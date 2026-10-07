import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const email = "exhibitor1006@example.com";
    const newPassword = "Exhibitor@123";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Exhibitor not found");
      process.exit(1);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log("✅ Exhibitor password reset successfully");
    console.log("Email:", email);
    console.log("Password:", newPassword);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

resetPassword();