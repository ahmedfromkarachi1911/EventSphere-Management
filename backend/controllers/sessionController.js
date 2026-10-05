import Session from "../models/Session.js";
import Expo from "../models/Expo.js";
import SessionRegistration from "../models/SessionRegistration.js";
import Bookmark from "../models/Bookmark.js";

const validateSession = async (data) => {
  const {
    expo,
    title,
    speaker,
    date,
    startTime,
    endTime,
    location,
  } = data;

  if (!expo) {
    return "Expo is required";
  }

  if (!title?.trim()) {
    return "Session title is required";
  }

  if (!speaker?.trim()) {
    return "Speaker is required";
  }

  if (!date) {
    return "Session date is required";
  }

  if (!startTime || !endTime) {
    return "Start time and end time are required";
  }

  if (!location?.trim()) {
    return "Location is required";
  }

  if (endTime <= startTime) {
    return "End time must be after start time";
  }

  const selectedExpo = await Expo.findById(expo);

  if (!selectedExpo) {
    return "Expo not found";
  }

  const sessionDate = new Date(date);
  const expoStartDate = new Date(
    selectedExpo.startDate
  );
  const expoEndDate = new Date(
    selectedExpo.endDate
  );

  sessionDate.setHours(0, 0, 0, 0);
  expoStartDate.setHours(0, 0, 0, 0);
  expoEndDate.setHours(0, 0, 0, 0);

  if (
    sessionDate < expoStartDate ||
    sessionDate > expoEndDate
  ) {
    return "Session date must be within expo dates";
  }

  return "";
};

const createSession = async (req, res) => {
  try {
    const {
      expo,
      title,
      speaker,
      date,
      startTime,
      endTime,
      location,
      description,
    } = req.body;

    const validationMessage =
      await validateSession(req.body);

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      });
    }

    const session = await Session.create({
      expo,
      title: title.trim(),
      speaker: speaker.trim(),
      date,
      startTime,
      endTime,
      location: location.trim(),
      description:
        description?.trim() || "",
    });

    const populatedSession =
      await Session.findById(
        session._id
      ).populate(
        "expo",
        "title category status"
      );

    const io = req.app.get("io");

    if (
      io &&
      populatedSession?.expo?.status ===
        "published"
    ) {
      io.emit(
        "sessionCreated",
        populatedSession
      );
    }

    res.status(201).json({
      message:
        "Session created successfully",
      session: populatedSession,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSessions = async (req, res) => {
  try {
    const filter = {};

    if (req.query.expo) {
      filter.expo = req.query.expo;
    }

    if (
      !req.user ||
      req.user.role !== "admin"
    ) {
      const publishedExpos =
        await Expo.find({
          status: "published",
        }).select("_id");

      const publishedExpoIds =
        publishedExpos.map(
          (expo) => expo._id
        );

      if (req.query.expo) {
        const allowed =
          publishedExpoIds.some(
            (expoId) =>
              expoId.toString() ===
              req.query.expo
          );

        if (!allowed) {
          return res
            .status(200)
            .json([]);
        }
      } else {
        filter.expo = {
          $in: publishedExpoIds,
        };
      }
    }

    const sessions =
      await Session.find(filter)
        .populate(
          "expo",
          "title category status"
        )
        .sort({
          date: 1,
          startTime: 1,
        });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateSession = async (
  req,
  res
) => {
  try {
    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const updatedData = {
      expo:
        req.body.expo ??
        session.expo,
      title:
        req.body.title ??
        session.title,
      speaker:
        req.body.speaker ??
        session.speaker,
      date:
        req.body.date ??
        session.date,
      startTime:
        req.body.startTime ??
        session.startTime,
      endTime:
        req.body.endTime ??
        session.endTime,
      location:
        req.body.location ??
        session.location,
      description:
        req.body.description ??
        session.description,
    };

    const validationMessage =
      await validateSession(
        updatedData
      );

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      });
    }

    session.expo =
      updatedData.expo;

    session.title =
      updatedData.title.trim();

    session.speaker =
      updatedData.speaker.trim();

    session.date =
      updatedData.date;

    session.startTime =
      updatedData.startTime;

    session.endTime =
      updatedData.endTime;

    session.location =
      updatedData.location.trim();

    session.description =
      updatedData.description?.trim() ||
      "";

    await session.save();

    const populatedSession =
      await Session.findById(
        session._id
      ).populate(
        "expo",
        "title category status"
      );

    const io = req.app.get("io");

    if (
      io &&
      populatedSession?.expo?.status ===
        "published"
    ) {
      io.emit(
        "sessionUpdated",
        populatedSession
      );
    }

    res.status(200).json({
      message:
        "Session updated successfully",
      session: populatedSession,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteSession = async (
  req,
  res
) => {
  try {
    const session =
      await Session.findById(
        req.params.id
      ).populate(
        "expo",
        "status"
      );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const sessionId =
      session._id.toString();

    const wasPublished =
      session.expo?.status ===
      "published";

    await Promise.all([
      SessionRegistration.deleteMany({
        session: session._id,
      }),

      Bookmark.deleteMany({
        session: session._id,
      }),
    ]);

    await session.deleteOne();

    const io = req.app.get("io");

    if (io && wasPublished) {
      io.emit(
        "sessionDeleted",
        sessionId
      );
    }

    res.status(200).json({
      message:
        "Session and related data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSessionById = async (
  req,
  res
) => {
  try {
    const session =
      await Session.findById(
        req.params.id
      ).populate(
        "expo",
        "title category status"
      );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (
      session.expo?.status !==
        "published" &&
      (!req.user ||
        req.user.role !== "admin")
    ) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
};