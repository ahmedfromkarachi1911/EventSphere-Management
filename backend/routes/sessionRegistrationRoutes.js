import express from "express";

import {
  registerForSession,
  getMySessionRegistrations,
  cancelSessionRegistration,
} from "../controllers/sessionRegistrationController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("attendee"),
  registerForSession
);

router.get(
  "/my",
  protect,
  authorize("attendee"),
  getMySessionRegistrations
);

router.put(
  "/:sessionId/cancel",
  protect,
  authorize("attendee"),
  cancelSessionRegistration
);

export default router;