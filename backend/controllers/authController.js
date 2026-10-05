import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const registerUser = async (req, res) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      password,
      role,
      consentAccepted,
    } = req.body;

    if (!["exhibitor", "attendee"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    if (consentAccepted !== true) {
      return res.status(400).json({
        message:
          "You must accept the privacy consent before registration",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      companyName,
      email,
      phone,
      password: hashedPassword,
      role,
      consentAccepted: true,
      consentAcceptedAt: new Date(),
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        logo: user.logo,
        shareContactInfo:
          user.shareContactInfo,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        website: user.website,
        category: user.category,
        description: user.description,
        logo: user.logo,
        shareContactInfo:
          user.shareContactInfo,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      name,
      companyName,
      email,
      phone,
      website,
      category,
      description,
      shareContactInfo,
    } = req.body;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }
    }

    user.name = name ?? user.name;
    user.companyName =
      companyName ?? user.companyName;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.website = website ?? user.website;
    user.category = category ?? user.category;
    user.description =
      description ?? user.description;

    if (
      user.role === "exhibitor" &&
      typeof shareContactInfo === "boolean"
    ) {
      user.shareContactInfo =
        shareContactInfo;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        website: user.website,
        category: user.category,
        description: user.description,
        logo: user.logo,
        shareContactInfo:
          user.shareContactInfo,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const uploadProfileLogo = async (req, res) => {
  try {
    if (req.user.role !== "exhibitor") {
      if (
        req.file?.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(403).json({
        message:
          "Only exhibitors can upload company logos",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a logo image",
      });
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.logo) {
      const oldLogoPath = path.join(
        process.cwd(),
        user.logo.replace(/^\/+/, "")
      );

      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    user.logo = `/uploads/logos/${req.file.filename}`;

    await user.save();

    res.status(200).json({
      message:
        "Company logo uploaded successfully",
      logo: user.logo,
      user: {
        id: user._id,
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        website: user.website,
        category: user.category,
        description: user.description,
        logo: user.logo,
        shareContactInfo:
          user.shareContactInfo,
      },
    });
  } catch (error) {
    if (
      req.file?.path &&
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message =
      `You requested a password reset for your EventSphere account.\n\n` +
      `Use the following link to reset your password:\n${resetUrl}\n\n` +
      `This link will expire in 15 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "EventSphere Password Reset",
        message,
      });

      res.status(200).json({
        message:
          "Password reset link sent to your email",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      res.status(500).json({
        message:
          "Unable to send password reset email",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const {
      password,
      confirmPassword,
    } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message:
          "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    }).select(
      "+resetPasswordToken +resetPasswordExpire"
    );

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired reset link",
      });
    }

    user.password = await bcrypt.hash(
      password,
      10
    );

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  uploadProfileLogo,
  forgotPassword,
  resetPassword,
};