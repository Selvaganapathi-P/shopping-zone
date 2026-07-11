const Category = require("../model/categoryModel");

const getCategories = async (req, res) => {
  try {
    const cats = await Category.find({}).sort({ order: 1, name: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createCategory = async (req, res) => {
  const { name, icon, order } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required." });
  try {
    const cat = await Category.create({ name: name.trim(), icon: icon || "🛍️", order: order || 0 });
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Category already exists." });
    res.status(500).json({ message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ message: "Category not found." });
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted." });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
