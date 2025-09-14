import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePic: { type: String },
    role: {
      type: String,
      enum: ["customer", "businessOwner", "admin"],
      default: "customer",
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Business" }],
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
