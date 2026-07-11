const PDFDocument = require("pdfkit");
const Order = require("../model/orderModel");

const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found." });

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id}.pdf`);
    doc.pipe(res);

    // ── Header ──
    doc.rect(0, 0, 595, 90).fill("#0f172a");
    doc.fillColor("#ea580c").fontSize(26).font("Helvetica-Bold").text("Thansel Zovia", 50, 25);
    doc.fillColor("#94a3b8").fontSize(10).font("Helvetica").text("Shop Smart. Track Smarter.", 50, 56);
    doc.fillColor("#ffffff").fontSize(10).text("INVOICE", 450, 30, { width: 100 });
    doc.fillColor("#94a3b8").text(`#${order._id.toString().slice(-10).toUpperCase()}`, 450, 46);
    doc.text(`${new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}`, 450, 62);

    let y = 110;

    // ── Delivery address ──
    doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("Delivery Address", 50, y);
    y += 18;
    doc.fontSize(10).font("Helvetica").fillColor("#334155");
    const addr = order.deliveryAddress;
    doc.text(addr.name, 50, y); y += 14;
    doc.text(addr.addressLine1, 50, y); y += 14;
    if (addr.addressLine2) { doc.text(addr.addressLine2, 50, y); y += 14; }
    doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 50, y); y += 14;
    doc.text(`Phone: ${addr.phone}`, 50, y); y += 20;

    // ── Status badge ──
    const statusColors = { pending:"#f59e0b", confirmed:"#3b82f6", shipped:"#8b5cf6", out_for_delivery:"#f97316", delivered:"#22c55e", cancelled:"#ef4444" };
    const sc = statusColors[order.status] || "#6b7280";
    doc.roundedRect(400, 110, 140, 26, 5).fill(sc + "22");
    doc.fillColor(sc).fontSize(10).font("Helvetica-Bold")
      .text(order.status.replace(/_/g, " ").toUpperCase(), 400, 120, { width: 140, align: "center" });

    y += 10;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e2e8f0").stroke(); y += 16;

    // ── Items table header ──
    doc.rect(50, y, 495, 22).fill("#f8fafc");
    doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold");
    doc.text("#",   58, y + 6, { width: 20 });
    doc.text("Product", 80, y + 6, { width: 230 });
    doc.text("Qty",  320, y + 6, { width: 50, align: "center" });
    doc.text("Price", 375, y + 6, { width: 80, align: "right" });
    doc.text("Total", 460, y + 6, { width: 80, align: "right" });
    y += 22;

    // ── Items ──
    doc.font("Helvetica").fillColor("#0f172a").fontSize(9);
    order.items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, y, 495, 20).fill("#f8fafc");
      doc.fillColor("#64748b").text(`${i+1}`, 58, y + 5, { width: 20 });
      doc.fillColor("#0f172a").text(item.name.length > 38 ? item.name.slice(0, 38) + "…" : item.name, 80, y + 5, { width: 230 });
      doc.fillColor("#64748b").text(`${item.quantity}`, 320, y + 5, { width: 50, align: "center" });
      doc.text(`Rs.${item.price.toLocaleString()}`, 375, y + 5, { width: 80, align: "right" });
      doc.fillColor("#0f172a").text(`Rs.${(item.price * item.quantity).toLocaleString()}`, 460, y + 5, { width: 80, align: "right" });
      y += 20;
    });

    y += 10;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e2e8f0").stroke(); y += 14;

    // ── Totals ──
    const addRow = (label, val, bold = false) => {
      if (bold) { doc.font("Helvetica-Bold").fillColor("#0f172a"); } else { doc.font("Helvetica").fillColor("#475569"); }
      doc.fontSize(bold ? 11 : 10).text(label, 350, y, { width: 110 });
      doc.text(val, 460, y, { width: 80, align: "right" });
      y += bold ? 16 : 14;
    };
    addRow("Subtotal", `Rs.${order.subtotal.toLocaleString()}`);
    addRow("GST (18%)", `Rs.${order.tax.toLocaleString()}`);
    addRow("Delivery", order.delivery === 0 ? "FREE" : `Rs.${order.delivery}`);
    doc.moveTo(350, y).lineTo(545, y).strokeColor("#cbd5e1").stroke(); y += 6;
    addRow("Grand Total", `Rs.${order.grandTotal.toLocaleString()}`, true);

    // ── Footer ──
    y = Math.max(y + 40, 720);
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e2e8f0").stroke(); y += 12;
    doc.fillColor("#94a3b8").fontSize(9).font("Helvetica")
      .text("Thank you for shopping with Thansel Zovia!", 50, y, { align: "center", width: 495 });
    doc.text("support@thanselzovia.com  |  www.thanselzovia.com", 50, y + 14, { align: "center", width: 495 });

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: "Failed to generate invoice." });
  }
};

module.exports = { downloadInvoice };
