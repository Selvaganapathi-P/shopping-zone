import "./i18n/i18n"; // init i18n before anything else
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { WishlistProvider } from "./context/WishlistContext";
import { useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ExpenseTracker from "./pages/ExpenseTracker";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import OrderSuccess from "./pages/OrderSuccess";
import AIChatWidget from "./components/AIChatWidget/AIChatWidget";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/home" replace />;
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const { isAdmin, adminLoading } = useAdmin();

  if (adminLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "16px",
        background: "#0f172a",
      }}>
        <div style={{
          width: "40px", height: "40px",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#ea580c", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#64748b", fontSize: "14px", fontFamily: "Inter,sans-serif" }}>
          Verifying admin access…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  const isAdminSession = localStorage.getItem("isAdminSession") === "true";
  if (!isAdmin || !isAdminSession) return <Navigate to="/home" replace />;
  return children;
};

function AnimatedRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleBack = () => {
      const admin = localStorage.getItem("isAdminSession") === "true";
      window.history.pushState(null, "", admin ? "/admin" : "/home");
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public — anyone can browse */}
        <Route path="/"             element={<Navigate to="/home" replace />} />
        <Route path="/home"         element={<Home />} />
        <Route path="/products"     element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Auth pages */}
        <Route path="/login"        element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"       element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected — login required */}
        <Route path="/wishlist"        element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/cart"            element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/expense-tracker" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/order-success"   element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

        {/* Admin — hidden, not linked anywhere */}
        <Route path="/admin-login"  element={<AdminLogin />} />
        <Route path="/admin"        element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <WishlistProvider>
              <AnimatedRoutes />
              <AIChatWidget />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#1e293b",
                    color: "#f8fafc",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontFamily: "Inter, sans-serif",
                  },
                  success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                  error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
