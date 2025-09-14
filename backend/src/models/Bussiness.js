import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    images: [{ type: String }],
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      address: String,
      city: String,
      state: String,
    },
    openingHours: {
      mon: { open: String, close: String },
      tue: { open: String, close: String },
      wed: { open: String, close: String },
      thu: { open: String, close: String },
      fri: { open: String, close: String },
      sat: { open: String, close: String },
      sun: { open: String, close: String },
    },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

businessSchema.index({ location: "2dsphere" });

const Business = mongoose.model("Business", businessSchema);
export default Business;
