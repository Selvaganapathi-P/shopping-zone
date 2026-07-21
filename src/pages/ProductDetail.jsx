import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart, Heart, Star, ChevronRight, ArrowLeft,
  Package, Shield, Truck, Clock, Zap,
} from "lucide-react";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import "./ProductDetail.css";

const RECENTLY_VIEWED_KEY = "tz_recently_viewed";
const MAX_RECENTLY_VIEWED = 8;

function saveRecentlyViewed(product) {
  try {
    const existing = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    const filtered = existing.filter((p) => p._id !== product._id);
    const updated  = [
      { _id: product._id, name: product.name, image: product.image, price: product.price, category: product.category },
      ...filtered,
    ].slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {}
}

function getRecentlyViewed(currentId) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    return list.filter((p) => p._id !== currentId).slice(0, 6);
  } catch { return []; }
}

function StarRating({ value, onSelect, interactive = false, size = 16 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="pd-stars" style={{ gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          className="pd-star-btn"
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onSelect?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{ cursor: interactive ? "pointer" : "default" }}
        >
          <Star
            size={size}
            fill={(hovered || value) >= i ? "#f59e0b" : "none"}
            color={(hovered || value) >= i ? "#f59e0b" : "#475569"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user }     = useAuth();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [qty, setQty]                 = useState(1);
  const [reviews, setReviews]         = useState([]);
  const [imgError, setImgError]       = useState(false);
  const [activeImg, setActiveImg]     = useState(0);
  const [related, setRelated]         = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [userRating, setUserRating]   = useState(0);
  const [comment, setComment]         = useState("");
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    setLoading(true);
    setImgError(false);
    setQty(1);
    setActiveImg(0);
    API.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
        saveRecentlyViewed(data);
        setRecentlyViewed(getRecentlyViewed(data._id));
        // Load related products (same category, exclude current)
        API.get("/products", { params: { category: data.category } })
          .then(({ data: all }) => {
            setRelated(all.filter((p) => p._id !== data._id).slice(0, 5));
          })
          .catch(() => {});
      })
      .catch(() => { toast.error("Product not found"); navigate("/products"); });
  }, [id, navigate]);

  useEffect(() => {
    API.get(`/reviews/${id}`)
      .then(({ data }) => setReviews(data))
      .catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(product, qty);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please log in to purchase");
      navigate("/login");
      return;
    }
    addToCart(product, qty);
    navigate("/cart");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userRating) return toast.error("Please select a rating.");
    if (!comment.trim()) return toast.error("Please write a comment.");
    setSubmitting(true);
    try {
      const { data } = await API.post(`/reviews/${id}`, { rating: userRating, comment });
      setReviews(prev => [data, ...prev]);
      setUserRating(0);
      setComment("");
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="pd-skeleton">
        <Navbar />
        <div className="pd-skeleton-main">
          <div className="shimmer" style={{ height: 420 }} />
          <div style={{ display:"flex", flexDirection:"column", gap: 16 }}>
            {[60, 40, 80, 50, 100, 50].map((w, i) => (
              <div key={i} className="shimmer" style={{ height: 20, width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const allImages  = [product.image, ...(product.images || [])].filter(Boolean);
  const activeImgSrc = allImages[activeImg] || product.image;

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const savings    = product.mrp ? product.mrp - product.price : 0;
  const wishlisted = isInWishlist(product._id);
  const inStock    = product.stock > 0;

  return (
    <div className="product-detail-page">
      <Navbar />

      <div className="pd-hero">
        <div className="pd-container">
          {/* Breadcrumb */}
          <div className="pd-breadcrumb">
            <Link to="/home">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products">Products</Link>
            <ChevronRight size={14} />
            <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <ChevronRight size={14} />
            <span>{product.name}</span>
          </div>

          {/* Main grid */}
          <div className="pd-main">
            {/* Image */}
            <motion.div
              className="pd-image-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="pd-image-wrap">
                <img
                  src={imgError
                    ? `https://placehold.co/600x600/F4F4F8/9898B0?text=${encodeURIComponent(product.name.split(" ")[0])}`
                    : activeImgSrc
                  }
                  alt={product.name}
                  className="pd-image"
                  onError={() => setImgError(true)}
                />
                {discount > 0 && <div className="pd-discount-badge">{discount}% OFF</div>}
                <button
                  className={`pd-wish-btn ${wishlisted ? "wishlisted" : ""}`}
                  onClick={() => toggleWishlist(product)}
                  title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} fill={wishlisted ? "#ef4444" : "none"} />
                </button>
              </div>
              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="pd-thumbnails">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      className={`pd-thumb-btn ${activeImg === i ? "active" : ""}`}
                      onClick={() => { setActiveImg(i); setImgError(false); }}
                    >
                      <img src={img} alt={`view ${i + 1}`} onError={(e) => { e.target.src = "https://placehold.co/80x80/F4F4F8/9898B0?text=?"; }} />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              className="pd-info"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="pd-category-tag"><Package size={12} /> {product.category}</div>
              <h1 className="pd-name">{product.name}</h1>

              <div className="pd-rating-row">
                <StarRating value={Math.round(product.rating)} size={16} />
                <span className="pd-rating-text">{product.rating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>

              <div className="pd-price-block">
                <span className="pd-price">₹{product.price.toLocaleString()}</span>
                {product.mrp && product.mrp > product.price && (
                  <span className="pd-mrp">₹{product.mrp.toLocaleString()}</span>
                )}
              </div>

              {savings > 0 && (
                <p className="pd-savings">You save ₹{savings.toLocaleString()} ({discount}% off)</p>
              )}

              <p className="pd-desc">{product.description}</p>

              <div className="pd-stock-row">
                {inStock
                  ? product.stock <= 5
                    ? <span className="pd-stock-low">⚠ Only {product.stock} left</span>
                    : <span className="pd-stock-in">✓ In Stock</span>
                  : <span className="pd-stock-out">✗ Out of Stock</span>
                }
              </div>

              {inStock && (
                <div className="pd-qty-row">
                  <span className="pd-qty-label">Qty:</span>
                  <div className="pd-qty-stepper">
                    <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                    <span className="pd-qty-num">{qty}</span>
                    <button className="pd-qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
                  </div>
                </div>
              )}

              <div className="pd-actions">
                <motion.button className="pd-btn-buy" onClick={handleBuyNow} disabled={!inStock} whileTap={{ scale: 0.97 }}>
                  <Zap size={18} />
                  Buy Now
                </motion.button>
                <motion.button className="pd-btn-cart" onClick={handleAddToCart} disabled={!inStock} whileTap={{ scale: 0.97 }}>
                  <ShoppingCart size={18} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </motion.button>
                <button className={`pd-btn-wish ${wishlisted ? "active" : ""}`} onClick={() => toggleWishlist(product)}>
                  <Heart size={16} fill={wishlisted ? "#ef4444" : "none"} />
                  {wishlisted ? "Saved" : "Save"}
                </button>
              </div>

              <div style={{ display:"flex", gap:12, marginTop:20, flexWrap:"wrap" }}>
                {[
                  { icon: Truck,   text: "Free delivery over ₹499" },
                  { icon: Shield,  text: "Secure payment" },
                  { icon: Package, text: "Easy returns" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748b", background:"rgba(255,255,255,0.03)", padding:"6px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.05)" }}>
                    <Icon size={12} /> {text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div className="pd-sections">
          <div className="pd-section">
            <h3 className="pd-section-title">You May Also Like</h3>
            <div className="pd-related-grid">
              {related.map((p) => (
                <motion.div
                  key={p._id}
                  className="pd-related-card"
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/products/${p._id}`)}
                >
                  <div className="pd-related-img">
                    <img src={p.image} alt={p.name} onError={(e) => { e.target.src = "https://placehold.co/200x160/F4F4F8/9898B0?text=No+Image"; }} />
                  </div>
                  <div className="pd-related-info">
                    <p className="pd-related-name">{p.name}</p>
                    <p className="pd-related-price">₹{p.price?.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <div className="pd-sections">
          <div className="pd-section">
            <h3 className="pd-section-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Clock size={16} /> Recently Viewed
            </h3>
            <div className="pd-related-grid">
              {recentlyViewed.map((p) => (
                <motion.div
                  key={p._id}
                  className="pd-related-card"
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/products/${p._id}`)}
                >
                  <div className="pd-related-img">
                    <img src={p.image} alt={p.name} onError={(e) => { e.target.src = "https://placehold.co/200x160/F4F4F8/9898B0?text=No+Image"; }} />
                  </div>
                  <div className="pd-related-info">
                    <p className="pd-related-name">{p.name}</p>
                    <p className="pd-related-price">₹{p.price?.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews section ── */}
      <div className="pd-sections">
        <div className="pd-section">
          <h3 className="pd-section-title">Customer Reviews</h3>

          {user && (
            <form className="pd-review-form" onSubmit={handleSubmitReview}>
              <p style={{ fontSize:14, color:"#94a3b8", marginBottom:8 }}>Write a review:</p>
              <StarRating value={userRating} onSelect={setUserRating} interactive size={24} />
              <div className="pd-stars-input" />
              <textarea
                className="pd-review-textarea"
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />
              <button className="pd-review-submit" type="submit" disabled={submitting}>
                {submitting ? "Posting…" : "Post Review"}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="pd-no-reviews">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="pd-review-list">
              {reviews.map(r => (
                <motion.div key={r._id} className="pd-review-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="pd-review-header">
                    <span className="pd-review-name">{r.name || "User"}</span>
                    <span className="pd-review-date">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </span>
                  </div>
                  <StarRating value={r.rating} size={14} />
                  <p className="pd-review-comment" style={{ marginTop: 8 }}>{r.comment}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{ display:"flex", alignItems:"center", gap:8, background:"transparent", border:"none", color:"#64748b", fontSize:14, cursor:"pointer", padding:"8px 0" }}
        >
          <ArrowLeft size={16} /> Back to products
        </button>
      </div>
    </div>
  );
}
