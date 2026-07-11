import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import AddressModal from "../components/AddressModal/AddressModal";
import toast from "react-hot-toast";
import {
  Trash2, Minus, Plus, ShoppingBag, MapPin,
  Tag, Truck, ChevronRight, AlertCircle, Check, X
} from "lucide-react";
import "./Cart.css";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses]     = useState([]);
  const [selectedAddress, setSelectedAddress]   = useState(null);
  const [addressLoading, setAddressLoading]     = useState(true);
  const [placing, setPlacing]                   = useState(false);

  // Coupon state
  const [couponInput, setCouponInput]     = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, type, value }

  const tax       = Math.round(cartTotal * 0.18);
  const delivery  = cartTotal > 499 ? 0 : 49;
  const discount  = appliedCoupon?.discount || 0;
  const grandTotal = cartTotal + tax + delivery - discount;

  useEffect(() => {
    if (!user) return;
    API.get("/addresses")
      .then(({ data }) => {
        setSavedAddresses(data);
        const def = data.find((a) => a.isDefault) || data[0];
        if (def) setSelectedAddress(def);
      })
      .catch(() => {
        // fallback to profile address
        API.get("/auth/profile").then(({ data }) => {
          if (data.addressLine1 && data.city) {
            const addr = { name: data.name, phone: data.phone, addressLine1: data.addressLine1, addressLine2: data.addressLine2, city: data.city, state: data.state, pincode: data.pincode, landmark: data.landmark };
            setSavedAddresses([addr]);
            setSelectedAddress(addr);
          }
        }).catch(() => {});
      })
      .finally(() => setAddressLoading(false));
  }, [user]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await API.post("/coupons/validate", {
        code: couponInput.trim(),
        orderAmount: cartTotal,
      });
      setAppliedCoupon(data);
      toast.success(`Coupon applied! You save ₹${data.discount.toLocaleString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code.");
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.success("Coupon removed.");
  };

  const handlePlaceOrder = async (address) => {
    if (cartItems.length === 0) return;
    setPlacing(true);
    try {
      // Increment coupon usage if applied
      if (appliedCoupon) {
        await API.post("/coupons/apply", { code: appliedCoupon.code }).catch(() => {});
      }

      const { data } = await API.post("/orders", {
        items: cartItems, subtotal: cartTotal,
        tax, delivery, grandTotal,
        deliveryAddress: address,
        couponCode: appliedCoupon?.code,
        discount,
      });
      await clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/order-success", { state: { order: data } });
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
    setPlacing(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <motion.div
          className="cart-empty"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-bag-icon">
            <ShoppingBag size={64} strokeWidth={1.5} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <button className="shop-now-btn" onClick={() => navigate("/products")}>
            <ShoppingBag size={16} /> Browse Products
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-layout">

        {/* Cart Items */}
        <div className="cart-items-section">
          <h2 className="cart-title">
            Your Cart <span className="cart-count">({cartItems.length} {cartItems.length === 1 ? "item" : "items"})</span>
          </h2>

          <AnimatePresence initial={false}>
            {cartItems.map((item) => (
              <motion.div
                key={item.productId}
                className="cart-item"
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="cart-item-img">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => { e.target.src = "https://placehold.co/80x80/1e293b/64748b?text=?"; }}
                  />
                </div>

                <div className="cart-item-details">
                  <span className="cart-item-cat">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">₹{item.price.toLocaleString()} each</p>
                </div>

                <div className="cart-item-actions">
                  <div className="qty-stepper">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </motion.button>
                    <span>{item.quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </motion.button>
                  </div>

                  <div className="cart-item-subtotal">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>

                  <motion.button
                    className="remove-btn"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => { removeFromCart(item.productId); toast.success("Removed from cart"); }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>

          {/* Coupon Code */}
          <div className="coupon-section">
            <p className="coupon-label"><Tag size={13} /> Have a coupon?</p>
            {appliedCoupon ? (
              <div className="coupon-applied">
                <div className="coupon-applied-info">
                  <Check size={14} style={{ color: "#22c55e" }} />
                  <span className="coupon-code-text">{appliedCoupon.code}</span>
                  <span className="coupon-saved">−₹{appliedCoupon.discount.toLocaleString()}</span>
                </div>
                <button className="coupon-remove-btn" onClick={removeCoupon} title="Remove coupon">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="coupon-input-row">
                <input
                  className="coupon-input"
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                />
                <button
                  className="coupon-apply-btn"
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim() || couponLoading}
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          <div className="summary-lines">
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((s,i) => s + i.quantity, 0)} items)</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>GST (18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span className="delivery-label">
                <Truck size={14} /> Delivery
              </span>
              <span className={delivery === 0 ? "free-delivery" : ""}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
            {appliedCoupon && (
              <div className="summary-row" style={{ color: "#22c55e" }}>
                <span><Tag size={13} /> Coupon ({appliedCoupon.code})</span>
                <span>−₹{discount.toLocaleString()}</span>
              </div>
            )}
            {delivery === 0 && (
              <div className="free-delivery-note">
                <Tag size={12} /> Free delivery on orders above ₹499
              </div>
            )}
            {delivery > 0 && (
              <div className="free-delivery-note warn">
                <AlertCircle size={12} /> Add ₹{499 - cartTotal} more for free delivery
              </div>
            )}
          </div>

          <div className="summary-total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>

          <div className="delivery-address-section">
            <h4><MapPin size={14} /> Delivery Address</h4>
            {addressLoading ? (
              <div className="shimmer" style={{ height: 60, borderRadius: 10 }} />
            ) : savedAddresses.length > 0 ? (
              <div className="address-list">
                {savedAddresses.map((addr, i) => (
                  <label
                    key={addr._id || i}
                    className={`address-radio-card ${selectedAddress === addr || (selectedAddress?._id && selectedAddress._id === addr._id) ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="delivery-address"
                      checked={!!(selectedAddress?._id ? selectedAddress._id === addr._id : selectedAddress === addr)}
                      onChange={() => setSelectedAddress(addr)}
                      style={{ marginRight: 8 }}
                    />
                    <div className="address-card-body">
                      <span className="addr-label-chip">{addr.label || "Home"}</span>
                      <strong>{addr.name}</strong>
                      <span>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}</span>
                      <span>📞 {addr.phone}</span>
                    </div>
                  </label>
                ))}
                <button className="add-address-btn" onClick={() => setShowAddressModal(true)} style={{ marginTop: 6 }}>
                  <MapPin size={13} /> Add New Address
                </button>
              </div>
            ) : (
              <button className="add-address-btn" onClick={() => setShowAddressModal(true)}>
                <MapPin size={14} /> Add Delivery Address
              </button>
            )}
          </div>

          <motion.button
            className="place-order-btn"
            onClick={() => {
              if (selectedAddress) handlePlaceOrder(selectedAddress);
              else setShowAddressModal(true);
            }}
            disabled={placing || cartItems.length === 0}
            whileTap={{ scale: 0.98 }}
          >
            {placing ? (
              <span className="btn-spinner" />
            ) : (
              <>Place Order <ChevronRight size={18} /></>
            )}
          </motion.button>

          <p className="secure-note">🔒 Secured by Thansel Zovia. Safe checkout.</p>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onConfirm={(addr) => {
            setSavedAddresses(prev => {
              const exists = prev.some(a => a._id && a._id === addr._id);
              return exists ? prev.map(a => a._id === addr._id ? addr : a) : [addr, ...prev];
            });
            setSelectedAddress(addr);
            setShowAddressModal(false);
          }}
          existingAddress={selectedAddress}
        />
      )}
    </div>
  );
}
