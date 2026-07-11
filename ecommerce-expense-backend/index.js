const express    = require("express");
const http       = require("http");
const cors       = require("cors");
const path       = require("path");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const morgan     = require("morgan");
const xss        = require("xss");
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

app.set("io", io);

// ── Logging ──
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

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
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ── Body parsing ──
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ── NoSQL injection sanitization (strip $ and . keys) ──
app.use((req, res, next) => {
  const sanitizeKeys = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) { delete obj[key]; }
      else sanitizeKeys(obj[key]);
    }
  };
  sanitizeKeys(req.body);
  next();
});

// ── XSS sanitization on string values in body ──
app.use((req, res, next) => {
  const sanitizeValues = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "string") obj[key] = xss(obj[key]);
      else sanitizeValues(obj[key]);
    }
  };
  sanitizeValues(req.body);
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
app.get("/", (req, res) => res.json({ status: "ok", app: "Thansel Zovia API", version: "2.0" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Global error handler ──
app.use((err, req, res, next) => {
  const status  = err.status || 500;
  const message = process.env.NODE_ENV === "production" ? "Something went wrong." : err.message;
  if (process.env.NODE_ENV !== "production") console.error(err.stack);
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Thansel Zovia API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
