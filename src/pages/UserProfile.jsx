import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import Navbar from "../components/Navbar/Navbar";
import { FiUser, FiMapPin, FiEdit2, FiSave, FiX, FiPlus, FiTrash2, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import "./UserProfile.css";

const BLANK_ADDR = {
  label: "Home", name: "", phone: "",
  addressLine1: "", addressLine2: "",
  city: "", state: "", pincode: "", landmark: "",
  isDefault: false,
};

function AddressFormModal({ initial, onSave, onClose }) {
  const [form, setForm]   = useState(initial || BLANK_ADDR);
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      return toast.error("Please fill in all required fields.");
    }
    setSaving(true);
    try {
      let data;
      if (initial?._id) {
        ({ data } = await API.put(`/addresses/${initial._id}`, form));
      } else {
        ({ data } = await API.post("/addresses", form));
      }
      onSave(data);
      toast.success(initial?._id ? "Address updated!" : "Address added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address.");
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-addr-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initial?._id ? "Edit Address" : "Add New Address"}</h3>
          <button className="modal-close-btn" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={submit} className="addr-form">
          <div className="form-row">
            <div className="form-group">
              <label>Label</label>
              <select name="label" value={form.label} onChange={handle} className="addr-select">
                {["Home", "Work", "Other"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Recipient name" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="10-digit mobile" maxLength={10} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full">
              <label>Address Line 1 *</label>
              <input name="addressLine1" value={form.addressLine1} onChange={handle} placeholder="House No, Street, Area" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group full">
              <label>Address Line 2</label>
              <input name="addressLine2" value={form.addressLine2} onChange={handle} placeholder="Apartment, Suite (optional)" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input name="city" value={form.city} onChange={handle} placeholder="City" required />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input name="state" value={form.state} onChange={handle} placeholder="State" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pincode *</label>
              <input name="pincode" value={form.pincode} onChange={handle} placeholder="6-digit pincode" maxLength={6} required />
            </div>
            <div className="form-group">
              <label>Landmark</label>
              <input name="landmark" value={form.landmark} onChange={handle} placeholder="Near landmark (optional)" />
            </div>
          </div>
          <label className="addr-default-check">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default address
          </label>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="cancel-btn" onClick={onClose}><FiX size={14} /> Cancel</button>
            <button type="submit" className="save-btn" disabled={saving}>
              <FiSave size={14} /> {saving ? "Saving…" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { user } = useAuth();
  const [tab, setTab]       = useState("profile");
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", addressLine1: "",
    addressLine2: "", city: "", state: "",
    pincode: "", landmark: "",
  });

  // Address book state
  const [addresses, setAddresses]   = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrModal, setAddrModal]   = useState(null); // null | "new" | address object

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        setForm({
          name: data.name || "", phone: data.phone || "",
          addressLine1: data.addressLine1 || "", addressLine2: data.addressLine2 || "",
          city: data.city || "", state: data.state || "",
          pincode: data.pincode || "", landmark: data.landmark || "",
        });
      } catch {}
      setLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (tab !== "addresses") return;
    setAddrLoading(true);
    API.get("/addresses")
      .then(({ data }) => setAddresses(data))
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  }, [tab]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/auth/profile", form);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleAddrSaved = (addr) => {
    setAddresses(prev => {
      const exists = prev.some(a => a._id === addr._id);
      let updated = exists ? prev.map(a => a._id === addr._id ? addr : a) : [addr, ...prev];
      if (addr.isDefault) updated = updated.map(a => ({ ...a, isDefault: a._id === addr._id }));
      return updated;
    });
    setAddrModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await API.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a._id !== id));
      toast.success("Address deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const { data } = await API.put(`/addresses/${id}/default`);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === data._id })));
      toast.success("Default address updated.");
    } catch {
      toast.error("Failed to set default.");
    }
  };

  const isComplete = form.name && form.phone && form.addressLine1 && form.city && form.state && form.pincode;

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

        <div className="profile-header">
          <div className="profile-avatar-big">
            <img src={`https://ui-avatars.com/api/?name=${form.name}&background=e85d04&color=fff&size=100`} alt="avatar" />
            <div className="profile-avatar-status" />
          </div>
          <div className="profile-header-info">
            <h1>{form.name || "User"}</h1>
            <p>{user?.email}</p>
            {isComplete
              ? <span className="profile-badge complete">✅ Profile Complete</span>
              : <span className="profile-badge incomplete">⚠️ Profile Incomplete</span>
            }
          </div>
          {tab === "profile" && !editing && (
            <button className="edit-profile-btn" onClick={() => setEditing(true)}>
              <FiEdit2 size={15} /> Edit Profile
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="profile-tabs">
          <button className={`profile-tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
            <FiUser size={14} /> Profile
          </button>
          <button className={`profile-tab ${tab === "addresses" ? "active" : ""}`} onClick={() => setTab("addresses")}>
            <FiMapPin size={14} /> Address Book
          </button>
        </div>

        {success && <div className="profile-success">✅ Profile saved successfully!</div>}

        <div className="profile-body">

          {/* ── Profile Tab ── */}
          {tab === "profile" && (
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
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" required />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} required />
                    </div>
                  </div>

                  <div className="profile-card-header" style={{ marginTop: "24px" }}>
                    <FiMapPin size={18} />
                    <h3>Primary Address</h3>
                  </div>

                  <div className="form-row">
                    <div className="form-group full">
                      <label>Address Line 1 *</label>
                      <input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="House No, Street, Area" required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full">
                      <label>Address Line 2</label>
                      <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Apartment, Suite (optional)" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input name="state" value={form.state} onChange={handleChange} placeholder="State" required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} required />
                    </div>
                    <div className="form-group">
                      <label>Landmark</label>
                      <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="Near landmark (optional)" />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setEditing(false)}><FiX size={15} /> Cancel</button>
                    <button type="submit" className="save-btn" disabled={saving}><FiSave size={15} /> {saving ? "Saving..." : "Save Profile"}</button>
                  </div>
                </form>
              ) : (
                <div className="profile-view">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{form.name || <span className="not-set">Not set</span>}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{form.phone || <span className="not-set">Not set</span>}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{user?.email}</span>
                    </div>
                  </div>

                  <div className="address-view-card">
                    <div className="address-view-header"><FiMapPin size={16} /><span>Primary Address</span></div>
                    {isComplete ? (
                      <div className="address-view-content">
                        <p className="address-line">{form.addressLine1}</p>
                        {form.addressLine2 && <p className="address-line">{form.addressLine2}</p>}
                        <p className="address-line">{form.city}, {form.state} — {form.pincode}</p>
                        {form.landmark && <p className="address-landmark">Near: {form.landmark}</p>}
                        <p className="address-phone">📞 {form.phone}</p>
                      </div>
                    ) : (
                      <div className="address-empty">
                        <p>No delivery address saved.</p>
                        <button className="add-address-btn" onClick={() => setEditing(true)}>+ Add Address</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Address Book Tab ── */}
          {tab === "addresses" && (
            <div className="profile-card">
              <div className="profile-card-header" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FiMapPin size={18} />
                  <h3>Saved Addresses</h3>
                </div>
                <button className="edit-profile-btn" onClick={() => setAddrModal("new")}>
                  <FiPlus size={14} /> Add Address
                </button>
              </div>

              {addrLoading ? (
                <div className="addr-loading">Loading addresses…</div>
              ) : addresses.length === 0 ? (
                <div className="address-empty" style={{ padding: "32px 0" }}>
                  <FiMapPin size={32} style={{ color: "#334155", marginBottom: 12 }} />
                  <p>No saved addresses yet.</p>
                  <button className="save-btn" style={{ marginTop: 12 }} onClick={() => setAddrModal("new")}>
                    <FiPlus size={14} /> Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="addr-book-list">
                  {addresses.map((addr) => (
                    <div key={addr._id} className={`addr-book-card ${addr.isDefault ? "default" : ""}`}>
                      <div className="addr-book-top">
                        <span className="addr-label-chip">{addr.label || "Home"}</span>
                        {addr.isDefault && <span className="addr-default-badge"><FiStar size={10} /> Default</span>}
                      </div>
                      <strong className="addr-book-name">{addr.name}</strong>
                      <p className="addr-book-line">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                      <p className="addr-book-line">{addr.city}, {addr.state} — {addr.pincode}</p>
                      {addr.landmark && <p className="addr-book-line" style={{ color: "#64748b" }}>Near: {addr.landmark}</p>}
                      <p className="addr-book-phone">📞 {addr.phone}</p>
                      <div className="addr-book-actions">
                        {!addr.isDefault && (
                          <button className="addr-action-btn" onClick={() => handleSetDefault(addr._id)}>
                            <FiStar size={13} /> Set Default
                          </button>
                        )}
                        <button className="addr-action-btn" onClick={() => setAddrModal(addr)}>
                          <FiEdit2 size={13} /> Edit
                        </button>
                        <button className="addr-action-btn danger" onClick={() => handleDelete(addr._id)}>
                          <FiTrash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {addrModal && (
        <AddressFormModal
          initial={addrModal === "new" ? null : addrModal}
          onSave={handleAddrSaved}
          onClose={() => setAddrModal(null)}
        />
      )}
    </div>
  );
}
