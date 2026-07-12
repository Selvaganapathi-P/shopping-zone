import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! Welcome to Thansel Zovia 🎉");
      navigate("/home", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Try again.";
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
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingTop: 0 }}
      >
        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-brand-emoji">🛍️</span>
            <h1 className="auth-brand-name">Thansel Zovia</h1>
          </div>

          <div className="auth-toggle">
            <Link to="/login" className="auth-toggle-btn">Login</Link>
            <span className="auth-toggle-btn active">Sign Up</span>
          </div>

          <h2 className="auth-heading">Create account</h2>
          <p className="auth-subheading">Join thousands of smart shoppers</p>

          {error && (
            <motion.div className="auth-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <label>Full name</label>
              <div className="input-wrap">
                <User size={16} className="input-icon" />
                <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label>Email address</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Create account →"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
