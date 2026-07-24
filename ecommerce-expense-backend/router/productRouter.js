const express = require("express");
const router  = express.Router();
const { getProducts, getProductById, getPriceDrops, getPexelsPhoto, addProduct, updateProduct, deleteProduct, toggleVisibility, setFlashSale, seedProductsHandler } = require("../controller/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const log = require("../middleware/activityLog");

router.get("/",               getProducts);
router.post("/seed",   protect, adminOnly, seedProductsHandler);
router.get("/price-drops",    getPriceDrops);
router.get("/pexels-photo",   protect, adminOnly, getPexelsPhoto);
router.get("/:id",            getProductById);
router.post("/",       protect, adminOnly, upload.single("image"), log("ADD_PRODUCT","Product"), addProduct);
router.put("/:id",     protect, adminOnly, upload.single("image"), log("UPDATE_PRODUCT","Product"), updateProduct);
router.delete("/:id",       protect, adminOnly, log("DELETE_PRODUCT","Product"), deleteProduct);
router.patch("/:id/visibility", protect, adminOnly, log("TOGGLE_VISIBILITY","Product"), toggleVisibility);
router.patch("/:id/flash-sale", protect, adminOnly, log("SET_FLASH_SALE","Product"), setFlashSale);

module.exports = router;
