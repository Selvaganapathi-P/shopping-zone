/**
 * Run once: node scripts/seedAdmin.js
 * Creates the admin user in MongoDB if they don't already exist.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../model/userModel");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS  = "selva@007";   // change after first login

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB:", process.env.MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (!existing.isAdmin) {
      existing.isAdmin = true;
      await existing.save();
      console.log("Existing user promoted to admin:", ADMIN_EMAIL);
    } else {
      console.log("Admin already exists:", ADMIN_EMAIL);
    }
    await mongoose.disconnect();
    return;
  }

  const hashed = bcrypt.hashSync(ADMIN_PASS, 10);
  await User.create({
    name:     "Admin",
    email:    ADMIN_EMAIL,
    password: hashed,
    isAdmin:  true,
  });

  console.log("Admin user created:", ADMIN_EMAIL);
  console.log("Password: selva@007 (change after first login!)");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
