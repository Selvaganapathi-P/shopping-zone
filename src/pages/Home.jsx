import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import {
  Truck, ShieldCheck, TrendingUp, ShoppingBag,
  Star, ArrowRight, ChevronDown, Zap, Tag, TrendingDown, ShoppingCart
} from "lucide-react";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import "./Home.css";

const categories = [
  { name: "Electronics", icon: "💻", gradient: "from-blue-600 to-cyan-500",   count: "2,400+ items" },
  { name: "Fashion",     icon: "👗", gradient: "from-pink-600 to-rose-500",    count: "5,100+ items" },
  { name: "Home & Kitchen", icon: "🏠", gradient: "from-green-600 to-emerald-500", count: "3,200+ items" },
  { name: "Sports",      icon: "⚽", gradient: "from-orange-600 to-amber-500", count: "1,800+ items" },
  { name: "Books",       icon: "📚", gradient: "from-purple-600 to-violet-500", count: "9,000+ items" },
  { name: "Beauty",      icon: "💄", gradient: "from-red-600 to-pink-500",     count: "2,700+ items" },
];

const features = [
  { icon: Truck,      title: "Free Delivery",    desc: "On orders above ₹499",         color: "#22c55e" },
  { icon: ShieldCheck, title: "Secure Payment",  desc: "100% safe transactions",        color: "#3b82f6" },
  { icon: TrendingUp, title: "Track Expenses",   desc: "Monitor your spending",         color: "#f97316" },
  { icon: ShoppingBag, title: "Best Deals",      desc: "Unbeatable prices daily",       color: "#a855f7" },
];

const HERO_VIDEO = "https://videos.pexels.com/video-files/3763895/3763895-uhd_2560_1440_25fps.mp4";
const HERO_POSTER = "https://images.pexels.com/photos/5632388/pexels-photo-5632388.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80";

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const navigate  = useNavigate();
  const videoRef  = useRef(null);
  const heroRef   = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [banner, setBanner]           = useState(null);
  const [priceDrops, setPriceDrops]   = useState([]);
  const [addedId, setAddedId]         = useState(null);
  const { addToCart }                 = useCart();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY      = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (reducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, [reducedMotion]);

  useEffect(() => {
    API.get("/banner").then(({ data }) => { if (data?.isActive !== false) setBanner(data); }).catch(() => {});
    API.get("/products/price-drops").then(({ data }) => setPriceDrops(data.slice(0, 6))).catch(() => {});
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedId(product._id);
    toast.success(`${product.name} added!`);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="home-page">
      <Navbar transparent />

      {/* ── Cinematic Hero ── */}
      <section className="hero-section" ref={heroRef}>

        {/* Video Background */}
        <motion.div className="hero-video-wrap" style={reducedMotion ? {} : { y: heroY }}>
          <video
            ref={videoRef}
            className={`hero-video ${videoLoaded ? "loaded" : ""}`}
            autoPlay muted loop playsInline
            poster={HERO_POSTER}
            onCanPlay={() => setVideoLoaded(true)}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </motion.div>

        {/* Animated orbs (fallback / additional depth) */}
        <div className="hero-orbs" aria-hidden>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* Hero Content */}
        <motion.div
          className="hero-content-wrap"
          style={reducedMotion ? {} : { opacity: heroOpacity }}
        >
          <motion.div
            className="hero-glass-panel"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="hero-badge">
              <Zap size={14} />
              <span>{banner?.badge || "New Arrivals Every Day"}</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="hero-title">
              {banner?.headline
                ? banner.headline
                : <>{`Shop Smart.`}<br /><span className="hero-title-accent">Track Smarter.</span></>
              }
            </motion.h1>

            <motion.p variants={fadeUp} className="hero-subtitle">
              {banner?.subheadline || "Discover thousands of products and keep track of every rupee you spend — all in one place."}
            </motion.p>

            <motion.div variants={fadeUp} className="hero-cta-row">
              <button className="hero-btn-primary" onClick={() => navigate(banner?.ctaLink || "/products")}>
                {banner?.ctaText || "Shop Now"} <ArrowRight size={18} />
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate("/expense-tracker")}>
                View Expenses
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="hero-stats">
              {[["10K+","Products"],["50K+","Customers"],["4.9★","Rating"]].map(([n,l]) => (
                <div className="hero-stat" key={l}>
                  <strong>{n}</strong><span>{l}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="scroll-cue"
          animate={reducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── Features Strip ── */}
      <motion.section
        className="features-strip"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        {features.map(({ icon: Icon, title, desc, color }) => (
          <motion.div className="feature-card" key={title} variants={fadeUp}>
            <div className="feature-icon" style={{ background: `${color}1a`, color }}>
              <Icon size={22} />
            </div>
            <div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Price Dropped Today ── */}
      {priceDrops.length > 0 && (
        <section className="price-drops-section">
          <motion.div
            className="section-header"
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
          >
            <div className="section-tag" style={{ color:"#22c55e", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)" }}>
              <TrendingDown size={14} /> Price Dropped Today
            </div>
            <h2>Flash Price Drops</h2>
            <p>Prices slashed in the last 7 days — grab them before they're gone</p>
          </motion.div>

          <motion.div
            className="price-drops-grid"
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {priceDrops.map((product) => {
              const drop = product.priceHistory?.length
                ? product.priceHistory[product.priceHistory.length - 1].price - product.price
                : 0;
              const pct = product.priceHistory?.length
                ? Math.round((drop / product.priceHistory[product.priceHistory.length - 1].price) * 100)
                : 0;
              return (
                <motion.div
                  key={product._id}
                  className="drop-card"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div className="drop-img-wrap">
                    <img src={product.image} alt={product.name} loading="lazy"
                      onError={(e) => { e.target.src = "https://placehold.co/300x220/1e293b/64748b?text=No+Image"; }} />
                    {pct > 0 && <span className="drop-pct-badge">↓ {pct}% off</span>}
                  </div>
                  <div className="drop-info">
                    <p className="drop-cat">{product.category}</p>
                    <h4 className="drop-name">{product.name}</h4>
                    <div className="drop-price-row">
                      <span className="drop-price">₹{product.price?.toLocaleString()}</span>
                      {drop > 0 && <span className="drop-was">was ₹{(product.price + drop)?.toLocaleString()}</span>}
                    </div>
                    <button
                      className="drop-cart-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <ShoppingCart size={14} />
                      {addedId === product._id ? "Added!" : "Add to Cart"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="categories-section">
        <motion.div
          className="section-header"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
        >
          <div className="section-tag"><Tag size={14} /> Categories</div>
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
        </motion.div>

        <motion.div
          className="categories-grid"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              className="category-card"
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
            >
              <div className={`category-icon-wrap bg-gradient-to-br ${cat.gradient}`}>
                <span className="category-emoji">{cat.icon}</span>
              </div>
              <p className="category-name">{cat.name}</p>
              <span className="category-count">{cat.count}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Promo Banner ── */}
      <motion.section
        className="promo-banner"
        initial="hidden" whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
      >
        <div className="promo-orb" aria-hidden />
        <div className="promo-content">
          <div className="promo-tag"><Star size={14} /> Smart Feature</div>
          <h2>Track Your Monthly Expenses</h2>
          <p>Know where every rupee goes. Detailed charts and insights on all your purchases — automatically tracked from your orders.</p>
          <button className="hero-btn-primary" onClick={() => navigate("/expense-tracker")}>
            Open Expense Tracker <ArrowRight size={18} />
          </button>
        </div>
        <div className="promo-visual" aria-hidden>
          <div className="promo-chart-mock">
            {[60,80,45,90,70,100,55].map((h, i) => (
              <motion.div
                key={i}
                className="promo-bar"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </div>
          <p>Your spending this week</p>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">🛍️</span>
            <span>Thansel Zovia</span>
          </div>
          <p>© 2026 Thansel Zovia. Built with ❤️ for India.</p>
          <p className="footer-sub">Shop Smart. Track Smarter.</p>
        </div>
      </footer>
    </div>
  );
}
