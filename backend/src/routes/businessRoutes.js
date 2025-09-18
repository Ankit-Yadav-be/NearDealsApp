import express from "express";
import {
  createBusiness,
  getBusinesses,
  getBusinessById,
  getNearbyBusinesses,
  updateBusiness,
  deleteBusiness,
} from "../Controllers/businessController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBusiness); // Create business
router.get("/",protect, getBusinesses); // Get all businesses
router.get("/nearby",protect, getNearbyBusinesses); // Get nearby
router.get("/:id", getBusinessById); // Get single business
router.put("/:id", protect, updateBusiness); // Update
router.delete("/:id", protect, deleteBusiness); // Delete

export default router;
