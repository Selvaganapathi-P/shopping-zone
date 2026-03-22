import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import { db } from "../../firebase/config";
import {
  collection, getDocs, deleteDoc, doc, addDoc
} from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
  FiUsers, FiShoppingBag, FiDollarSign,
  FiPackage, FiTrash2, FiPlus, FiLogOut,
  FiGrid, FiX
} from "react-icons/fi";
import "./AdminDashboard.css";

const TABS = ["Overview", "Users", "Orders", "Products"];

const categories = [
  "Electronics", "Fashion", "Home & Kitchen",
  "Sports", "Books", "Beauty"
];

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function AdminDashboard() {
  const { isAdmin, adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    rating: "",
    image: "",
    description: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/home");
    }
  }, [isAdmin, adminLoading]);

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [usersSnap, ordersSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "products")),
        ]);
        setUsers(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setOrders(ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setProducts(productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  // ── Stats ──
  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  // Monthly revenue for Line Chart
  const monthlyRevenue = months.map((m, i) => ({
    month: m,
    revenue: orders
      .filter((o) => {
        const d = o.createdAt?.toDate?.();
        return d && d.getMonth() === i;
      })
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0),
  }));

  // Category wise orders for Bar Chart
  const categoryStats = categories.map((cat) => ({
    category: cat,
    orders: orders.filter((o) =>
      o.items?.some((item) => item.category === cat)
    ).length,
  }));

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        rating: Number(newProduct.rating),
      });
      setProducts([
        ...products,
        { id: docRef.id, ...newProduct,
          price: Number(newProduct.price),
          rating: Number(newProduct.rating)
        },
      ]);
      setNewProduct({
        name: "", category: "", price: "",
        rating: "", image: "", description: "",
      });
      setShowAddProduct(false);
      alert("✅ Product added successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // Handle back to site
  const handleBackToSite = () => {
    localStorage.removeItem("isAdminSession");
    navigate("/home");
  };

  if (adminLoading || loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* ══ Sidebar ══ */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>🛍️</span>
          <h2>ShopTrack</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`admin-nav-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Overview"  && <FiGrid size={16} />}
              {tab === "Users"     && <FiUsers size={16} />}
              {tab === "Orders"    && <FiShoppingBag size={16} />}
              {tab === "Products"  && <FiPackage size={16} />}
              {tab}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleBackToSite}>
          <FiLogOut size={16} /> Back to Site
        </button>
      </aside>

      {/* ══ Main Content ══ */}
      <main className="admin-main">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>{activeTab}</h1>
            <p>
              {activeTab === "Overview" && "Your store at a glance"}
              {activeTab === "Users"    && `${totalUsers} registered users`}
              {activeTab === "Orders"   && `${totalOrders} total orders`}
              {activeTab === "Products" && `${totalProducts} products listed`}
            </p>
          </div>
          {activeTab === "Products" && (
            <button
              className="add-product-btn"
              onClick={() => setShowAddProduct(true)}
            >
              <FiPlus size={16} /> Add Product
            </button>
          )}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "Overview" && (
          <div className="overview-content">

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">
                  <FiUsers size={24} />
                </div>
                <div>
                  <p>Total Users</p>
                  <h2>{totalUsers}</h2>
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon">
                  <FiShoppingBag size={24} />
                </div>
                <div>
                  <p>Total Orders</p>
                  <h2>{totalOrders}</h2>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">
                  <FiDollarSign size={24} />
                </div>
                <div>
                  <p>Total Revenue</p>
                  <h2>₹{totalRevenue.toLocaleString()}</h2>
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon">
                  <FiPackage size={24} />
                </div>
                <div>
                  <p>Total Products</p>
                  <h2>{totalProducts}</h2>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="admin-charts-row">
              <div className="admin-chart-card wide">
                <h3>Monthly Revenue — {new Date().getFullYear()}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v) => [`₹${v}`, "Revenue"]}
                      contentStyle={{ borderRadius: "8px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#e85d04"
                      strokeWidth={3}
                      dot={{ fill: "#e85d04", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="admin-chart-card">
                <h3>Orders by Category</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      tick={{ fontSize: 11 }}
                      width={90}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="orders"
                      fill="#e85d04"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="admin-table-card">
              <h3>Recent Orders</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Month</th>
                    <th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-row">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td className="order-id">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td>
                          {order.deliveryAddress?.fullName || "—"}
                        </td>
                        <td>{order.items?.length} items</td>
                        <td className="amount">
                          ₹{order.grandTotal?.toLocaleString()}
                        </td>
                        <td>{order.month} {order.year}</td>
                        <td>
                          {order.deliveryAddress?.city || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ USERS TAB ══ */}
        {activeTab === "Users" && (
          <div className="admin-table-card">
            <h3>All Registered Users</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Pincode</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-row">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td className="user-name">
                        <div className="user-avatar-small">
                          {u.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        {u.fullName || "—"}
                      </td>
                      <td>{u.email || "—"}</td>
                      <td>{u.phone || "—"}</td>
                      <td>{u.city || "—"}</td>
                      <td>{u.state || "—"}</td>
                      <td>{u.pincode || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ ORDERS TAB ══ */}
        {activeTab === "Orders" && (
          <div className="admin-table-card">
            <h3>All Orders</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>GST</th>
                  <th>Delivery</th>
                  <th>Grand Total</th>
                  <th>Month</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-row">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td>
                        {order.deliveryAddress?.fullName || "—"}
                      </td>
                      <td>
                        <div className="order-items-list">
                          {order.items?.map((item, j) => (
                            <span key={j} className="order-item-tag">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>₹{order.subtotal?.toLocaleString()}</td>
                      <td>₹{order.tax?.toLocaleString()}</td>
                      <td>
                        {order.delivery === 0
                          ? <span className="free-tag">FREE</span>
                          : `₹${order.delivery}`}
                      </td>
                      <td className="amount">
                        ₹{order.grandTotal?.toLocaleString()}
                      </td>
                      <td>{order.month} {order.year}</td>
                      <td>
                        {order.deliveryAddress?.city || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ PRODUCTS TAB ══ */}
        {activeTab === "Products" && (
          <div className="products-admin-grid">
            {products.length === 0 ? (
              <div className="empty-products">
                <p>No products found.</p>
              </div>
            ) : (
              products.map((product) => (
                <div className="product-admin-card" key={product.id}>
                  <img src={product.image} alt={product.name} />
                  <div className="product-admin-info">
                    <span className="product-admin-cat">
                      {product.category}
                    </span>
                    <h4>{product.name}</h4>
                    <p>₹{product.price} · ⭐ {product.rating}</p>
                  </div>
                  <button
                    className="product-delete-btn"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* ══ Add Product Modal ══ */}
      {showAddProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">

            <div className="admin-modal-header">
              <h3>Add New Product</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowAddProduct(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="admin-modal-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="e.g. 999"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Rating *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newProduct.rating}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, rating: e.target.value })
                    }
                    placeholder="e.g. 4.5"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group full">
                <label>Image URL *</label>
                <input
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              <div className="admin-form-group full">
                <label>Description *</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Short product description"
                  rows={3}
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={() => setShowAddProduct(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-save-btn">
                  <FiPlus size={15} /> Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}