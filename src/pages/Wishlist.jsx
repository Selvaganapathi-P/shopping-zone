import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, X, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar/Navbar";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import "./Wishlist.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [imgErrors, setImgErrors] = useState({});

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemove = (product) => {
    toggleWishlist(product);
  };

  return (
    <div className="wishlist-page">
      <Navbar />

      <div className="wishlist-header">
        <div className="wishlist-header-inner">
          <div>
            <h1 className="wishlist-title">
              <Heart size={28} style={{ color: "#ef4444", marginRight: 12, verticalAlign: "middle" }} />
              My Wishlist
            </h1>
            <p className="wishlist-subtitle">
              {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="wishlist-content">
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 20 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: "#1e293b", borderRadius: 16, overflow: "hidden", height: 320 }}>
                <div style={{ height: 200, background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)", backgroundSize: "400%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 14, background: "#334155", borderRadius: 6, marginBottom: 8, width: "60%" }} />
                  <div style={{ height: 16, background: "#334155", borderRadius: 6, marginBottom: 12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">💝</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love for later by clicking the heart icon on any product.</p>
            <button className="wishlist-shop-btn" onClick={() => navigate("/products")}>
              Start Shopping <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            <AnimatePresence>
              {wishlist.map(product => {
                const discount = product.mrp && product.mrp > product.price
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : 0;

                return (
                  <motion.div
                    key={product._id}
                    className="wl-card"
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      className="wl-img-wrap"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <img
                        src={imgErrors[product._id]
                          ? `https://placehold.co/400x400/1e293b/64748b?text=${encodeURIComponent(product.name.split(" ")[0])}`
                          : product.image
                        }
                        alt={product.name}
                        className="wl-img"
                        onError={() => setImgErrors(prev => ({ ...prev, [product._id]: true }))}
                      />
                      <button
                        className="wl-remove-btn"
                        onClick={e => { e.stopPropagation(); handleRemove(product); }}
                        title="Remove from wishlist"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="wl-body">
                      <p className="wl-category">{product.category}</p>
                      <p className="wl-name" onClick={() => navigate(`/products/${product._id}`)} style={{ cursor: "pointer" }}>
                        {product.name}
                      </p>
                      <div className="wl-price-row">
                        <span className="wl-price">₹{product.price.toLocaleString()}</span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="wl-mrp">₹{product.mrp.toLocaleString()}</span>
                        )}
                        {discount > 0 && <span className="wl-disc">{discount}% off</span>}
                      </div>
                      <button
                        className="wl-add-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart size={14} />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`@keyframes shimmer{0%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
    </div>
  );
}
