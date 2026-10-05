import Feedback from "../models/Feedback.js";
import Expo from "../models/Expo.js";

const createFeedback = async (req, res) => {
  try {
    const { expo, type, rating, comment } = req.body;

    if (!expo || rating === undefined || !comment?.trim()) {
      return res.status(400).json({
        message: "Expo, rating and feedback are required",
      });
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const allowedTypes = [
      "feedback",
      "suggestion",
      "issue",
    ];

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid feedback type",
      });
    }

    const selectedExpo = await Expo.findById(expo);

    if (!selectedExpo) {
      return res.status(404).json({
        message: "Expo not found",
      });
    }

    if (selectedExpo.status !== "published") {
      return res.status(400).json({
        message: "Feedback can only be submitted for published expos",
      });
    }

    const existingFeedback = await Feedback.findOne({
      user: req.user._id,
      expo,
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You have already submitted feedback for this expo",
      });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      expo,
      type: type || "feedback",
      rating: numericRating,
      comment: comment.trim(),
    });

    const populatedFeedback =
      await Feedback.findById(feedback._id)
        .populate("user", "name email role")
        .populate("expo", "title");

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: populatedFeedback,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to submit feedback",
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "name email role")
      .populate("expo", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load feedback",
    });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "new",
      "reviewed",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid feedback status",
      });
    }

    const feedback = await Feedback.findById(
      req.params.id
    );

    if (!feedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    feedback.status = status;

    await feedback.save();

    const updatedFeedback =
      await Feedback.findById(feedback._id)
        .populate("user", "name email role")
        .populate("expo", "title");

    res.status(200).json({
      message: "Feedback status updated",
      feedback: updatedFeedback,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update feedback status",
    });
  }
};

export {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
};