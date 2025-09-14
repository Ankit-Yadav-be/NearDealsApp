import express from "express";
import { createCategory, getCategories } from "../Controllers/categoryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create category (admin only)
router.post("/", protect, createCategory);

// Get all categories (public)
router.get("/", getCategories);

export default router;
