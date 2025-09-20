import express from "express";
import { createVisit, getTrendingBusinesses } from "../Controllers/visitController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Record a visit (userId from auth middleware)
router.post("/", authMiddleware, createVisit);

// Get trending businesses (last 7 days visits)
router.get("/", getTrendingBusinesses);

export default router;
