const Expense = require("../model/expenseModel");

const getExpenses = async (req, res) => {
  const { month, year } = req.query;
  try {
    const query = { userId: req.user._id };
    if (month) query.month = month;
    if (year)  query.year  = Number(year);
    const expenses = await Expense.find(query);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({})
      .populate("userId", "name email");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getExpenses, getAllExpenses };