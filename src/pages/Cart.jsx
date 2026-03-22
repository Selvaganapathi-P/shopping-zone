import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection, addDoc, Timestamp,
  doc, deleteDoc, getDoc
} from "firebase/firestore";
import Navbar from "../components/Navbar/Navbar";
import AddressModal from "../components/AddressModal/AddressModal";
import {
  FiTrash2, FiMinus, FiPlus,
  FiShoppingBag, FiMapPin
} from "react-icons/fi";
import "./Cart.css";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const tax = Math.round(cartTotal * 0.18);
  const delivery = cartTotal > 499 ? 0 : 49;
  const grandTotal = cartTotal + tax + delivery;

  // Check saved address on load
  useEffect(() => {
    const checkAddress = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          const isComplete =
            data.fullName &&
            data.phone &&
            data.addressLine1 &&
            data.city &&
            data.state &&
            data.pincode;
          if (isComplete) setSavedAddress(data);
        }
      } catch (err) {
        console.error(err);
      }
      setAddressLoading(false);
    };
    checkAddress();
  }, [user]);

  const handlePlaceOrder = async (address) => {
    if (cartItems.length === 0) return;
    try {
      // Save order
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: cartItems,
        subtotal: cartTotal,
        tax,
        delivery,
        grandTotal,
        deliveryAddress: address,
        month: new Date().toLocaleString("default", { month: "long" }),
        year: new Date().getFullYear(),
        createdAt: Timestamp.now(),
      });

      // Save expenses
      for (const item of cartItems) {
        await addDoc(collection(db, "expenses"), {
          userId: user.uid,
          name: item.name,
          amount: item.price * item.quantity,
          category: item.category,
          month: new Date().toLocaleString("default", { month: "long" }),
          year: new Date().getFullYear(),
          date: Timestamp.now(),
        });
      }

      // Clear cart
      await deleteDoc(doc(db, "carts", user.uid));

      alert("🎉 Order placed successfully!");
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-empty">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <button
            className="shop-now-btn"
            onClick={() => navigate("/products")}
          >
            <FiShoppingBag size={16} /> Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />

      <div className="cart-layout">

        {/* ── Cart Items ── */}
        <div className="cart-items-section">
          <h2 className="cart-title">
            🛒 Your Cart <span>({cartItems.length} items)</span>
          </h2>

          {cartItems.map((item) => (
            <div className="cart-card" key={item.id}>
              <img
                src={item.image}
                alt={item.name}
                className="cart-img"
              />

              <div className="cart-item-info">
                <span className="cart-item-category">{item.category}</span>
                <h3>{item.name}</h3>
                <p className="cart-item-price">₹{item.price} per item</p>
              </div>

              <div className="cart-item-controls">
                {/* Quantity */}
                <div className="quantity-control">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <FiMinus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <FiPlus size={14} />
                  </button>
                </div>

                <p className="cart-item-total">
                  ₹{item.price * item.quantity}
                </p>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="order-summary">
          <h3>Order Summary</h3>

          {/* Saved Address */}
          {savedAddress && (
            <div className="saved-address-box">
              <div className="saved-address-label">
                <FiMapPin size={13} /> Delivering to
              </div>
              <p className="saved-address-name">{savedAddress.fullName}</p>
              <p className="saved-address-text">
                {savedAddress.addressLine1}, {savedAddress.city}
              </p>
              <p className="saved-address-text">
                {savedAddress.state} — {savedAddress.pincode}
              </p>
              <p className="saved-address-phone">
                📞 {savedAddress.phone}
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="summary-row">
              <span>GST (18%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className={delivery === 0 ? "free" : ""}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
            {delivery === 0 && (
              <p className="free-delivery-msg">
                🎉 You get free delivery!
              </p>
            )}
          </div>

          <div className="summary-total">
            <span>Grand Total</span>
            <span>₹{grandTotal}</span>
          </div>

          {/* Place Order Button */}
          <button
            className="place-order-btn"
            onClick={() => setShowAddressModal(true)}
            disabled={addressLoading}
          >
            {addressLoading ? "Loading..." : "Place Order 🚀"}
          </button>

          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {/* ── Address Modal ── */}
      {showAddressModal && (
        <AddressModal
          onConfirm={async (address) => {
            setSavedAddress(address);
            setShowAddressModal(false);
            await handlePlaceOrder(address);
          }}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </div>
  );
}