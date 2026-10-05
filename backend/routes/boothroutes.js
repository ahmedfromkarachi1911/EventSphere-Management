import express from "express";

import {
  createAvailableBooth,
  getAvailableBooths,
  getExpoFloorPlan,
  reserveBooth,
  confirmBoothReservation,
  assignBooth,
  updateBooth,
  getMyBooths,
  getBooths,
} from "../controllers/boothController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/available",
  protect,
  authorize("admin"),
  createAvailableBooth
);

router.get(
  "/available/:expoId",
  protect,
  authorize("exhibitor"),
  getAvailableBooths
);

router.get(
  "/floor-plan/:expoId",
  getExpoFloorPlan
);

router.put(
  "/:id/reserve",
  protect,
  authorize("exhibitor"),
  reserveBooth
);

router.put(
  "/:id/confirm",
  protect,
  authorize("admin"),
  confirmBoothReservation
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateBooth
);

router.post(
  "/",
  protect,
  authorize("admin"),
  assignBooth
);

router.get(
  "/my",
  protect,
  authorize("exhibitor"),
  getMyBooths
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getBooths
);

export default router;