import { useState, useEffect } from "react";
import API from "../../api/axios";
import { FiX, FiMapPin } from "react-icons/fi";
import "./AddressModal.css";

export default function AddressModal({ onConfirm, onClose }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", addressLine1: "",
    addressLine2: "", city: "", state: "",
    pincode: "", landmark: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        setForm({
          name:         data.name         || "",
          phone:        data.phone        || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          city:         data.city         || "",
          state:        data.state        || "",
          pincode:      data.pincode      || "",
          landmark:     data.landmark     || "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/auth/profile", form);
      onConfirm(form);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
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
          Confirm your delivery address before placing the order.
        </p>

        <form onSubmit={handleConfirm} className="modal-form">
          <div className="modal-row">
            <div className="modal-group">
              <label>Full Name *</label>
              <input
                name="name"
                value={form.name}
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