import Visit from "../models/Visit.js";
import Business from "../models/Bussiness.js";
import Review from "../models/Review.js"; // 👈 Review Model Import kiya gaya

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

// ---


export const getTrendingBusinesses = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const trending = await Visit.aggregate([
      // 1. Last 7 days visits match
      { $match: { createdAt: { $gte: lastWeek } } },
      
      // 2. Group by business and count visits
      {
        $group: {
          _id: "$business",
          visitCount: { $sum: 1 },
        },
      },
      // 3. Sort and Limit
      { $sort: { visitCount: -1 } },
      { $limit: 10 },
      
      // 4. Business data ko jodna
      {
        $lookup: {
          from: "businesses",
          localField: "_id",
          foreignField: "_id",
          as: "business",
        },
      },
      { $unwind: "$business" },
      
      // 5. Reviews data ko jodna (Reviews collection ka naam 'reviews' hota hai)
      {
        $lookup: {
          from: "reviews", // Review collection ka naam
          localField: "_id",
          foreignField: "business",
          as: "reviews",
        },
      },

      // 6. Average Rating aur Review Count ki ganna karna
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" }, // Reviews array ki ratings ka average
          reviewCount: { $size: "$reviews" }, // Reviews array ka size
        },
      },

      // 7. Final Output Format
      {
        $project: {
          _id: 0,
          businessId: "$business._id",
          name: "$business.name",
          category: "$business.category",
          location: "$business.location",
          images: "$business.images", 
          visitCount: 1,
          averageRating: 1, // 👈 New Field
          reviewCount: 1, // 👈 New Field
          reviews: 0, // Reviews array ko response se hata diya
        },
      },
    ]);

    res.json(trending);
  } catch (err) {
    console.error("Error fetching trending businesses:", err);
    res.status(500).json({ message: "Server error" });
  }
};