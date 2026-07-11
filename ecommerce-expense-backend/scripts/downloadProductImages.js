/**
 * Download product images from Pexels API and update MongoDB records.
 * Usage: PEXELS_API_KEY=your_key node scripts/downloadProductImages.js
 *
 * Each product's name/category is used as the search query.
 * Images are fetched as Pexels URLs (no local storage needed).
 */

require("dotenv").config();
const mongoose = require("mongoose");
const https    = require("https");
const Product  = require("../model/productModel");

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const MONGO_URI  = process.env.MONGO_URI;

if (!PEXELS_KEY) {
  console.error("❌  Set PEXELS_API_KEY in your .env file.");
  process.exit(1);
}

// Category → search keyword mapping for better results
const CATEGORY_KEYWORDS = {
  "Electronics":     "electronics gadget",
  "Fashion":         "fashion clothing",
  "Home & Kitchen":  "kitchen home",
  "Sports":          "sports equipment",
  "Books":           "books reading",
  "Beauty":          "beauty cosmetics",
};

function pexelsSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`;
    const options = { headers: { Authorization: PEXELS_KEY } };
    https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const photo = json.photos?.[0];
          resolve(photo ? photo.src.medium : null);
        } catch {
          reject(new Error("Pexels parse error"));
        }
      });
    }).on("error", reject);
  });
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  const products = await Product.find({});
  console.log(`Found ${products.length} products. Fetching Pexels images…\n`);

  let updated = 0;
  let failed  = 0;

  for (const product of products) {
    const keyword = `${product.name} ${CATEGORY_KEYWORDS[product.category] || product.category}`;
    try {
      const imageUrl = await pexelsSearch(keyword);
      if (imageUrl) {
        product.image = imageUrl;
        await product.save();
        console.log(`✓ ${product.name}`);
        updated++;
      } else {
        console.log(`⚠  No image found for: ${product.name}`);
        failed++;
      }
      // Respect Pexels rate limit (200 req/hour free tier)
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`✗ ${product.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Updated: ${updated}  Failed/skipped: ${failed}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
