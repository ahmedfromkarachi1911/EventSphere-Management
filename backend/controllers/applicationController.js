import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import Expo from "../models/Expo.js";
import Document from "../models/Document.js";

const createApplication = async (req, res) => {
  try {
    const { expo, message } = req.body;

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
        message:
          "Applications are not open for this expo",
      });
    }

    const now = new Date();

    if (
      selectedExpo.registrationDeadline &&
      new Date(
        selectedExpo.registrationDeadline
      ) < now
    ) {
      return res.status(400).json({
        message:
          "Application deadline has passed",
      });
    }

    if (
      selectedExpo.endDate &&
      new Date(selectedExpo.endDate) < now
    ) {
      return res.status(400).json({
        message:
          "This expo has already ended",
      });
    }

    const existingApplication =
      await Application.findOne({
        expo,
        exhibitor: req.user._id,
      });

    if (existingApplication) {
      return res.status(400).json({
        message:
          "You have already applied for this expo",
      });
    }

    const application =
      await Application.create({
        expo,
        exhibitor: req.user._id,
        message: message?.trim() || "",
      });

    const io = req.app.get("io");

    if (io) {
      io.emit("applicationStatusUpdated", {
        application:
          application._id.toString(),
        expo: selectedExpo._id.toString(),
        status: application.status,
      });
    }

    res.status(201).json({
      message:
        "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyApplications = async (
  req,
  res
) => {
  try {
    const applications =
      await Application.find({
        exhibitor: req.user._id,
      })
        .populate("expo")
        .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getApplications = async (
  req,
  res
) => {
  try {
    const applications =
      await Application.find()
        .populate("expo")
        .populate(
          "exhibitor",
          "name companyName email phone"
        )
        .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (
      !["approved", "rejected"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const application =
      await Application.findById(
        req.params.id
      ).populate("expo", "title");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (status === "approved") {
      const verifiedDocument =
        await Document.findOne({
          application: application._id,
          status: "verified",
        });

      if (!verifiedDocument) {
        return res.status(400).json({
          message:
            "Application cannot be approved until at least one supporting document is verified",
        });
      }
    }

    application.status = status;

    await application.save();

    await Notification.create({
      user: application.exhibitor,
      title:
        status === "approved"
          ? "Application Approved"
          : "Application Rejected",
      message:
        status === "approved"
          ? `Your application for ${application.expo.title} has been approved.`
          : `Your application for ${application.expo.title} has been rejected.`,
      type: "application",
      link: "/exhibitor/applications",
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("applicationStatusUpdated", {
        application:
          application._id.toString(),
        expo:
          application.expo?._id?.toString(),
        status: application.status,
      });
    }

    res.status(200).json({
      message: `Application ${status} successfully`,
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createApplication,
  getMyApplications,
  getApplications,
  updateApplicationStatus,
};