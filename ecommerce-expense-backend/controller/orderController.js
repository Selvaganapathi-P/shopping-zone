const Order    = require("../model/orderModel");
const Expense  = require("../model/expenseModel");
const Coupon   = require("../model/couponModel");
const nodemailer = require("nodemailer");
const { sendOrderWhatsApp } = require("../services/whatsapp");

function getMailer() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendOrderConfirmationEmail(order, userEmail, userName) {
  const mailer = getMailer();
  if (!mailer) return;
  const itemRows = order.items.map(i =>
    `<tr><td style="padding:6px 12px">${i.name}</td><td style="padding:6px 12px;text-align:center">${i.quantity}</td><td style="padding:6px 12px;text-align:right">₹${(i.price * i.quantity).toLocaleString()}</td></tr>`
  ).join("");
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#f8fafc;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#ea580c,#c2410c);padding:32px;text-align:center">
        <h1 style="margin:0;font-size:24px">🛍️ Order Confirmed!</h1>
        <p style="margin:8px 0 0;opacity:.8">Thank you, ${userName}!</p>
      </div>
      <div style="padding:32px">
        <p style="color:#94a3b8">Your order <strong style="color:#f97316">#${order._id.toString().slice(0,8).toUpperCase()}</strong> has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead><tr style="background:rgba(255,255,255,0.05)">
            <th style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px">Item</th>
            <th style="padding:10px 12px;text-align:center;color:#64748b;font-size:12px">Qty</th>
            <th style="padding:10px 12px;text-align:right;color:#64748b;font-size:12px">Amount</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:16px">
          <p style="display:flex;justify-content:space-between;margin:6px 0;color:#94a3b8"><span>Subtotal</span><span>₹${order.subtotal?.toLocaleString()}</span></p>
          <p style="display:flex;justify-content:space-between;margin:6px 0;color:#94a3b8"><span>Tax</span><span>₹${order.tax?.toLocaleString()}</span></p>
          <p style="display:flex;justify-content:space-between;margin:6px 0;color:#94a3b8"><span>Delivery</span><span>₹${order.delivery?.toLocaleString()}</span></p>
          <p style="display:flex;justify-content:space-between;margin:8px 0 0;font-weight:700;font-size:18px;color:#f97316"><span>Total</span><span>₹${order.grandTotal?.toLocaleString()}</span></p>
        </div>
        <p style="color:#64748b;font-size:13px;margin-top:24px">We'll send you updates as your order progresses. Thank you for shopping with <strong>Thansel Zovia</strong>!</p>
      </div>
    </div>`;
  try {
    await mailer.sendMail({
      from:    `"Thansel Zovia" <${process.env.SMTP_USER}>`,
      to:      userEmail,
      subject: `Order Confirmed — #${order._id.toString().slice(0,8).toUpperCase()}`,
      html,
    });
  } catch { /* silent — email failure should not break order */ }
}

const STATUS_VALUES = ["pending","confirmed","shipped","out_for_delivery","delivered","cancelled"];

const placeOrder = async (req, res) => {
  const { items, subtotal, tax, delivery, grandTotal, deliveryAddress } = req.body;
  try {
    if (!items?.length) return res.status(400).json({ message: "Order must have items." });

    const month = new Date().toLocaleString("default", { month: "long" });
    const year  = new Date().getFullYear();

    const order = await Order.create({
      userId: req.user._id,
      items, subtotal, tax, delivery, grandTotal,
      deliveryAddress, month, year,
      status: "pending",
    });

    for (const item of items) {
      await Expense.create({
        userId:   req.user._id,
        name:     item.name,
        amount:   item.price * item.quantity,
        category: item.category,
        month, year,
      });
    }

    // Fire-and-forget notifications (email + WhatsApp)
    const User = require("../model/userModel");
    User.findById(req.user._id).then((u) => {
      const name = u?.name || "Customer";
      if (u?.email) sendOrderConfirmationEmail(order, u.email, name);
      const phone = order.deliveryAddress?.phone || u?.phone;
      if (phone) sendOrderWhatsApp(phone, order, name).catch(() => {});
    }).catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to place order." });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders." });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders." });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!STATUS_VALUES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status." });
  }
};

const getAnalytics = async (req, res) => {
  try {
    // Top 8 products by quantity sold
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
        _id: "$items.productId",
        name:      { $first: "$items.name" },
        totalSold: { $sum: "$items.quantity" },
        revenue:   { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 8 },
    ]);

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
        _id:     "$items.category",
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        units:   { $sum: "$items.quantity" },
      }},
      { $sort: { revenue: -1 } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Daily revenue — last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: {
          year:  { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day:   { $dayOfMonth: "$createdAt" },
        },
        revenue: { $sum: "$grandTotal" },
        orders:  { $sum: 1 },
      }},
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Coupon usage stats
    const coupons = await Coupon.find({}).select("code usedCount discount type isActive maxUses");

    res.json({ topProducts, revenueByCategory, ordersByStatus, dailyRevenue, coupons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, getAnalytics };
