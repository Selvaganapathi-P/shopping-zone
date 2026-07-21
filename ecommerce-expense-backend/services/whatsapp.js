const twilio = require("twilio");

// Normalise Indian phone numbers to E.164 (+91XXXXXXXXXX)
function toE164(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

async function sendOrderWhatsApp(phone, order, userName) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. +14155238886

  if (!sid || !token || !from || !phone) return;

  const client  = twilio(sid, token);
  const orderId = order._id.toString().slice(0, 8).toUpperCase();

  const itemLines = order.items
    .map(i => `• ${i.name} × ${i.quantity}  ₹${(i.price * i.quantity).toLocaleString("en-IN")}`)
    .join("\n");

  const addr = order.deliveryAddress;
  const addressText = [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(", ");

  const body = [
    `🛍️ *Order Confirmed — #${orderId}*`,
    ``,
    `Hi ${userName}! Your order has been placed successfully.`,
    ``,
    `*Items Ordered:*`,
    itemLines,
    ``,
    `*Subtotal:* ₹${order.subtotal?.toLocaleString("en-IN")}`,
    `*Tax:*      ₹${order.tax?.toLocaleString("en-IN")}`,
    `*Delivery:* ₹${order.delivery?.toLocaleString("en-IN")}`,
    `*Total:*    ₹${order.grandTotal?.toLocaleString("en-IN")}`,
    ``,
    `*Delivering to:*`,
    addressText,
    ``,
    `We'll notify you as your order progresses. Thank you for shopping with *Thansel Zovia*! 🎉`,
  ].join("\n");

  await client.messages.create({
    from: `whatsapp:+${from.replace(/\D/g, "")}`,
    to:   `whatsapp:${toE164(phone)}`,
    body,
  });
}

module.exports = { sendOrderWhatsApp };
