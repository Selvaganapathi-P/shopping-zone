import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { FiShoppingBag, FiTrendingUp, FiShield, FiTruck } from "react-icons/fi";
import "./Home.css";
import { seedProducts } from "../firebase/seedProducts";

const categories = [
    { name: "Electronics", icon: "💻", bg: "#e3f2fd" },
    { name: "Fashion", icon: "👗", bg: "#fce4ec" },
    { name: "Home & Kitchen", icon: "🏠", bg: "#e8f5e9" },
    { name: "Sports", icon: "⚽", bg: "#fff3e0" },
    { name: "Books", icon: "📚", bg: "#f3e5f5" },
    { name: "Beauty", icon: "💄", bg: "#fff8e1" },
];

const features = [
    { icon: <FiTruck size={28} />, title: "Free Delivery", desc: "On orders above ₹499" },
    { icon: <FiShield size={28} />, title: "Secure Payment", desc: "100% safe transactions" },
    { icon: <FiTrendingUp size={28} />, title: "Track Expenses", desc: "Monitor your spending" },
    { icon: <FiShoppingBag size={28} />, title: "Best Deals", desc: "Unbeatable prices daily" },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <Navbar />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-badge">🔥 New Arrivals Every Day</span>
                    <h1>Shop Smart.<br />Track Smarter.</h1>
                    <p>Discover thousands of products and keep track of every rupee you spend — all in one place.</p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate("/products")}>
                            Shop Now
                        </button>
                        <button className="btn-secondary" onClick={() => navigate("/expense-tracker")}>
                            View Expenses
                        </button>
                        {/* <button className="btn-secondary" onClick={seedProducts}>
                            Seed Products (Run Once)
                        </button> */}
                    </div>
                </div>
                <div className="hero-image">
                    <div className="hero-img-box">
                        <span>🛍️</span>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="features-strip">
                {features.map((f, i) => (
                    <div className="feature-card" key={i}>
                        <div className="feature-icon">{f.icon}</div>
                        <div>
                            <h4>{f.title}</h4>
                            <p>{f.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <h2>Shop by Category</h2>
                <p className="section-subtitle">Find exactly what you're looking for</p>
                <div className="categories-grid">
                    {categories.map((cat, i) => (
                        <div
                            className="category-card"
                            key={i}
                            style={{ background: cat.bg }}
                           onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                        >
                            <span className="category-icon">{cat.icon}</span>
                            <p>{cat.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Banner */}
            <section className="promo-banner">
                <div className="promo-content">
                    <h2>Track Your Monthly Expenses 📊</h2>
                    <p>Know where your money goes. Get detailed charts and insights on your purchases.</p>
                    <button className="btn-primary" onClick={() => navigate("/expense-tracker")}>
                        Open Expense Tracker
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>© 2026 ShopTrack. Built with ❤️ using React & Firebase.</p>
            </footer>
        </div>
    );
}