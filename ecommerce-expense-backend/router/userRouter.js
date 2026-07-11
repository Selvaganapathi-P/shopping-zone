const express = require("express");
const router = express.Router();
const {
  register, login, adminLogin,
  getProfile, updateProfile, getAllUsers,
  suspendUser, activateUser, getUserOrders,
} = require("../controller/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/register",    register);
router.post("/login",       login);
router.post("/admin-login", adminLogin);
router.get("/profile",      protect, getProfile);
router.put("/profile",      protect, updateProfile);
router.get("/all",              protect, adminOnly, getAllUsers);
router.put("/:id/suspend",      protect, adminOnly, suspendUser);
router.put("/:id/activate",     protect, adminOnly, activateUser);
router.get("/:id/orders",       protect, adminOnly, getUserOrders);

module.exports = router;