const Product = require("../model/productModel");
const https   = require("https");

const getProducts = async (req, res) => {
  try {
    const filter = { isActive: true, isVisible: { $ne: false } };
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to load products." });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to load product." });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, category, price, mrp, stock, rating, description } = req.body;
    if (!name || !category || !price || !description) {
      return res.status(400).json({ message: "Name, category, price, and description are required." });
    }
    const image = req.file
      ? `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`
      : req.body.image;
    if (!image) return res.status(400).json({ message: "Product image is required." });

    const extraImages = req.body.images
      ? (Array.isArray(req.body.images) ? req.body.images : req.body.images.split(",").map(s => s.trim())).filter(Boolean)
      : [];
    const product = await Product.create({
      name, category,
      price:   Number(price),
      mrp:     mrp ? Number(mrp) : null,
      stock:   stock ? Number(stock) : 0,
      rating:  Number(rating) || 4.0,
      description, image,
      images:  extraImages,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to add product." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const { name, category, price, mrp, stock, rating, description, isActive } = req.body;

    if (name)        product.name        = name;
    if (category)    product.category    = category;
    if (price && Number(price) !== product.price) {
      product.priceHistory.push({ price: product.price, date: new Date() });
      product.price = Number(price);
    }
    if (mrp)         product.mrp         = Number(mrp);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating)      product.rating      = Number(rating);
    if (description) product.description = description;
    if (isActive !== undefined) product.isActive = isActive;
    if (req.body.images) {
      product.images = Array.isArray(req.body.images)
        ? req.body.images.filter(Boolean)
        : req.body.images.split(",").map(s => s.trim()).filter(Boolean);
    }

    if (req.file) {
      product.image = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      product.image = req.body.image;
    }

    const updated = await product.save();

    // Emit stock update via Socket.IO
    const io = req.app.get("io");
    if (io && stock !== undefined) {
      io.to(`product_${updated._id}`).emit("stock_update", {
        productId: updated._id,
        stock:     updated.stock,
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product." });
  }
};

const getPriceDrops = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(sevenDaysAgo.getHours() - 48);
    const products = await Product.find({ isActive: true, isVisible: { $ne: false }, "priceHistory.1": { $exists: true } });
    const drops = products.filter((p) => {
      const history = p.priceHistory;
      if (history.length < 2) return false;
      const prev = history[history.length - 2];
      return prev.price > p.price && new Date(prev.date) >= sevenDaysAgo;
    }).map((p) => ({
      _id: p._id, name: p.name, image: p.image, category: p.category,
      price: p.price, mrp: p.mrp,
      previousPrice: p.priceHistory[p.priceHistory.length - 2].price,
    })).slice(0, 8);
    res.json(drops);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPexelsPhoto = async (req, res) => {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return res.status(503).json({ message: "PEXELS_API_KEY not configured." });

  const query = req.query.query || "product";
  const url   = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`;

  try {
    await new Promise((resolve, reject) => {
      https.get(url, { headers: { Authorization: key } }, (r) => {
        let data = "";
        r.on("data", (c) => (data += c));
        r.on("end", () => {
          try {
            const json  = JSON.parse(data);
            const photo = json.photos?.[0];
            res.json({ url: photo ? photo.src.large : null });
            resolve();
          } catch { reject(new Error("parse error")); }
        });
      }).on("error", reject);
    });
  } catch (err) {
    res.status(500).json({ message: "Pexels request failed.", error: err.message });
  }
};

const toggleVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    product.isVisible = !product.isVisible;
    await product.save();
    res.json({ _id: product._id, isVisible: product.isVisible });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const setFlashSale = async (req, res) => {
  try {
    const { enabled, salePrice, startAt, endAt } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    product.flashSale = { enabled: !!enabled, salePrice: salePrice || null, startAt: startAt || null, endAt: endAt || null };
    await product.save();
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getProducts, getProductById, getPriceDrops, getPexelsPhoto, addProduct, updateProduct, deleteProduct, toggleVisibility, setFlashSale };
