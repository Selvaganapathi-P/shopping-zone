const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getProductReviews, addReview, deleteReview, getAllReviews } = require("../controller/reviewController");

router.get("/admin",              protect, adminOnly, getAllReviews);
router.get("/:productId",         getProductReviews);
router.post("/:productId",        protect, addReview);
router.delete("/:id",             protect, adminOnly, deleteReview);

module.exports = router;
