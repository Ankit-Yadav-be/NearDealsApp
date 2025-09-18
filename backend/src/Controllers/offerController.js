import Offer from "../models/Offer.js";
import Business from "../models/Bussiness.js";

// @desc    Create new offer
// @route   POST /api/offers/:businessId
// @access  Private (owner or admin)
export const createOffer = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { title, description, discountPercent, validFrom, validTo } =
      req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Sirf business owner ya admin hi offer create kar sake
    if (
      business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to create offer" });
    }

    const offer = new Offer({
      business: businessId,
      title,
      description,
      discountPercent,
      validFrom,
      validTo,
    });

    await offer.save();

    // ✅ populate business details
    const populatedOffer = await Offer.findById(offer._id).populate(
      "business",
      "name category images contact location rating averageRating numReviews"
    );

    res.status(201).json(populatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all offers for a business (only active by default)
// @route   GET /api/offers/:businessId
// @access  Public
export const getBusinessOffers = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { active } = req.query; // ?active=true ya ?active=false

    const query = { business: businessId };
    if (active) {
      query.isActive = active === "true";
    }

    // ✅ populate business details
    const offers = await Offer.find(query).populate(
      "business",
      "name category images contact location rating averageRating numReviews"
    );

    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active offers across businesses
// @route   GET /api/offers
// @access  Public
export const getAllOffers = async (req, res) => {
  try {
    const { active } = req.query;

    // by default active offers hi dikhayenge
    const today = new Date();
    const query = {};

    if (active === "true") {
      query.isActive = true;
      query.validFrom = { $lte: today }; // already started
      query.validTo = { $gte: today };   // not expired
    }

    const offers = await Offer.find(query)
      .populate(
        "business",
        "name category images contact location rating averageRating numReviews"
      )
      .sort({ createdAt: -1 }); // latest offers first

    res.status(200).json(offers);
  } catch (error) {
    console.error("Error fetching all offers:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private (owner or admin)
export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("business");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Sirf owner ya admin hi update kar sake
    if (
      offer.business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update offer" });
    }

    // ✅ update and populate again
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate(
      "business",
      "name category images contact location rating averageRating numReviews"
    );

    res.status(200).json(updatedOffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private (owner or admin)
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("business");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (
      offer.business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete offer" });
    }

    await offer.deleteOne();
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
