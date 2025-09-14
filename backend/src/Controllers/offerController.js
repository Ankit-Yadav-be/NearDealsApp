import Offer from "../models/Offer.js";
import Business from "../models/Bussiness.js";

// @desc    Create new offer
// @route   POST /api/offers/:businessId
// @access  Private (owner or admin)
export const createOffer = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { title, description, discountPercent, validFrom, validTo } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Sirf business owner ya admin hi offer create kar sake
    if (
      business.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to create offer" });
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
    res.status(201).json(offer);
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

    const offers = await Offer.find(query);
    res.status(200).json(offers);
  } catch (error) {
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
      return res.status(403).json({ message: "Not authorized to update offer" });
    }

    // ✅ direct update with findByIdAndUpdate
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // jo fields update karni hain
      { new: true, runValidators: true } // updated doc return karega aur validations run honge
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
      return res.status(403).json({ message: "Not authorized to delete offer" });
    }

    await offer.deleteOne();
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
