import express from "express";

import {
  createStaff,
  getMyStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("exhibitor"),
  createStaff
);

router.get(
  "/my",
  protect,
  authorize("exhibitor"),
  getMyStaff
);

router.put(
  "/:id",
  protect,
  authorize("exhibitor"),
  updateStaff
);

router.delete(
  "/:id",
  protect,
  authorize("exhibitor"),
  deleteStaff
);

export default router;