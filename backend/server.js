import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js"
import businessRoutes from "./src/routes/businessRoutes.js"
import reviewRoutes from "./src/routes/reviewRoutes.js"
import offerRoutes from "./src/routes/offerRoutes.js"
import compression from "compression";
import categoryRoutes from "./src/routes/categoryRoutes.js"
import followRoutes from "./src/routes/followRoutes.js"
import visitRoutes from "./src/routes/visitRoutes.js"
dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(compression());

// Sample route
app.get("/", (req, res) => {
  res.send("🚀 LocalConnect API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/review",reviewRoutes)
app.use("/api/offer",offerRoutes)
app.use("/api/category", categoryRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/trending",visitRoutes)
export default app;