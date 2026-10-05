import SessionRegistration from "../models/SessionRegistration.js";
import Session from "../models/Session.js";
import Registration from "../models/Registration.js";
import Expo from "../models/Expo.js";
import Notification from "../models/Notification.js";

const registerForSession = async (req, res) => {
  try {
    const { session } = req.body;

    if (!session) {
      return res.status(400).json({
        message: "Session is required",
      });
    }

    const existingSession = await Session.findById(
      session
    );

    if (!existingSession) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const expo = await Expo.findById(
      existingSession.expo
    );

    if (!expo) {
      return res.status(404).json({
        message: "Expo not found",
      });
    }

    if (expo.status !== "published") {
      return res.status(400).json({
        message:
          "This session is not available for registration",
      });
    }

    const now = new Date();

    if (
      expo.endDate &&
      new Date(expo.endDate) < now
    ) {
      return res.status(400).json({
        message: "This expo has already ended",
      });
    }

    const expoRegistration =
      await Registration.findOne({
        attendee: req.user._id,
        expo: existingSession.expo,
        status: "registered",
      });

    if (!expoRegistration) {
      return res.status(400).json({
        message:
          "You must register for the expo before registering for this session",
      });
    }

    const existingRegistration =
      await SessionRegistration.findOne({
        attendee: req.user._id,
        session,
      });

    if (existingRegistration) {
      if (
        existingRegistration.status ===
        "registered"
      ) {
        return res.status(400).json({
          message:
            "You are already registered for this session",
        });
      }

      existingRegistration.status =
        "registered";

      await existingRegistration.save();

      await Notification.create({
        user: req.user._id,
        title: "Session Registered",
        message: `You are registered for ${existingSession.title}.`,
        type: "session",
        link: `/attendee/schedule/${existingSession._id}`,
      });

      const io = req.app.get("io");

      if (io) {
        io.emit("sessionRegistrationUpdated", {
          session: existingSession._id.toString(),
          expo: existingSession.expo.toString(),
        });
      }

      return res.status(200).json({
        message:
          "Session registration restored successfully",
        registration:
          existingRegistration,
      });
    }

    const registration =
      await SessionRegistration.create({
        attendee: req.user._id,
        session,
      });

    await Notification.create({
      user: req.user._id,
      title: "Session Registered",
      message: `You are registered for ${existingSession.title}.`,
      type: "session",
      link: `/attendee/schedule/${existingSession._id}`,
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("sessionRegistrationUpdated", {
        session: existingSession._id.toString(),
        expo: existingSession.expo.toString(),
      });
    }

    res.status(201).json({
      message:
        "Session registered successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMySessionRegistrations = async (
  req,
  res
) => {
  try {
    const registrations =
      await SessionRegistration.find({
        attendee: req.user._id,
        status: "registered",
      })
        .populate({
          path: "session",
          populate: {
            path: "expo",
            select: "title",
          },
        })
        .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const cancelSessionRegistration = async (
  req,
  res
) => {
  try {
    const registration =
      await SessionRegistration.findOne({
        attendee: req.user._id,
        session: req.params.sessionId,
      });

    if (!registration) {
      return res.status(404).json({
        message:
          "Session registration not found",
      });
    }

    const session = await Session.findById(
      req.params.sessionId
    );

    registration.status = "cancelled";

    await registration.save();

    if (session) {
      await Notification.create({
        user: req.user._id,
        title:
          "Session Registration Cancelled",
        message: `Your registration for ${session.title} has been cancelled.`,
        type: "session",
        link: "/attendee/schedule",
      });

      const io = req.app.get("io");

      if (io) {
        io.emit("sessionRegistrationUpdated", {
          session: session._id.toString(),
          expo: session.expo.toString(),
        });
      }
    }

    res.status(200).json({
      message:
        "Session registration cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  registerForSession,
  getMySessionRegistrations,
  cancelSessionRegistration,
};