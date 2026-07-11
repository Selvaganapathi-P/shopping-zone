import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  ShoppingCart, ChevronDown, LayoutDashboard,
  User, BarChart2, LogOut, Menu, X
} from "lucide-react";
import "./Navbar.css";

export default function Navbar({ transparent = false }) {
  const { user, logout }  = useAuth();
  const { cartCount }     = useCart();
  const navigate          = useNavigate();
  const location          = useLocation();
  const dropdownRef       = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminSession");
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navbarClass = [
    "navbar",
    transparent && !scrolled ? "navbar-transparent" : "navbar-solid",
    scrolled ? "navbar-scrolled" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <nav className={navbarClass}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/home" className="navbar-logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">Thansel Zovia</span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links">
            {[
              { path: "/home",     label: "Home" },
              { path: "/products", label: "Products" },
            ].map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`nav-link ${isActive(path) ? "active" : ""}`}
                >
                  {label}
                  {isActive(path) && (
                    <motion.div
                      className="nav-link-dot"
                      layoutId="nav-dot"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            ))}

            {/* Cart */}
            <li>
              <Link to="/cart" className={`nav-link cart-nav-link ${isActive("/cart") ? "active" : ""}`}>
                <div className="cart-icon-wrap">
                  <ShoppingCart size={18} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        className="cart-badge"
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 600, damping: 20 }}
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                Cart
              </Link>
            </li>
          </ul>

          {/* Right side */}
          <div className="navbar-right">
            {/* Expense tracker button */}
            <button
              className="expense-btn"
              onClick={() => navigate("/expense-tracker")}
              title="Expense Tracker"
            >
              <BarChart2 size={16} />
              <span>Expenses</span>
            </button>

            {/* Profile dropdown */}
            <div className="profile-wrapper" ref={dropdownRef}>
              <button
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=ea580c&color=fff&bold=true`}
                  alt="avatar"
                  className="profile-avatar"
                />
                <ChevronDown
                  size={14}
                  className={`chevron ${dropdownOpen ? "open" : ""}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="profile-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="dropdown-header">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=ea580c&color=fff&bold=true&size=80`}
                        alt="avatar"
                        className="dropdown-avatar"
                      />
                      <p className="dropdown-name">{user?.name || "User"}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>

                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                      >
                        <User size={15} /> My Profile
                      </button>

                      {user?.isAdmin && (
                        <button
                          className="dropdown-item dropdown-item-admin"
                          onClick={() => { navigate("/admin"); setDropdownOpen(false); }}
                        >
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

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {[
              { path: "/home",             label: "Home" },
              { path: "/products",         label: "Products" },
              { path: "/cart",             label: `Cart (${cartCount})` },
              { path: "/expense-tracker",  label: "Expenses" },
              { path: "/profile",          label: "My Profile" },
            ].map(({ path, label }) => (
              <Link key={path} to={path} className={`mobile-link ${isActive(path) ? "active" : ""}`}>
                {label}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link to="/admin" className="mobile-link mobile-link-admin">
                Admin Dashboard
              </Link>
            )}
            <button className="mobile-logout" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
