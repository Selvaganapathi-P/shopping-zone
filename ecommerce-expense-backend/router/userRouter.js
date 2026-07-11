const express = require("express");
const router = express.Router();
const {
  register, login, adminLogin,
  getProfile, updateProfile, getAllUsers,
  suspendUser, activateUser, getUserOrders,
} = require("../controller/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validate, schemas } = require("../middleware/validate");
const log = require("../middleware/activityLog");

router.post("/register",    validate(schemas.register), register);
router.post("/login",       validate(schemas.login),    login);
router.post("/admin-login", validate(schemas.adminLogin), adminLogin);
router.get("/profile",      protect, getProfile);
router.put("/profile",      protect, updateProfile);
router.get("/all",          protect, adminOnly, getAllUsers);
router.put("/:id/suspend",  protect, adminOnly, log("SUSPEND_USER", "User"), suspendUser);
router.put("/:id/activate", protect, adminOnly, log("ACTIVATE_USER", "User"), activateUser);
router.get("/:id/orders",   protect, adminOnly, getUserOrders);

module.exports = router;
