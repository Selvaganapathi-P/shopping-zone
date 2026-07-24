import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  ShoppingCart, ChevronDown, LayoutDashboard,
  User, BarChart2, LogOut, Menu, X, Search, Heart, Zap,
} from "lucide-react";
import "./Navbar.css";

const SEARCH_CATS = ["All","Electronics","Fashion","Home & Kitchen","Sports & Fitness","Beauty & Personal Care","Books","Groceries","Jewellery & Watches","Travel & Luggage"];

const CAT_LINKS = [
  { label: "All",                   cat: null,                      icon: null,  hot: false },
  { label: "Electronics",           cat: "Electronics",             icon: "📱",  hot: false },
  { label: "Fashion",               cat: "Fashion",                 icon: "👗",  hot: false },
  { label: "Home & Kitchen",        cat: "Home & Kitchen",          icon: "🏠",  hot: false },
  { label: "Sports",                cat: "Sports & Fitness",        icon: "⚽",  hot: false },
  { label: "Beauty",                cat: "Beauty & Personal Care",  icon: "💄",  hot: false },
  { label: "Books",                 cat: "Books",                   icon: "📚",  hot: false },
  { label: "Groceries",             cat: "Groceries",               icon: "🛒",  hot: false },
  { label: "Jewellery",             cat: "Jewellery & Watches",     icon: "💍",  hot: false },
  { label: "Travel",                cat: "Travel & Luggage",        icon: "🧳",  hot: false },
  { label: "Offers",                cat: null,                      icon: null,  hot: true  },
  { label: "New Arrivals",          cat: null,                      icon: null,  hot: false },
];

export default function Navbar({ transparent = false }) {
  const { user, logout }          = useAuth();
  const { cartCount }             = useCart();
  const { wishlist }              = useWishlist();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const dropdownRef               = useRef(null);
  const catSelRef                 = useRef(null);

  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchCat,     setSearchCat]     = useState("All");
  const [catSelOpen,    setCatSelOpen]    = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (catSelRef.current && !catSelRef.current.contains(e.target))
        setCatSelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminSession");
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) { navigate("/products"); return; }
    const params = new URLSearchParams();
    params.set("q", q);
    if (searchCat !== "All") params.set("category", searchCat);
    navigate(`/products?${params.toString()}`);
  };

  const handleCatLink = (cat) => {
    if (cat) navigate(`/products?category=${encodeURIComponent(cat)}`);
    else navigate("/products");
  };

  const isActive   = (path) => location.pathname === path;
  const activeCat  = new URLSearchParams(location.search).get("category");
  const wishCount  = wishlist?.length || 0;

  const navClass = [
    "navbar",
    transparent && !scrolled ? "navbar-transparent" : "navbar-solid",
    scrolled ? "navbar-scrolled" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <nav className={navClass}>

        {/* ══════════ ROW 1: logo · search · icons ══════════ */}
        <div className="nb-row1">
          <div className="nb-row1-inner">

            {/* Logo */}
            <Link to="/home" className="navbar-logo">
              <span className="logo-icon">🛍️</span>
              <span className="logo-text">Thansel<br /><em>Zovia</em></span>
            </Link>

            {/* Search bar */}
            <form className="nb-search" onSubmit={handleSearch}>
              <div className="nb-cat-wrap" ref={catSelRef}>
                <button type="button" className="nb-cat-btn" onClick={() => setCatSelOpen(!catSelOpen)}>
                  {searchCat === "All" ? "All" : searchCat.split(" ")[0]}
                  <ChevronDown size={11} className={catSelOpen ? "rot" : ""} />
                </button>
                <AnimatePresence>
                  {catSelOpen && (
                    <motion.ul className="nb-cat-list"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.13 }}>
                      {SEARCH_CATS.map((c) => (
                        <li key={c}>
                          <button type="button"
                            className={`nb-cat-opt ${searchCat === c ? "sel" : ""}`}
                            onClick={() => { setSearchCat(c); setCatSelOpen(false); }}>
                            {c}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <input
                className="nb-search-input"
                type="text"
                placeholder="Search products, brands and more…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="nb-search-btn" aria-label="Search">
                <Search size={19} />
              </button>
            </form>

            {/* Right icons */}
            <div className="nb-right">

              {/* Expense tracker */}
              {user && (
                <button className="nb-icon-btn" onClick={() => navigate("/expense-tracker")}>
                  <BarChart2 size={20} />
                  <span className="nb-lbl">Expenses</span>
                </button>
              )}

              {/* Wishlist */}
              <button className="nb-icon-btn" onClick={() => user ? navigate("/wishlist") : navigate("/login")}>
                <div className="nb-icon-wrap">
                  <Heart size={20} />
                  {user && wishCount > 0 && <span className="nb-badge">{wishCount > 9 ? "9+" : wishCount}</span>}
                </div>
                <span className="nb-lbl">Wishlist</span>
              </button>

              {/* Cart */}
              <button className="nb-icon-btn" onClick={() => user ? navigate("/cart") : navigate("/login")}>
                <div className="nb-icon-wrap">
                  <ShoppingCart size={20} />
                  {user && cartCount > 0 && (
                    <motion.span className="nb-badge nb-badge-orange"
                      key={cartCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 600, damping: 18 }}>
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </div>
                <span className="nb-lbl">Cart</span>
              </button>

              {/* Account */}
              {user ? (
                <div className="profile-wrapper" ref={dropdownRef}>
                  <button className="nb-profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=ea580c&color=fff&bold=true`}
                      alt="avatar" className="profile-avatar"
                    />
                    <div className="nb-profile-text">
                      <span className="nb-hello">Hello, {user?.name?.split(" ")[0] || "User"}</span>
                      <span className="nb-acct">Account <ChevronDown size={10} className={dropdownOpen ? "rot" : ""} /></span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div className="profile-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.14 }}>
                        <div className="dropdown-header">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=ea580c&color=fff&bold=true&size=80`} alt="avatar" className="dropdown-avatar" />
                          <p className="dropdown-name">{user?.name || "User"}</p>
                          <p className="dropdown-email">{user?.email}</p>
                        </div>
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={() => { navigate("/profile"); setDropdownOpen(false); }}>
                            <User size={15} /> My Profile
                          </button>
                          <button className="dropdown-item" onClick={() => { navigate("/wishlist"); setDropdownOpen(false); }}>
                            <Heart size={15} /> My Wishlist
                          </button>
                          <button className="dropdown-item" onClick={() => { navigate("/cart"); setDropdownOpen(false); }}>
                            <ShoppingCart size={15} /> My Cart
                          </button>
                          <button className="dropdown-item" onClick={() => { navigate("/expense-tracker"); setDropdownOpen(false); }}>
                            <BarChart2 size={15} /> Expense Tracker
                          </button>
                          {user?.isAdmin && (
                            <button className="dropdown-item dropdown-item-admin" onClick={() => { navigate("/admin"); setDropdownOpen(false); }}>
                              <LayoutDashboard size={15} /> Admin Dashboard
                            </button>
                          )}
                          <div className="dropdown-divider" />
                          <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="nb-auth">
                  <button className="nb-icon-btn" onClick={() => navigate("/login")}>
                    <User size={20} />
                    <span className="nb-lbl">Login</span>
                  </button>
                  <Link to="/signup" className="nav-signup-btn">Sign Up</Link>
                </div>
              )}

              <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>

        {/* ══════════ ROW 2: category strip ══════════ */}
        <div className="nb-strip">
          <div className="nb-strip-inner">
            {CAT_LINKS.map(({ label, cat, icon, hot }) => {
              const stripActive =
                (!cat && !activeCat && location.pathname === "/products" && label === "All") ||
                (cat && activeCat === cat);
              return (
                <button
                  key={label}
                  className={["nb-strip-btn", hot ? "nb-strip-hot" : "", stripActive ? "nb-strip-active" : ""].filter(Boolean).join(" ")}
                  onClick={() => handleCatLink(cat)}
                >
                  {hot && <Zap size={11} />}
                  {icon && <span className="strip-icon">{icon}</span>}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

      </nav>

      {/* ══════════ MOBILE MENU ══════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="mobile-menu"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.2 }}>

            <form className="mobile-search-form" onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}>
              <input
                className="mobile-search-input"
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="mobile-search-btn"><Search size={15} /></button>
            </form>

            <div className="mobile-cats">
              {CAT_LINKS.filter(c => c.label !== "All").map(({ label, cat }) => (
                <button key={label} className="mobile-cat-chip"
                  onClick={() => { handleCatLink(cat); setMobileOpen(false); }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mobile-divider" />

            <Link to="/home" className={`mobile-link ${isActive("/home") ? "active" : ""}`}>Home</Link>

            {user ? (
              <>
                <Link to="/wishlist"        className={`mobile-link ${isActive("/wishlist") ? "active" : ""}`}>Wishlist {wishCount > 0 && `(${wishCount})`}</Link>
                <Link to="/cart"            className={`mobile-link ${isActive("/cart") ? "active" : ""}`}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
                <Link to="/expense-tracker" className={`mobile-link ${isActive("/expense-tracker") ? "active" : ""}`}>Expenses</Link>
                <Link to="/profile"         className={`mobile-link ${isActive("/profile") ? "active" : ""}`}>My Profile</Link>
                {user?.isAdmin && <Link to="/admin" className="mobile-link mobile-link-admin">Admin Dashboard</Link>}
                <button className="mobile-logout" onClick={handleLogout}><LogOut size={15} /> Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"  className="mobile-link">Login</Link>
                <Link to="/signup" className="mobile-link">Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
