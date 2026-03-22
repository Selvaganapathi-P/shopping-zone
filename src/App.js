import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import ExpenseTracker from "./pages/ExpenseTracker";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/Admin/AdminDashboard";

// ── Public Route ──
// Allow access always — only redirect if already in admin session
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const isAdminSession = localStorage.getItem("isAdminSession") === "true";

  // If already in admin session → go to admin
  if (user && isAdminSession) return <Navigate to="/admin" replace />;

  // Otherwise always show login/signup page
  // Even if logged in as customer they can access login page
  return children;
};

// ── Protected Route ──
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// ── Admin Route ──
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const { isAdmin, adminLoading } = useAdmin();

  if (adminLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "#f8f9fa"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f0f0f0",
          borderTopColor: "#e85d04",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "#888", fontSize: "16px" }}>
          Verifying admin access...
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isAdminSession = localStorage.getItem("isAdminSession") === "true";

  if (!isAdmin || !isAdminSession) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// ── App Routes ──
function AppRoutes() {
  const { user } = useAuth();
  const isAdminSession = localStorage.getItem("isAdminSession") === "true";

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={
              user && isAdminSession
                ? "/admin"
                : user
                ? "/home"
                : "/login"
            }
            replace
          />
        }
      />

      {/* Login and Signup — accessible always */}
      <Route
        path="/login"
        element={<PublicRoute><Login /></PublicRoute>}
      />
      <Route
        path="/signup"
        element={<PublicRoute><Signup /></PublicRoute>}
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={<ProtectedRoute><Home /></ProtectedRoute>}
      />
      <Route
        path="/products"
        element={<ProtectedRoute><Products /></ProtectedRoute>}
      />
      <Route
        path="/cart"
        element={<ProtectedRoute><Cart /></ProtectedRoute>}
      />
      <Route
        path="/expense-tracker"
        element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><UserProfile /></ProtectedRoute>}
      />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={<AdminRoute><AdminDashboard /></AdminRoute>}
      />
    </Routes>
  );
}

// ── App ──
function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;