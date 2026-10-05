import express from "express";

import {
  createApplication,
  getMyApplications,
  getApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("exhibitor"),
  createApplication
);

router.get(
  "/my",
  protect,
  authorize("exhibitor"),
  getMyApplications
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getApplications
);

router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateApplicationStatus
);

export default router;