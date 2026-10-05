import express from "express";

import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("exhibitor"),
  createProduct
);

router.get(
  "/my",
  protect,
  authorize("exhibitor"),
  getMyProducts
);

router.put(
  "/:id",
  protect,
  authorize("exhibitor"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  authorize("exhibitor"),
  deleteProduct
);

export default router;