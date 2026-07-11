import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ShoppingBag, Lock, Mail, Key, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "./Auth.css";

const PARTICLE_COUNT = 60;

function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.1,
      alpha: Math.random(),
      dAlpha: (Math.random() * 0.01 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y -= s.speed;
        s.alpha += s.dAlpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-canvas" aria-hidden />;
}

export default function Login() {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars

  const [isAdmin, setIsAdmin]     = useState(false);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isAdmin) {
        await adminLogin(email, password, secretKey);
        toast.success("Welcome back, Admin!");
        window.location.href = "/admin";
      } else {
        await login(email, password);
        toast.success("Welcome back!");
        window.location.href = "/home";
      }
    } catch (err) {
      localStorage.removeItem("isAdminSession");
      const msg = err.response?.data?.message || "Invalid credentials.";
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  const switchRole = (admin) => {
    setIsAdmin(admin);
    setError("");
    setEmail(""); setPassword(""); setSecretKey("");
  };

  return (
    <div className="auth-page">
      <StarField />

      {/* Gradient orbs */}
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <ShoppingBag size={24} />
          </div>
          <h1 className="auth-brand-name">Thansel Zovia</h1>
        </div>

        {/* Page toggle */}
        <div className="auth-toggle">
          <span className="auth-toggle-btn active">Login</span>
          <Link to="/signup" className="auth-toggle-btn">Sign Up</Link>
        </div>

        {/* Role toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${!isAdmin ? "active" : ""}`}
            onClick={() => switchRole(false)}
          >
            🛍️ User
          </button>
          <button
            type="button"
            className={`role-btn ${isAdmin ? "active" : ""}`}
            onClick={() => switchRole(true)}
          >
            ⚙️ Admin
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isAdmin ? "admin" : "user"}
            initial={{ opacity: 0, x: isAdmin ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isAdmin ? -20 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="auth-title-section">
              <h2>{isAdmin ? "Admin Access 🔐" : "Welcome Back 👋"}</h2>
              <p>{isAdmin ? "Restricted to authorized personnel" : "Login to continue shopping"}</p>
            </div>

            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={15} /> {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    placeholder={isAdmin ? "Admin email" : "your@email.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isAdmin && (
                <motion.div
                  className="input-group"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label>Admin Secret Key</label>
                  <div className="input-wrap">
                    <Key size={16} className="input-icon" />
                    <input
                      type="password"
                      placeholder="Enter secret key"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              )}

              <button
                className={`auth-submit ${isAdmin ? "admin-submit" : ""}`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  isAdmin ? "Access Dashboard →" : "Login →"
                )}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>

        {!isAdmin && (
          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">Sign Up</Link>
          </p>
        )}
        {isAdmin && (
          <p className="auth-note">
            🔒 Admin access is restricted to authorized personnel only.
          </p>
        )}
      </motion.div>
    </div>
  );
}
