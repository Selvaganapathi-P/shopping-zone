import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { FiX, FiMapPin } from "react-icons/fi";
import "./AddressModal.css";

export default function AddressModal({ onConfirm, onClose }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  // Load existing address if any
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setForm(snap.data());
      } else {
        setForm((prev) => ({
          ...prev,
          fullName: user.displayName || "",
        }));
      }
    };
    load();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      onConfirm(form);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <FiMapPin size={20} />
            <h2>Delivery Address</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <p className="modal-subtitle">
          Please confirm your delivery address before placing the order.
        </p>

        <form onSubmit={handleConfirm} className="modal-form">
          <div className="modal-row">
            <div className="modal-group">
              <label>Full Name *</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>
            <div className="modal-group">
              <label>Phone *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="modal-group full">
            <label>Address Line 1 *</label>
            <input
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="House No, Street, Area"
              required
            />
          </div>

          <div className="modal-group full">
            <label>Address Line 2</label>
            <input
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Apartment, Suite (optional)"
            />
          </div>

          <div className="modal-row">
            <div className="modal-group">
              <label>City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            <div className="modal-group">
              <label>State *</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-group">
              <label>Pincode *</label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                maxLength={6}
                required
              />
            </div>
            <div className="modal-group">
              <label>Landmark</label>
              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Near (optional)"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-confirm"
              disabled={saving}
            >
              {saving ? "Saving..." : "Confirm & Place Order 🚀"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}