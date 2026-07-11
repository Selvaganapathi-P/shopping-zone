import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import "./OrderSuccess.css";

const TRACK_STEPS = [
  { key: "pending",          label: "Order Placed",   icon: "📦" },
  { key: "confirmed",        label: "Confirmed",      icon: "✅" },
  { key: "shipped",          label: "Shipped",        icon: "🚚" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "delivered",        label: "Delivered",      icon: "🏠" },
];

const STATUS_IDX = { pending: 0, confirmed: 1, shipped: 2, out_for_delivery: 3, delivered: 4, cancelled: -1 };

function OrderTracker({ status }) {
  const currentIdx = STATUS_IDX[status] ?? 0;
  if (status === "cancelled") {
    return (
      <div className="order-tracker cancelled">
        <div className="tracker-cancelled">
          <span>❌</span>
          <p>Order Cancelled</p>
        </div>
      </div>
    );
  }
  return (
    <div className="order-tracker">
      {TRACK_STEPS.map((step, i) => {
        const isCompleted = i <= currentIdx;
        const isCurrent   = i === currentIdx;
        return (
          <div key={step.key} className="tracker-step-wrap">
            <motion.div
              className={`tracker-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
              initial={isCurrent ? { scale: 0.8 } : {}}
              animate={isCurrent ? { scale: [0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="tracker-icon">{step.icon}</div>
              <div className="tracker-line-dot" />
            </motion.div>
            <p className="tracker-label">{step.label}</p>
            {i < TRACK_STEPS.length - 1 && (
              <div className={`tracker-connector ${isCompleted && i < currentIdx ? "filled" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderSuccess() {
  const { state }        = useLocation();
  const navigate         = useNavigate();
  const printRef         = useRef();
  const order            = state?.order;
  const [downloading, setDownloading] = useState(false);

  if (!order) {
    navigate("/home");
    return null;
  }

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await API.get(`/orders/${order._id}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch {
      toast.error("Failed to download invoice.");
    }
    setDownloading(false);
  };

  const handleWhatsApp = () => {
    const address = order.deliveryAddress;
    const items = order.items
      ?.map((item, i) =>
        `${i + 1}. ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`
      )
      .join("\n");

    const message = `
🛍️ *Thansel Zovia - Order Confirmation*
━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* #${order._id?.slice(0, 12).toUpperCase()}
📅 *Date:* ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
⏰ *Time:* ${new Date().toLocaleTimeString("en-IN")}
━━━━━━━━━━━━━━━━━━━━
📍 *Delivery Address:*
${address?.name}
${address?.addressLine1}${address?.addressLine2 ? ", " + address?.addressLine2 : ""}
${address?.city}, ${address?.state} - ${address?.pincode}
📞 ${address?.phone}
━━━━━━━━━━━━━━━━━━━━
🛒 *Order Items:*
${items}
━━━━━━━━━━━━━━━━━━━━
💰 *Price Summary:*
Subtotal  : ₹${order.subtotal?.toLocaleString()}
GST (18%) : ₹${order.tax?.toLocaleString()}
Delivery  : ${order.delivery === 0 ? "FREE" : "₹" + order.delivery}
━━━━━━━━━━━━━━━━━━━━
💵 *Grand Total: ₹${order.grandTotal?.toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━
Thank you for shopping with Thansel Zovia! 🎉
    `.trim();

    const encoded = encodeURIComponent(message);
    const phone   = address?.phone?.replace(/\D/g, "");
    const url     = `https://wa.me/91${phone}?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="order-success-page">

      {/* Success Header */}
      <motion.div
        className="success-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="success-icon"
          animate={{ scale: [0.5, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >✅</motion.div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for shopping with Thansel Zovia 🛍️</p>
        <p className="order-id-display">
          Order ID: <strong>#{order._id?.slice(0, 12).toUpperCase()}</strong>
        </p>
      </motion.div>

      {/* Order Tracker */}
      <motion.div
        className="tracker-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="tracker-title">Order Status</h3>
        <OrderTracker status={order.status || "pending"} />
      </motion.div>

      {/* Bill */}
      <div className="bill-wrapper" ref={printRef}>
        <div className="bill-container">

          {/* Bill Header */}
          <div className="bill-header">
            <div className="bill-brand">
              <h2>🛍️ Thansel Zovia</h2>
              <p>Your Smart Shopping Partner</p>
            </div>
            <div className="bill-info">
              <p>
                <strong>Order ID:</strong>{" "}
                #{order._id?.slice(0, 12).toUpperCase()}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date().toLocaleDateString("en-IN", {
                  day:   "numeric",
                  month: "long",
                  year:  "numeric",
                })}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date().toLocaleTimeString("en-IN")}
              </p>
            </div>
          </div>

          <div className="bill-divider" />

          {/* Delivery Address */}
          <div className="bill-section">
            <h3>📦 Delivery Address</h3>
            <div className="bill-address">
              <p className="address-name">{order.deliveryAddress?.name}</p>
              <p>{order.deliveryAddress?.addressLine1}</p>
              {order.deliveryAddress?.addressLine2 && (
                <p>{order.deliveryAddress?.addressLine2}</p>
              )}
              <p>
                {order.deliveryAddress?.city},{" "}
                {order.deliveryAddress?.state} —{" "}
                {order.deliveryAddress?.pincode}
              </p>
              {order.deliveryAddress?.landmark && (
                <p>Near: {order.deliveryAddress?.landmark}</p>
              )}
              <p>📞 {order.deliveryAddress?.phone}</p>
            </div>
          </div>

          <div className="bill-divider" />

          {/* Items Table */}
          <div className="bill-section">
            <h3>🛒 Order Items</h3>
            <table className="bill-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="item-name">{item.name}</td>
                    <td>{item.category}</td>
                    <td>₹{item.price?.toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td className="item-total">
                      ₹{(item.price * item.quantity)?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bill-divider" />

          {/* Price Summary */}
          <div className="bill-section">
            <h3>💰 Price Summary</h3>
            <div className="bill-summary">
              <div className="bill-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="bill-row">
                <span>GST (18%)</span>
                <span>₹{order.tax?.toLocaleString()}</span>
              </div>
              <div className="bill-row">
                <span>Delivery</span>
                <span className={order.delivery === 0 ? "free-text" : ""}>
                  {order.delivery === 0 ? "FREE" : `₹${order.delivery}`}
                </span>
              </div>
              <div className="bill-total-row">
                <span>Grand Total</span>
                <span>₹{order.grandTotal?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bill-divider" />

          {/* Bill Footer */}
          <div className="bill-footer">
            <p>Thank you for your purchase! 🎉</p>
            <p>For support contact: support@thanselzovia.com</p>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="bill-actions">
        <button className="print-btn" onClick={handlePrint}>
          🖨️ Print Bill
        </button>
        <button
          className="print-btn"
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }}
        >
          <Download size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
          {downloading ? "Downloading…" : "PDF Invoice"}
        </button>
        <button className="whatsapp-btn" onClick={handleWhatsApp}>
          📲 Bill to WhatsApp
        </button>
        <button
          className="done-btn"
          onClick={() => navigate("/home")}
        >
          ✅ Done
        </button>
      </div>

    </div>
  );
}
