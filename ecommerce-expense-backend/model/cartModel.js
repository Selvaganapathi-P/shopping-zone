const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [
    {
      productId:   String,
      name:        String,
      category:    String,
      price:       Number,
      quantity:    Number,
      image:       String,
      description: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);