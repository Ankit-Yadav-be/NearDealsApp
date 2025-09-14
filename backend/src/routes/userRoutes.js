import express from "express";
import { registerUser, authUser, getUserProfile } from "../Controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);   // Public
router.post("/login", authUser);          // Public
router.get("/profile", protect, getUserProfile); // Protected

export default router;
