import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const email = "admin@eventsphere.com";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      await mongoose.connection.close();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "EventSphere Admin",
      email: "admin@eventsphere.com",
      phone: "03000000000",
      password: hashedPassword,
      role: "admin",
      consentAccepted: true,
      consentAcceptedAt: new Date(),
    });

    console.log("✅ Admin created successfully");
    console.log("Email: admin@eventsphere.com");
    console.log("Password: Admin@123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seed failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();