import Expo from "../models/Expo.js";
import Application from "../models/Application.js";
import Booth from "../models/booth.js";
import Session from "../models/Session.js";
import Registration from "../models/Registration.js";
import SessionRegistration from "../models/SessionRegistration.js";
import Bookmark from "../models/Bookmark.js";
import Feedback from "../models/Feedback.js";
import Document from "../models/Document.js";
import BoothVisit from "../models/boothVisit.js";

const validateExpo = (data, isEdit = false) => {
  const {
    title,
    description,
    startDate,
    endDate,
    registrationDeadline,
    venue,
    city,
    openingTime,
    closingTime,
    expectedAttendees,
  } = data;

  if (!title?.trim()) {
    return "Title is required";
  }

  if (!description?.trim()) {
    return "Description is required";
  }

  if (!venue?.trim()) {
    return "Venue is required";
  }

  if (!city?.trim()) {
    return "City is required";
  }

  if (
    !startDate ||
    !endDate ||
    !registrationDeadline
  ) {
    return "All dates are required";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const deadline = new Date(
    registrationDeadline
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    Number.isNaN(deadline.getTime())
  ) {
    return "Invalid date";
  }

  if (!isEdit) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);

    const deadlineDay = new Date(deadline);
    deadlineDay.setHours(0, 0, 0, 0);

    if (startDay < today) {
      return "Start date cannot be in the past";
    }

    if (deadlineDay < today) {
      return "Registration deadline cannot be in the past";
    }
  }

  if (end < start) {
    return "End date cannot be before start date";
  }

  if (deadline > start) {
    return "Registration deadline cannot be after expo start date";
  }

  if (!openingTime || !closingTime) {
    return "Opening and closing time are required";
  }

  if (closingTime <= openingTime) {
    return "Closing time must be after opening time";
  }

  const attendees = Number(
    expectedAttendees
  );

  if (
    !Number.isInteger(attendees) ||
    attendees <= 0
  ) {
    return "Expected attendees must be greater than 0";
  }

  return "";
};

const createExpo = async (req, res) => {
  try {
    const validationMessage =
      validateExpo(req.body);

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      });
    }

    const expo = await Expo.create({
      ...req.body,
      title: req.body.title.trim(),
      description:
        req.body.description.trim(),
      venue: req.body.venue.trim(),
      city: req.body.city.trim(),
      expectedAttendees: Number(
        req.body.expectedAttendees
      ),
    });

    const io = req.app.get("io");

    if (
      io &&
      expo.status === "published"
    ) {
      io.emit("expoCreated", expo);
    }

    res.status(201).json({
      message: "Expo created successfully",
      expo,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExpos = async (req, res) => {
  try {
    const filter = {};

    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      filter.status = "published";
    }

    const expos = await Expo.find(
      filter
    ).sort({
      createdAt: -1,
    });

    res.status(200).json(expos);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExpoById = async (req, res) => {
  try {
    const expo = await Expo.findById(
      req.params.id
    );

    if (!expo) {
      return res.status(404).json({
        message: "Expo not found",
      });
    }

    if (
      expo.status !== "published" &&
      (!req.user ||
        req.user.role !== "admin")
    ) {
      return res.status(404).json({
        message: "Expo not found",
      });
    }

    res.status(200).json(expo);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateExpo = async (req, res) => {
  try {
    const existingExpo =
      await Expo.findById(req.params.id);

    if (!existingExpo) {
      return res.status(404).json({
        message: "Expo not found",
      });
    }

    const previousStatus =
      existingExpo.status;

    const updatedData = {
      ...existingExpo.toObject(),
      ...req.body,
    };

    const validationMessage =
      validateExpo(updatedData, true);

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      });
    }

    const expo =
      await Expo.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          title:
            updatedData.title.trim(),
          description:
            updatedData.description.trim(),
          venue:
            updatedData.venue.trim(),
          city:
            updatedData.city.trim(),
          expectedAttendees: Number(
            updatedData.expectedAttendees
          ),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    const io = req.app.get("io");

    if (io) {
      if (
        previousStatus !==
          "published" &&
        expo.status === "published"
      ) {
        io.emit("expoCreated", expo);
      } else if (
        previousStatus ===
          "published" &&
        expo.status === "published"
      ) {
        io.emit("expoUpdated", expo);
      } else if (
        previousStatus ===
          "published" &&
        expo.status !== "published"
      ) {
        io.emit(
          "expoDeleted",
          expo._id.toString()
        );
      }
    }

    res.status(200).json({
      message: "Expo updated successfully",
      expo,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteExpo = async (req, res) => {
  try {
    const expo = await Expo.findById(
      req.params.id
    );

    if (!expo) {
      return res.status(404).json({
        message: "Expo not found",
      });
    }

    const wasPublished =
      expo.status === "published";

    const sessions =
      await Session.find({
        expo: expo._id,
      }).select("_id");

    const sessionIds = sessions.map(
      (session) => session._id
    );

    const applications =
      await Application.find({
        expo: expo._id,
      }).select("_id");

    const applicationIds =
      applications.map(
        (application) =>
          application._id
      );

    await Promise.all([
      SessionRegistration.deleteMany({
        session: {
          $in: sessionIds,
        },
      }),

      Bookmark.deleteMany({
        session: {
          $in: sessionIds,
        },
      }),

      Document.deleteMany({
        application: {
          $in: applicationIds,
        },
      }),

      BoothVisit.deleteMany({
        expo: expo._id,
      }),

      Feedback.deleteMany({
        expo: expo._id,
      }),

      Registration.deleteMany({
        expo: expo._id,
      }),

      Booth.deleteMany({
        expo: expo._id,
      }),

      Application.deleteMany({
        expo: expo._id,
      }),

      Session.deleteMany({
        expo: expo._id,
      }),
    ]);

    await expo.deleteOne();

    const io = req.app.get("io");

    if (io && wasPublished) {
      io.emit(
        "expoDeleted",
        expo._id.toString()
      );
    }

    res.status(200).json({
      message:
        "Expo and related data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createExpo,
  getExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
};