const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name:     { type: String, required: true },
  amount:   { type: Number, required: true },
  category: { type: String, required: true },
  month:    { type: String, required: true },
  year:     { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);