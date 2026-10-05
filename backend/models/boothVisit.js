import mongoose from "mongoose";

const boothVisitSchema = new mongoose.Schema(
  {
    booth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booth",
      required: true,
    },

    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },

    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

boothVisitSchema.index({
  booth: 1,
  createdAt: -1,
});

boothVisitSchema.index({
  expo: 1,
  createdAt: -1,
});

const BoothVisit = mongoose.model(
  "BoothVisit",
  boothVisitSchema
);

export default BoothVisit;