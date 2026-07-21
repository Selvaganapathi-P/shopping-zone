import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Home.css";

// ── File-level constants ───────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "Shop Smart", "Track Every Rupee", "50,000+ Customers",
  "Free Delivery", "Easy Returns", "Premium Quality",
  "New Arrivals Daily", "Zero Hidden Charges",
];

const LIVE_EVENTS = [
  { name: "Rahul M.", city: "Mumbai",    product: "iPhone 15 Pro",       emoji: "📱" },
  { name: "Priya S.", city: "Delhi",     product: "Nike Air Max",         emoji: "👟" },
  { name: "Arjun K.", city: "Bangalore", product: "Sony WH-1000XM5",     emoji: "🎧" },
  { name: "Sneha R.", city: "Chennai",   product: "MacBook Air M2",       emoji: "💻" },
  { name: "Vivek T.", city: "Hyderabad", product: "Levi's 501 Jeans",    emoji: "👖" },
  { name: "Neha P.",  city: "Pune",      product: "Canon EOS R50",        emoji: "📸" },
  { name: "Karan L.", city: "Kolkata",   product: "boAt Airdopes 141",   emoji: "🎵" },
  { name: "Divya A.", city: "Ahmedabad", product: "Philips Air Fryer",   emoji: "🍳" },
];

const FEATURES = [
  {
    id: "catalog",
    tag: "Massive Selection",
    big: "10K+",
    title: "Products Curated Daily",
    desc: "From electronics to fashion — a living catalogue updated every day, across every category you care about.",
    bg: "dark",
  },
  {
    id: "track",
    tag: "Smart Finance",
    big: "₹0",
    title: "Hidden Charges. Zero.",
    desc: "Auto-categorised expense insights from every order. See exactly where your money goes, beautifully.",
    bg: "light",
  },
  {
    id: "delivery",
    tag: "Fast & Free",
    big: "499",
    title: "Free From ₹499",
    desc: "Express shipping across India. Order by 6 PM and get it the next morning — no excuses, no delays.",
    bg: "accent",
  },
];

const CATS = [
  { name: "Electronics",   emoji: "📱", sub: "Phones, Laptops, Cameras" },
  { name: "Fashion",       emoji: "👗", sub: "Men, Women, Kids" },
  { name: "Sports",        emoji: "⚽", sub: "Gear, Clothing, Equipment" },
  { name: "Books",         emoji: "📚", sub: "Fiction, Learning, Kids" },
  { name: "Home & Living", emoji: "🏠", sub: "Decor, Kitchen, Garden" },
  { name: "Beauty",        emoji: "💄", sub: "Skin, Hair, Fragrance" },
];

const STATS = [
  { target: 10000, suffix: "+",  prefix: "",  label: "Products",     dec: 0 },
  { target: 50,    suffix: "K+", prefix: "",  label: "Customers",    dec: 0 },
  { target: 99,    suffix: "%",  prefix: "",  label: "Satisfaction", dec: 0 },
  { target: 4.9,   suffix: "★",  prefix: "",  label: "App Rating",   dec: 1 },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};
const slideL = {
  hidden:  { opacity: 0, x: -52 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.66, ease: [0.22, 1, 0.36, 1] } },
};
const slideR = {
  hidden:  { opacity: 0, x: 52 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.66, ease: [0.22, 1, 0.36, 1] } },
};

// ── Custom glow cursor ─────────────────────────────────────────────────────

function GlowCursor() {
  const dotRef  = useRef(null);
  const glowRef = useRef(null);
  const pos     = useRef({ x: -400, y: -400 });
  const lerp    = useRef({ x: -400, y: -400 });
  const rafRef  = useRef(null);

  useEffect(() => {
    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      lerp.current.x += (pos.current.x - lerp.current.x) * 0.07;
      lerp.current.y += (pos.current.y - lerp.current.y) * 0.07;
      if (dotRef.current)
        dotRef.current.style.transform =
          `translate(${pos.current.x - 4}px,${pos.current.y - 4}px)`;
      if (glowRef.current)
        glowRef.current.style.transform =
          `translate(${lerp.current.x - 230}px,${lerp.current.y - 230}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="c-dot"  aria-hidden="true" />
      <div ref={glowRef} className="c-glow" aria-hidden="true" />
    </>
  );
}

// ── Hero product grid card ─────────────────────────────────────────────────

function HeroCard({ product, floatDur, floatAmp, tall, onNav, delay = 0 }) {
  const fallback = `https://placehold.co/300x240/1A1A2E/6666AA?text=${
    encodeURIComponent(product?.name?.split(" ")[0] || "Item")
  }`;
  const disc = product?.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <motion.div
      className={`hpg-card${tall ? " hpg-tall" : ""}`}
      animate={{ y: [0, floatAmp, 0] }}
      transition={{ repeat: Infinity, duration: floatDur, ease: "easeInOut", delay }}
      onClick={() => product?._id && onNav(`/products/${product._id}`)}
      style={{ cursor: product?._id ? "pointer" : "default" }}
    >
      {product ? (
        <>
          <div className={`hpg-img${tall ? " hpg-img-tall" : ""}`}>
            <img src={product.image} alt={product.name}
              onError={(e) => { e.target.onerror = null; e.target.src = fallback; }} />
            {disc > 0 && <span className="hpg-disc">{disc}% OFF</span>}
          </div>
          <div className="hpg-info">
            <span className="hpg-cat">{product.category}</span>
            <span className="hpg-name">{product.name}</span>
            <div className="hpg-price-row">
              <span className="hpg-price">₹{product.price?.toLocaleString("en-IN")}</span>
              {disc > 0 && <span className="hpg-mrp">₹{product.mrp?.toLocaleString("en-IN")}</span>}
            </div>
          </div>
        </>
      ) : (
        <div className="hpg-shimmer" />
      )}
    </motion.div>
  );
}

// ── Live activity toast ────────────────────────────────────────────────────

function LiveActivity() {
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    const show = () => {
      idx.current = (idx.current + 1) % LIVE_EVENTS.length;
      setCurrent(LIVE_EVENTS[idx.current]);
      setVisible(true);
      setTimeout(() => setVisible(false), 3200);
    };
    const t  = setTimeout(show, 2600);
    const iv = setInterval(show, 5500);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);

  return (
    <div className="live-wrap" aria-live="polite">
      <AnimatePresence>
        {visible && current && (
          <motion.div
            key={current.product}
            className="live-toast"
            initial={{ opacity: 0, y: 26, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
          >
            <span className="live-emoji">{current.emoji}</span>
            <div className="live-text">
              <strong>{current.name}</strong> from {current.city}
              <p>just bought {current.product}</p>
            </div>
            <span className="live-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Marquee strip ──────────────────────────────────────────────────────────

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="mq-outer" aria-hidden="true">
      <div className="mq-track">
        {items.map((item, i) => (
          <span key={i} className="mq-item">
            {item} <span className="mq-sep">✦</span>{" "}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Magnetic button ────────────────────────────────────────────────────────

function MagneticBtn({ children, className, onClick }) {
  const ref = useRef(null);
  const [xy, setXY] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    setXY({
      x: (e.clientX - r.left - r.width  / 2) * 0.22,
      y: (e.clientY - r.top  - r.height / 2) * 0.22,
    });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      animate={{ x: xy.x, y: xy.y }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      onMouseMove={onMove}
      onMouseLeave={() => setXY({ x: 0, y: 0 })}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// ── Count-up hook ──────────────────────────────────────────────────────────

function useCountUp(target, dur, dec) {
  const [val, setVal] = useState(0);
  const wrapRef = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const step = (now) => {
          const p    = Math.min((now - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(+(target * ease).toFixed(dec));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, dur, dec]);

  return [val, wrapRef];
}

function StatCard({ target, suffix, prefix, label, dec }) {
  const [val, ref] = useCountUp(target, 1800, dec);
  return (
    <div ref={ref} className="stat-card">
      <div className="stat-num">
        {prefix}{dec ? val.toFixed(dec) : Math.round(val).toLocaleString("en-IN")}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Carousel hook ──────────────────────────────────────────────────────────

function useCarousel() {
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
    el.addEventListener("scroll", check, { passive: true });
    check();
    return () => el.removeEventListener("scroll", check);
  }, [check]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return { trackRef, atStart, atEnd, scroll };
}

// ── Home ───────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate  = useNavigate();
  const heroRef   = useRef(null);

  const [products, setProducts] = useState([]);
  const [addedId,  setAddedId]  = useState(null);

  const { addToCart } = useCart();
  const { user }      = useAuth();
  const carousel      = useCarousel();

  const { scrollYProgress: pageY } = useScroll();
  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroFade  = useTransform(heroP, [0, 0.72], [1, 0]);
  const heroShift = useTransform(heroP, [0, 1], ["0%", "14%"]);

  useEffect(() => {
    API.get("/products")
      .then(({ data }) => setProducts(Array.isArray(data) ? data.slice(0, 18) : []))
      .catch(() => {});
  }, []);

  const handleAdd = (e, p) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(p);
    setAddedId(p._id);
    toast.success(`${p.name} added to cart!`);
    setTimeout(() => setAddedId(null), 2000);
  };

  const heroProds = products.length >= 3
    ? [products[0], products[1], products[2]]
    : [null, null, null];

  return (
    <div className="home-page">
      <GlowCursor />
      <Navbar transparent />

      {/* ── Scroll progress bar ── */}
      <motion.div className="scroll-bar" style={{ scaleX: pageY }} />

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        className="hero-section"
        ref={heroRef}
      >
        {/* Aurora + grain background */}
        <div className="hero-bg" aria-hidden="true">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
          <div className="h-grain" />
          <div className="hero-grid-lines" />
        </div>

        <motion.div
          className="hero-inner"
          style={{ opacity: heroFade, y: heroShift }}
        >
          {/* Left: Editorial text */}
          <div className="hero-left">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.48 }}
            >
              <span className="hero-live-dot" />
              Live shopping · Free delivery
            </motion.div>

            <h1 className="hero-h1">
              {["Discover", "Premium", "Products."].map((word, i) => (
                <span key={i} className="h1-line">
                  <motion.span
                    className={`h1-word${i === 1 ? " h1-accent" : ""}`}
                    initial={{ y: "108%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      delay: 0.18 + i * 0.15,
                      duration: 0.86,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.56 }}
            >
              Thousands of products. Every rupee tracked — automatically.
              <br />Shop smarter, spend less.
            </motion.p>

            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88, duration: 0.5 }}
            >
              <MagneticBtn className="btn-primary" onClick={() => navigate("/products")}>
                Shop Now <ArrowRight size={15} />
              </MagneticBtn>
              <MagneticBtn className="btn-ghost" onClick={() => navigate("/products")}>
                Explore All
              </MagneticBtn>
            </motion.div>

            <motion.div
              className="hero-trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.06, duration: 0.6 }}
            >
              {[["10K+","Products"],["50K+","Customers"],["4.9★","Rating"]].map(([n,l]) => (
                <div key={l} className="trust-item">
                  <strong>{n}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Product card grid */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0, x: 44 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-product-grid">
              <div className="hpg-glow" aria-hidden="true" />

              <HeroCard product={heroProds[0]} floatDur={4.6} floatAmp={-12} tall={false} onNav={navigate} delay={0} />
              <HeroCard product={heroProds[1]} floatDur={5.4} floatAmp={10}  tall={true}  onNav={navigate} delay={0.7} />
              <HeroCard product={heroProds[2]} floatDur={3.9} floatAmp={-8}  tall={false} onNav={navigate} delay={1.3} />

              <motion.div
                className="hpg-badge hpg-badge-a"
                animate={{ y: [0, -7, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              >
                🛒 Just added
              </motion.div>
              <motion.div
                className="hpg-badge hpg-badge-b"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4.0, ease: "easeInOut", delay: 1 }}
              >
                ⚡ Flash deal
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <LiveActivity />

        <motion.div
          className="scroll-pill"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          <div className="pill-body">
            <div className="pill-dot" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <Marquee />

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="features-section">
        <div className="features-inner">
          <motion.div
            className="section-label"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Why Thansel Zovia
          </motion.div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                className={`fc fc-${f.bg}`}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.13, duration: 0.64, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
              >
                <span className="fc-tag">{f.tag}</span>
                <div className="fc-big">{f.big}</div>
                <h3 className="fc-title">{f.title}</h3>
                <p className="fc-desc">{f.desc}</p>
                <div className="fc-arrow">↗</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRODUCTS CAROUSEL ═══════════════ */}
      {products.length > 0 && (
        <motion.section
          className="trending-section"
          variants={slideR}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-70px" }}
        >
          <div className="section-head">
            <div>
              <div className="section-label">Handpicked For You</div>
              <h2 className="section-title">Trending Now</h2>
            </div>
            <div className="carousel-arrows">
              <button
                className="arrow-btn"
                onClick={() => carousel.scroll(-1)}
                disabled={carousel.atStart}
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="arrow-btn"
                onClick={() => carousel.scroll(1)}
                disabled={carousel.atEnd}
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="carousel-track" ref={carousel.trackRef}>
            <AnimatePresence>
              {products.map((p, i) => (
                <motion.div
                  key={p._id}
                  className="prod-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(i * 0.04, 0.8),
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/products/${p._id}`)}
                >
                  <div className="prod-img-wrap">
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x220/F4F4F8/9898B0?text=${
                          encodeURIComponent(p.name?.split(" ")[0] || "Item")
                        }`;
                      }}
                    />
                    {p.mrp && p.mrp > p.price && (
                      <span className="prod-disc-badge">
                        {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% OFF
                      </span>
                    )}
                    <button
                      className={`cart-quick${addedId === p._id ? " added" : ""}`}
                      onClick={(e) => handleAdd(e, p)}
                      aria-label="Add to cart"
                    >
                      {addedId === p._id
                        ? <span className="cart-check">✓</span>
                        : <ShoppingCart size={15} />}
                    </button>
                  </div>
                  <div className="prod-info">
                    <p className="prod-cat">{p.category}</p>
                    <p className="prod-name">{p.name}</p>
                    <div className="prod-price-row">
                      <span className="prod-price">₹{p.price?.toLocaleString("en-IN")}</span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="prod-mrp">₹{p.mrp?.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                    {p.rating && (
                      <div className="prod-rating-row">
                        <span className="prod-star">★</span>
                        <span className="prod-rating-val">{p.rating}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}

      {/* ═══════════════ CATEGORIES BENTO ═══════════════ */}
      <motion.section
        className="cats-section"
        variants={slideL}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-70px" }}
      >
        <div className="section-head">
          <div>
            <div className="section-label">Browse By Category</div>
            <h2 className="section-title">Shop Every World</h2>
          </div>
          <button className="view-all-btn" onClick={() => navigate("/products")}>
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="bento-grid">
          {CATS.map((c, i) => (
            <motion.div
              key={c.name}
              className={`bc bc-${i}`}
              whileHover={{ scale: 1.025 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={() => navigate(`/products?category=${encodeURIComponent(c.name)}`)}
            >
              <motion.span
                className="bc-emoji"
                whileHover={{ scale: 1.3, rotate: 12 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
              >
                {c.emoji}
              </motion.span>
              <p className="bc-name">{c.name}</p>
              <p className="bc-sub">{c.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ STATS ═══════════════ */}
      <motion.section
        className="stats-section"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="stats-inner">
          <div className="stats-copy">
            <div className="section-label light">By the numbers</div>
            <h2 className="stats-title">The Thansel Zovia<br />Effect</h2>
          </div>
          <div className="stats-grid">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════ CTA ═══════════════ */}
      <motion.section
        className="cta-section"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="cta-grain" aria-hidden="true" />
        <div className="cta-glow cta-g1" aria-hidden="true" />
        <div className="cta-glow cta-g2" aria-hidden="true" />
        <div className="cta-inner">
          <h2 className="cta-title">Start Shopping<br />Smarter Today.</h2>
          <p className="cta-sub">
            Join 50,000+ Indians who track every rupee and love every purchase.
          </p>
          <div className="cta-btns">
            <MagneticBtn className="cta-btn-main" onClick={() => navigate("/signup")}>
              Create Free Account <ArrowRight size={15} />
            </MagneticBtn>
            <MagneticBtn className="cta-btn-ghost" onClick={() => navigate("/products")}>
              Browse Products
            </MagneticBtn>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark">TZ</span>
              <span>Thansel Zovia</span>
            </div>
            <p>India's premium shopping &amp; expense tracking platform. Shop smart, live better.</p>
            <div className="footer-socials">
              {["Twitter", "Instagram", "LinkedIn"].map((s) => (
                <span key={s} className="social-chip">{s}</span>
              ))}
            </div>
          </div>

          <div className="footer-cols">
            {[
              { title: "Shop",    links: ["All Products","Electronics","Fashion","Sports","Books"] },
              { title: "Account", links: ["Login","Sign Up","My Orders","Wishlist","Profile"] },
              { title: "Help",    links: ["FAQ","Shipping","Returns","Contact","Privacy"] },
            ].map((col) => (
              <div key={col.title} className="footer-col">
                <h4>{col.title}</h4>
                {col.links.map((l) => (
                  <span
                    key={l}
                    className="footer-link"
                    onClick={() => navigate("/products")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/products")}
                  >
                    {l}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bar">
          <span>© 2025 Thansel Zovia. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </footer>
    </div>
  );
}
