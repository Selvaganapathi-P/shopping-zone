import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import {
  Truck, ShieldCheck, RefreshCw, Headphones,
  ArrowRight, ChevronLeft, ChevronRight, ShoppingCart,
} from "lucide-react";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import "./Home.css";

/* ── Static data ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { name: "Electronics",    icon: "💻", color: "#3B82F6", bg: "#EFF6FF" },
  { name: "Fashion",        icon: "👗", color: "#EC4899", bg: "#FDF2F8" },
  { name: "Home & Kitchen", icon: "🏠", color: "#10B981", bg: "#ECFDF5" },
  { name: "Sports",         icon: "⚽", color: "#F59E0B", bg: "#FFFBEB" },
  { name: "Books",          icon: "📚", color: "#8B5CF6", bg: "#F5F3FF" },
  { name: "Beauty",         icon: "💄", color: "#EF4444", bg: "#FEF2F2" },
  { name: "Toys",           icon: "🧸", color: "#F97316", bg: "#FFF7ED" },
  { name: "Groceries",      icon: "🛒", color: "#14B8A6", bg: "#F0FDFA" },
];

const TRUST = [
  { icon: Truck,       title: "Free Delivery",  desc: "Orders above ₹499",     color: "#10B981" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% safe & encrypted", color: "#3B82F6" },
  { icon: RefreshCw,   title: "Easy Returns",   desc: "7-day hassle free",     color: "#F59E0B" },
  { icon: Headphones,  title: "24/7 Support",   desc: "Always here for you",   color: "#8B5CF6" },
];

const LIVE_PURCHASES = [
  { name: "Arjun M.",   city: "Bengaluru",  product: "Samsung 65″ 4K TV",  price: "₹82,999",   initials: "AM", color: "#3B82F6" },
  { name: "Priya S.",   city: "Chennai",    product: "Nike Air Max 270",    price: "₹9,495",    initials: "PS", color: "#EC4899" },
  { name: "Kiran R.",   city: "Mumbai",     product: "iPhone 15 Pro 256GB", price: "₹1,34,900", initials: "KR", color: "#8B5CF6" },
  { name: "Divya T.",   city: "Hyderabad",  product: "Dyson V15 Vacuum",    price: "₹54,900",   initials: "DT", color: "#10B981" },
  { name: "Rahul B.",   city: "Pune",       product: "Levi's 501 Jeans",    price: "₹3,999",    initials: "RB", color: "#F59E0B" },
  { name: "Sneha K.",   city: "Delhi",      product: "MacBook Air M2",      price: "₹1,14,900", initials: "SK", color: "#6366F1" },
  { name: "Vijay P.",   city: "Coimbatore", product: "Sony WH-1000XM5",     price: "₹31,490",   initials: "VP", color: "#EF4444" },
  { name: "Meera L.",   city: "Kochi",      product: "Banarasi Silk Saree", price: "₹4,299",    initials: "ML", color: "#F97316" },
];

/* ── Animation variants (defined outside so not recreated each render) ───── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } },
};
const slideLeft = {
  hidden:  { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const slideRight = {
  hidden:  { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const staggerParent = { visible: { transition: { staggerChildren: 0.10 } } };

/* ── Live activity toast ─────────────────────────────────────────────────── */
function LiveActivity() {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE_PURCHASES.length); setVisible(true); }, 420);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const item = LIVE_PURCHASES[idx];
  return (
    <div className="live-wrap">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            className="live-toast"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{    y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
          >
            <span className="live-dot" />
            <div className="live-avatar" style={{ background: item.color }}>{item.initials}</div>
            <div className="live-body">
              <p className="live-who"><strong>{item.name}</strong> · {item.city}</p>
              <p className="live-what">Bought {item.product}</p>
            </div>
            <span className="live-price">{item.price}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Carousel hook ───────────────────────────────────────────────────────── */
function useCarousel(itemCount) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const checkBounds = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkBounds();
    el.addEventListener("scroll", checkBounds, { passive: true });
    return () => el.removeEventListener("scroll", checkBounds);
  }, [checkBounds, itemCount]);

  const scrollLeft  = () => trackRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => trackRef.current?.scrollBy({ left:  300, behavior: "smooth" });

  return { trackRef, atStart, atEnd, scrollLeft, scrollRight };
}

/* ── Carousel shell ──────────────────────────────────────────────────────── */
function Carousel({ title, onViewAll, trackRef, onScrollLeft, onScrollRight, atStart, atEnd, children, padRight }) {
  return (
    <div className="carousel-wrap">
      <div className="carousel-head" style={padRight ? { paddingRight: padRight } : {}}>
        <h2 className="carousel-title">{title}</h2>
        <div className="carousel-controls">
          {onViewAll && (
            <button className="view-all-btn" onClick={onViewAll}>
              View all <ArrowRight size={13} />
            </button>
          )}
          <button className="c-arrow" onClick={onScrollLeft} disabled={atStart} aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button className="c-arrow" onClick={onScrollRight} disabled={atEnd} aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="carousel-track" ref={trackRef} style={padRight ? { paddingRight: padRight } : {}}>
        {children}
      </div>
    </div>
  );
}

/* ── Video constants ─────────────────────────────────────────────────────── */
const HERO_VIDEO  = "https://videos.pexels.com/video-files/3763895/3763895-uhd_2560_1440_25fps.mp4";
const HERO_POSTER = "https://images.pexels.com/photos/5632388/pexels-photo-5632388.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80";

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [products,    setProducts]    = useState([]);
  const [addedId,     setAddedId]     = useState(null);
  const { addToCart }                  = useCart();

  const catCarousel  = useCarousel(CATEGORIES.length);
  const prodCarousel = useCarousel(products.length);

  useEffect(() => {
    API.get("/products").then(({ data }) => {
      setProducts(Array.isArray(data) ? data.slice(0, 16) : []);
    }).catch(() => {});
  }, []);

  const handleAdd = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedId(product._id);
    toast.success(`${product.name} added!`);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="home-page">
      <Navbar transparent />

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-video-wrap">
          <video
            ref={videoRef}
            className={`hero-video${videoLoaded ? " loaded" : ""}`}
            autoPlay muted loop playsInline poster={HERO_POSTER}
            onCanPlay={() => setVideoLoaded(true)}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="hero-overlay" />
        </div>

        <motion.div
          className="hero-content"
          variants={staggerParent}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={fadeUp} className="hero-eyebrow">
            🔥 New arrivals every day
          </motion.span>
          <motion.h1 variants={fadeUp} className="hero-title">
            India's Smartest<br />
            <span className="hero-accent">Shopping Experience</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="hero-sub">
            Thousands of products. Every rupee tracked automatically.
          </motion.p>
          <motion.div variants={fadeUp} className="hero-btns">
            <button className="btn-primary" onClick={() => navigate("/products")}>
              Shop Now <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" onClick={() => navigate("/products")}>
              Browse All
            </button>
          </motion.div>
        </motion.div>

        <LiveActivity />
      </section>

      {/* ── Trust strip ── */}
      <motion.div
        className="trust-strip"
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {TRUST.map(({ icon: Icon, title, desc, color }) => (
          <motion.div key={title} className="trust-item" variants={fadeUp}>
            <div className="trust-icon" style={{ color }}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="trust-title">{title}</p>
              <p className="trust-desc">{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Categories carousel — slides in from left ── */}
      <motion.div
        className="section-pad"
        variants={slideLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <Carousel
          title="Shop by Category"
          onViewAll={() => navigate("/products")}
          trackRef={catCarousel.trackRef}
          onScrollLeft={catCarousel.scrollLeft}
          onScrollRight={catCarousel.scrollRight}
          atStart={catCarousel.atStart}
          atEnd={catCarousel.atEnd}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className="cat-chip"
              style={{ "--cat-bg": cat.bg, "--cat-color": cat.color }}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
            >
              <span className="cat-emoji">{cat.icon}</span>
              <span className="cat-label">{cat.name}</span>
            </button>
          ))}
        </Carousel>
      </motion.div>

      {/* ── Products carousel — slides in from right ── */}
      {products.length > 0 && (
        <motion.div
          className="products-section"
          variants={slideRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <Carousel
            title="Trending Right Now"
            onViewAll={() => navigate("/products")}
            trackRef={prodCarousel.trackRef}
            onScrollLeft={prodCarousel.scrollLeft}
            onScrollRight={prodCarousel.scrollRight}
            atStart={prodCarousel.atStart}
            atEnd={prodCarousel.atEnd}
            padRight="32px"
          >
            {products.map((p) => (
              <motion.div
                key={p._id}
                className="prod-card"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.18 }}
                onClick={() => navigate(`/products/${p._id}`)}
              >
                <div className="prod-img-wrap">
                  <img
                    src={p.image || "https://placehold.co/240x180/F4F4F8/9898B0?text=No+Image"}
                    alt={p.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/240x180/F4F4F8/9898B0?text=No+Image"; }}
                  />
                </div>
                <div className="prod-info">
                  <p className="prod-cat">{p.category}</p>
                  <p className="prod-name">{p.name}</p>
                  <div className="prod-row">
                    <span className="prod-price">₹{p.price?.toLocaleString()}</span>
                    <button
                      className={`prod-add${addedId === p._id ? " added" : ""}`}
                      onClick={(e) => handleAdd(e, p)}
                      aria-label="Add to cart"
                    >
                      {addedId === p._id ? "✓" : <ShoppingCart size={13} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </Carousel>
        </motion.div>
      )}

      {/* ── CTA banner ── */}
      <motion.div
        className="cta-banner"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="cta-text">
          <h2>Ready to start shopping?</h2>
          <p>Join 50,000+ happy customers saving with Thansel Zovia</p>
        </div>
        <button className="btn-primary btn-lg" onClick={() => navigate("/products")}>
          Explore Products <ArrowRight size={18} />
        </button>
      </motion.div>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <span className="footer-brand">🛍️ Thansel Zovia</span>
          <p>© 2026 Thansel Zovia · Built with ❤️ for India · Shop Smart. Track Smarter.</p>
        </div>
      </footer>
    </div>
  );
}
