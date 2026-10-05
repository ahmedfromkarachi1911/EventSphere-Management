import mongoose from "mongoose";

const sessionRegistrationSchema = new mongoose.Schema(
  {
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "cancelled"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  }
);

sessionRegistrationSchema.index(
  {
    attendee: 1,
    session: 1,
  },
  {
    unique: true,
  }
);

const SessionRegistration = mongoose.model(
  "SessionRegistration",
  sessionRegistrationSchema
);

export default SessionRegistration;