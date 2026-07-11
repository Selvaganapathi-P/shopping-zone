const Cart = require("../model/cartModel");

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addToCart = async (req, res) => {
  const { product } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [{ ...product, quantity: 1 }],
      });
      return res.json(cart);
    }
    const existing = cart.items.find(
      (i) => i.productId === product.productId
    );
    if (existing) {
      cart.items = cart.items.map((i) =>
        i.productId === product.productId
          ? { ...i.toObject(), quantity: i.quantity + 1 }
          : i
      );
    } else {
      cart.items.push({ ...product, quantity: 1 });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (quantity < 1) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      cart.items = cart.items.map((i) =>
        i.productId === productId
          ? { ...i.toObject(), quantity }
          : i
      );
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    cart.items = cart.items.filter(
      (i) => i.productId !== req.params.productId
    );
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCart, addToCart, updateCartItem,
  removeFromCart, clearCart,
};