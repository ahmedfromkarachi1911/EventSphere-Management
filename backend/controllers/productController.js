import Product from "../models/Product.js";

const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      image,
    } = req.body;

    const product = await Product.create({
      exhibitor: req.user._id,
      name,
      category,
      description,
      price,
      image,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      exhibitor: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      exhibitor: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      category,
      description,
      price,
      image,
    } = req.body;

    product.name = name ?? product.name;
    product.category = category ?? product.category;
    product.description =
      description ?? product.description;
    product.price = price ?? product.price;
    product.image = image ?? product.image;

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      exhibitor: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
};