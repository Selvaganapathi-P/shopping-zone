import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import "./Auth.css";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    if (isAdmin) {
      // Step 1 — Check Firestore
      const snap = await getDoc(doc(db, "admins", "admin"));

      if (!snap.exists()) {
        setError("Admin account not found.");
        setLoading(false);
        return;
      }

      const adminData = snap.data();

      // Step 2 — Check email
      if (adminData.email !== email) {
        setError("You are not authorized as admin.");
        setLoading(false);
        return;
      }

      // Step 3 — Check secret key
      if (adminData.secretKey !== secretKey) {
        setError("Invalid admin secret key.");
        setLoading(false);
        return;
      }

      // Step 4 — Set admin session BEFORE login
      localStorage.setItem("isAdminSession", "true");

      // Step 5 — Login
      await login(email, password);

      // Step 6 — Force hard redirect to admin
      // Using window.location instead of navigate
      // to avoid Firebase Auth re-render race condition
      window.location.href = "/admin";

    } else {
      // Normal user login
      localStorage.removeItem("isAdminSession");
      await login(email, password);
      window.location.href = "/home";
    }
  } catch (err) {
    localStorage.removeItem("isAdminSession");
    setError("Invalid email or password.");
    setLoading(false);
  }
};
  const handleGoogle = async () => {
    setError("");
    try {
      localStorage.removeItem("isAdminSession");
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
          <button className="toggle-btn active">Login</button>
          <Link to="/signup" className="toggle-btn">Sign Up</Link>
        </div>

        {/* ── Role Toggle: User / Admin ── */}
        <div className="role-toggle">
          <button
            className={`role-btn ${!isAdmin ? "active" : ""}`}
            onClick={() => {
              setIsAdmin(false);
              setError("");
              setSecretKey("");
              setEmail("");
              setPassword("");
            }}
          >
            🛍️ User Login
          </button>
          <button
            className={`role-btn ${isAdmin ? "active" : ""}`}
            onClick={() => {
              setIsAdmin(true);
              setError("");
              setEmail("");
              setPassword("");
              setSecretKey("");
            }}
          >
            ⚙️ Admin Login
          </button>
        </div>

        {/* Title */}
        <div className="auth-title-section">
          <h2>
            {isAdmin ? "Admin Access 🔐" : "Welcome Back 👋"}
          </h2>
          <p>
            {isAdmin
              ? "Enter your admin credentials"
              : "Login to your account to continue"}
          </p>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleLogin} className="auth-form">

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder={isAdmin ? "Admin email" : "Enter your email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder={
                isAdmin ? "Admin password" : "Enter your password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Secret Key — only for admin */}
          {isAdmin && (
            <div className="input-group">
              <label>🔑 Admin Secret Key</label>
              <input
                type="password"
                placeholder="Enter secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
            </div>
          )}

          <button
            className={`auth-submit-btn ${isAdmin ? "admin-btn" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isAdmin
              ? "Access Dashboard →"
              : "Login →"}
          </button>
        </form>

        {/* Google — only for user login */}
        {!isAdmin && (
          <>
            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            <button className="auth-google-btn" onClick={handleGoogle}>
              <img
                src="https://www.google.com/favicon.ico"
                alt="google"
                width="18"
              />
              Continue with Google
            </button>
          </>
        )}

        {/* Switch — only for user */}
        {!isAdmin && (
          <p className="auth-switch">
            Don't have an account?
            <Link to="/signup" className="auth-switch-link">
              Sign Up
            </Link>
          </p>
        )}

        {/* Admin note */}
        {isAdmin && (
          <p className="admin-note">
            🔒 Admin access is restricted to authorized personnel only.
          </p>
        )}

      </div>
    </div>
  );
}