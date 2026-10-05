import Staff from "../models/Staff.js";

const createStaff = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const staff = await Staff.create({
      exhibitor: req.user._id,
      name,
      email,
      phone,
      role,
    });

    res.status(201).json({
      message: "Staff member added successfully",
      staff,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyStaff = async (req, res) => {
  try {
    const staff = await Staff.find({
      exhibitor: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      _id: req.params.id,
      exhibitor: req.user._id,
    });

    if (!staff) {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    const { name, email, phone, role } = req.body;

    staff.name = name ?? staff.name;
    staff.email = email ?? staff.email;
    staff.phone = phone ?? staff.phone;
    staff.role = role ?? staff.role;

    await staff.save();

    res.status(200).json({
      message: "Staff member updated successfully",
      staff,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      _id: req.params.id,
      exhibitor: req.user._id,
    });

    if (!staff) {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    await staff.deleteOne();

    res.status(200).json({
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createStaff,
  getMyStaff,
  updateStaff,
  deleteStaff,
};