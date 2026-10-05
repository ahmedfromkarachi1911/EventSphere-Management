import Registration from "../models/Registration.js";
import Notification from "../models/Notification.js";
import Expo from "../models/Expo.js";

const registerForExpo = async (req, res) => {
  try {
    const { expo } = req.body;

    if (!expo) {
      return res.status(400).json({
        message: "Expo is required",
      });
    }

    const selectedExpo = await Expo.findById(expo);

    if (!selectedExpo) {
      return res.status(404).json({
        message: "Expo not found",
      });
    }

    if (selectedExpo.status !== "published") {
      return res.status(400).json({
        message: "This expo is not open for registration",
      });
    }

    const now = new Date();

    if (
      selectedExpo.registrationDeadline &&
      new Date(selectedExpo.registrationDeadline) < now
    ) {
      return res.status(400).json({
        message: "Registration deadline has passed",
      });
    }

    if (
      selectedExpo.endDate &&
      new Date(selectedExpo.endDate) < now
    ) {
      return res.status(400).json({
        message: "This expo has already ended",
      });
    }

    const existingRegistration =
      await Registration.findOne({
        attendee: req.user._id,
        expo,
        status: "registered",
      });

    if (existingRegistration) {
      return res.status(400).json({
        message:
          "You are already registered for this expo",
      });
    }

    const registration =
      await Registration.create({
        attendee: req.user._id,
        expo,
      });

    const registrationWithExpo =
      await Registration.findById(
        registration._id
      ).populate("expo", "title");

    await Notification.create({
      user: req.user._id,
      title: "Expo Registration Successful",
      message: `You are registered for ${
        registrationWithExpo?.expo?.title ||
        "the expo"
      }.`,
      type: "general",
      link: "/attendee/registrations",
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("expoRegistrationUpdated", {
        expo: selectedExpo._id.toString(),
      });
    }

    res.status(201).json({
      message: "Expo registration successful",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations =
      await Registration.find({
        attendee: req.user._id,
        status: "registered",
      })
        .populate("expo")
        .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  registerForExpo,
  getMyRegistrations,
};