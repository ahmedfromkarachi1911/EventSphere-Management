import express from "express";

import {
  createExpo,
  getExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
} from "../controllers/expoController.js";

import {
  protect,
  optionalProtect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  optionalProtect,
  getExpos
);

router.get(
  "/:id",
  optionalProtect,
  getExpoById
);

router.post(
  "/",
  protect,
  authorize("admin"),
  createExpo
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateExpo
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteExpo
);

export default router;