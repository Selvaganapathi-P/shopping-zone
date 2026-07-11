const express = require("express");
const router = express.Router();

router.use("/auth",       require("./router/userRouter"));
router.use("/products",   require("./router/productRouter"));
router.use("/cart",       require("./router/cartRouter"));
router.use("/orders",     require("./router/orderRouter"));
router.use("/expenses",   require("./router/expenseRouter"));
router.use("/wishlist",   require("./router/wishlistRouter"));
router.use("/reviews",    require("./router/reviewRouter"));
router.use("/coupons",    require("./router/couponRouter"));
router.use("/ai",         require("./router/aiRouter"));
router.use("/categories", require("./router/categoryRouter"));
router.use("/banner",     require("./router/bannerRouter"));
router.use("/addresses",  require("./router/addressRouter"));

module.exports = router;