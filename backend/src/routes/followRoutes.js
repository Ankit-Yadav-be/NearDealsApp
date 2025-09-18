import express from "express";
import {
  followBusiness,
  unfollowBusiness,
  getMyFollowedBusinesses,
  getBusinessFollowers,
} from "../Controllers/followControleer.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Follow a business
router.post("/:businessId", protect, followBusiness);

// Unfollow a business
router.delete("/:businessId", protect, unfollowBusiness);

// Get businesses followed by logged-in user
router.get("/my", protect, getMyFollowedBusinesses);

// Get all followers of a business (for owner/admin)
router.get("/business/:businessId", protect, getBusinessFollowers);

export default router;
