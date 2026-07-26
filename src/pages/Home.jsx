import { useRef, useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, ArrowRight, Star, Zap, Shield, RotateCcw,
  Headphones, ChevronRight, TrendingUp, Sparkles,
  Truck, BadgeCheck, Heart,
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { MAIN_CATEGORIES } from "../config/categories";
import toast from "react-hot-toast";
import "./Home.css";

// ── Three.js floating orb ────────────────────────────────────────────────────
function HeroOrb() {
  const mesh = useRef();
  const wire = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.18;
      mesh.current.rotation.z = t * 0.09;
    }
    if (wire.current) {
      wire.current.rotation.y = -t * 0.12;
    }
  });
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.5, 1]} />
        <MeshDistortMaterial
          color="#ea580c"
          emissive="#7c2d12"
          emissiveIntensity={0.5}
          metalness={0.85}
          roughness={0.08}
          distort={0.35}
          speed={2.5}
        />
      </mesh>
      <mesh ref={wire} scale={1.7}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.06} wireframe />
      </mesh>
    </Float>
  );
}

// ── Marquee brands ────────────────────────────────────────────────────────────
const BRANDS = [
  "Samsung","Apple","OnePlus","Xiaomi","Nike","Adidas","Levi's","Sony",
  "Fossil","L'Oréal","Prestige","Dell","HP","boAt","Mamaearth","Canon",
  "Tanishq","American Tourister","Philips","Lenovo",
];

// ── Category icons ────────────────────────────────────────────────────────────
const CAT_META = {
  "Electronics":            { icon: "📱", color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  "Fashion":                { icon: "👗", color: "#ec4899", bg: "rgba(236,72,153,0.1)"  },
  "Home & Kitchen":         { icon: "🏠", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  "Beauty & Personal Care": { icon: "💄", color: "#a855f7", bg: "rgba(168,85,247,0.1)"  },
  "Sports & Fitness":       { icon: "⚽", color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  "Books":                  { icon: "📚", color: "#6366f1", bg: "rgba(99,102,241,0.1)"  },
  "Groceries":              { icon: "🛒", color: "#84cc16", bg: "rgba(132,204,22,0.1)"  },
  "Jewellery & Watches":    { icon: "💍", color: "#eab308", bg: "rgba(234,179,8,0.1)"   },
  "Travel & Luggage":       { icon: "🧳", color: "#06b6d4", bg: "rgba(6,182,212,0.1)"   },
  "Baby Products":          { icon: "🍼", color: "#f97316", bg: "rgba(249,115,22,0.1)"  },
  "Pet Supplies":           { icon: "🐾", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  "Automotive":             { icon: "🚗", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  "Office Supplies":        { icon: "🖊️", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)"  },
  "Musical Instruments":    { icon: "🎸", color: "#d946ef", bg: "rgba(217,70,239,0.1)"  },
};

const FEATURES = [
  { icon: Truck,      title: "Free Delivery",   desc: "Free shipping on orders above ₹499",     color: "#22c55e" },
  { icon: RotateCcw,  title: "Easy Returns",    desc: "7-day hassle-free return policy",          color: "#3b82f6" },
  { icon: Shield,     title: "100% Secure",     desc: "Bank-grade encrypted payments",            color: "#a855f7" },
  { icon: Headphones, title: "24/7 Support",    desc: "Dedicated team available round the clock", color: "#ea580c" },
];

const STATS = [
  { value: 10000, suffix: "+",  label: "Products",       decimal: false },
  { value: 50,    suffix: "K+", label: "Happy Customers",decimal: false },
  { value: 14,    suffix: "",   label: "Categories",     decimal: false },
  { value: 4.9,   suffix: "★",  label: "Rating",        decimal: true  },
];


const cardV = {
  hidden:  { opacity: 0, y: 36 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55, ease: [0.16,1,0.3,1] } }),
};

// ── ProductCard ───────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  return (
    <motion.div
      className="hpc-card"
      onClick={() => navigate(`/products/${product._id}`)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <div className="hpc-img-wrap">
        <img
          src={product.image || "https://placehold.co/400x400/12121f/ea580c?text=No+Img"}
          alt={product.name}
          onError={(e) => { e.target.src = "https://placehold.co/400x400/12121f/ea580c?text=No+Img"; }}
        />
        {discount && <span className="hpc-discount">{discount}% OFF</span>}
        {product.isTrending && <span className="hpc-trend"><Zap size={10}/> Hot</span>}
      </div>
      <div className="hpc-body">
        <p className="hpc-cat">{product.subcategory || product.category}</p>
        <h3 className="hpc-name">{product.name}</h3>
        <div className="hpc-meta">
          <div className="hpc-price-row">
            <span className="hpc-price">₹{product.price.toLocaleString()}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="hpc-mrp">₹{product.mrp.toLocaleString()}</span>
            )}
          </div>
          <span className="hpc-rating"><Star size={11} fill="#f59e0b" stroke="none" /> {product.rating}</span>
        </div>
        <motion.button
          className={`hpc-btn ${added ? "hpc-btn-added" : ""}`}
          onClick={handleAdd}
          whileTap={{ scale: 0.96 }}
        >
          {added ? <><BadgeCheck size={15}/> Added!</> : <><ShoppingBag size={15}/> Add to Cart</>}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Home() {
  const navigate  = useNavigate();
  const { addToCart } = useCart();
  const { user }  = useAuth();

  const statsRef   = useRef(null);
  const sectionsRef= useRef(null);

  const [products,  setProducts]  = useState([]);
  const [trending,  setTrending]  = useState([]);
  const [newArrivals, setNew]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  // ── Fetch products ──────────────────────────────────────────────────────────
  useEffect(() => {
    API.get("/products")
      .then(({ data }) => {
        setProducts(data);
        setTrending(data.filter(p => p.isTrending || p.isBestSeller).slice(0, 10));
        setNew(data.filter(p => p.isNewArrival).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Scroll reveals (IntersectionObserver) ───────────────────────────────────
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal-section").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Counter animation (IntersectionObserver + rAF) ──────────────────────────
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.val);
        const dec    = el.dataset.dec === "1";
        const start  = performance.now();
        const dur    = 2200;
        const tick   = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = dec
            ? (target * eased).toFixed(1)
            : Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      }),
      { threshold: 0.5 }
    );
    document.querySelectorAll(".stat-num").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Live purchase ticker ────────────────────────────────────────────────────
  const handleAdd = (product) => {
    if (!user) { toast.error("Login to add to cart"); navigate("/login"); return; }
    addToCart(product);
    toast.success(`${product.name.split(" ").slice(0,3).join(" ")} added!`);
  };

  // ── Visible categories (top 8) ─────────────────────────────────────────────
  const visibleCats = MAIN_CATEGORIES.slice(0, 8);

  return (
    <div className="home-root">
      <Navbar transparent />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="home-hero">
        {/* Glow orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Grid lines */}
        <div className="hero-grid" aria-hidden="true" />

        <div className="section-container hero-inner">
          {/* Left content */}
          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Sparkles size={13} /> Premium Shopping Experience
            </motion.div>

            <h1 className="hero-title">
              <motion.span className="hero-line" initial={{ opacity: 0, y: 70, skewY: 2 }} animate={{ opacity: 1, y: 0, skewY: 0 }} transition={{ delay: 0.28, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>Shop Every</motion.span>
              <motion.span className="hero-line hero-line-accent" initial={{ opacity: 0, y: 70, skewY: 2 }} animate={{ opacity: 1, y: 0, skewY: 0 }} transition={{ delay: 0.40, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>Category,</motion.span>
              <motion.span className="hero-line" initial={{ opacity: 0, y: 70, skewY: 2 }} animate={{ opacity: 1, y: 0, skewY: 0 }} transition={{ delay: 0.52, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>Track Every</motion.span>
              <motion.span className="hero-line" initial={{ opacity: 0, y: 70, skewY: 2 }} animate={{ opacity: 1, y: 0, skewY: 0 }} transition={{ delay: 0.64, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>Rupee.</motion.span>
            </h1>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Discover 10,000+ products across 14 categories — from the latest
              electronics to everyday essentials. All in one premium store.
            </motion.p>

            <div className="hero-ctas">
              <motion.button
                className="hero-btn-primary"
                onClick={() => navigate("/products")}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: 0.72, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Shop Now <ArrowRight size={18} />
              </motion.button>
              <motion.button
                className="hero-btn-ghost"
                onClick={() => navigate("/products")}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: 0.82, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Explore Categories
              </motion.button>
            </div>

            <div className="hero-stats-row">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="hero-stat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.90 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="hero-stat-value">
                    <span className="stat-num" data-val={s.value} data-dec={s.decimal ? "1" : "0"}>
                      {s.decimal ? s.value.toFixed(1) : s.value.toLocaleString()}
                    </span>
                    <span className="hero-stat-suffix">{s.suffix}</span>
                  </div>
                  <div className="hero-stat-label">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — Three.js canvas */}
          <div className="hero-3d">
            <Suspense fallback={<div className="hero-3d-fallback" />}>
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
              >
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} color="#f97316" />
                <pointLight position={[-4, -4, -4]} intensity={0.6} color="#3b82f6" />
                <HeroOrb />
                <Environment preset="city" />
              </Canvas>
            </Suspense>
            {/* Decorative floating badges */}
            <motion.div className="hero-float-badge hero-fb-1"
              animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              📱 iPhone 16 Pro
            </motion.div>
            <motion.div className="hero-float-badge hero-fb-2"
              animate={{ y: [6, -6, 6] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              ⚡ Flash Deals
            </motion.div>
            <motion.div className="hero-float-badge hero-fb-3"
              animate={{ y: [-5, 9, -5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              🛒 Free Delivery
            </motion.div>
          </div>
        </div>


        {/* Scroll indicator */}
        <motion.div className="scroll-indicator"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
        </motion.div>
      </section>

      {/* ══ BRAND MARQUEE ═════════════════════════════════════════════════════ */}
      <div className="brands-strip">
        <div className="brands-marquee">
          <div className="brands-track">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="brand-item">
                <span className="brand-dot" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CATEGORIES ════════════════════════════════════════════════════════ */}
      <section className="home-section reveal-section" ref={sectionsRef}>
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-tag"><TrendingUp size={13}/> Shop By Category</span>
              <h2 className="section-title">Everything You Need</h2>
            </div>
            <button className="see-all-btn" onClick={() => navigate("/products")}>
              View All <ChevronRight size={16}/>
            </button>
          </div>

          <div className="cats-grid">
            {visibleCats.map((cat, i) => {
              const meta = CAT_META[cat.name] || { icon: "🛍️", color: "#ea580c", bg: "rgba(234,88,12,0.1)" };
              return (
                <motion.button
                  key={cat.name}
                  className="cat-card"
                  custom={i}
                  variants={cardV}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                  style={{ "--cat-color": meta.color, "--cat-bg": meta.bg }}
                >
                  <div className="cat-icon-wrap">
                    <span className="cat-icon">{meta.icon}</span>
                  </div>
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                  </div>
                  <ArrowRight size={14} className="cat-arrow" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TRENDING PRODUCTS ═════════════════════════════════════════════════ */}
      <section className="home-section reveal-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <span className="section-tag"><Zap size={13}/> Trending Now</span>
              <h2 className="section-title">Hot This Week</h2>
            </div>
            <button className="see-all-btn" onClick={() => navigate("/products")}>
              View All <ChevronRight size={16}/>
            </button>
          </div>

          {loading ? (
            <div className="hpc-skeleton-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="hpc-skeleton">
                  <div className="skeleton-img shimmer" />
                  <div className="skeleton-body">
                    <div className="shimmer" style={{ height:12, width:"60%", borderRadius:6, marginBottom:8 }} />
                    <div className="shimmer" style={{ height:16, width:"90%", borderRadius:6, marginBottom:12 }} />
                    <div className="shimmer" style={{ height:14, width:"40%", borderRadius:6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hpc-scroll-row">
              {(trending.length ? trending : products.slice(0, 10)).map((p, i) => (
                <motion.div key={p._id}
                  initial={{ opacity:0, x:30 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ delay: i * 0.06, duration:0.5, ease:[0.16,1,0.3,1] }}>
                  <ProductCard product={p} onAdd={handleAdd} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ STATS STRIP ═══════════════════════════════════════════════════════ */}
      <section className="stats-section reveal-section" ref={statsRef}>
        <div className="stats-glow" />
        <div className="section-container stats-inner">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-value">
                <span className="stat-num" data-val={s.value} data-dec={s.decimal ? "1" : "0"}>
                  {s.decimal ? s.value.toFixed(1) : s.value.toLocaleString()}
                </span>
                <span className="stat-card-suffix">{s.suffix}</span>
              </div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section className="home-section reveal-section">
        <div className="section-container">
          <div className="section-header center">
            <div>
              <span className="section-tag"><BadgeCheck size={13}/> Why Choose Us</span>
              <h2 className="section-title">Built for Your Trust</h2>
            </div>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className="feature-card"
                custom={i} variants={cardV} initial="hidden"
                whileInView="visible" viewport={{ once:true, amount:0.2 }}
                whileHover={{ y:-4 }}>
                <div className="feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  <f.icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NEW ARRIVALS ══════════════════════════════════════════════════════ */}
      {(newArrivals.length > 0 || products.length > 0) && (
        <section className="home-section reveal-section">
          <div className="section-container">
            <div className="section-header">
              <div>
                <span className="section-tag"><Sparkles size={13}/> Fresh Drops</span>
                <h2 className="section-title">New Arrivals</h2>
              </div>
              <button className="see-all-btn" onClick={() => navigate("/products")}>
                View All <ChevronRight size={16}/>
              </button>
            </div>
            <div className="new-arrivals-grid">
              {(newArrivals.length ? newArrivals : products.slice(10, 18)).map((p, i) => (
                <motion.div key={p._id}
                  custom={i} variants={cardV} initial="hidden"
                  whileInView="visible" viewport={{ once:true, amount:0.15 }}>
                  <ProductCard product={p} onAdd={handleAdd} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CTA BANNER ════════════════════════════════════════════════════════ */}
      <section className="cta-banner reveal-section">
        <div className="cta-glow-1" />
        <div className="cta-glow-2" />
        <div className="section-container cta-inner">
          <motion.div
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}>
            <span className="section-tag" style={{ justifyContent:"center" }}>
              <Heart size={13}/> Loved by 50,000+ Shoppers
            </span>
            <h2 className="cta-title">Discover Your Next Favourite</h2>
            <p className="cta-sub">
              Join thousands of satisfied customers across India who trust
              Thansel Zovia for quality products at unbeatable prices.
            </p>
            <div className="cta-btns">
              <motion.button className="hero-btn-primary" onClick={() => navigate("/products")}
                whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
                Start Shopping <ArrowRight size={17}/>
              </motion.button>
              {!user && (
                <motion.button className="hero-btn-ghost" onClick={() => navigate("/signup")}
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                  Create Account
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <footer className="home-footer">
        <div className="section-container footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">🛍️ Thansel Zovia</span>
            <p className="footer-tagline">
              Premium shopping, smarter spending.
            </p>
          </div>
          <div className="footer-links">
            {[["Shop",["All Products","/products"],["Electronics","/products?category=Electronics"],["Fashion","/products?category=Fashion"]],
              ["Account",["Login","/login"],["Sign Up","/signup"],["My Cart","/cart"]],
              ["Support",["Help Center","#"],["Returns","#"],["Contact","#"]]].map(([title,...links]) => (
              <div key={title} className="footer-col">
                <h4 className="footer-col-title">{title}</h4>
                {links.map(([label, href]) => (
                  <button key={label} className="footer-link"
                    onClick={() => href !== "#" && navigate(href)}>{label}</button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Thansel Zovia. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </footer>
    </div>
  );
}
