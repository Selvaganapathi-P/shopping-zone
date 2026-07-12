import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield } from "lucide-react";
import toast from "react-hot-toast";
import "./Auth.css";

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
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

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
