import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    discountPercent: { type: Number },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;
