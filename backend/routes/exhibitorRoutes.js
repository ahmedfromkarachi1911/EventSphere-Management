import express from "express";

import {
  getRegisteredExhibitors,
  getApprovedExhibitors,
  getExhibitorByApplicationId,
} from "../controllers/exhibitorController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/registered",
  protect,
  authorize("admin"),
  getRegisteredExhibitors
);

router.get("/", getApprovedExhibitors);

router.get(
  "/:applicationId",
  getExhibitorByApplicationId
);

export default router;