import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShoppingBag, User, Lock, Mail, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "./Auth.css";

function StarField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, speed: Math.random() * 0.4 + 0.1,
      alpha: Math.random(), dAlpha: (Math.random() * 0.01 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y -= s.speed; s.alpha += s.dAlpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
        ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.fillStyle = "#ffffff"; ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} className="star-canvas" aria-hidden />;
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! Welcome to Thansel Zovia 🎉");
      navigate("/home", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Try again.";
      setError(msg); toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <StarField />
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-brand">
          <div className="auth-brand-icon"><ShoppingBag size={24} /></div>
          <h1 className="auth-brand-name">Thansel Zovia</h1>
        </div>
        <div className="auth-toggle">
          <Link to="/login" className="auth-toggle-btn">Login</Link>
          <span className="auth-toggle-btn active">Sign Up</span>
        </div>
        <div className="auth-title-section">
          <h2>Create Account ✨</h2>
          <p>Join thousands of smart shoppers</p>
        </div>
        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={15} /> {error}
          </motion.div>
        )}
        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                type={showPass ? "text" : "password"} placeholder="At least 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Create Account →"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
