import Review from "../models/Review.js";
import Business from "../models/Bussiness.js";

// @desc Create a review
// @route POST /api/reviews/:businessId
// @access Private (user only)
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const businessId = req.params.businessId;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Check if user already reviewed this business
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      business: businessId,
    });

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this business" });
    }

    const review = await Review.create({
      user: req.user._id,
      business: businessId,
      rating,
      comment,
    });

    // Update business ratings
    const reviews = await Review.find({ business: businessId });
    business.numReviews = reviews.length;
    business.averageRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await business.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get reviews for a business
// @route GET /api/reviews/:businessId
// @access Public
export const getReviews = async (req, res) => {
  try {
    const businessId = req.params.businessId;
    const reviews = await Review.find({ business: businessId }).populate(
      "user",
      "name email"
    );

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a review
// @route PUT /api/reviews/:id
// @access Private (owner of review only)
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this review" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    // Recalculate business rating
    const business = await Business.findById(review.business);
    const reviews = await Review.find({ business: review.business });
    business.numReviews = reviews.length;
    business.averageRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await business.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a review
// @route DELETE /api/reviews/:id
// @access Private (owner of review or admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();

    // Recalculate business rating
    const business = await Business.findById(review.business);
    const reviews = await Review.find({ business: review.business });
    business.numReviews = reviews.length;
    business.averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;
    await business.save();

    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
