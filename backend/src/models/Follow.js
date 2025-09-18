import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ user: 1, business: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);
export default Follow;
