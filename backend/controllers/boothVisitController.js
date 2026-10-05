import Booth from "../models/booth.js";
import BoothVisit from "../models/boothVisit.js";

const recordBoothVisit = async (req, res) => {
  try {
    const booth = await Booth.findById(
      req.params.boothId
    );

    if (!booth) {
      return res.status(404).json({
        message: "Booth not found",
      });
    }

    if (
      booth.status !== "assigned" ||
      !booth.exhibitor
    ) {
      return res.status(400).json({
        message:
          "Only assigned exhibitor booths can record visits",
      });
    }

    const thirtyMinutesAgo = new Date(
      Date.now() - 30 * 60 * 1000
    );

    const recentVisit =
      await BoothVisit.findOne({
        booth: booth._id,
        attendee: req.user._id,
        createdAt: {
          $gte: thirtyMinutesAgo,
        },
      });

    if (recentVisit) {
      return res.status(200).json({
        message:
          "Booth visit already recorded recently",
        visit: recentVisit,
      });
    }

    const visit = await BoothVisit.create({
      booth: booth._id,
      expo: booth.expo,
      exhibitor: booth.exhibitor,
      attendee: req.user._id,
    });

    const io = req.app.get("io");

    if (io) {
      io.emit("boothTrafficUpdated", {
        boothId: booth._id.toString(),
        expoId: booth.expo.toString(),
      });
    }

    res.status(201).json({
      message: "Booth visit recorded",
      visit,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export { recordBoothVisit };