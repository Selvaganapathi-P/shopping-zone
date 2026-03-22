import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate("/home", { replace: true });
    } catch (err) {
      setError("Signup failed. Try a stronger password (min 6 chars).");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await googleLogin();
      navigate("/home", { replace: true });
    } catch (err) {
      setError("Google sign-in failed.");
    }
  };

  return (
    <div className="auth-page">

      {/* Background elements */}
      <div className="orb-bottom" />

      {[...Array(20)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {[...Array(10)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="particle"
          style={{
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 12 + 8}s`,
            animationDelay: `${Math.random() * 6}s`,
          }}
        />
      ))}

      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <span>🛍️</span>
          <h1>ShopTrack</h1>
        </div>

        {/* ── Top Toggle: Login / Signup ── */}
        <div className="auth-toggle">
          <Link to="/login" className="toggle-btn">Login</Link>
          <button className="toggle-btn active">Sign Up</button>
        </div>

        {/* ── Role Toggle: User / Admin ── */}
        <div className="role-toggle">
          <button className="role-btn active">
            🛍️ User Sign Up
          </button>
          <Link to="/login" className="role-btn">
            ⚙️ Admin Login
          </Link>
        </div>

        {/* Title */}
        <div className="auth-title-section">
          <h2>Create Account 🛍️</h2>
          <p>Sign up to get started today</p>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Create Account →"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Google */}
        <button className="auth-google-btn" onClick={handleGoogle}>
          <img
            src="https://www.google.com/favicon.ico"
            alt="google"
            width="18"
          />
          Continue with Google
        </button>

        {/* Switch */}
        <p className="auth-switch">
          Already have an account?
          <Link to="/login" className="auth-switch-link">Login</Link>
        </p>

      </div>
    </div>
  );
}