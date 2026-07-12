const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password manually here
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      isAdmin: user.isAdmin,
      token:   generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    const isMatch = user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      isAdmin: true,
      token:   generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name         = req.body.name         || user.name;
    user.phone        = req.body.phone        || user.phone;
    user.addressLine1 = req.body.addressLine1 || user.addressLine1;
    user.addressLine2 = req.body.addressLine2 || user.addressLine2;
    user.city         = req.body.city         || user.city;
    user.state        = req.body.state        || user.state;
    user.pincode      = req.body.pincode      || user.pincode;
    user.landmark     = req.body.landmark     || user.landmark;
    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Users — Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Suspend / Activate user — Admin
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isAdmin) return res.status(403).json({ message: "Cannot suspend admin." });
    user.isSuspended = true;
    await user.save();
    res.json({ message: "User suspended.", isSuspended: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    user.isSuspended = false;
    await user.save();
    res.json({ message: "User activated.", isSuspended: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for a specific user — Admin
const getUserOrders = async (req, res) => {
  try {
    const Order = require("../model/orderModel");
    const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  getAllUsers,
  suspendUser,
  activateUser,
  getUserOrders,
};