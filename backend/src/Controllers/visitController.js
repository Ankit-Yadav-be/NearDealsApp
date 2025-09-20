import Visit from "../models/Visit.js";
import Business from "../models/Bussiness.js";

// 👉 Record a new visit
export const createVisit = async (req, res) => {
  try {
    const userId = req.user._id; // authMiddleware se aayega
    const { businessId } = req.body;

    if (!businessId) {
      return res.status(400).json({ message: "businessId required" });
    }

    // check business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const visit = new Visit({ user: userId, business: businessId });
    await visit.save();

    res.status(201).json({ message: "Visit recorded successfully", visit });
  } catch (err) {
    console.error("Error recording visit:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 👉 Get trending businesses (last 7 days visits)
export const getTrendingBusinesses = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const trending = await Visit.aggregate([
      { $match: { createdAt: { $gte: lastWeek } } },
      {
        $group: {
          _id: "$business",
          visitCount: { $sum: 1 },
        },
      },
      { $sort: { visitCount: -1 } },
      { $limit: 10 },
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
          category: "$business.category",
          location: "$business.location",
          visitCount: 1,
        },
      },
    ]);

    res.json(trending);
  } catch (err) {
    console.error("Error fetching trending businesses:", err);
    res.status(500).json({ message: "Server error" });
  }
};
