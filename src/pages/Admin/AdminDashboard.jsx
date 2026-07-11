import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "../../context/AdminContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar,
} from "recharts";
import {
  Users, ShoppingBag, DollarSign, Package, Trash2,
  Plus, LayoutGrid, X, Edit2, Save,
  TrendingUp, Home, Tag, Star, BarChart2,
  ChevronDown, ChevronUp, Search, Sparkles,
  AlertTriangle, CheckCircle, Ban, Grid3X3, ImageIcon,
  Layers, Clock, Calendar,
} from "lucide-react";
import "./AdminDashboard.css";

// ── Constants ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "Overview",    label: "Overview",    Icon: LayoutGrid },
  { id: "Products",    label: "Products",    Icon: Package },
  { id: "Orders",      label: "Orders",      Icon: ShoppingBag },
  { id: "Analytics",   label: "Analytics",   Icon: BarChart2 },
  { id: "Coupons",     label: "Coupons",     Icon: Tag },
  { id: "Reviews",     label: "Reviews",     Icon: Star },
  { id: "Users",       label: "Users",       Icon: Users },
  { id: "Categories",  label: "Categories",  Icon: Grid3X3 },
  { id: "Banners",     label: "Banners",     Icon: ImageIcon },
  { id: "Activities",  label: "Activities",  Icon: Clock },
];

const CATEGORIES = ["Electronics","Fashion","Home & Kitchen","Sports","Books","Beauty"];
const MONTHS     = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_STEPS  = ["pending","confirmed","shipped","out_for_delivery","delivered"];
const STATUS_LABELS = {
  pending: "Pending", confirmed: "Confirmed", shipped: "Shipped",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};

const PIE_COLORS  = ["#ea580c","#3b82f6","#22c55e","#a855f7","#f59e0b","#ef4444"];
const EMPTY_PRODUCT = { name:"", category:"", price:"", mrp:"", stock:"", rating:"", image:"", images:"", description:"" };
const EMPTY_COUPON  = { code:"", type:"percent", discount:"", minOrder:"", maxUses:"", expiresAt:"" };

// ── Main component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isAdmin, adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [activeTab,  setActiveTab]  = useState("Overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users,      setUsers]      = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [products,   setProducts]   = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct,   setEditingProduct]   = useState(null);
  const [productForm,      setProductForm]      = useState(EMPTY_PRODUCT);
  const [imageType,        setImageType]        = useState("url");
  const [imageFile,        setImageFile]        = useState(null);
  const [saving,           setSaving]           = useState(false);
  const [fetchingPhoto,    setFetchingPhoto]    = useState(false);
  const [generatingDesc,   setGeneratingDesc]   = useState(false);

  // Coupon modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon,   setEditingCoupon]   = useState(null);
  const [couponForm,      setCouponForm]      = useState(EMPTY_COUPON);
  const [coupons,         setCoupons]         = useState([]);
  const [savingCoupon,    setSavingCoupon]    = useState(false);

  // User detail modal
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [userOrders,      setUserOrders]      = useState([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [userSearch,      setUserSearch]      = useState("");
  const [productSearch,   setProductSearch]   = useState("");
  const [orderSearch,     setOrderSearch]     = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Categories
  const [categories,       setCategories]       = useState([]);
  const [showCatModal,     setShowCatModal]     = useState(false);
  const [editingCat,       setEditingCat]       = useState(null);
  const [catForm,          setCatForm]          = useState({ name: "", icon: "🛍️", order: 0 });
  const [savingCat,        setSavingCat]        = useState(false);

  // Banners
  const [bannerForm,       setBannerForm]       = useState({ headline: "", subheadline: "", badge: "", ctaText: "", ctaLink: "", isActive: true });
  const [savingBanner,     setSavingBanner]     = useState(false);
  const [bannerSaved,      setBannerSaved]      = useState(false);

  // Bulk inventory
  const [showBulkModal,    setShowBulkModal]    = useState(false);
  const [bulkEdits,        setBulkEdits]        = useState({});
  const [savingBulk,       setSavingBulk]       = useState(false);

  // Activity log
  const [activityLogs,     setActivityLogs]     = useState([]);
  const [activityLoading,  setActivityLoading]  = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/home");
  }, [isAdmin, adminLoading, navigate]);

  const fetchAll = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        API.get("/auth/all"),
        API.get("/orders/all"),
        API.get("/products"),
      ]);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch {
      toast.error("Failed to load dashboard data.");
    }
    setLoading(false);
  }, [isAdmin]);

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await API.get("/coupons/admin");
      setCoupons(data);
    } catch { /* silent */ }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await API.get("/reviews/admin");
      setReviews(data);
    } catch { /* silent */ }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (analytics) return;
    try {
      const { data } = await API.get("/orders/analytics");
      setAnalytics(data);
    } catch { /* silent */ }
  }, [analytics]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (activeTab === "Coupons")   fetchCoupons();  }, [activeTab, fetchCoupons]);
  useEffect(() => { if (activeTab === "Reviews")   fetchReviews();  }, [activeTab, fetchReviews]);
  useEffect(() => { if (activeTab === "Analytics") fetchAnalytics();}, [activeTab, fetchAnalytics]);

  useEffect(() => {
    if (activeTab !== "Categories") return;
    API.get("/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Activities") return;
    setActivityLoading(true);
    API.get("/activity-log")
      .then(({ data }) => setActivityLogs(data))
      .catch(() => toast.error("Failed to load activity log."))
      .finally(() => setActivityLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Banners") return;
    API.get("/banner").then(({ data }) => {
      setBannerForm({ headline: data.headline || "", subheadline: data.subheadline || "", badge: data.badge || "", ctaText: data.ctaText || "", ctaLink: data.ctaLink || "", isActive: data.isActive !== false });
    }).catch(() => {});
  }, [activeTab]);

  // ── Derived stats ──────────────────────────────────────────────────────
  const totalRevenue   = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
  const monthlyRevenue = MONTHS.map((m, i) => ({
    month: m,
    revenue: orders
      .filter((o) => o.createdAt && new Date(o.createdAt).getMonth() === i)
      .reduce((s, o) => s + (o.grandTotal || 0), 0),
  }));
  const categoryStats = CATEGORIES.map((cat) => ({
    category: cat.split(" ")[0],
    orders: orders.filter((o) => o.items?.some((it) => it.category === cat)).length,
  }));

  // Low-stock products (stock < 5)
  const lowStock = products.filter((p) => (p.stock ?? 0) < 5);

  // ── Product handlers ───────────────────────────────────────────────────
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted.");
    } catch { toast.error("Delete failed."); }
  };

  const handleToggleVisibility = async (product) => {
    try {
      const { data } = await API.patch(`/products/${product._id}/visibility`);
      setProducts((prev) => prev.map((p) => p._id === data._id ? { ...p, isVisible: data.isVisible } : p));
      toast.success(data.isVisible ? "Product visible." : "Product hidden.");
    } catch { toast.error("Failed to toggle visibility."); }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setImageType("url");
    setImageFile(null);
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name, category: product.category,
      price: product.price, mrp: product.mrp || "",
      stock: product.stock || "", rating: product.rating,
      image: product.image, images: (product.images || []).join(", "),
      description: product.description,
    });
    setImageType("url");
    setImageFile(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([k, v]) => { if (k !== "image" && k !== "images") formData.append(k, v); });
      if (productForm.images) formData.append("images", productForm.images);
      if (imageType === "file" && imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", productForm.image);
      }
      if (editingProduct) {
        const { data } = await API.put(`/products/${editingProduct._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        setProducts((prev) => prev.map((p) => p._id === data._id ? data : p));
        toast.success("Product updated!");
      } else {
        const { data } = await API.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
        setProducts((prev) => [...prev, data]);
        toast.success("Product added!");
      }
      setShowProductModal(false);
    } catch { toast.error("Failed to save product."); }
    setSaving(false);
  };

  // Fetch Pexels stock photo by product name + category
  const handleFetchPhoto = async () => {
    const query = `${productForm.name} ${productForm.category}`.trim();
    if (!query) { toast.error("Enter a product name first."); return; }
    setFetchingPhoto(true);
    try {
      const { data } = await API.get("/products/pexels-photo", { params: { query } });
      if (data.url) {
        setProductForm((f) => ({ ...f, image: data.url }));
        setImageType("url");
        toast.success("Stock photo fetched!");
      } else {
        toast.error("No photo found for that query.");
      }
    } catch {
      toast.error("Pexels fetch failed. Check PEXELS_API_KEY in backend .env.");
    }
    setFetchingPhoto(false);
  };

  // AI description generator
  const handleGenerateDesc = async () => {
    if (!productForm.name || !productForm.category) {
      toast.error("Enter product name and category first.");
      return;
    }
    setGeneratingDesc(true);
    try {
      const { data } = await API.post("/ai/generate-description", {
        name: productForm.name,
        category: productForm.category,
        price: productForm.price,
      });
      if (data.description) {
        setProductForm((f) => ({ ...f, description: data.description }));
        toast.success("Description generated!");
      }
    } catch {
      toast.error("AI generation failed. Check ANTHROPIC_API_KEY.");
    }
    setGeneratingDesc(false);
  };

  // ── Order handlers ─────────────────────────────────────────────────────
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${STATUS_LABELS[newStatus]}`);
    } catch { toast.error("Failed to update status."); }
    setUpdatingOrderId(null);
  };

  // ── Coupon handlers ────────────────────────────────────────────────────
  const openAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm(EMPTY_COUPON);
    setShowCouponModal(true);
  };

  const openEditCoupon = (c) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code, type: c.type, discount: c.discount,
      minOrder: c.minOrder || "", maxUses: c.maxUses || "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      if (editingCoupon) {
        const { data } = await API.put(`/coupons/admin/${editingCoupon._id}`, couponForm);
        setCoupons((prev) => prev.map((c) => c._id === data._id ? data : c));
        toast.success("Coupon updated!");
      } else {
        const { data } = await API.post("/coupons/admin", couponForm);
        setCoupons((prev) => [...prev, data]);
        toast.success("Coupon created!");
      }
      setShowCouponModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon.");
    }
    setSavingCoupon(false);
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await API.delete(`/coupons/admin/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success("Coupon deleted.");
    } catch { toast.error("Delete failed."); }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const { data } = await API.put(`/coupons/admin/${coupon._id}`, { ...coupon, isActive: !coupon.isActive });
      setCoupons((prev) => prev.map((c) => c._id === data._id ? data : c));
      toast.success(data.isActive ? "Coupon activated." : "Coupon deactivated.");
    } catch { toast.error("Failed to toggle coupon."); }
  };

  // ── Review handlers ────────────────────────────────────────────────────
  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await API.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted.");
    } catch { toast.error("Failed to delete review."); }
  };

  // ── User handlers ──────────────────────────────────────────────────────
  const handleSuspendUser = async (u) => {
    try {
      await API.put(`/auth/${u._id}/suspend`);
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isSuspended: true } : x));
      toast.success(`${u.name} suspended.`);
    } catch { toast.error("Failed to suspend user."); }
  };

  const handleActivateUser = async (u) => {
    try {
      await API.put(`/auth/${u._id}/activate`);
      setUsers((prev) => prev.map((x) => x._id === u._id ? { ...x, isSuspended: false } : x));
      toast.success(`${u.name} activated.`);
    } catch { toast.error("Failed to activate user."); }
  };

  const handleViewUserOrders = async (u) => {
    setSelectedUser(u);
    setLoadingUserOrders(true);
    try {
      const { data } = await API.get(`/auth/${u._id}/orders`);
      setUserOrders(data);
    } catch { setUserOrders([]); }
    setLoadingUserOrders(false);
  };

  // ── Category handlers ──────────────────────────────────────────────────
  const openAddCat = () => { setEditingCat(null); setCatForm({ name: "", icon: "🛍️", order: 0 }); setShowCatModal(true); };
  const openEditCat = (c) => { setEditingCat(c); setCatForm({ name: c.name, icon: c.icon || "🛍️", order: c.order || 0 }); setShowCatModal(true); };
  const handleSaveCat = async (e) => {
    e.preventDefault();
    setSavingCat(true);
    try {
      if (editingCat) {
        const { data } = await API.put(`/categories/${editingCat._id}`, catForm);
        setCategories(prev => prev.map(c => c._id === data._id ? data : c));
        toast.success("Category updated!");
      } else {
        const { data } = await API.post("/categories", catForm);
        setCategories(prev => [...prev, data]);
        toast.success("Category added!");
      }
      setShowCatModal(false);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save category."); }
    setSavingCat(false);
  };
  const handleDeleteCat = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success("Category deleted.");
    } catch { toast.error("Delete failed."); }
  };

  // ── Banner handler ─────────────────────────────────────────────────────
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      await API.put("/banner", bannerForm);
      setBannerSaved(true);
      setTimeout(() => setBannerSaved(false), 3000);
      toast.success("Banner updated!");
    } catch { toast.error("Failed to update banner."); }
    setSavingBanner(false);
  };

  // ── Bulk inventory handler ─────────────────────────────────────────────
  const handleBulkSave = async () => {
    const entries = Object.entries(bulkEdits).filter(([, v]) => v !== "");
    if (!entries.length) return toast.error("No changes to save.");
    setSavingBulk(true);
    try {
      await Promise.all(entries.map(([id, stock]) =>
        API.put(`/products/${id}`, { stock: Number(stock) }, { headers: { "Content-Type": "multipart/form-data" } }).catch(() =>
          API.put(`/products/${id}`, { stock: Number(stock) })
        )
      ));
      setProducts(prev => prev.map(p => bulkEdits[p._id] !== undefined ? { ...p, stock: Number(bulkEdits[p._id]) } : p));
      setBulkEdits({});
      setShowBulkModal(false);
      toast.success("Stock updated for all products!");
    } catch { toast.error("Some updates failed."); }
    setSavingBulk(false);
  };

  const handleBackToSite = () => {
    localStorage.removeItem("isAdminSession");
    navigate("/home");
  };

  if (adminLoading || loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading Admin Dashboard…</p>
      </div>
    );
  }

  const filteredUsers    = users.filter((u) =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className={`admin-page ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">🛍️</div>
          {!sidebarCollapsed && (
            <div>
              <h2>Thansel Zovia</h2>
              <span>Admin Console</span>
            </div>
          )}
          <button className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed((v) => !v)} title="Toggle sidebar">
            {sidebarCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        <nav className="admin-nav">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`admin-nav-btn ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={16} />
              {!sidebarCollapsed && <span>{label}</span>}
              {activeTab === id && (
                <motion.div className="nav-active-bar" layoutId="nav-bar" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              )}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleBackToSite} title="Back to site">
          <Home size={15} />
          {!sidebarCollapsed && " Back to Site"}
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>{activeTab}</h1>
            <p className="admin-header-sub">
              {activeTab === "Overview"    && "Your store at a glance"}
              {activeTab === "Users"       && `${users.length} registered users`}
              {activeTab === "Orders"      && `${orders.length} total orders`}
              {activeTab === "Products"    && `${products.length} products listed`}
              {activeTab === "Analytics"   && "Revenue & sales insights"}
              {activeTab === "Coupons"     && `${coupons.length} coupons`}
              {activeTab === "Reviews"     && `${reviews.length} reviews`}
              {activeTab === "Categories"  && `${categories.length} categories`}
              {activeTab === "Banners"     && "Home hero banner settings"}
              {activeTab === "Activities"  && "Admin action audit trail"}
            </p>
          </div>
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            {activeTab === "Products" && (
              <>
                <button className="add-product-btn" style={{ background:"rgba(59,130,246,0.15)", color:"#3b82f6", border:"1px solid rgba(59,130,246,0.3)" }} onClick={() => { setBulkEdits({}); setShowBulkModal(true); }}>
                  <Layers size={15} /> Bulk Stock
                </button>
                <button className="add-product-btn" onClick={openAddModal}>
                  <Plus size={16} /> Add Product
                </button>
              </>
            )}
            {activeTab === "Coupons" && (
              <button className="add-product-btn" onClick={openAddCoupon}>
                <Plus size={16} /> New Coupon
              </button>
            )}
            {activeTab === "Categories" && (
              <button className="add-product-btn" onClick={openAddCat}>
                <Plus size={16} /> Add Category
              </button>
            )}
          </div>
        </div>

        {/* Low-stock alert banner */}
        {lowStock.length > 0 && (activeTab === "Overview" || activeTab === "Products") && (
          <div className="low-stock-banner">
            <AlertTriangle size={16} />
            <span><strong>{lowStock.length} product{lowStock.length > 1 ? "s" : ""}</strong> running low on stock (under 5 units): {lowStock.map((p) => p.name).join(", ")}</span>
          </div>
        )}

        {/* ══ OVERVIEW ══ */}
        {activeTab === "Overview" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="stats-grid">
              {[
                { label:"Total Revenue",  value:`₹${totalRevenue.toLocaleString()}`, Icon:DollarSign, color:"#22c55e", bg:"rgba(34,197,94,0.1)"  },
                { label:"Total Orders",   value:orders.length,                        Icon:ShoppingBag,color:"#3b82f6", bg:"rgba(59,130,246,0.1)" },
                { label:"Total Users",    value:users.length,                         Icon:Users,      color:"#a855f7", bg:"rgba(168,85,247,0.1)" },
                { label:"Total Products", value:products.length,                      Icon:Package,    color:"#f97316", bg:"rgba(249,115,22,0.1)" },
              ].map(({ label, value, Icon, color, bg }) => (
                <motion.div key={label} className="stat-card" whileHover={{ y:-2 }} style={{ "--accent": color, "--accent-bg": bg }}>
                  <div className="stat-icon-wrap" style={{ background: bg, color }}><Icon size={22} /></div>
                  <div>
                    <p className="stat-label">{label}</p>
                    <h2 className="stat-value">{value}</h2>
                  </div>
                  <TrendingUp size={14} className="stat-trend" style={{ color }} />
                </motion.div>
              ))}
            </div>

            <div className="admin-charts-row">
              <div className="admin-chart-card wide">
                <h3>Monthly Revenue — {new Date().getFullYear()}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize:12, fill:"#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:12, fill:"#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f1f5f9" }} formatter={(v) => [`₹${v}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2.5} dot={{ fill:"#ea580c", r:4 }} activeDot={{ r:6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="admin-chart-card">
                <h3>Orders by Category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryStats} dataKey="orders" nameKey="category" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                      {categoryStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f1f5f9" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-table-card">
              <h3>Recent Orders</h3>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>City</th></tr></thead>
                  <tbody>
                    {orders.length === 0
                      ? <tr><td colSpan={6} className="empty-row">No orders yet</td></tr>
                      : orders.slice(0, 6).map((order) => (
                        <tr key={order._id}>
                          <td className="order-id">#{order._id.slice(0,8).toUpperCase()}</td>
                          <td>{order.deliveryAddress?.name || order.userId?.name || "—"}</td>
                          <td>{order.items?.length} items</td>
                          <td className="amount">₹{order.grandTotal?.toLocaleString()}</td>
                          <td><span className={`status-badge status-${order.status || "pending"}`}>{STATUS_LABELS[order.status] || "Pending"}</span></td>
                          <td>{order.deliveryAddress?.city || "—"}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ PRODUCTS ══ */}
        {activeTab === "Products" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="admin-search-row">
              <div className="admin-search-wrap">
                <Search size={15} />
                <input
                  className="admin-search-input"
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="empty-products"><Package size={48} strokeWidth={1.5} /><p>No products found.</p></div>
            ) : (
              <div className="products-admin-grid">
                {filteredProducts.map((product) => (
                  <motion.div className="product-admin-card" key={product._id} whileHover={{ y:-2 }}>
                    <div className="product-admin-img">
                      <img src={product.image} alt={product.name} onError={(e) => { e.target.src = "https://placehold.co/200x160/1e293b/64748b?text=No+Image"; }} />
                      {(product.stock ?? 0) < 5 && (
                        <span className="low-stock-badge">Low Stock</span>
                      )}
                    </div>
                    <div className="product-admin-info">
                      <span className="product-admin-cat">{product.category}</span>
                      <h4>{product.name}</h4>
                      <p>₹{product.price?.toLocaleString()}{product.mrp && <span className="mrp-tag"> MRP: ₹{product.mrp}</span>}</p>
                      <p className="product-admin-meta">⭐ {product.rating}{product.stock !== undefined && ` · Stock: ${product.stock}`}</p>
                    </div>
                    <div className="product-admin-actions">
                      <button className="product-edit-btn"   onClick={() => openEditModal(product)} title="Edit"><Edit2 size={14} /></button>
                      <button
                        className="product-edit-btn"
                        onClick={() => handleToggleVisibility(product)}
                        title={product.isVisible === false ? "Show product" : "Hide product"}
                        style={{ color: product.isVisible === false ? "#64748b" : "#22c55e" }}
                      >
                        {product.isVisible === false ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button className="product-delete-btn" onClick={() => handleDeleteProduct(product._id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ══ ORDERS ══ */}
        {activeTab === "Orders" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="admin-search-row" style={{ gap:10, flexWrap:"wrap" }}>
              <div className="admin-search-wrap" style={{ flex:1, minWidth:180 }}>
                <Search size={15} />
                <input
                  className="admin-search-input"
                  placeholder="Search customer or order ID…"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
              <select
                className="status-select"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{ background:"#1e293b", color:"#f1f5f9", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 12px", fontSize:13 }}
              >
                <option value="all">All Statuses</option>
                {STATUS_STEPS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="admin-table-card">
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Update</th></tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = orders.filter(o => {
                        const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
                        const term = orderSearch.toLowerCase();
                        const matchSearch = !term ||
                          o._id?.toLowerCase().includes(term) ||
                          o.deliveryAddress?.name?.toLowerCase().includes(term);
                        return matchStatus && matchSearch;
                      });
                      if (filtered.length === 0) return <tr><td colSpan={7} className="empty-row">No orders found</td></tr>;
                      return filtered.map((order) => (
                        <tr key={order._id}>
                          <td className="order-id">#{order._id.slice(0,8).toUpperCase()}</td>
                          <td>{order.deliveryAddress?.name || "—"}</td>
                          <td>
                            <div className="order-items-list">
                              {order.items?.slice(0,2).map((item, j) => <span key={j} className="order-item-tag">{item.name}</span>)}
                              {order.items?.length > 2 && <span className="order-item-tag">+{order.items.length - 2}</span>}
                            </div>
                          </td>
                          <td className="amount">₹{order.grandTotal?.toLocaleString()}</td>
                          <td style={{ fontSize:12, color:"#64748b" }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : `${order.month} ${order.year}`}
                          </td>
                          <td><span className={`status-badge status-${order.status || "pending"}`}>{STATUS_LABELS[order.status] || "Pending"}</span></td>
                          <td>
                            <select
                              className="status-select"
                              value={order.status || "pending"}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              disabled={updatingOrderId === order._id}
                            >
                              {STATUS_STEPS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ ANALYTICS ══ */}
        {activeTab === "Analytics" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            {!analytics ? (
              <div className="admin-loading" style={{ minHeight:200 }}>
                <div className="admin-spinner" /><p>Loading analytics…</p>
              </div>
            ) : (
              <>
                {/* Top products bar chart */}
                <div className="admin-charts-row">
                  <div className="admin-chart-card wide">
                    <h3>Top Products by Units Sold</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={analytics.topProducts} layout="vertical" margin={{ left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize:12, fill:"#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#94a3b8" }} axisLine={false} tickLine={false} width={120} />
                        <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f1f5f9" }} />
                        <Bar dataKey="totalSold" fill="#ea580c" radius={[0,4,4,0]} name="Units Sold" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="admin-chart-card">
                    <h3>Revenue by Category</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={analytics.revenueByCategory} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                          {analytics.revenueByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f1f5f9" }} formatter={(v) => [`₹${v?.toLocaleString()}`, "Revenue"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders by status */}
                <div className="admin-charts-row">
                  <div className="admin-chart-card wide">
                    <h3>Daily Revenue — Last 30 Days</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analytics.dailyRevenue.map((d) => ({
                        day: `${d._id.day}/${d._id.month}`,
                        revenue: d.revenue,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" tick={{ fontSize:11, fill:"#64748b" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize:11, fill:"#64748b" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background:"#1e293b", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f1f5f9" }} formatter={(v) => [`₹${v}`, "Revenue"]} />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="admin-chart-card">
                    <h3>Orders by Status</h3>
                    <div className="status-stat-list">
                      {analytics.ordersByStatus.map((s) => (
                        <div key={s._id} className="status-stat-row">
                          <span className={`status-badge status-${s._id}`}>{STATUS_LABELS[s._id] || s._id}</span>
                          <span className="status-stat-count">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coupon usage stats */}
                {analytics.coupons?.length > 0 && (
                  <div className="admin-table-card">
                    <h3>Coupon Usage</h3>
                    <div className="table-wrap">
                      <table className="admin-table">
                        <thead><tr><th>Code</th><th>Type</th><th>Discount</th><th>Used</th><th>Max Uses</th><th>Active</th></tr></thead>
                        <tbody>
                          {analytics.coupons.map((c) => (
                            <tr key={c._id}>
                              <td><code style={{ color:"#f97316" }}>{c.code}</code></td>
                              <td>{c.type}</td>
                              <td>{c.type === "percent" ? `${c.discount}%` : `₹${c.discount}`}</td>
                              <td>{c.usedCount}</td>
                              <td>{c.maxUses || "∞"}</td>
                              <td>{c.isActive ? <CheckCircle size={14} color="#22c55e" /> : <Ban size={14} color="#ef4444" />}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Heatmaps ── */}
                {(() => {
                  const hourCounts  = Array(24).fill(0);
                  const dayCounts   = Array(7).fill(0);
                  orders.forEach((o) => {
                    if (!o.createdAt) return;
                    const d = new Date(o.createdAt);
                    hourCounts[d.getHours()]++;
                    dayCounts[d.getDay()]++;
                  });
                  const maxHour = Math.max(...hourCounts, 1);
                  const maxDay  = Math.max(...dayCounts, 1);
                  const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
                  return (
                    <div className="admin-charts-row">
                      <div className="admin-chart-card wide">
                        <h3 style={{ display:"flex", alignItems:"center", gap:8 }}><Clock size={15} /> Orders by Hour of Day</h3>
                        <div className="heatmap-hour-row">
                          {hourCounts.map((count, h) => {
                            const opacity = count === 0 ? 0.06 : 0.15 + (count / maxHour) * 0.85;
                            return (
                              <div key={h} className="heatmap-hour-cell" title={`${h}:00 — ${count} orders`} style={{ background: `rgba(234,88,12,${opacity})` }}>
                                <span className="heatmap-hour-label">{h}</span>
                                <span className="heatmap-count">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="admin-chart-card">
                        <h3 style={{ display:"flex", alignItems:"center", gap:8 }}><Calendar size={15} /> Orders by Day of Week</h3>
                        <div className="heatmap-day-col">
                          {dayCounts.map((count, d) => {
                            const pct = count === 0 ? 6 : 15 + Math.round((count / maxDay) * 85);
                            return (
                              <div key={d} className="heatmap-day-row" title={`${DAY_LABELS[d]}: ${count} orders`}>
                                <span className="heatmap-day-label">{DAY_LABELS[d]}</span>
                                <div className="heatmap-day-bar">
                                  <div style={{ width: `${pct}%`, height:"100%", background: `rgba(234,88,12,${0.2 + (pct/100)*0.8})`, borderRadius:4, minWidth: 6, transition:"width 0.4s" }} />
                                </div>
                                <span className="heatmap-count">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </motion.div>
        )}

        {/* ══ COUPONS ══ */}
        {activeTab === "Coupons" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="admin-table-card">
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Code</th><th>Type</th><th>Discount</th><th>Min Order</th><th>Used/Max</th><th>Expires</th><th>Active</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {coupons.length === 0
                      ? <tr><td colSpan={8} className="empty-row">No coupons yet</td></tr>
                      : coupons.map((c) => (
                        <tr key={c._id}>
                          <td><code className="coupon-code">{c.code}</code></td>
                          <td style={{ textTransform:"capitalize" }}>{c.type}</td>
                          <td>{c.type === "percent" ? `${c.discount}%` : `₹${c.discount}`}</td>
                          <td>{c.minOrder ? `₹${c.minOrder}` : "—"}</td>
                          <td>{c.usedCount} / {c.maxUses || "∞"}</td>
                          <td style={{ fontSize:12, color:"#64748b" }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "—"}</td>
                          <td>
                            <button
                              className={`coupon-toggle-btn ${c.isActive ? "active" : "inactive"}`}
                              onClick={() => handleToggleCoupon(c)}
                              title={c.isActive ? "Deactivate" : "Activate"}
                            >
                              {c.isActive ? <CheckCircle size={14} /> : <Ban size={14} />}
                            </button>
                          </td>
                          <td>
                            <div style={{ display:"flex", gap:6 }}>
                              <button className="product-edit-btn"   onClick={() => openEditCoupon(c)}><Edit2 size={13} /></button>
                              <button className="product-delete-btn" onClick={() => handleDeleteCoupon(c._id)}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ REVIEWS ══ */}
        {activeTab === "Reviews" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="admin-table-card">
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Comment</th><th>Date</th><th>Delete</th></tr></thead>
                  <tbody>
                    {reviews.length === 0
                      ? <tr><td colSpan={6} className="empty-row">No reviews yet</td></tr>
                      : reviews.map((r) => (
                        <tr key={r._id}>
                          <td style={{ maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {r.productId?.name || "—"}
                          </td>
                          <td>{r.name || r.userId?.name || "—"}</td>
                          <td>
                            <span style={{ color:"#f59e0b" }}>{"★".repeat(r.rating)}</span>
                            <span style={{ color:"#334155" }}>{"★".repeat(5 - r.rating)}</span>
                          </td>
                          <td style={{ maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"#94a3b8" }}>
                            {r.comment}
                          </td>
                          <td style={{ fontSize:12, color:"#64748b" }}>
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "—"}
                          </td>
                          <td>
                            <button className="product-delete-btn" onClick={() => handleDeleteReview(r._id)}><Trash2 size={13} /></button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ USERS ══ */}
        {activeTab === "Users" && !selectedUser && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="admin-search-row">
              <div className="admin-search-wrap">
                <Search size={15} />
                <input
                  className="admin-search-input"
                  placeholder="Search by name or email…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="admin-table-card">
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>State</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0
                      ? <tr><td colSpan={8} className="empty-row">No users found</td></tr>
                      : filteredUsers.map((u, i) => (
                        <tr key={u._id} className={u.isSuspended ? "row-suspended" : ""}>
                          <td>{i + 1}</td>
                          <td>
                            <div className="user-row">
                              <div className="user-avatar">{u.name?.charAt(0)?.toUpperCase() || "?"}</div>
                              {u.name || "—"}
                            </div>
                          </td>
                          <td>{u.email || "—"}</td>
                          <td>{u.phone || "—"}</td>
                          <td>{u.city || "—"}</td>
                          <td>{u.state || "—"}</td>
                          <td>
                            {u.isAdmin
                              ? <span className="status-badge" style={{ background:"rgba(168,85,247,0.15)", color:"#a855f7" }}>Admin</span>
                              : u.isSuspended
                                ? <span className="status-badge status-cancelled">Suspended</span>
                                : <span className="status-badge status-delivered">Active</span>
                            }
                          </td>
                          <td>
                            <div style={{ display:"flex", gap:6 }}>
                              <button className="product-edit-btn" onClick={() => handleViewUserOrders(u)} title="View Orders">
                                <ShoppingBag size={13} />
                              </button>
                              {!u.isAdmin && (u.isSuspended
                                ? <button className="product-edit-btn" onClick={() => handleActivateUser(u)} title="Activate" style={{ color:"#22c55e" }}><CheckCircle size={13} /></button>
                                : <button className="product-delete-btn" onClick={() => handleSuspendUser(u)} title="Suspend"><Ban size={13} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Orders Detail Panel */}
        {activeTab === "Users" && selectedUser && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <button className="back-link-btn" onClick={() => setSelectedUser(null)}>
              ← Back to Users
            </button>
            <div className="admin-table-card" style={{ marginTop:16 }}>
              <h3>Orders for {selectedUser.name}</h3>
              {loadingUserOrders ? (
                <div style={{ padding:32, textAlign:"center", color:"#64748b" }}>Loading…</div>
              ) : userOrders.length === 0 ? (
                <div className="empty-row" style={{ padding:32, textAlign:"center" }}>No orders placed yet.</div>
              ) : (
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Order ID</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {userOrders.map((o) => (
                        <tr key={o._id}>
                          <td className="order-id">#{o._id.slice(0,8).toUpperCase()}</td>
                          <td>{o.items?.length} items</td>
                          <td className="amount">₹{o.grandTotal?.toLocaleString()}</td>
                          <td style={{ fontSize:12, color:"#64748b" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                          <td><span className={`status-badge status-${o.status || "pending"}`}>{STATUS_LABELS[o.status] || "Pending"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {/* ══ CATEGORIES ══ */}
        {activeTab === "Categories" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="products-admin-grid" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
              {categories.length === 0 ? (
                <div className="empty-products" style={{ gridColumn:"1/-1" }}><Grid3X3 size={48} strokeWidth={1.5} /><p>No categories yet. Add one!</p></div>
              ) : categories.map((cat) => (
                <motion.div key={cat._id} className="product-admin-card" whileHover={{ y:-2 }}>
                  <div style={{ fontSize:40, textAlign:"center", padding:"20px 0 8px" }}>{cat.icon || "🛍️"}</div>
                  <div className="product-admin-info" style={{ textAlign:"center" }}>
                    <h4>{cat.name}</h4>
                    <p style={{ color:"#64748b", fontSize:12 }}>Order: {cat.order ?? 0}</p>
                  </div>
                  <div className="product-admin-actions">
                    <button className="product-edit-btn"   onClick={() => openEditCat(cat)} title="Edit"><Edit2 size={14} /></button>
                    <button className="product-delete-btn" onClick={() => handleDeleteCat(cat._id)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══ BANNERS ══ */}
        {activeTab === "Banners" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            <div className="admin-table-card" style={{ maxWidth:640 }}>
              <h3 style={{ marginBottom:20 }}>Home Hero Banner</h3>
              {bannerSaved && <div className="profile-success" style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", color:"#22c55e", borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:14 }}>✅ Banner saved!</div>}
              <form onSubmit={handleSaveBanner} className="admin-modal-form" style={{ gap:16 }}>
                <div className="admin-form-group full">
                  <label>Headline *</label>
                  <input value={bannerForm.headline} onChange={e => setBannerForm({...bannerForm, headline:e.target.value})} placeholder="e.g. India's Freshest Deals" required />
                </div>
                <div className="admin-form-group full">
                  <label>Subheadline</label>
                  <input value={bannerForm.subheadline} onChange={e => setBannerForm({...bannerForm, subheadline:e.target.value})} placeholder="e.g. Up to 60% off on electronics" />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Badge Text</label>
                    <input value={bannerForm.badge} onChange={e => setBannerForm({...bannerForm, badge:e.target.value})} placeholder="e.g. New Arrivals" />
                  </div>
                  <div className="admin-form-group">
                    <label>CTA Button Text</label>
                    <input value={bannerForm.ctaText} onChange={e => setBannerForm({...bannerForm, ctaText:e.target.value})} placeholder="e.g. Shop Now" />
                  </div>
                </div>
                <div className="admin-form-group full">
                  <label>CTA Link</label>
                  <input value={bannerForm.ctaLink} onChange={e => setBannerForm({...bannerForm, ctaLink:e.target.value})} placeholder="e.g. /products" />
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, color:"#94a3b8", cursor:"pointer" }}>
                  <input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm({...bannerForm, isActive:e.target.checked})} style={{ accentColor:"#ea580c", width:16, height:16 }} />
                  Banner active (show on homepage)
                </label>
                <div className="admin-modal-actions" style={{ marginTop:8 }}>
                  <button type="submit" className="admin-save-btn" disabled={savingBanner}>
                    {savingBanner ? <span className="btn-spinner-sm" /> : <><Save size={14} /> Save Banner</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
        {/* ══ ACTIVITIES ══ */}
        {activeTab === "Activities" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
            {activityLoading ? (
              <div className="admin-loading" style={{ minHeight:200 }}>
                <div className="admin-spinner" /><p>Loading activity log…</p>
              </div>
            ) : (
              <div className="admin-table-card">
                <div className="table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Time</th><th>Admin</th><th>Action</th><th>Entity</th><th>IP</th></tr>
                    </thead>
                    <tbody>
                      {activityLogs.length === 0
                        ? <tr><td colSpan={5} className="empty-row">No activity recorded yet</td></tr>
                        : activityLogs.map((log) => (
                          <tr key={log._id}>
                            <td style={{ fontSize:12, color:"#64748b", whiteSpace:"nowrap" }}>
                              {log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : "—"}
                            </td>
                            <td style={{ fontSize:12 }}>{log.adminEmail || "—"}</td>
                            <td>
                              <span style={{ background:"rgba(234,88,12,0.12)", color:"#f97316", borderRadius:6, padding:"2px 8px", fontSize:12, fontWeight:600 }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ fontSize:12, color:"#94a3b8" }}>{log.entity}{log.entityId ? ` #${log.entityId.slice(0,8)}` : ""}</td>
                            <td style={{ fontSize:11, color:"#475569" }}>{log.ip || "—"}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ══ Product Modal ══ */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowProductModal(false); }}>
            <motion.div className="admin-modal" initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.97 }} transition={{ duration:0.2 }}>
              <div className="admin-modal-header">
                <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <button className="modal-close-btn" onClick={() => setShowProductModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="admin-modal-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Product Name *</label>
                    <input value={productForm.name} onChange={(e) => setProductForm({...productForm, name:e.target.value})} placeholder="Enter product name" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category:e.target.value})} required>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Selling Price (₹) *</label>
                    <input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price:e.target.value})} placeholder="e.g. 999" required />
                  </div>
                  <div className="admin-form-group">
                    <label>MRP (₹)</label>
                    <input type="number" value={productForm.mrp} onChange={(e) => setProductForm({...productForm, mrp:e.target.value})} placeholder="e.g. 1499" />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Stock Quantity</label>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock:e.target.value})} placeholder="e.g. 50" />
                  </div>
                  <div className="admin-form-group">
                    <label>Rating *</label>
                    <input type="number" step="0.1" min="1" max="5" value={productForm.rating} onChange={(e) => setProductForm({...productForm, rating:e.target.value})} placeholder="1.0 – 5.0" required />
                  </div>
                </div>

                <div className="admin-form-group full">
                  <label>Image</label>
                  <div className="image-type-toggle">
                    <button type="button" className={`img-type-btn ${imageType==="url"?"active":""}`} onClick={() => setImageType("url")}>🔗 URL</button>
                    <button type="button" className={`img-type-btn ${imageType==="file"?"active":""}`} onClick={() => setImageType("file")}>📁 Upload</button>
                    <button type="button" className={`img-type-btn pexels-btn`} onClick={handleFetchPhoto} disabled={fetchingPhoto}>
                      {fetchingPhoto ? <span className="btn-spinner-sm" /> : "📸 Pexels"}
                    </button>
                  </div>
                  {imageType === "url" ? (
                    <input value={productForm.image} onChange={(e) => setProductForm({...productForm, image:e.target.value})} placeholder="https://…" required={!editingProduct} />
                  ) : (
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files[0])} required={!editingProduct && !productForm.image} />
                  )}
                  {productForm.image && imageType === "url" && (
                    <img src={productForm.image} alt="preview" className="product-img-preview" onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                </div>

                <div className="admin-form-group full">
                  <label>Extra Images <span style={{color:"#475569",fontWeight:400}}>(comma-separated URLs for gallery)</span></label>
                  <input value={productForm.images} onChange={(e) => setProductForm({...productForm, images:e.target.value})} placeholder="https://img1.jpg, https://img2.jpg, …" />
                </div>

                <div className="admin-form-group full">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <label>Description *</label>
                    <button type="button" className="ai-desc-btn" onClick={handleGenerateDesc} disabled={generatingDesc}>
                      {generatingDesc ? <span className="btn-spinner-sm" /> : <><Sparkles size={12} /> AI Generate</>}
                    </button>
                  </div>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description:e.target.value})} placeholder="Short product description" rows={3} required />
                </div>

                <div className="admin-modal-actions">
                  <button type="button" className="admin-cancel-btn" onClick={() => setShowProductModal(false)}>Cancel</button>
                  <button type="submit" className="admin-save-btn" disabled={saving}>
                    {saving ? <span className="btn-spinner-sm" /> : editingProduct ? <><Save size={14} /> Update</> : <><Plus size={14} /> Add</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Coupon Modal ══ */}
      <AnimatePresence>
        {showCouponModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCouponModal(false); }}>
            <motion.div className="admin-modal admin-modal-sm" initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.97 }} transition={{ duration:0.2 }}>
              <div className="admin-modal-header">
                <h3>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</h3>
                <button className="modal-close-btn" onClick={() => setShowCouponModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveCoupon} className="admin-modal-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Code *</label>
                    <input value={couponForm.code} onChange={(e) => setCouponForm({...couponForm, code:e.target.value.toUpperCase()})} placeholder="SAVE10" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Type *</label>
                    <select value={couponForm.type} onChange={(e) => setCouponForm({...couponForm, type:e.target.value})}>
                      <option value="percent">Percent (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Discount * {couponForm.type === "percent" ? "(%)" : "(₹)"}</label>
                    <input type="number" value={couponForm.discount} onChange={(e) => setCouponForm({...couponForm, discount:e.target.value})} placeholder="e.g. 10" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Min. Order (₹)</label>
                    <input type="number" value={couponForm.minOrder} onChange={(e) => setCouponForm({...couponForm, minOrder:e.target.value})} placeholder="e.g. 500" />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Max Uses</label>
                    <input type="number" value={couponForm.maxUses} onChange={(e) => setCouponForm({...couponForm, maxUses:e.target.value})} placeholder="Leave blank for unlimited" />
                  </div>
                  <div className="admin-form-group">
                    <label>Expires On</label>
                    <input type="date" value={couponForm.expiresAt} onChange={(e) => setCouponForm({...couponForm, expiresAt:e.target.value})} />
                  </div>
                </div>

                <div className="admin-modal-actions">
                  <button type="button" className="admin-cancel-btn" onClick={() => setShowCouponModal(false)}>Cancel</button>
                  <button type="submit" className="admin-save-btn" disabled={savingCoupon}>
                    {savingCoupon ? <span className="btn-spinner-sm" /> : editingCoupon ? <><Save size={14} /> Update</> : <><Plus size={14} /> Create</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ══ Category Modal ══ */}
      <AnimatePresence>
        {showCatModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCatModal(false); }}>
            <motion.div className="admin-modal admin-modal-sm" initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.97 }} transition={{ duration:0.2 }}>
              <div className="admin-modal-header">
                <h3>{editingCat ? "Edit Category" : "Add Category"}</h3>
                <button className="modal-close-btn" onClick={() => setShowCatModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveCat} className="admin-modal-form">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category Name *</label>
                    <input value={catForm.name} onChange={e => setCatForm({...catForm, name:e.target.value})} placeholder="e.g. Electronics" required />
                  </div>
                  <div className="admin-form-group">
                    <label>Icon (emoji)</label>
                    <input value={catForm.icon} onChange={e => setCatForm({...catForm, icon:e.target.value})} placeholder="🛍️" maxLength={4} />
                  </div>
                </div>
                <div className="admin-form-group full">
                  <label>Sort Order</label>
                  <input type="number" value={catForm.order} onChange={e => setCatForm({...catForm, order:e.target.value})} placeholder="0" />
                </div>
                <div className="admin-modal-actions">
                  <button type="button" className="admin-cancel-btn" onClick={() => setShowCatModal(false)}>Cancel</button>
                  <button type="submit" className="admin-save-btn" disabled={savingCat}>
                    {savingCat ? <span className="btn-spinner-sm" /> : editingCat ? <><Save size={14} /> Update</> : <><Plus size={14} /> Add</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Bulk Inventory Modal ══ */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowBulkModal(false); }}>
            <motion.div className="admin-modal" style={{ maxWidth:700, maxHeight:"80vh", overflow:"hidden", display:"flex", flexDirection:"column" }} initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.97 }} transition={{ duration:0.2 }}>
              <div className="admin-modal-header">
                <h3><Layers size={16} /> Bulk Stock Update</h3>
                <button className="modal-close-btn" onClick={() => setShowBulkModal(false)}><X size={18} /></button>
              </div>
              <p style={{ fontSize:13, color:"#64748b", padding:"0 4px 12px" }}>Edit stock for any products below, then click Save All.</p>
              <div style={{ overflowY:"auto", flex:1, paddingRight:4 }}>
                <table className="admin-table">
                  <thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>New Stock</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} style={{ background: bulkEdits[p._id] !== undefined ? "rgba(234,88,12,0.05)" : "transparent" }}>
                        <td style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</td>
                        <td style={{ fontSize:12, color:"#64748b" }}>{p.category}</td>
                        <td style={{ color:(p.stock ?? 0) < 5 ? "#f59e0b" : "#94a3b8" }}>{p.stock ?? 0}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={bulkEdits[p._id] !== undefined ? bulkEdits[p._id] : ""}
                            placeholder={String(p.stock ?? 0)}
                            onChange={e => setBulkEdits(prev => ({ ...prev, [p._id]: e.target.value }))}
                            style={{ width:80, padding:"4px 8px", borderRadius:6, border:"1px solid rgba(255,255,255,0.1)", background:"#0f172a", color:"#f8fafc", fontSize:13 }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-modal-actions" style={{ paddingTop:16 }}>
                <button className="admin-cancel-btn" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button className="admin-save-btn" onClick={handleBulkSave} disabled={savingBulk}>
                  {savingBulk ? <span className="btn-spinner-sm" /> : <><Save size={14} /> Save All Changes</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
