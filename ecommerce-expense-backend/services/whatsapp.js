const DIV = "━━━━━━━━━━━━━━━━━━━━";

function toChatId(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `${digits}@c.us`;
  return `91${digits}@c.us`;
}

function formatDateTime(date) {
  const d    = new Date(date);
  const day  = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  return { day, time };
}

async function sendOrderWhatsApp(phone, order, userName) {
  const idInstance = process.env.GREEN_API_INSTANCE;
  const apiToken   = process.env.GREEN_API_TOKEN;

  if (!idInstance || !apiToken || !phone) return;

  const chatId  = toChatId(phone);
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

  const message = [
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
  ].join("\n");

  const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`;

  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chatId, message }),
  });

  if (!res.ok) throw new Error(`Green API ${res.status}`);
}

module.exports = { sendOrderWhatsApp };
