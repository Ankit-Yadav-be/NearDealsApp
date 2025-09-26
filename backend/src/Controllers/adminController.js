import User from "../models/User.js";
import Business from "../models/Bussiness.js";
import Review from "../models/Review.js";
import Follow from "../models/Follow.js";

// @desc Get admin analytics
// @route GET /api/admin/analytics
// @access Private (admin only)
export const getAdminAnalytics = async (req, res) => {
  try {
    // Check admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }

    // Total counts
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalFollows = await Follow.countDocuments();

    // Most followed businesses (top 5)
    const mostFollowedBusinesses = await Follow.aggregate([
      { $group: { _id: "$business", followers: { $sum: 1 } } },
      { $sort: { followers: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "businesses",
          localField: "_id",
          foreignField: "_id",
          as: "business",
        },
      },
      { $unwind: "$business" },
      {
        $project: {
          _id: 0,
          businessId: "$business._id",
          name: "$business.name",
          followers: 1,
        },
      },
    ]);

    // Top rated businesses (averageRating desc, top 5)
    const topRatedBusinesses = await Business.find()
      .sort({ averageRating: -1 })
      .limit(5)
      .select("name averageRating numReviews");

    // Recent activity (latest 5 users, businesses, reviews)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    const recentBusinesses = await Business.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name owner category createdAt");

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("business", "name");

    res.json({
      totalUsers,
      totalBusinesses,
      totalReviews,
      totalFollows,
      mostFollowedBusinesses,
      topRatedBusinesses,
      recentUsers,
      recentBusinesses,
      recentReviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
