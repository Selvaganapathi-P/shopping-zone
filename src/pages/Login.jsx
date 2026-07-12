import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "./Auth.css";

/* ── Animated cat mascot ─────────────────────────────────────────────────── */
function CatMascot({ catState }) {
  const sp       = { type: "spring", stiffness: 260, damping: 22 };
  const isHiding = catState === "hiding";
  const isWatch  = catState === "watching";

  return (
    <div className="cat-wrap" aria-hidden="true">
      <svg viewBox="0 0 200 200" width="160" height="160" style={{ overflow: "visible", display: "block" }}>

        {/* ── Left paw — swings up + rotates inward when hiding ── */}
        <motion.g
          animate={{ y: isHiding ? -76 : 0, rotate: isHiding ? -22 : 0 }}
          transition={sp}
          style={{ transformOrigin: "72px 162px", transformBox: "fill-box" }}
        >
          <ellipse cx="72"  cy="164" rx="28" ry="18" fill="#FF8C42" />
          <ellipse cx="59"  cy="175" rx="11" ry="9"  fill="#FF8C42" />
          <ellipse cx="72"  cy="181" rx="11" ry="9"  fill="#FF8C42" />
          <ellipse cx="85"  cy="175" rx="11" ry="9"  fill="#FF8C42" />
          <ellipse cx="72"  cy="171" rx="17" ry="11" fill="#FFBEA0" opacity="0.7" />
        </motion.g>

        {/* ── Right paw ── */}
        <motion.g
          animate={{ y: isHiding ? -76 : 0, rotate: isHiding ? 22 : 0 }}
          transition={sp}
          style={{ transformOrigin: "128px 162px", transformBox: "fill-box" }}
        >
          <ellipse cx="128" cy="164" rx="28" ry="18" fill="#FF8C42" />
          <ellipse cx="115" cy="175" rx="11" ry="9"  fill="#FF8C42" />
          <ellipse cx="128" cy="181" rx="11" ry="9"  fill="#FF8C42" />
          <ellipse cx="141" cy="175" rx="11" ry="9"  fill="#FF8C42" />
          <ellipse cx="128" cy="171" rx="17" ry="11" fill="#FFBEA0" opacity="0.7" />
        </motion.g>

        {/* ── Ears ── */}
        <polygon points="47,58 62,16 84,52"  fill="#FF8C42" />
        <polygon points="55,54 64,22 80,50"  fill="#FFBEA0" />
        <polygon points="153,58 138,16 116,52" fill="#FF8C42" />
        <polygon points="145,54 136,22 120,50" fill="#FFBEA0" />

        {/* ── Head ── */}
        <circle cx="100" cy="92" r="62" fill="#FF8C42" />

        {/* ── Face patch ── */}
        <ellipse cx="100" cy="107" rx="40" ry="32" fill="#FFF3EA" />

        {/* ── Forehead tabby stripe ── */}
        <path d="M86,36 Q100,28 114,36" stroke="#D97A30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M90,29 Q100,23 110,29" stroke="#D97A30" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* ── Left brow (rises when watching, relaxes when hiding) ── */}
        <motion.g
          animate={{ y: isWatch ? -4 : isHiding ? 2 : 0 }}
          transition={sp}
          style={{ transformOrigin: "78px 69px", transformBox: "fill-box" }}
        >
          <path d="M64,71 Q79,65 91,71" stroke="#C97828" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* ── Right brow ── */}
        <motion.g
          animate={{ y: isWatch ? -4 : isHiding ? 2 : 0 }}
          transition={sp}
          style={{ transformOrigin: "122px 69px", transformBox: "fill-box" }}
        >
          <path d="M109,71 Q121,65 136,71" stroke="#C97828" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* ── Left eye (scaleY: 1.2 = wide open, 0.07 = closed slit) ── */}
        <motion.g
          animate={{ scaleY: isHiding ? 0.07 : isWatch ? 1.22 : 1 }}
          transition={sp}
          style={{ transformOrigin: "78px 85px", transformBox: "fill-box" }}
        >
          <ellipse cx="78"  cy="85" rx="16" ry="14" fill="white" />
          <ellipse cx="78"  cy="85" rx="10" ry="10" fill="#10B981" />
          <ellipse cx="78"  cy="85" rx="4.5" ry="8" fill="#111827" />
          <circle  cx="85"  cy="79" r="3.5" fill="white" />
        </motion.g>

        {/* ── Right eye ── */}
        <motion.g
          animate={{ scaleY: isHiding ? 0.07 : isWatch ? 1.22 : 1 }}
          transition={sp}
          style={{ transformOrigin: "122px 85px", transformBox: "fill-box" }}
        >
          <ellipse cx="122" cy="85" rx="16" ry="14" fill="white" />
          <ellipse cx="122" cy="85" rx="10" ry="10" fill="#10B981" />
          <ellipse cx="122" cy="85" rx="4.5" ry="8" fill="#111827" />
          <circle  cx="129" cy="79" r="3.5" fill="white" />
        </motion.g>

        {/* ── Nose ── */}
        <polygon points="97,113 100,119 103,113" fill="#FF6BAD" />

        {/* ── Mouth ── */}
        <path d="M94,120 Q100,128 106,120" stroke="#B07850" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* ── Whiskers ── */}
        <line x1="40"  y1="110" x2="76"  y2="117" stroke="#C9A082" strokeWidth="1.5" opacity="0.6" />
        <line x1="40"  y1="118" x2="76"  y2="118" stroke="#C9A082" strokeWidth="1.5" opacity="0.6" />
        <line x1="124" y1="117" x2="160" y2="110" stroke="#C9A082" strokeWidth="1.5" opacity="0.6" />
        <line x1="124" y1="118" x2="160" y2="118" stroke="#C9A082" strokeWidth="1.5" opacity="0.6" />

        {/* ── Cheek blush dots ── */}
        <circle cx="58"  cy="106" r="8" fill="#FF8C42" opacity="0.18" />
        <circle cx="142" cy="106" r="8" fill="#FF8C42" opacity="0.18" />
      </svg>
    </div>
  );
}

/* ── Login Page ──────────────────────────────────────────────────────────── */
export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [catState, setCatState] = useState("idle");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/home";
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials.";
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <motion.div
        className="auth-card-outer"
        initial={{ opacity: 0, y: 36, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <CatMascot catState={catState} />

        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-brand-emoji">🛍️</span>
            <h1 className="auth-brand-name">Thansel Zovia</h1>
          </div>

          <div className="auth-toggle">
            <span className="auth-toggle-btn active">Login</span>
            <Link to="/signup" className="auth-toggle-btn">Sign Up</Link>
          </div>

          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-subheading">Sign in to continue shopping</p>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label htmlFor="auth-email">Email address</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setCatState("watching")}
                  onBlur={() => { if (!password) setCatState("idle"); }}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="auth-pass">Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="auth-pass"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setCatState("hiding")}
                  onBlur={() => setCatState("idle")}
                  required
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Sign in →"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
