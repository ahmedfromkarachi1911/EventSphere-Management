import express from "express";

import {
  recordBoothVisit,
} from "../controllers/boothVisitController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:boothId",
  protect,
  authorize("attendee"),
  recordBoothVisit
);

export default router;