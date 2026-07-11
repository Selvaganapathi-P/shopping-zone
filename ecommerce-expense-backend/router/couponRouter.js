const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  validateCoupon, applyCoupon,
  createCoupon, getAllCoupons, updateCoupon, deleteCoupon,
} = require("../controller/couponController");

router.post("/validate",    protect, validateCoupon);
router.post("/apply",       protect, applyCoupon);
router.get("/admin",        protect, adminOnly, getAllCoupons);
router.post("/admin",       protect, adminOnly, createCoupon);
router.put("/admin/:id",    protect, adminOnly, updateCoupon);
router.delete("/admin/:id", protect, adminOnly, deleteCoupon);

module.exports = router;
