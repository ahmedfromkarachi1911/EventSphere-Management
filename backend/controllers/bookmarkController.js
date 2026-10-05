import Bookmark from "../models/Bookmark.js";
import Session from "../models/Session.js";

const addBookmark = async (req, res) => {
  try {
    const { session } = req.body;

    const existingSession = await Session.findById(session);

    if (!existingSession) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const existingBookmark = await Bookmark.findOne({
      attendee: req.user._id,
      session,
    });

    if (existingBookmark) {
      return res.status(400).json({
        message: "Session already bookmarked",
      });
    }

    const bookmark = await Bookmark.create({
      attendee: req.user._id,
      session,
    });

    res.status(201).json({
      message: "Session bookmarked successfully",
      bookmark,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({
      attendee: req.user._id,
    })
      .populate({
        path: "session",
        populate: {
          path: "expo",
          select: "title",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      attendee: req.user._id,
      session: req.params.sessionId,
    });

    if (!bookmark) {
      return res.status(404).json({
        message: "Bookmark not found",
      });
    }

    await bookmark.deleteOne();

    res.status(200).json({
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  addBookmark,
  getMyBookmarks,
  removeBookmark,
};