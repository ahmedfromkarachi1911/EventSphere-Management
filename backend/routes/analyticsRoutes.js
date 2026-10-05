import express from "express";

import {
  getAdminAnalytics,
} from "../controllers/analyticsController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminAnalytics
);

export default router;