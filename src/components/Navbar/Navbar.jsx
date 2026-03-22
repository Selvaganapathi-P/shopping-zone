import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { FiShoppingCart, FiChevronDown } from "react-icons/fi";
import { MdOutlineTrackChanges } from "react-icons/md";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

 const handleLogout = async () => {
  localStorage.removeItem("isAdminSession");
  await logout();
  navigate("/login");
};

  return (
    <nav className="navbar">

      {/* ── Logo ── */}
      <div className="navbar-logo">
        <Link to="/home">🛍️ ShopTrack</Link>
      </div>

      {/* ── Nav Links ── */}
      <ul className="navbar-links">
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li>
          <Link to="/cart" className="cart-link">
            <div className="cart-icon-wrap">
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </div>
            <span>Cart</span>
          </Link>
        </li>
      </ul>

      {/* ── Right Section ── */}
      <div className="navbar-right">

        {/* Expense Tracker Button */}
        <button
          className="expense-btn"
          onClick={() => navigate("/expense-tracker")}
        >
          <MdOutlineTrackChanges size={18} />
          Expense Tracker
        </button>

        {/* Profile */}
        <div
          className="profile-wrapper"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img
            src={
              user?.photoURL ||
              `https://ui-avatars.com/api/?name=${user?.displayName}&background=e85d04&color=fff`
            }
            alt="profile"
            className="profile-avatar"
          />
          <FiChevronDown
            size={16}
            style={{
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            {/* Click outside to close */}
            <div
              className="dropdown-overlay"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="profile-dropdown">
              <img
                src={
                  user?.photoURL ||
                  `https://ui-avatars.com/api/?name=${user?.displayName}&background=e85d04&color=fff`
                }
                alt="profile"
                className="dropdown-avatar"
              />
              <p className="dropdown-name">{user?.displayName || "User"}</p>
              <p className="dropdown-email">{user?.email}</p>

              <button
                className="view-profile-btn"
                onClick={() => {
                  navigate("/profile");
                  setDropdownOpen(false);
                }}
              >
                👤 View Profile
              </button>

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}