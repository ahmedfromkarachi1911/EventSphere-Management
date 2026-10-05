import express from "express";

import {
  registerForExpo,
  getMyRegistrations,
} from "../controllers/registrationController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("attendee"),
  registerForExpo
);

router.get(
  "/my",
  protect,
  authorize("attendee"),
  getMyRegistrations
);

export default router;