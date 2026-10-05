import express from "express";

import {
  addBookmark,
  getMyBookmarks,
  removeBookmark,
} from "../controllers/bookmarkController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("attendee"),
  addBookmark
);

router.get(
  "/my",
  protect,
  authorize("attendee"),
  getMyBookmarks
);

router.delete(
  "/:sessionId",
  protect,
  authorize("attendee"),
  removeBookmark
);

export default router;