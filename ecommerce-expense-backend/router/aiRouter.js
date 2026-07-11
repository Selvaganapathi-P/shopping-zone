const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { chat, generateDescription } = require("../controller/aiController");
const { adminOnly } = require("../middleware/authMiddleware");

router.post("/chat",                 protect, chat);
router.post("/generate-description", protect, adminOnly, generateDescription);

module.exports = router;
