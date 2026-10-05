import mongoose from "mongoose";

const expoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    theme: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    registrationDeadline: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    openingTime: {
      type: String,
      required: true,
    },

    closingTime: {
      type: String,
      required: true,
    },

    expectedAttendees: {
      type: Number,
      default: 0,
    },

    coverImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "published", "completed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Expo = mongoose.model("Expo", expoSchema);

export default Expo;