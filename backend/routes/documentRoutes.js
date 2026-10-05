import express from "express";

import {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  downloadDocument,
  updateDocumentStatus,
  deleteDocument,
} from "../controllers/documentController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

import {
  documentUpload,
} from "../middleware/documentUpload.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("exhibitor"),
  documentUpload.single("document"),
  uploadDocument
);

router.get(
  "/my",
  protect,
  authorize("exhibitor"),
  getMyDocuments
);

router.get(
  "/",
  protect,
  authorize("admin"),
  getAllDocuments
);

router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  updateDocumentStatus
);

router.get(
  "/:id/download",
  protect,
  downloadDocument
);

router.delete(
  "/:id",
  protect,
  authorize("exhibitor"),
  deleteDocument
);

export default router;