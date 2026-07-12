import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  { name: "Electronics",   icon: "💻", color: "#3B82F6", bg: "#EFF6FF", count: "2,400+ items" },
  { name: "Fashion",       icon: "👗", color: "#EC4899", bg: "#FDF2F8", count: "5,100+ items" },
  { name: "Home & Kitchen",icon: "🏠", color: "#10B981", bg: "#ECFDF5", count: "3,200+ items" },
  { name: "Sports",        icon: "⚽", color: "#F59E0B", bg: "#FFFBEB", count: "1,800+ items" },
  { name: "Books",         icon: "📚", color: "#8B5CF6", bg: "#F5F3FF", count: "9,000+ items" },
  { name: "Beauty",        icon: "💄", color: "#EF4444", bg: "#FEF2F2", count: "2,700+ items" },
];

const features = [
  { icon: Truck,       title: "Free Delivery",  desc: "On orders above ₹499",      color: "#10B981", bg: "#ECFDF5" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% safe transactions",     color: "#3B82F6", bg: "#EFF6FF" },
  { icon: TrendingUp,  title: "Track Expenses", desc: "Monitor every rupee",        color: "#F59E0B", bg: "#FFFBEB" },
  { icon: ShoppingBag, title: "Best Deals",     desc: "Unbeatable prices daily",    color: "#8B5CF6", bg: "#F5F3FF" },
];

const LIVE_PURCHASES = [
  { name: "Arjun M.",  city: "Bengaluru", product: "Samsung 65″ 4K TV",    price: "₹82,999",   initials: "AM", color: "#3B82F6" },
  { name: "Priya S.",  city: "Chennai",   product: "Nike Air Max 270",      price: "₹9,495",    initials: "PS", color: "#EC4899" },
  { name: "Kiran R.",  city: "Mumbai",    product: "iPhone 15 Pro 256GB",   price: "₹1,34,900", initials: "KR", color: "#8B5CF6" },
  { name: "Divya T.",  city: "Hyderabad", product: "Dyson V15 Vacuum",      price: "₹54,900",   initials: "DT", color: "#10B981" },
  { name: "Rahul B.",  city: "Pune",      product: "Levi's 501 Jeans",      price: "₹3,999",    initials: "RB", color: "#F59E0B" },
  { name: "Sneha K.",  city: "Delhi",     product: "Apple MacBook Air M2",  price: "₹1,14,900", initials: "SK", color: "#6366F1" },
  { name: "Vijay P.",  city: "Coimbatore",product: "Sony WH-1000XM5",       price: "₹31,490",   initials: "VP", color: "#EF4444" },
  { name: "Meera L.",  city: "Kochi",     product: "Banarasi Silk Saree",   price: "₹4,299",    initials: "ML", color: "#F97316" },
  { name: "Arun K.",   city: "Madurai",   product: "Prestige Smart OTG",    price: "₹6,800",    initials: "AK", color: "#14B8A6" },
  { name: "Ravi N.",   city: "Jaipur",    product: "Fitbit Charge 6",       price: "₹14,999",   initials: "RN", color: "#A855F7" },
];

function LiveActivity() {
  const [idx,  setIdx]  = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE_PURCHASES.length); setShow(true); }, 500);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const item = LIVE_PURCHASES[idx];

  return (
    <div className="live-wrap">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={idx}
            className="live-toast"
            initial={{ x: -60, opacity: 0, scale: 0.92 }}
            animate={{ x: 0,   opacity: 1, scale: 1    }}
            exit={{    x: -40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="live-avatar" style={{ background: item.color }}>{item.initials}</div>
            <div className="live-body">
              <div className="live-line1">
                <span className="live-blink" />
                <strong>{item.name}</strong>&nbsp;from&nbsp;{item.city}
              </div>
              <div className="live-line2">just bought <em>{item.product}</em></div>
            </div>
            <span className="live-price">{item.price}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const HERO_VIDEO  = "https://videos.pexels.com/video-files/3763895/3763895-uhd_2560_1440_25fps.mp4";
const HERO_POSTER = "https://images.pexels.com/photos/5632388/pexels-photo-5632388.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80";

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const navigate      = useNavigate();
  const videoRef      = useRef(null);
  const heroRef       = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [reducedMotion]               = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [banner,    setBanner]        = useState(null);
  const [priceDrops, setPriceDrops]  = useState([]);
  const [addedId,   setAddedId]       = useState(null);
  const { addToCart } = useCart();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => { if (reducedMotion && videoRef.current) videoRef.current.pause(); }, [reducedMotion]);

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

      {/* ── Hero ── */}
      <section className="hero-section" ref={heroRef}>
        <motion.div className="hero-video-wrap" style={reducedMotion ? {} : { y: heroY }}>
          <video
            ref={videoRef}
            className={`hero-video ${videoLoaded ? "loaded" : ""}`}
            autoPlay muted loop playsInline poster={HERO_POSTER}
            onCanPlay={() => setVideoLoaded(true)}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </motion.div>

        <div className="hero-orbs" aria-hidden>
          <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        </div>

        <motion.div className="hero-content-wrap" style={reducedMotion ? {} : { opacity: heroOpacity }}>
          <motion.div className="hero-glass-panel" variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="hero-badge">
              <Zap size={14} /><span>{banner?.badge || "New Arrivals Every Day"}</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="hero-title">
              {banner?.headline
                ? banner.headline
                : <>{`Shop Smart.`}<br /><span className="hero-title-accent">Track Smarter.</span></>
              }
            </motion.h1>

            <motion.p variants={fadeUp} className="hero-subtitle">
              {banner?.subheadline || "Discover thousands of products at unbeatable prices. Every rupee tracked — automatically."}
            </motion.p>

            <motion.div variants={fadeUp} className="hero-cta-row">
              <button className="hero-btn-primary" onClick={() => navigate(banner?.ctaLink || "/products")}>
                {banner?.ctaText || "Shop Now"} <ArrowRight size={18} />
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate("/products")}>
                Browse Categories
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="hero-stats">
              {[["10K+","Products"],["50K+","Customers"],["4.9★","Rating"]].map(([n, l]) => (
                <div className="hero-stat" key={l}><strong>{n}</strong><span>{l}</span></div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Live activity ticker */}
        <LiveActivity />

        <motion.div className="scroll-cue" animate={reducedMotion ? {} : { y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── Features strip ── */}
      <motion.section className="features-strip" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
        {features.map(({ icon: Icon, title, desc, color, bg }) => (
          <motion.div className="feature-card" key={title} variants={fadeUp}>
            <div className="feature-icon" style={{ background: bg, color }}>
              <Icon size={22} />
            </div>
            <div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Price drops ── */}
      {priceDrops.length > 0 && (
        <section className="price-drops-section">
          <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
            <div className="section-tag green-tag"><TrendingDown size={14} /> Price Dropped Today</div>
            <h2>Flash Price Drops</h2>
            <p>Prices slashed in the last 7 days — grab them before they're gone</p>
          </motion.div>
          <div className="price-drops-grid">
            {priceDrops.map((product, i) => {
              const drop = product.priceHistory?.length
                ? product.priceHistory[product.priceHistory.length - 1].price - product.price : 0;
              const pct = product.priceHistory?.length
                ? Math.round((drop / product.priceHistory[product.priceHistory.length - 1].price) * 100) : 0;
              return (
                <motion.div
                  key={product._id}
                  className="drop-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22,1,0.36,1] }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div className="drop-img-wrap">
                    <img src={product.image || "https://placehold.co/300x220/F4F4F8/9898B0?text=No+Image"} alt={product.name} loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x220/F4F4F8/9898B0?text=No+Image"; }} />
                    {pct > 0 && <span className="drop-pct-badge">↓ {pct}% off</span>}
                  </div>
                  <div className="drop-info">
                    <p className="drop-cat">{product.category}</p>
                    <h4 className="drop-name">{product.name}</h4>
                    <div className="drop-price-row">
                      <span className="drop-price">₹{product.price?.toLocaleString()}</span>
                      {drop > 0 && <span className="drop-was">₹{(product.price + drop)?.toLocaleString()}</span>}
                    </div>
                    <button className="drop-cart-btn" onClick={(e) => handleAddToCart(e, product)}>
                      <ShoppingCart size={14} />
                      {addedId === product._id ? "Added!" : "Add to Cart"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="categories-section">
        <motion.div className="section-header" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
          <div className="section-tag"><Tag size={14} /> Categories</div>
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
        </motion.div>

        <div className="categories-grid">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              className="category-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22,1,0.36,1] }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
            >
              <div className="category-icon-wrap" style={{ background: cat.bg }}>
                <span className="category-emoji">{cat.icon}</span>
              </div>
              <p className="category-name">{cat.name}</p>
              <span className="category-count">{cat.count}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Promo banner ── */}
      <motion.section className="promo-banner" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
        <div className="promo-content">
          <div className="section-tag" style={{ marginBottom: 16 }}><Star size={14} /> Smart Feature</div>
          <h2>Track Every Rupee You Spend</h2>
          <p>Know exactly where your money goes. Auto-categorised spending insights from all your orders — beautifully visualised.</p>
          <button className="hero-btn-primary" onClick={() => navigate("/expense-tracker")}>
            Open Expense Tracker <ArrowRight size={18} />
          </button>
        </div>
        <div className="promo-visual" aria-hidden>
          <div className="promo-chart-mock">
            {[60,80,45,90,70,100,55].map((h, i) => (
              <motion.div
                key={i} className="promo-bar"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: "easeOut" }}
              />
            ))}
          </div>
          <p>Your spending this week</p>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand"><span className="footer-logo">🛍️</span><span>Thansel Zovia</span></div>
          <p>© 2026 Thansel Zovia. Built with ❤️ for India.</p>
          <p className="footer-sub">Shop Smart. Track Smarter.</p>
        </div>
      </footer>
    </div>
  );
}
