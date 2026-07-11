const express = require("express");
const router  = express.Router();
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, getAnalytics } = require("../controller/orderController");
const { downloadInvoice } = require("../controller/invoiceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/",                    protect, placeOrder);
router.get("/my",                   protect, getMyOrders);
router.get("/all",                  protect, adminOnly, getAllOrders);
router.put("/:id/status",           protect, adminOnly, updateOrderStatus);
router.get("/analytics",            protect, adminOnly, getAnalytics);
router.get("/:orderId/invoice",     protect, downloadInvoice);

module.exports = router;
