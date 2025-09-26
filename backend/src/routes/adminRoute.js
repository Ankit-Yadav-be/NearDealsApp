import express from "express";
import { getAdminAnalytics } from "../Controllers/adminController.js";
import  protect  from "../middlewares/authMiddleware.js"; // middleware jo token verify kare
// protect middleware me req.user attach hota hai (userId + role)

const router = express.Router();

// @route   GET /api/admin/analytics
// @desc    Get full app analytics (admin only)
router.get("/analytics", protect, getAdminAnalytics);

export default router;
