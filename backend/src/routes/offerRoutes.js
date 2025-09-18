import express from "express";
import {
  createOffer,
  getBusinessOffers,
  updateOffer,
  deleteOffer,
  getAllOffers,
} from "../Controllers/offerController.js";
import  protect  from "../middlewares/authMiddleware.js";

const router = express.Router();

// create offer
router.get("/", getAllOffers);
router.post("/:businessId", protect, createOffer);

// get offers for a business
router.get("/:businessId", getBusinessOffers);

// update offer
router.put("/:id", protect, updateOffer);

// delete offer
router.delete("/:id", protect, deleteOffer);

export default router;
