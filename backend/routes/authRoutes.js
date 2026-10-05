import express from "express";

import {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  uploadProfileLogo,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

import logoUpload from "../middleware/logoUpload.js";

const router = express.Router();

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

router.get(
  "/profile",
  protect,
  getMyProfile
);

router.put(
  "/profile",
  protect,
  updateMyProfile
);

router.post(
  "/profile/logo",
  protect,
  authorize("exhibitor"),
  logoUpload.single("logo"),
  uploadProfileLogo
);

router.get(
  "/admin-test",
  protect,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Admin route accessed successfully",
    });
  }
);

export default router;