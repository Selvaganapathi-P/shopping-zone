const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, index: true },
  brand:        { type: String, default: "" },
  category:     { type: String, required: true, index: true },
  subcategory:  { type: String, default: "", index: true },
  series:       { type: String, default: "" },
  model:        { type: String, default: "" },
  variant:      { type: String, default: "" },
  color:        { type: String, default: "" },
  size:         { type: String, default: "" },
  sku:          { type: String, default: "" },
  price:        { type: Number, required: true, min: 0 },
  mrp:          { type: Number, default: null },
  stock:        { type: Number, default: 0 },
  rating:       { type: Number, default: 4.0 },
  reviewCount:  { type: Number, default: 0 },
  image:        { type: String, required: true },
  images:       [{ type: String }],
  description:  { type: String, required: true },
  tags:         [{ type: String }],
  specs:        { type: mongoose.Schema.Types.Mixed, default: {} },
  warranty:     { type: String, default: "" },
  seller:       { type: String, default: "Thansel Zovia" },
  isTrending:   { type: Boolean, default: false },
  isFeatured:   { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  isVisible:    { type: Boolean, default: true },
  flashSale: {
    enabled:   { type: Boolean, default: false },
    salePrice: { type: Number, default: null },
    startAt:   { type: Date, default: null },
    endAt:     { type: Date, default: null },
  },
  priceHistory: [{
    price: { type: Number },
    date:  { type: Date, default: Date.now },
  }],
}, { timestamps: true });

productSchema.index({ name: "text", brand: "text", tags: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
