const express = require("express");
const router  = express.Router();
const { getProducts, getProductById, getPriceDrops, getPexelsPhoto, addProduct, updateProduct, deleteProduct } = require("../controller/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.get("/",               protect, getProducts);
router.get("/price-drops",    protect, getPriceDrops);
router.get("/pexels-photo",   protect, adminOnly, getPexelsPhoto);
router.get("/:id",            protect, getProductById);
router.post("/",       protect, adminOnly, upload.single("image"), addProduct);
router.put("/:id",     protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id",  protect, adminOnly, deleteProduct);

module.exports = router;
