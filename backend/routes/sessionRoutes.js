import express from "express";

import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
} from "../controllers/sessionController.js";

import {
  protect,
  optionalProtect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  optionalProtect,
  getSessions
);

router.get(
  "/:id",
  optionalProtect,
  getSessionById
);

router.post(
  "/",
  protect,
  authorize("admin"),
  createSession
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateSession
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteSession
);

export default router;