import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar/Navbar";
import { FiSearch, FiFilter, FiStar, FiShoppingCart } from "react-icons/fi";
import "./Products.css";

const categories = ["All", "Electronics", "Fashion", "Home & Kitchen", "Sports", "Books", "Beauty"];
const sortOptions = ["Default", "Price: Low to High", "Price: High to Low", "Top Rated"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(5000);
  const [sortBy, setSortBy] = useState("Default");
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  // Fetch products
  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "products"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(data);
      setLoading(false);
    };
    fetch();
  }, []);

  // Set category from URL param (from Home page category cards)
  useEffect(() => {
  const cat = searchParams.get("category");
if (cat) setSelectedCategory(decodeURIComponent(cat));
  }, [searchParams]);

  // Filter + Sort
  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== "All")
      result = result.filter((p) => p.category === selectedCategory);

    if (search)
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );

    result = result.filter((p) => p.price <= priceRange);

    if (sortBy === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "Top Rated") result.sort((a, b) => b.rating - a.rating);

    setFiltered(result);
  }, [products, selectedCategory, search, priceRange, sortBy]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="products-page">
      <Navbar />

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <h3><FiFilter size={16} /> Filters</h3>

          {/* Category */}
          <div className="filter-group">
            <h4>Category</h4>
            {categories.map((cat) => (
              <label key={cat} className="filter-label">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <h4>Max Price: ₹{priceRange}</h4>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-labels">
              <span>₹100</span>
              <span>₹5000</span>
            </div>
          </div>

          {/* Reset */}
          <button className="reset-btn" onClick={() => {
            setSelectedCategory("All");
            setPriceRange(5000);
            setSearch("");
            setSortBy("Default");
          }}>
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <main className="products-main">
          {/* Search + Sort Bar */}
          <div className="products-topbar">
            <div className="search-box">
              <FiSearch size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <p className="results-count">{filtered.length} products found</p>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="no-results">😕 No products found. Try changing filters.</div>
          ) : (
            <div className="products-grid">
              {filtered.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-img-wrap">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-footer">
                      <div>
                        <span className="product-price">₹{product.price}</span>
                        <span className="product-rating">
                          <FiStar size={12} /> {product.rating}
                        </span>
                      </div>
                      <button
                        className={`add-cart-btn ${addedId === product.id ? "added" : ""}`}
                        onClick={() => handleAddToCart(product)}
                      >
                        {addedId === product.id ? "✅ Added" : <><FiShoppingCart size={14} /> Add</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}