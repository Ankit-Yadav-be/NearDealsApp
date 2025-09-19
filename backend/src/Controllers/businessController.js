import Business from "../models/Bussiness.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";

// @desc Create a new business
// @route POST /api/business
// @access Private (businessOwner only)
export const createBusiness = async (req, res) => {
  try {
    if (req.user.role !== "businessOwner" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only business owners can create businesses" });
    }

    const {
      name,
      description,
      category,
      images,
      contact,
      location,
      openingHours,
    } = req.body;

    const business = await Business.create({
      owner: req.user._id,
      name,
      description,
      category,
      images,
      contact,
      location,
      openingHours,
    });

    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all businesses (with followers count & isFollowed)
// @route GET /api/business
// @access Public
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate("owner", "name email");

    let userId = req.user ? req.user._id : null;
    let followedMap = {};

    if (userId) {
      const follows = await Follow.find({ user: userId });
      followedMap = follows.reduce((map, f) => {
        map[f.business.toString()] = true;
        return map;
      }, {});
    }

    // Followers count fetch karna
    const counts = await Follow.aggregate([
      { $group: { _id: "$business", count: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((map, c) => {
      map[c._id.toString()] = c.count;
      return map;
    }, {});

    const response = businesses.map((b) => ({
      ...b.toObject(),
      isFollowed: !!followedMap[b._id.toString()],
      followersCount: countMap[b._id.toString()] || 0,
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get business by ID (with followers count & isFollowed)
// @route GET /api/business/:id
// @access Public
export const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate(
      "owner",
      "name email"
    );
    if (!business)
      return res.status(404).json({ message: "Business not found" });

    let isFollowed = false;
    if (req.user) {
      const follow = await Follow.findOne({
        user: req.user._id,
        business: req.params.id,
      });
      if (follow) isFollowed = true;
    }

    // followers count
    const followersCount = await Follow.countDocuments({
      business: req.params.id,
    });

    res.json({ ...business.toObject(), isFollowed, followersCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get nearby businesses (with followers count & isFollowed)
// @route GET /api/business/nearby?lng=...&lat=...&radius=...
// @access Public
export const getNearbyBusinesses = async (req, res) => {
  try {
    const { lng, lat, radius } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ message: "Please provide lng and lat" });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const distance = radius ? parseFloat(radius) : 5; // default 5 km

    const businesses = await Business.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], distance / 6378.1],
        },
      },
    });

    let userId = req.user ? req.user._id : null;
    let followedMap = {};

    if (userId) {
      const follows = await Follow.find({ user: userId });
      followedMap = follows.reduce((map, f) => {
        map[f.business.toString()] = true;
        return map;
      }, {});
    }

    // Followers count fetch karna
    const counts = await Follow.aggregate([
      { $group: { _id: "$business", count: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((map, c) => {
      map[c._id.toString()] = c.count;
      return map;
    }, {});

    const response = businesses.map((b) => ({
      ...b.toObject(),
      isFollowed: !!followedMap[b._id.toString()],
      followersCount: countMap[b._id.toString()] || 0,
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update & Delete same as before (no change)
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Business.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Business not found" });

    if (
      existing.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this business" });
    }

    const updated = await Business.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business)
      return res.status(404).json({ message: "Business not found" });

    if (
      business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this business" });
    }

    await business.deleteOne();
    res.json({ message: "Business removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
