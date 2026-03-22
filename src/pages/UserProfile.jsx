import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "../components/Navbar/Navbar";
import { FiUser, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from "react-icons/fi";
import "./UserProfile.css";

export default function UserProfile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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

  // Fetch saved profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setForm(snap.data());
        } else {
          setForm((prev) => ({
            ...prev,
            fullName: user.displayName || "",
          }));
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...form,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const isComplete =
    form.fullName &&
    form.phone &&
    form.addressLine1 &&
    form.city &&
    form.state &&
    form.pincode;

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-loading">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">

        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar-big">
            <img
              src={
                user?.photoURL ||
                `https://ui-avatars.com/api/?name=${user?.displayName}&background=e85d04&color=fff&size=100`
              }
              alt="avatar"
            />
            <div className="profile-avatar-status" />
          </div>
          <div className="profile-header-info">
            <h1>{user?.displayName || "User"}</h1>
            <p>{user?.email}</p>
            {isComplete ? (
              <span className="profile-badge complete">
                ✅ Profile Complete
              </span>
            ) : (
              <span className="profile-badge incomplete">
                ⚠️ Profile Incomplete
              </span>
            )}
          </div>
          {!editing && (
            <button
              className="edit-profile-btn"
              onClick={() => setEditing(true)}
            >
              <FiEdit2 size={15} /> Edit Profile
            </button>
          )}
        </div>

        {/* Success message */}
        {success && (
          <div className="profile-success">
            ✅ Profile saved successfully!
          </div>
        )}

        <div className="profile-body">

          {/* Personal Info Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <FiUser size={18} />
              <h3>Personal Information</h3>
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="profile-card-header" style={{ marginTop: "24px" }}>
                  <FiMapPin size={18} />
                  <h3>Delivery Address</h3>
                </div>

                <div className="form-row">
                  <div className="form-group full">
                    <label>Address Line 1 *</label>
                    <input
                      name="addressLine1"
                      value={form.addressLine1}
                      onChange={handleChange}
                      placeholder="House No, Street, Area"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full">
                    <label>Address Line 2</label>
                    <input
                      name="addressLine2"
                      value={form.addressLine2}
                      onChange={handleChange}
                      placeholder="Apartment, Suite (optional)"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="form-group">
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

                <div className="form-row">
                  <div className="form-group">
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
                  <div className="form-group">
                    <label>Landmark</label>
                    <input
                      name="landmark"
                      value={form.landmark}
                      onChange={handleChange}
                      placeholder="Near landmark (optional)"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditing(false)}
                  >
                    <FiX size={15} /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={saving}
                  >
                    <FiSave size={15} />
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-view">

                {/* Personal Info View */}
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">
                      {form.fullName || <span className="not-set">Not set</span>}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">
                      {form.phone || <span className="not-set">Not set</span>}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                </div>

                {/* Address View */}
                <div className="address-view-card">
                  <div className="address-view-header">
                    <FiMapPin size={16} />
                    <span>Delivery Address</span>
                  </div>
                  {isComplete ? (
                    <div className="address-view-content">
                      <p className="address-line">{form.addressLine1}</p>
                      {form.addressLine2 && (
                        <p className="address-line">{form.addressLine2}</p>
                      )}
                      <p className="address-line">
                        {form.city}, {form.state} — {form.pincode}
                      </p>
                      {form.landmark && (
                        <p className="address-landmark">
                          Near: {form.landmark}
                        </p>
                      )}
                      <p className="address-phone">
                        📞 {form.phone}
                      </p>
                    </div>
                  ) : (
                    <div className="address-empty">
                      <p>No delivery address saved.</p>
                      <button
                        className="add-address-btn"
                        onClick={() => setEditing(true)}
                      >
                        + Add Address
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}