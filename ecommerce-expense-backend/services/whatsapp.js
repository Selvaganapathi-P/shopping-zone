const twilio = require("twilio");

const DIV = "━━━━━━━━━━━━━━━━━━━━";

function toE164(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

function formatDateTime(date) {
  const d = new Date(date);
  const day = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  return { day, time };
}

async function sendOrderWhatsApp(phone, order, userName) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!sid || !token || !from || !phone) return;

  const client  = twilio(sid, token);
  const orderId = order._id.toString().slice(-12).toUpperCase();
  const { day, time } = formatDateTime(order.createdAt || new Date());

  const addr = order.deliveryAddress || {};
  const addrLines = [
    addr.name || userName,
    [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", "),
    [addr.city, addr.state].filter(Boolean).join(", ") + (addr.pincode ? ` - ${addr.pincode}` : ""),
    addr.phone || phone,
  ].filter(Boolean);

  const itemLines = order.items
    .map((i, idx) => `${idx + 1}. ${i.name} x${i.quantity} = Rs.${(i.price * i.quantity).toLocaleString("en-IN")}`)
    .join("\n");

  const gstPct  = order.subtotal > 0 ? Math.round((order.tax / order.subtotal) * 100) : 18;
  const delivery = order.delivery > 0 ? `Rs.${order.delivery.toLocaleString("en-IN")}` : "FREE";

  const lines = [
    `*Thansel Zovia - Order Confirmation*`,
    DIV,
    `*Order ID:* #${orderId}`,
    `*Date:*     ${day}`,
    `*Time:*     ${time}`,
    DIV,
    `*Delivery Address:*`,
    ...addrLines,
    DIV,
    `*Order Items:*`,
    itemLines,
    DIV,
    `*Price Summary:*`,
    `Subtotal       : Rs.${order.subtotal?.toLocaleString("en-IN")}`,
    `GST (${gstPct}%)      : Rs.${order.tax?.toLocaleString("en-IN")}`,
    `Delivery       : ${delivery}`,
    DIV,
    `*Grand Total: Rs.${order.grandTotal?.toLocaleString("en-IN")}*`,
    DIV,
    `Thank you for shopping with Thansel Zovia!`,
  ];

  await client.messages.create({
    from: `whatsapp:+${from.replace(/\D/g, "")}`,
    to:   `whatsapp:${toE164(phone)}`,
    body: lines.join("\n"),
  });
}

module.exports = { sendOrderWhatsApp };
