import Booth from "../models/booth.js";
import Application from "../models/Application.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const emitBoothEvent = async (
  req,
  eventName,
  boothId
) => {
  try {
    const io = req.app.get("io");

    if (!io) {
      return;
    }

    const realtimeBooth = await Booth.findById(
      boothId
    )
      .populate("expo", "title")
      .populate(
        "exhibitor",
        "name companyName logo"
      );

    if (realtimeBooth) {
      io.emit(eventName, realtimeBooth);
    }
  } catch (error) {
    console.log(
      "Booth realtime error:",
      error.message
    );
  }
};

const createAvailableBooth = async (req, res) => {
  try {
    const {
      expo,
      boothNumber,
      hall,
      boothType,
    } = req.body;

    const existingBooth = await Booth.findOne({
      expo,
      boothNumber,
      status: {
        $ne: "cancelled",
      },
    });

    if (existingBooth) {
      return res.status(400).json({
        message: "This booth already exists",
      });
    }

    const booth = await Booth.create({
      expo,
      boothNumber,
      hall,
      boothType,
      status: "available",
    });

    await emitBoothEvent(
      req,
      "boothCreated",
      booth._id
    );

    res.status(201).json({
      message:
        "Available booth created successfully",
      booth,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAvailableBooths = async (req, res) => {
  try {
    const booths = await Booth.find({
      expo: req.params.expoId,
      status: "available",
    })
      .populate("expo", "title")
      .sort({
        boothNumber: 1,
      });

    res.status(200).json(booths);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExpoFloorPlan = async (req, res) => {
  try {
    const booths = await Booth.find({
      expo: req.params.expoId,
      status: {
        $ne: "cancelled",
      },
    })
      .populate(
        "exhibitor",
        "name companyName logo"
      )
      .populate("expo", "title")
      .sort({
        boothNumber: 1,
      });

    res.status(200).json(booths);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const reserveBooth = async (req, res) => {
  try {
    const booth = await Booth.findById(
      req.params.id
    );

    if (!booth) {
      return res.status(404).json({
        message: "Booth not found",
      });
    }

    if (booth.status !== "available") {
      return res.status(400).json({
        message: "This booth is not available",
      });
    }

    const approvedApplication =
      await Application.findOne({
        expo: booth.expo,
        exhibitor: req.user._id,
        status: "approved",
      });

    if (!approvedApplication) {
      return res.status(403).json({
        message:
          "Your application must be approved before reserving a booth",
      });
    }

    const existingBooth = await Booth.findOne({
      expo: booth.expo,
      exhibitor: req.user._id,
      status: {
        $in: ["reserved", "assigned"],
      },
    });

    if (existingBooth) {
      return res.status(400).json({
        message:
          "You already have a reserved or assigned booth for this expo",
      });
    }

    const reservedBooth =
      await Booth.findOneAndUpdate(
        {
          _id: booth._id,
          status: "available",
        },
        {
          exhibitor: req.user._id,
          status: "reserved",
        },
        {
          new: true,
        }
      )
        .populate("expo", "title")
        .populate(
          "exhibitor",
          "name companyName logo"
        );

    if (!reservedBooth) {
      return res.status(400).json({
        message:
          "This booth is no longer available",
      });
    }

    const admins = await User.find({
      role: "admin",
    }).select("_id");

    if (admins.length > 0) {
      await Notification.insertMany(
        admins.map((admin) => ({
          user: admin._id,
          title: "Booth Reservation Request",
          message: `${
            req.user.companyName ||
            req.user.name ||
            "An exhibitor"
          } reserved booth ${
            reservedBooth.boothNumber
          } for ${
            reservedBooth.expo?.title ||
            "an expo"
          }.`,
          type: "booth",
          link: "/admin/booths",
        }))
      );
    }

    await emitBoothEvent(
      req,
      "boothUpdated",
      reservedBooth._id
    );

    res.status(200).json({
      message: "Booth reserved successfully",
      booth: reservedBooth,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const confirmBoothReservation = async (
  req,
  res
) => {
  try {
    const booth = await Booth.findById(
      req.params.id
    ).populate("expo", "title");

    if (!booth) {
      return res.status(404).json({
        message: "Booth not found",
      });
    }

    if (booth.status !== "reserved") {
      return res.status(400).json({
        message: "This booth is not reserved",
      });
    }

    booth.status = "assigned";

    await booth.save();

    if (booth.exhibitor) {
      await Notification.create({
        user: booth.exhibitor,
        title: "Booth Assigned",
        message: `Booth ${
          booth.boothNumber
        } for ${
          booth.expo?.title || "the expo"
        } has been confirmed and assigned to you.`,
        type: "booth",
        link: "/exhibitor/booth",
      });
    }

    await emitBoothEvent(
      req,
      "boothUpdated",
      booth._id
    );

    res.status(200).json({
      message: "Booth reservation confirmed",
      booth,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const assignBooth = async (req, res) => {
  try {
    const {
      expo,
      exhibitor,
      boothNumber,
      hall,
      boothType,
    } = req.body;

    const existingExhibitorBooth =
      await Booth.findOne({
        expo,
        exhibitor,
        status: {
          $in: ["reserved", "assigned"],
        },
      });

    if (existingExhibitorBooth) {
      return res.status(400).json({
        message:
          "Exhibitor already has a booth for this expo",
      });
    }

    const existingBooth = await Booth.findOne({
      expo,
      boothNumber,
      status: {
        $ne: "cancelled",
      },
    });

    if (existingBooth) {
      if (
        existingBooth.status === "assigned"
      ) {
        return res.status(400).json({
          message:
            "This booth is already assigned",
        });
      }

      if (
        existingBooth.status === "reserved" &&
        existingBooth.exhibitor &&
        existingBooth.exhibitor.toString() !==
          exhibitor.toString()
      ) {
        return res.status(400).json({
          message:
            "This booth is reserved by another exhibitor",
        });
      }

      existingBooth.exhibitor = exhibitor;
      existingBooth.hall = hall;
      existingBooth.boothType = boothType;
      existingBooth.status = "assigned";

      await existingBooth.save();

      await existingBooth.populate(
        "expo",
        "title"
      );

      await Notification.create({
        user: exhibitor,
        title: "Booth Assigned",
        message: `Booth ${
          existingBooth.boothNumber
        } for ${
          existingBooth.expo?.title ||
          "the expo"
        } has been assigned to you.`,
        type: "booth",
        link: "/exhibitor/booth",
      });

      await emitBoothEvent(
        req,
        "boothUpdated",
        existingBooth._id
      );

      return res.status(200).json({
        message: "Booth assigned successfully",
        booth: existingBooth,
      });
    }

    const booth = await Booth.create({
      expo,
      exhibitor,
      boothNumber,
      hall,
      boothType,
      status: "assigned",
    });

    await booth.populate("expo", "title");

    await Notification.create({
      user: exhibitor,
      title: "Booth Assigned",
      message: `Booth ${
        booth.boothNumber
      } for ${
        booth.expo?.title || "the expo"
      } has been assigned to you.`,
      type: "booth",
      link: "/exhibitor/booth",
    });

    await emitBoothEvent(
      req,
      "boothCreated",
      booth._id
    );

    res.status(201).json({
      message: "Booth assigned successfully",
      booth,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateBooth = async (req, res) => {
  try {
    const booth = await Booth.findById(
      req.params.id
    );

    if (!booth) {
      return res.status(404).json({
        message: "Booth not found",
      });
    }

    const {
      boothNumber,
      hall,
      boothType,
    } = req.body;

    if (!boothNumber || !hall || !boothType) {
      return res.status(400).json({
        message:
          "Booth number, hall and booth type are required",
      });
    }

    const existingBooth = await Booth.findOne({
      _id: {
        $ne: booth._id,
      },
      expo: booth.expo,
      boothNumber: boothNumber.trim(),
      status: {
        $ne: "cancelled",
      },
    });

    if (existingBooth) {
      return res.status(400).json({
        message:
          "This booth number already exists",
      });
    }

    booth.boothNumber = boothNumber.trim();
    booth.hall = hall;
    booth.boothType = boothType;

    await booth.save();

    const updatedBooth =
      await Booth.findById(booth._id)
        .populate("expo", "title")
        .populate(
          "exhibitor",
          "name companyName email phone"
        );

    if (
      updatedBooth.exhibitor &&
      ["reserved", "assigned"].includes(
        updatedBooth.status
      )
    ) {
      await Notification.create({
        user: updatedBooth.exhibitor._id,
        title: "Booth Updated",
        message: `Your booth ${
          updatedBooth.boothNumber
        } for ${
          updatedBooth.expo?.title ||
          "the expo"
        } has been updated.`,
        type: "booth",
        link: "/exhibitor/booth",
      });
    }

    await emitBoothEvent(
      req,
      "boothUpdated",
      updatedBooth._id
    );

    res.status(200).json({
      message: "Booth updated successfully",
      booth: updatedBooth,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyBooths = async (req, res) => {
  try {
    const booths = await Booth.find({
      exhibitor: req.user._id,
      status: {
        $in: ["reserved", "assigned"],
      },
    })
      .populate("expo")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(booths);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBooths = async (req, res) => {
  try {
    const booths = await Booth.find()
      .populate("expo", "title")
      .populate(
        "exhibitor",
        "name companyName email phone"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json(booths);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createAvailableBooth,
  getAvailableBooths,
  getExpoFloorPlan,
  reserveBooth,
  confirmBoothReservation,
  assignBooth,
  updateBooth,
  getMyBooths,
  getBooths,
};