import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my",
  protect,
  getMyNotifications
);

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

export default router;