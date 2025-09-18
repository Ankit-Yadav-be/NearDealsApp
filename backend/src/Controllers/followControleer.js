import Follow from "../models/Follow.js";
import Business from "../models/Bussiness.js";

// @desc    Follow a business
// @route   POST /api/follow/:businessId
// @access  Private
export const followBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user._id; // middleware se ayega

    // check if already following
    const existingFollow = await Follow.findOne({ user: userId, business: businessId });
    if (existingFollow) {
      return res.status(400).json({ message: "Already following this business" });
    }

    const follow = new Follow({ user: userId, business: businessId });
    await follow.save();

    res.status(201).json({ message: "Business followed successfully", follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unfollow a business
// @route   DELETE /api/follow/:businessId
// @access  Private
export const unfollowBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user._id;

    const deleted = await Follow.findOneAndDelete({ user: userId, business: businessId });

    if (!deleted) {
      return res.status(404).json({ message: "Not following this business" });
    }

    res.status(200).json({ message: "Business unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get businesses followed by user
// @route   GET /api/follow/my
// @access  Private
export const getMyFollowedBusinesses = async (req, res) => {
  try {
    const userId = req.user._id;

    const follows = await Follow.find({ user: userId })
      .populate("business", "name category images location");

    res.status(200).json(follows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get followers of a business
// @route   GET /api/follow/business/:businessId
// @access  Private (owner/admin)
// Business owner can see how many users follow them
export const getBusinessFollowers = async (req, res) => {
  try {
    const { businessId } = req.params;

    const followers = await Follow.find({ business: businessId }).populate("user", "name email");

    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
