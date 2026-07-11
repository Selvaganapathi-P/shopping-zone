const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getWishlist, toggleWishlist } = require("../controller/wishlistController");

router.get("/",       protect, getWishlist);
router.post("/toggle", protect, toggleWishlist);

module.exports = router;
