import fs from "fs";
import path from "path";

import Document from "../models/Document.js";
import Application from "../models/Application.js";

const uploadDocument = async (req, res) => {
  try {
    const { application } = req.body;

    if (!application) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Application is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a document",
      });
    }

    const exhibitorApplication = await Application.findOne({
      _id: application,
      exhibitor: req.user._id,
    });

    if (!exhibitorApplication) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        message: "Application not found",
      });
    }

    const document = await Document.create({
      exhibitor: req.user._id,
      application: exhibitorApplication._id,
      expo: exhibitorApplication.expo,
      name: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      status: "pending",
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    if (
      req.file &&
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      exhibitor: req.user._id,
    })
      .populate(
        "expo",
        "title category startDate endDate"
      )
      .populate(
        "application",
        "status"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate(
        "exhibitor",
        "name companyName email phone"
      )
      .populate(
        "expo",
        "title category startDate endDate"
      )
      .populate(
        "application",
        "status"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(
      req.params.id
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    if (
      document.exhibitor.toString() !==
        req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const filePath = path.resolve(
      document.filePath
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.download(
      filePath,
      document.name
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateDocumentStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (
      !["verified", "rejected"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Status must be verified or rejected",
      });
    }

    const document = await Document.findById(
      req.params.id
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    document.status = status;

    await document.save();

    const updatedDocument =
      await Document.findById(
        document._id
      )
        .populate(
          "exhibitor",
          "name companyName email phone"
        )
        .populate(
          "expo",
          "title category startDate endDate"
        )
        .populate(
          "application",
          "status"
        );

    res.status(200).json({
      message:
        status === "verified"
          ? "Document verified successfully"
          : "Document rejected successfully",
      document: updatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      exhibitor: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const filePath = path.resolve(
      document.filePath
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();

    res.status(200).json({
      message:
        "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  downloadDocument,
  updateDocumentStatus,
  deleteDocument,
};