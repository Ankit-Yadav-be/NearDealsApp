import express from "express";
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} from "../Controllers/reviewController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:businessId", protect, createReview);   // Create review
router.get("/:businessId", getReviews);               // Get reviews for business
router.put("/:id", protect, updateReview);            // Update review
router.delete("/:id", protect, deleteReview);         // Delete review

export default router;
