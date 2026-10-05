import mongoose from "mongoose";

const boothSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },

    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    boothNumber: {
      type: String,
      required: true,
    },

    hall: {
      type: String,
      required: true,
    },

    boothType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "available",
        "reserved",
        "assigned",
        "cancelled",
      ],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

const Booth = mongoose.model("Booth", boothSchema);

export default Booth;