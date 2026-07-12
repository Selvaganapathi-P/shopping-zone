import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield } from "lucide-react";
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
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: PARTICLE_COUNT }, () => ({
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

export default function AdminLogin() {
  const { adminLogin } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success("Welcome, Admin!");
      window.location.href = "/admin";
    } catch (err) {
      localStorage.removeItem("isAdminSession");
      const msg = err.response?.data?.message || "Invalid admin credentials.";
      setError(msg);
      toast.error(msg);
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
          <div className="auth-brand-icon" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
            <Shield size={24} />
          </div>
          <h1 className="auth-brand-name">Admin Access</h1>
        </div>

        <div className="auth-title-section">
          <h2>Restricted Area 🔐</h2>
          <p>Authorized personnel only</p>
        </div>

        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={15} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Admin Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" placeholder="admin@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="auth-submit admin-submit" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Access Dashboard →"}
          </button>
        </form>

        <p className="auth-note" style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#475569" }}>
          🔒 This page is not publicly accessible.
        </p>
      </motion.div>
    </div>
  );
}
