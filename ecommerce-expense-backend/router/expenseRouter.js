const express = require("express");
const router = express.Router();
const { getExpenses, getAllExpenses } = require("../controller/expenseController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/",    protect, getExpenses);
router.get("/all", protect, adminOnly, getAllExpenses);

module.exports = router;