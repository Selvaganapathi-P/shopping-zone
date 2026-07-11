const Review  = require("../model/reviewModel");
const Product = require("../model/productModel");

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reviews." });
  }
};

const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!rating || !comment) return res.status(400).json({ message: "Rating and comment are required." });

  try {
    const existing = await Review.findOne({ productId, userId: req.user._id });
    if (existing) return res.status(400).json({ message: "You have already reviewed this product." });

    const review = await Review.create({
      productId, userId: req.user._id,
      name: req.user.name || "Anonymous",
      rating: Number(rating), comment,
    });

    const reviews   = await Review.find({ productId });
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { rating: Math.round(avgRating * 10) / 10 });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Failed to add review." });
  }
};

const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review." });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("productId", "name")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reviews." });
  }
};

module.exports = { getProductReviews, addReview, deleteReview, getAllReviews };
