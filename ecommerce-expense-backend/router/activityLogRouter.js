const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getLogs } = require("../controller/activityLogController");

router.get("/", protect, adminOnly, getLogs);

module.exports = router;
