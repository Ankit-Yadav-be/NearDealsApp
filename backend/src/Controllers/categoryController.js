import Category from "../models/Category.js";

// @desc    Create new category
// @route   POST /api/category
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name, icon });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all categories
// @route   GET /api/category
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
