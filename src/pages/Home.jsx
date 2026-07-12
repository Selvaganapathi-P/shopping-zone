import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart, Zap } from "lucide-react";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import "./Home.css";

/* ── Data ────────────────────────────────────────────────────────────────── */
const CATS = [
  { name: "Electronics",    emoji: "💻", color: "#3B82F6", bg: "rgba(59,130,246,0.08)",   label: "2,400+ items" },
  { name: "Fashion",        emoji: "👗", color: "#EC4899", bg: "rgba(236,72,153,0.08)",   label: "5,100+ items" },
  { name: "Sports",         emoji: "⚽", color: "#F59E0B", bg: "rgba(245,158,11,0.08)",   label: "1,800+ items" },
  { name: "Books",          emoji: "📚", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)",   label: "9,000+ items" },
  { name: "Home & Kitchen", emoji: "🏠", color: "#10B981", bg: "rgba(16,185,129,0.08)",   label: "3,200+ items" },
  { name: "Beauty",         emoji: "💄", color: "#EF4444", bg: "rgba(239,68,68,0.08)",    label: "2,700+ items" },
];

const MARQUEE_WORDS = [
  "Shop Smart", "Track Smarter", "50,000+ Customers", "Free Delivery",
  "Secure Payments", "Easy Returns", "New Arrivals Daily", "Best Prices",
];

const LIVE = [
  { name: "Arjun M.",   city: "Bengaluru",  product: "Samsung 65″ 4K TV",  price: "₹82,999",   initials: "AM", color: "#3B82F6" },
  { name: "Priya S.",   city: "Chennai",    product: "Nike Air Max 270",    price: "₹9,495",    initials: "PS", color: "#EC4899" },
  { name: "Kiran R.",   city: "Mumbai",     product: "iPhone 15 Pro 256GB", price: "₹1,34,900", initials: "KR", color: "#8B5CF6" },
  { name: "Divya T.",   city: "Hyderabad",  product: "Dyson V15 Vacuum",    price: "₹54,900",   initials: "DT", color: "#10B981" },
  { name: "Rahul B.",   city: "Pune",       product: "Levi's 501 Jeans",    price: "₹3,999",    initials: "RB", color: "#F59E0B" },
  { name: "Sneha K.",   city: "Delhi",      product: "MacBook Air M2",      price: "₹1,14,900", initials: "SK", color: "#6366F1" },
  { name: "Vijay P.",   city: "Coimbatore", product: "Sony WH-1000XM5",     price: "₹31,490",   initials: "VP", color: "#EF4444" },
  { name: "Meera L.",   city: "Kochi",      product: "Banarasi Silk Saree", price: "₹4,299",    initials: "ML", color: "#F97316" },
];

const STATS = [
  { target: 10000, suffix: "+",  prefix: "",  label: "Products"  },
  { target: 50000, suffix: "+",  prefix: "",  label: "Customers" },
  { target: 4.9,   suffix: "★",  prefix: "",  label: "Rating"    },
  { target: 499,   suffix: "",   prefix: "₹", label: "Free from" },
];

/* ── Animation variants (file-level — stable references) ─────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } },
};
const slideL = {
  hidden:  { opacity: 0, x: -52 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};
const slideR = {
  hidden:  { opacity: 0, x: 52 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};

/* ── CountUp hook ────────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1700) {
  const [count,   setCount]   = useState(0);
  const elRef    = useRef(null);
  const started  = useRef(false);
  const isFloat  = target % 1 !== 0;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          const e = 1 - Math.pow(1 - p, 3);
          setCount(isFloat ? +(e * target).toFixed(1) : Math.floor(e * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, isFloat]);

  return { count, elRef };
}

/* ── Carousel hook ───────────────────────────────────────────────────────── */
function useCarousel(itemCount) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const check = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    check();
    el.addEventListener("scroll", check, { passive: true });
    return () => el.removeEventListener("scroll", check);
  }, [check, itemCount]);

  const left  = () => trackRef.current?.scrollBy({ left: -316, behavior: "smooth" });
  const right = () => trackRef.current?.scrollBy({ left:  316, behavior: "smooth" });

  return { trackRef, atStart, atEnd, left, right };
}

/* ── MagneticBtn ─────────────────────────────────────────────────────────── */
function MagneticBtn({ children, className, onClick }) {
  const ref = useRef(null);
  const [xy, setXY] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setXY({ x: (e.clientX - r.left - r.width / 2) * 0.20, y: (e.clientY - r.top - r.height / 2) * 0.20 });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={() => setXY({ x: 0, y: 0 })}
      animate={{ x: xy.x, y: xy.y }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
    >
      {children}
    </motion.button>
  );
}

/* ── Marquee ─────────────────────────────────────────────────────────────── */
function Marquee() {
  const all = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="marquee-outer" aria-hidden>
      <div className="marquee-track">
        {all.map((w, i) => (
          <span key={i} className="marquee-item">{w}<span className="marquee-sep"> · </span></span>
        ))}
      </div>
    </div>
  );
}

/* ── LiveActivity ────────────────────────────────────────────────────────── */
function LiveActivity() {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % LIVE.length); setVisible(true); }, 420);
    }, 4400);
    return () => clearInterval(t);
  }, []);

  const item = LIVE[idx];
  return (
    <div className="live-wrap">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={idx}
            className="live-toast"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{    y: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
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

/* ── StatCard ────────────────────────────────────────────────────────────── */
function StatCard({ target, suffix, prefix, label }) {
  const { count, elRef } = useCountUp(target);
  return (
    <div className="stat-card" ref={elRef}>
      <p className="stat-num">{prefix}{count.toLocaleString()}{suffix}</p>
      <p className="stat-lbl">{label}</p>
    </div>
  );
}

/* ── Home ────────────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const heroRef  = useRef(null);
  const [products, setProducts] = useState([]);
  const [addedId,  setAddedId]  = useState(null);
  const { addToCart }            = useCart();
  const carousel                 = useCarousel(products.length);

  const { scrollYProgress: pageY } = useScroll();
  const { scrollYProgress: heroY } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(heroY, [0, 0.72], [1, 0]);
  const heroSlide   = useTransform(heroY, [0, 1],    ["0%", "15%"]);

  useEffect(() => {
    API.get("/products").then(({ data }) => {
      setProducts(Array.isArray(data) ? data.slice(0, 18) : []);
    }).catch(() => {});
  }, []);

  const handleAdd = (e, p) => {
    e.stopPropagation();
    addToCart(p);
    setAddedId(p._id);
    toast.success(`${p.name} added!`);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="home-page">
      <Navbar transparent />

      {/* Page-wide scroll progress bar */}
      <motion.div className="scroll-progress-bar" style={{ scaleX: pageY }} />

      {/* ══════════════════════ HERO ══════════════════════════════ */}
      <section className="hero-section" ref={heroRef}>
        {/* Animated aurora blobs */}
        <div className="hero-bg" aria-hidden>
          <div className="h-blob b1" /><div className="h-blob b2" /><div className="h-blob b3" />
          <div className="h-grain" />
        </div>

        {/* Content fades + slides up as you scroll away */}
        <motion.div className="hero-inner" style={{ opacity: heroOpacity, y: heroSlide }}>

          {/* Eyebrow badge */}
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Zap size={12} /><span>New arrivals every day</span>
          </motion.div>

          {/* Headline — each word slides up from a clipped container */}
          <h1 className="hero-heading">
            {["India's", "Premium", "Shopping"].map((word, i) => (
              <span key={i} className="h-line">
                <motion.span
                  className={`h-word${i === 1 ? " h-word-accent" : ""}`}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%",   opacity: 1 }}
                  transition={{ delay: 0.22 + i * 0.13, duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Sub */}
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Thousands of products. Every rupee tracked — automatically.
          </motion.p>

          {/* CTA row */}
          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.86, duration: 0.5 }}
          >
            <MagneticBtn className="btn-primary-hero" onClick={() => navigate("/products")}>
              Shop Now <ArrowRight size={15} />
            </MagneticBtn>
            <MagneticBtn className="btn-ghost-hero" onClick={() => navigate("/products")}>
              Browse All
            </MagneticBtn>
          </motion.div>

          {/* Hero mini stats */}
          <motion.div
            className="hero-stats-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.04, duration: 0.6 }}
          >
            {[["10K+","Products"],["50K+","Customers"],["4.9★","Rating"]].map(([n, l]) => (
              <div key={l} className="h-stat">
                <strong>{n}</strong><span>{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <LiveActivity />

        {/* Mouse-scroll indicator */}
        <motion.div
          className="scroll-mouse"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <div className="mouse-body"><div className="mouse-dot" /></div>
        </motion.div>
      </section>

      {/* ══════════════════════ MARQUEE ══════════════════════════ */}
      <Marquee />

      {/* ══════════════════════ BENTO CATEGORIES ════════════════ */}
      <motion.section
        className="cats-section"
        variants={slideL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
      >
        <div className="section-intro">
          <p className="eyebrow">Explore</p>
          <h2 className="sec-h2">Shop by Category</h2>
        </div>
        <div className="bento-grid">
          {CATS.map((cat, i) => (
            <motion.button
              key={cat.name}
              className={`bento-card bc-${i}`}
              style={{ "--cc": cat.color, "--cbg": cat.bg }}
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
              whileHover={{ scale: 1.028 }}
              whileTap={{ scale: 0.972 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
            >
              <span className="bc-emoji">{cat.emoji}</span>
              <div className="bc-text">
                <span className="bc-name">{cat.name}</span>
                <span className="bc-count">{cat.label}</span>
              </div>
              <span className="bc-arrow"><ArrowRight size={13} /></span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════ PRODUCTS CAROUSEL ═══════════════ */}
      {products.length > 0 && (
        <motion.section
          className="trending-section"
          variants={slideR}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-70px" }}
        >
          <div className="trending-head">
            <div>
              <p className="eyebrow">Curated picks</p>
              <h2 className="sec-h2">Trending Right Now</h2>
            </div>
            <div className="t-nav">
              <button className="t-arrow" onClick={carousel.left}  disabled={carousel.atStart} aria-label="prev"><ChevronLeft  size={18}/></button>
              <button className="t-arrow" onClick={carousel.right} disabled={carousel.atEnd}   aria-label="next"><ChevronRight size={18}/></button>
              <button className="view-all-link" onClick={() => navigate("/products")}>View all <ArrowRight size={13}/></button>
            </div>
          </div>

          <div className="t-track" ref={carousel.trackRef}>
            {products.map((p) => (
              <motion.div
                key={p._id}
                className="t-card"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/products/${p._id}`)}
              >
                <div className="t-img">
                  <img
                    src={p.image || "https://placehold.co/280x210/EEEEEE/AAAAAA?text=No+Image"}
                    alt={p.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/280x210/EEEEEE/AAAAAA?text=No+Image"; }}
                  />
                </div>
                <div className="t-info">
                  <p className="t-cat">{p.category}</p>
                  <p className="t-name">{p.name}</p>
                  <div className="t-row">
                    <span className="t-price">₹{p.price?.toLocaleString()}</span>
                    <button
                      className={`t-add${addedId === p._id ? " added" : ""}`}
                      onClick={(e) => handleAdd(e, p)}
                      aria-label="Add to cart"
                    >
                      {addedId === p._id ? "✓" : <ShoppingCart size={13}/>}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ══════════════════════ STATS ════════════════════════════ */}
      <motion.section
        className="stats-section"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="stats-grid">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </motion.section>

      {/* ══════════════════════ CTA ══════════════════════════════ */}
      <motion.section
        className="cta-section"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="cta-glow cta-glow-l" aria-hidden />
        <div className="cta-glow cta-glow-r" aria-hidden />
        <div className="cta-inner">
          <p className="eyebrow" style={{ color: "rgba(255,180,150,0.8)" }}>Get started today</p>
          <h2 className="cta-h2">Ready to shop smarter?</h2>
          <p className="cta-sub">Join 50,000+ happy customers discovering the best deals every day.</p>
          <MagneticBtn className="btn-cta-white" onClick={() => navigate("/products")}>
            Explore Products <ArrowRight size={16}/>
          </MagneticBtn>
        </div>
      </motion.section>

      {/* ══════════════════════ FOOTER ═══════════════════════════ */}
      <footer className="home-footer">
        <div className="footer-inner">
          <span className="footer-brand">🛍️ Thansel Zovia</span>
          <p>© 2026 Thansel Zovia · Built with ❤️ for India · Shop Smart. Track Smarter.</p>
        </div>
      </footer>
    </div>
  );
}
