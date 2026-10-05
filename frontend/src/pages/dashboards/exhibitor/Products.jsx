import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../services/api";

export default function ExhibitorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    image: "",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getMyProducts();

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setMessage(data.message || "Unable to load products");
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const openAddForm = () => {
    setEditingProduct(null);

    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      image: "",
    });

    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price || "",
      image: product.image || "",
    });

    setShowForm(true);
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);

    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      image: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
      };

      if (editingProduct) {
        const data = await updateProduct(
          editingProduct._id,
          productData
        );

        if (!data.product) {
          setMessage(data.message || "Unable to update product");
          return;
        }

        setProducts(
          products.map((product) =>
            product._id === editingProduct._id
              ? data.product
              : product
          )
        );

        setMessage("Product updated successfully");
      } else {
        const data = await createProduct(productData);

        if (!data.product) {
          setMessage(data.message || "Unable to add product");
          return;
        }

        setProducts([data.product, ...products]);

        setMessage("Product added successfully");
      }

      closeForm();
    } catch (error) {
      setMessage("Unable to save product");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await deleteProduct(id);

      if (data.message === "Product deleted successfully") {
        setProducts(
          products.filter((product) => product._id !== id)
        );

        setMessage("Product deleted successfully");
      } else {
        setMessage(data.message || "Unable to delete product");
      }
    } catch (error) {
      setMessage("Unable to delete product");
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p>
            Manage products and services shown on your booth profile.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddForm}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="flex justify-between items-center">
            <div className="card-title">
              {editingProduct ? "Edit Product" : "Add Product"}
            </div>

            <button
              type="button"
              className="btn-icon"
              onClick={closeForm}
            >
              <X size={16} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="form-grid mt-4"
          >
            <div className="form-group">
              <label className="form-label">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                className="input"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Category
              </label>

              <input
                type="text"
                name="category"
                className="input"
                placeholder="e.g. Robotics"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Price
              </label>

              <input
                type="number"
                name="price"
                className="input"
                placeholder="Enter price"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Image URL
              </label>

              <input
                type="text"
                name="image"
                className="input"
                placeholder="Optional image URL"
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Description
              </label>

              <textarea
                name="description"
                className="textarea"
                placeholder="Describe your product or service..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group span-2">
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="empty-state">
            Loading products...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            No products added yet.
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {products.map((product) => (
            <div className="card" key={product._id}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    marginBottom: 14,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f1f5f9",
                    fontWeight: 700,
                  }}
                >
                  {product.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="cell-strong">
                {product.name}
              </div>

              <div
                className="text-muted"
                style={{ fontSize: 13 }}
              >
                {product.category}
              </div>

              {product.description && (
                <p
                  className="text-muted"
                  style={{
                    fontSize: 13,
                    marginTop: 10,
                  }}
                >
                  {product.description}
                </p>
              )}

              <div className="flex justify-between items-center mt-4">
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--primary)",
                  }}
                >
                  Rs. {Number(product.price).toLocaleString()}
                </span>

                <div className="row-actions">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => openEditForm(product)}
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() =>
                      handleDelete(product._id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}