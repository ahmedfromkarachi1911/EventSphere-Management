import express from "express";

import {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
} from "../controllers/feedbackController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("attendee", "exhibitor"),
  createFeedback
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getAllFeedback
);

router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateFeedbackStatus
);

export default router;