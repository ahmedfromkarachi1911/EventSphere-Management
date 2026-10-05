import express from "express";

import {
  sendMessage,
  getMessageContacts,
  getMyMessages,
  markMessageAsRead,
} from "../controllers/messageController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  sendMessage
);

router.get(
  "/contacts",
  protect,
  getMessageContacts
);

router.get(
  "/my",
  protect,
  getMyMessages
);

router.put(
  "/:id/read",
  protect,
  markMessageAsRead
);

export default router;