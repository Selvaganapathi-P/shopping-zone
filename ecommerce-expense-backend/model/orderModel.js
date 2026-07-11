const mongoose = require("mongoose");

const STATUS_VALUES = ["pending","confirmed","shipped","out_for_delivery","delivered","cancelled"];

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    productId: String, name: String, category: String,
    price: Number, quantity: Number, image: String,
  }],
  subtotal:        { type: Number, required: true },
  tax:             { type: Number, required: true },
  delivery:        { type: Number, required: true },
  grandTotal:      { type: Number, required: true },
  deliveryAddress: { type: Object, required: true },
  status:          { type: String, enum: STATUS_VALUES, default: "pending" },
  month:           { type: String },
  year:            { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
