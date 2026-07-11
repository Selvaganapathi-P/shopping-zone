const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controller/categoryController");

router.get("/",        getCategories);
router.post("/",       protect, adminOnly, createCategory);
router.put("/:id",     protect, adminOnly, updateCategory);
router.delete("/:id",  protect, adminOnly, deleteCategory);

module.exports = router;
