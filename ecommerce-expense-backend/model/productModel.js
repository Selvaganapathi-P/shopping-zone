const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  category:     { type: String, required: true },
  price:        { type: Number, required: true, min: 0 },
  mrp:          { type: Number, default: null },
  stock:        { type: Number, default: 0 },
  rating:       { type: Number, default: 4.0 },
  image:        { type: String, required: true },
  images:       [{ type: String }],
  description:  { type: String, required: true },
  isActive:     { type: Boolean, default: true },
  isVisible:    { type: Boolean, default: true },
  flashSale:    {
    enabled:   { type: Boolean, default: false },
    salePrice: { type: Number, default: null },
    startAt:   { type: Date,   default: null },
    endAt:     { type: Date,   default: null },
  },
  priceHistory: [{
    price: { type: Number },
    date:  { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
