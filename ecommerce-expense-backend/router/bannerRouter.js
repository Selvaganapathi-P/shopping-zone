const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getBanner, updateBanner } = require("../controller/bannerController");

router.get("/",    getBanner);
router.put("/",    protect, adminOnly, updateBanner);

module.exports = router;
