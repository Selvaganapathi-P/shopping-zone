const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  headline:    { type: String, default: "Discover India's Best Deals" },
  subheadline: { type: String, default: "Electronics, Fashion, Home & More" },
  ctaText:     { type: String, default: "Shop Now" },
  ctaLink:     { type: String, default: "/products" },
  badge:       { type: String, default: "New Arrivals Daily" },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Banner", bannerSchema);
