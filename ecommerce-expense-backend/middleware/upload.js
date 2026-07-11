const multer  = require("multer");
const path    = require("path");
const crypto  = require("crypto");
require("dotenv").config();

const ALLOWED_MIMES = ["image/jpeg","image/jpg","image/png","image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

// ── Cloudinary storage (when CLOUDINARY_CLOUD_NAME is set) ──────────────────
function buildCloudinaryStorage() {
  try {
    const cloudinary           = require("cloudinary").v2;
    const { CloudinaryStorage } = require("multer-storage-cloudinary");

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder:         "thansel-zovia",
        allowed_formats: ["jpg","jpeg","png","webp"],
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      },
    });
  } catch {
    return null;
  }
}

// ── Disk storage (fallback) ─────────────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => {
    const rand = crypto.randomBytes(8).toString("hex");
    const ext  = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${rand}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error("Only jpeg, png, and webp images are allowed."), { status: 400 }));
  }
};

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const storage = useCloudinary ? (buildCloudinaryStorage() || diskStorage) : diskStorage;

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

module.exports = upload;
