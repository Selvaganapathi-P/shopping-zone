const express    = require("express");
const http       = require("http");
const cors       = require("cors");
const path       = require("path");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const { Server } = require("socket.io");
require("dotenv").config();
require("./database");

const app    = express();
const server = http.createServer(app);

// ── Socket.IO — real-time inventory ──
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("join_product", (productId) => socket.join(`product_${productId}`));
  socket.on("leave_product", (productId) => socket.leave(`product_${productId}`));
});

// Attach io to app so controllers can emit events
app.set("io", io);

// ── Security headers ──
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ── Rate limiting on auth routes ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { message: "Too many attempts. Try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── CORS ──
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));

// ── Body parsing + sanitization ──
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
// Strip keys starting with $ or containing . to prevent NoSQL injection
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  next();
});

// ── Static uploads ──
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Apply rate limit to auth ──
app.use("/api/auth/login",       authLimiter);
app.use("/api/auth/admin-login", authLimiter);
app.use("/api/auth/register",    authLimiter);

// ── API routes ──
app.use("/api", require("./app"));

// ── Health check ──
app.get("/start", (req, res) => {
  res.json({ status: "ok", app: "Thansel Zovia API", version: "2.0" });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  const status  = err.status || 500;
  const message = process.env.NODE_ENV === "production" ? "Something went wrong." : err.message;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Thansel Zovia API running on port ${PORT}`);
});
