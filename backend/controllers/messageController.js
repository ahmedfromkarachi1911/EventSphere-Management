import Message from "../models/Message.js";
import User from "../models/User.js";
import Booth from "../models/booth.js";

const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;

    if (!receiver || !message?.trim()) {
      return res.status(400).json({
        message: "Receiver and message are required",
      });
    }

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot send a message to yourself",
      });
    }

    const receiverUser = await User.findById(receiver);

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver,
      message: message.trim(),
    });

    const populatedMessage = await Message.findById(
      newMessage._id
    )
      .populate("sender", "name companyName role")
      .populate("receiver", "name companyName role");

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMessageContacts = async (req, res) => {
  try {
    let contacts = [];

    if (req.user.role === "exhibitor") {
      const organizers = await User.find({
        role: "admin",
        _id: {
          $ne: req.user._id,
        },
      })
        .select("name companyName email role")
        .lean();

      const myBooths = await Booth.find({
        exhibitor: req.user._id,
        status: "assigned",
      }).select("expo hall");

      let neighboringExhibitors = [];

      if (myBooths.length > 0) {
        const neighboringBooths = await Booth.find({
          status: "assigned",
          exhibitor: {
            $ne: req.user._id,
          },
          $or: myBooths.map((booth) => ({
            expo: booth.expo,
            hall: booth.hall,
          })),
        }).populate(
          "exhibitor",
          "name companyName email role"
        );

        const uniqueNeighbors = new Map();

        neighboringBooths.forEach((booth) => {
          if (booth.exhibitor?._id) {
            uniqueNeighbors.set(
              booth.exhibitor._id.toString(),
              booth.exhibitor
            );
          }
        });

        neighboringExhibitors = Array.from(
          uniqueNeighbors.values()
        ).map((exhibitor) => ({
          _id: exhibitor._id,
          name: exhibitor.name,
          companyName: exhibitor.companyName,
          email: exhibitor.email,
          role: exhibitor.role,
          contactType: "neighbor",
        }));
      }

      contacts = [
        ...organizers.map((organizer) => ({
          ...organizer,
          contactType: "organizer",
        })),
        ...neighboringExhibitors,
      ];
    }

    if (req.user.role === "admin") {
      const exhibitors = await User.find({
        role: "exhibitor",
      })
        .select("name companyName email role")
        .lean();

      contacts = exhibitors.map((exhibitor) => ({
        ...exhibitor,
        contactType: "exhibitor",
      }));
    }

    if (req.user.role === "attendee") {
      const booths = await Booth.find({
        status: "assigned",
      }).populate(
        "exhibitor",
        "name companyName email role"
      );

      const uniqueExhibitors = new Map();

      booths.forEach((booth) => {
        if (booth.exhibitor?._id) {
          uniqueExhibitors.set(
            booth.exhibitor._id.toString(),
            booth.exhibitor
          );
        }
      });

      contacts = Array.from(
        uniqueExhibitors.values()
      ).map((exhibitor) => ({
        _id: exhibitor._id,
        name: exhibitor.name,
        companyName: exhibitor.companyName,
        email: exhibitor.email,
        role: exhibitor.role,
        contactType: "exhibitor",
      }));
    }

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
        },
        {
          receiver: req.user._id,
        },
      ],
    })
      .populate("sender", "name companyName role")
      .populate("receiver", "name companyName role")
      .sort({
        createdAt: 1,
      });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      receiver: req.user._id,
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.read = true;

    await message.save();

    res.status(200).json({
      message: "Message marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  sendMessage,
  getMessageContacts,
  getMyMessages,
  markMessageAsRead,
};