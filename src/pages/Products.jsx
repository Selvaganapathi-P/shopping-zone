import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Navbar from "../components/Navbar/Navbar";
import toast from "react-hot-toast";
import { Search, SlidersHorizontal, Star, ShoppingCart, Check, X, Heart, Mic, MicOff } from "lucide-react";
import "./Products.css";

const CATEGORIES   = ["All","Electronics","Fashion","Home & Kitchen","Sports","Books","Beauty"];
const SORT_OPTIONS = ["Default","Price: Low to High","Price: High to Low","Top Rated"];

const CAT_FILTERS = {
  Electronics: {
    RAM:     ["2GB","4GB","6GB","8GB","12GB","16GB"],
    Storage: ["16GB","32GB","64GB","128GB","256GB","512GB","1TB"],
  },
  Fashion: {
    Size:  ["XS","S","M","L","XL","XXL"],
    Color: ["Black","White","Red","Blue","Green","Yellow","Pink","Grey"],
  },
};

// Filters applied to all categories
const GLOBAL_CHIP_FILTERS = {
  Rating:   ["4★ & above","3★ & above"],
  Discount: ["10% off","25% off","50% off"],
};

function SkeletonCard() {
  return (
    <div className="product-skeleton">
      <div className="skeleton-img shimmer" />
      <div className="skeleton-body">
        <div className="skeleton-tag shimmer" />
        <div className="skeleton-title shimmer" />
        <div className="skeleton-text shimmer" />
        <div className="skeleton-footer">
          <div className="skeleton-price shimmer" />
          <div className="skeleton-btn shimmer" />
        </div>
      </div>
    </div>
  );
}

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// Voice search using Web Speech API
function useVoiceSearch(onResult, lang = "en-IN") {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search not supported in this browser.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => { setListening(false); toast.error("Voice recognition failed. Try again."); };
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
      toast.success(`Searching: "${text}"`);
    };

    recognitionRef.current = rec;
    rec.start();
  }, [onResult, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, startListening, stopListening };
}

export default function Products() {
  const navigate                                   = useNavigate();
  const [products, setProducts]                   = useState([]);
  const [filtered, setFiltered]                   = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [search, setSearch]                       = useState("");
  const [suggestions, setSuggestions]             = useState([]);
  const [showSuggestions, setShowSuggestions]     = useState(false);
  const [selectedCategory, setSelectedCategory]   = useState("All");
  const [priceRange, setPriceRange]               = useState(100000);
  const [sortBy, setSortBy]                       = useState("Default");
  const [addedId, setAddedId]                     = useState(null);
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [advFilters, setAdvFilters]               = useState({});
  const searchRef                                  = useRef(null);
  const { addToCart }                             = useCart();
  const { isInWishlist, toggleWishlist }          = useWishlist();
  const [searchParams]                            = useSearchParams();

  const [voiceLang, setVoiceLang] = useState("en-IN");
  const { listening, startListening, stopListening } = useVoiceSearch((text) => {
    setSearch(text);
    setShowSuggestions(false);
  }, voiceLang);

  useEffect(() => {
    API.get("/products")
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat ? decodeURIComponent(cat) : "All");
  }, [searchParams]);

  // Search autocomplete
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      return;
    }
    const lower = search.toLowerCase();
    const matches = products
      .filter((p) => p.name.toLowerCase().includes(lower))
      .slice(0, 6)
      .map((p) => ({ id: p._id, name: p.name, category: p.category }));
    setSuggestions(matches);
  }, [search, products]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let result = [...products];
    if (selectedCategory !== "All") result = result.filter((p) => p.category.trim() === selectedCategory.trim());
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    result = result.filter((p) => p.price <= priceRange);
    // Advanced per-category chip filters (keyword match in name/description)
    Object.entries(advFilters).forEach(([group, vals]) => {
      if (!vals?.length) return;
      if (group === "Rating") {
        const minRating = vals.reduce((min, v) => {
          const n = parseFloat(v);
          return n < min ? n : min;
        }, Infinity);
        result = result.filter((p) => (p.rating || 0) >= minRating);
      } else if (group === "Discount") {
        const minPct = vals.reduce((min, v) => {
          const n = parseFloat(v);
          return n < min ? n : min;
        }, Infinity);
        result = result.filter((p) => {
          if (!p.mrp || p.mrp <= p.price) return false;
          const pct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
          return pct >= minPct;
        });
      } else {
        result = result.filter((p) =>
          vals.some((v) =>
            p.name?.toLowerCase().includes(v.toLowerCase()) ||
            p.description?.toLowerCase().includes(v.toLowerCase())
          )
        );
      }
    });
    if (sortBy === "Price: Low to High") result.sort((a,b) => a.price - b.price);
    if (sortBy === "Price: High to Low") result.sort((a,b) => b.price - a.price);
    if (sortBy === "Top Rated")          result.sort((a,b) => b.rating - a.rating);
    setFiltered(result);
  }, [products, selectedCategory, search, priceRange, sortBy, advFilters]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setAddedId(product._id);
    toast.success(`${product.name} added!`);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleWishlist = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleSelectSuggestion = (s) => {
    setSearch(s.name);
    setShowSuggestions(false);
  };

  const handleVoiceToggle = () => {
    if (listening) stopListening();
    else startListening();
  };

  const toggleAdvFilter = (group, val) => {
    setAdvFilters(prev => {
      const current = prev[group] || [];
      const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      return { ...prev, [group]: updated };
    });
  };

  const resetFilters = () => { setSelectedCategory("All"); setPriceRange(100000); setSearch(""); setSortBy("Default"); setAdvFilters({}); };

  const advFilterCount = Object.values(advFilters).reduce((s, v) => s + (v?.length || 0), 0);
  const activeFilterCount = [selectedCategory !== "All", priceRange < 100000, sortBy !== "Default"].filter(Boolean).length + advFilterCount;

  return (
    <div className="products-page">
      <Navbar />
      <div className="products-layout">
        <button className="mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
          <SlidersHorizontal size={16} />
          Filters {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div className="sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3><SlidersHorizontal size={16} /> Filters</h3>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
          </div>
          <div className="filter-group">
            <h4>Category</h4>
            {CATEGORIES.map((cat) => (
              <label key={cat} className={`filter-label ${selectedCategory === cat ? "active" : ""}`}>
                <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="sr-only" />
                <span className="filter-check">{selectedCategory === cat && <Check size={12} />}</span>
                {cat}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h4>Max Price</h4>
            <div className="price-display">₹{priceRange.toLocaleString()}</div>
            <input type="range" min={100} max={100000} step={100} value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="price-slider" />
            <div className="price-labels"><span>₹100</span><span>₹1,00,000</span></div>
          </div>

          {/* Advanced per-category filters */}
          {CAT_FILTERS[selectedCategory] && Object.entries(CAT_FILTERS[selectedCategory]).map(([group, opts]) => (
            <div className="filter-group" key={group}>
              <h4>{group}</h4>
              <div className="filter-chips">
                {opts.map((val) => {
                  const active = (advFilters[group] || []).includes(val);
                  return (
                    <button
                      key={val}
                      className={`filter-chip-btn ${active ? "active" : ""}`}
                      onClick={() => toggleAdvFilter(group, val)}
                    >
                      {active && <Check size={10} />} {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Global rating & discount filters */}
          {Object.entries(GLOBAL_CHIP_FILTERS).map(([group, opts]) => (
            <div className="filter-group" key={group}>
              <h4>{group}</h4>
              <div className="filter-chips">
                {opts.map((val) => {
                  const active = (advFilters[group] || []).includes(val);
                  return (
                    <button
                      key={val}
                      className={`filter-chip-btn ${active ? "active" : ""}`}
                      onClick={() => toggleAdvFilter(group, val)}
                    >
                      {active && <Check size={10} />} {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {activeFilterCount > 0 && <button className="reset-btn" onClick={resetFilters}><X size={14} /> Reset All</button>}
        </aside>

        <main className="products-main">
          <div className="products-topbar">
            {/* Search with autocomplete */}
            <div className="search-box-wrap" ref={searchRef}>
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {search && <button className="search-clear" onClick={() => { setSearch(""); setSuggestions([]); }}><X size={14} /></button>}
                <button
                  className={`voice-btn ${listening ? "listening" : ""}`}
                  onClick={handleVoiceToggle}
                  title={listening ? "Stop listening" : `Voice search (${voiceLang === "ta-IN" ? "Tamil" : "English"})`}
                >
                  {listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
                <button
                  className="voice-lang-btn"
                  onClick={() => setVoiceLang(v => v === "en-IN" ? "ta-IN" : "en-IN")}
                  title={`Switch to ${voiceLang === "en-IN" ? "Tamil" : "English"} voice`}
                >
                  {voiceLang === "ta-IN" ? "த" : "EN"}
                </button>
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    className="search-suggestions"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {suggestions.map((s) => (
                      <button key={s.id} className="suggestion-item" onMouseDown={() => handleSelectSuggestion(s)}>
                        <Search size={12} />
                        <span className="suggestion-name">{s.name}</span>
                        <span className="suggestion-cat">{s.category}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {listening && (
              <motion.div
                className="voice-indicator"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span className="voice-pulse" />
                Listening…
              </motion.div>
            )}

            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </div>

          {(selectedCategory !== "All" || priceRange < 100000) && (
            <div className="active-filters">
              {selectedCategory !== "All" && (
                <span className="filter-chip">{selectedCategory}<button onClick={() => setSelectedCategory("All")}><X size={12} /></button></span>
              )}
              {priceRange < 100000 && (
                <span className="filter-chip">Under ₹{priceRange.toLocaleString()}<button onClick={() => setPriceRange(100000)}><X size={12} /></button></span>
              )}
            </div>
          )}

          <p className="results-count">
            {loading ? "Loading…" : `${filtered.length} products${selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}`}
          </p>

          {loading ? (
            <div className="products-grid">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <motion.div className="no-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="no-results-icon">😕</span>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="reset-btn" style={{ marginTop: 16 }} onClick={resetFilters}>Reset Filters</button>
            </motion.div>
          ) : (
            <motion.div
              className="products-grid"
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => {
                  const wishlisted = isInWishlist(product._id);
                  return (
                    <motion.div
                      className="product-card"
                      key={product._id}
                      variants={cardVariants}
                      layout
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => navigate(`/products/${product._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="product-img-wrap">
                        <img src={product.image} alt={product.name} loading="lazy"
                          onError={(e) => { e.target.src = "https://placehold.co/400x300/1e293b/64748b?text=No+Image"; }} />
                        <span className="product-category-badge">{product.category}</span>
                        <motion.button
                          className={`product-wish-btn ${wishlisted ? "wishlisted" : ""}`}
                          onClick={(e) => handleWishlist(e, product)}
                          whileTap={{ scale: 0.85 }}
                          title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                        >
                          <Heart size={16} fill={wishlisted ? "#ef4444" : "none"} color={wishlisted ? "#ef4444" : "#94a3b8"} />
                        </motion.button>
                        {product.mrp && product.mrp > product.price && (
                          <span className="product-discount-badge">
                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                          </span>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-desc">{product.description}</p>
                        <div className="product-footer">
                          <div className="product-price-block">
                            <span className="product-price">₹{product.price.toLocaleString()}</span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="product-mrp">₹{product.mrp.toLocaleString()}</span>
                            )}
                          </div>
                          <span className="product-rating">
                            <Star size={11} fill="#f59e0b" stroke="none" /> {product.rating}
                          </span>
                        </div>
                        <motion.button
                          className={`add-cart-btn ${addedId === product._id ? "added" : ""}`}
                          onClick={(e) => handleAddToCart(e, product)}
                          whileTap={{ scale: 0.96 }}
                        >
                          {addedId === product._id ? <><Check size={15} /> Added!</> : <><ShoppingCart size={15} /> Add to Cart</>}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
