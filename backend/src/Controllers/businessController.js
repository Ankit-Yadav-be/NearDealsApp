import Business from "../models/Bussiness.js";
import User from "../models/User.js";

// @desc Create a new business
// @route POST /api/business
// @access Private (businessOwner only)
export const createBusiness = async (req, res) => {
  try {
    if (req.user.role !== "businessOwner" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only business owners can create businesses" });
    }

    const { name, description, category, images, contact, location, openingHours } = req.body;

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

// @desc Get all businesses
// @route GET /api/business
// @access Public
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate("owner", "name email");
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get business by ID
// @route GET /api/business/:id
// @access Public
export const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("owner", "name email");
    if (!business) return res.status(404).json({ message: "Business not found" });

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get nearby businesses
// @route GET /api/business/nearby?lng=...&lat=...&radius=...
// @access Public
export const getNearbyBusinesses = async (req, res) => {
  try {
    const { lng, lat, radius } = req.query;
    console.log(lng,lat,radius)
    if (!lng || !lat) {
      return res.status(400).json({ message: "Please provide lng and lat" });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const distance = radius ? parseFloat(radius) : 5; // default 5 km
    console.log(longitude,latitude,distance);
    const businesses = await Business.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], distance / 6378.1],
        },
      },
    });

    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc Update business
// @route PUT /api/business/:id
// @access Private (owner or admin)
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Owner check ke liye pehle doc fetch karna hoga
    const existing = await Business.findById(id);
    if (!existing) return res.status(404).json({ message: "Business not found" });

    if (
      existing.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this business" });
    }

    // Update karo
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


// @desc Delete business
// @route DELETE /api/business/:id
// @access Private (owner or admin)
export const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) return res.status(404).json({ message: "Business not found" });

    if (
      business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this business" });
    }

    await business.deleteOne();
    res.json({ message: "Business removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
