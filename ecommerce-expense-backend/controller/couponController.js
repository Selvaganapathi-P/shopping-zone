const Coupon = require("../model/couponModel");

const validateCoupon = async (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ message: "Coupon code required." });
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code." });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ message: "Coupon has expired." });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ message: "Coupon usage limit reached." });
    if (orderAmount < coupon.minOrder) return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minOrder}.` });

    const discount = coupon.type === "percent"
      ? Math.round((orderAmount * coupon.discount) / 100)
      : Math.min(coupon.discount, orderAmount);

    res.json({
      valid: true,
      discount,
      type: coupon.type,
      value: coupon.discount,
      code: coupon.code,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to validate coupon." });
  }
};

const applyCoupon = async (req, res) => {
  const { code } = req.body;
  try {
    await Coupon.findOneAndUpdate({ code: code.toUpperCase().trim() }, { $inc: { usedCount: 1 } });
    res.json({ message: "Coupon applied." });
  } catch (err) {
    res.status(500).json({ message: "Failed to apply coupon." });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code?.toUpperCase().trim() });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Coupon code already exists." });
    res.status(500).json({ message: "Failed to create coupon." });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Failed to load coupons." });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: "Failed to update coupon." });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete coupon." });
  }
};

module.exports = { validateCoupon, applyCoupon, createCoupon, getAllCoupons, updateCoupon, deleteCoupon };
