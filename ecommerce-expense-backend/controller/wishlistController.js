const Wishlist = require("../model/wishlistModel");

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate("products");
    res.json({ products: wishlist?.products || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to load wishlist." });
  }
};

const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "productId required." });
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [productId] });
      return res.json({ added: true, message: "Added to wishlist" });
    }
    const idx = wishlist.products.findIndex(id => id.toString() === productId);
    if (idx === -1) {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ added: true, message: "Added to wishlist" });
    } else {
      wishlist.products.splice(idx, 1);
      await wishlist.save();
      return res.json({ added: false, message: "Removed from wishlist" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to update wishlist." });
  }
};

module.exports = { getWishlist, toggleWishlist };
