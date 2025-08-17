import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../components/ToastProvider";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css/animate.min.css";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://pulse-766719709317.asia-south1.run.app/products");
      setProducts(res.data);
    } catch (err) {
      showToast("Failed to load products: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`https://pulse-766719709317.asia-south1.run.app/products/${productId}`);
      setProducts((prev) => prev.filter((p) => (p.productId ?? p.id) !== productId));
      showToast("Product deleted successfully.", "success");
    } catch (err) {
      if (err.response?.status === 409) {
        if (
          window.confirm(
            "This product is linked to inventory or sales. Would you like to deactivate it instead?"
          )
        ) {
          await deactivateProduct(productId);
        }
      } else {
        showToast("Delete failed: " + (err.response?.data || err.message), "error");
      }
    }
  };

  const deactivateProduct = async (productId) => {
    try {
      const product = products.find((p) => (p.productId ?? p.id) === productId);
      if (!product) return;

      const updatedProduct = { ...product, status: "INACTIVE" };
      await axios.put(`https://pulse-766719709317.asia-south1.run.app/products/${productId}`, updatedProduct);

      setProducts((prev) =>
        prev.map((p) => (p.productId ?? p.id) === productId ? updatedProduct : p)
      );
      showToast("Product has been deactivated.", "success");
    } catch (err) {
      showToast("Failed to deactivate product: " + (err.response?.data || err.message), "error");
    }
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setNewStatus(product.status);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProduct = { ...selectedProduct, status: newStatus };
      const productId = selectedProduct.productId ?? selectedProduct.id;
      await axios.put(`https://pulse-766719709317.asia-south1.run.app/products/${productId}`, updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (p.productId ?? p.id) === productId ? updatedProduct : p)
      );
      setSelectedProduct(null);
      showToast("Product updated successfully.", "success");
    } catch (err) {
      showToast("Update failed: " + (err.response?.data || err.message), "error");
    }
  };

  return (
    <>
      <div className="inventory-bg">
        <div className="container inventory-container py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="card inventory-card shadow-lg border-0">
                <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                  <h3 className="mb-0 fw-bold">
                    <span role="img" aria-label="box">📦</span> All Products
                  </h3>
                  <span className="badge bg-light text-primary fs-6">
                    {products.length} Products
                  </span>
                </div>
                <div className="card-body p-4">
                  {/* Add Product and Update Price Buttons */}
                  <div className="mb-3 d-flex flex-column flex-sm-row gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate("/dashboard/products/add")}
                    >
                      Add Product
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate("/dashboard/products/price")}
                    >
                      Update Price
                    </button>
                  </div>
                  {loading ? (
                    <div className="d-flex flex-column align-items-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <span className="text-muted">Loading products...</span>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle inventory-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Product Name</th>
                            <th>Description</th>
                            <th>Tank Capacity (L)</th>
                            <th>Price (₹)</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, index) => {
                            const productId = product.productId ?? product.id;
                            return (
                              <tr key={productId}>
                                <td className="fw-semibold text-secondary">{index + 1}</td>
                                <td className="fw-bold text-dark">{product.productName}</td>
                                <td>{product.description}</td>
                                <td>{product.tankCapacity}</td>
                                <td>
                                  <span className="fw-semibold text-primary">
                                    ₹ {product.price}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge rounded-pill px-3 py-2 fs-6 ${
                                      product.status?.toLowerCase() === "active"
                                        ? "bg-success"
                                        : product.status?.toLowerCase() === "inactive"
                                        ? "bg-danger"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {product.status}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                                    <button className="btn btn-primary btn-sm" onClick={() => handleUpdateClick(product)}>
                                      Update
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(productId)}>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="card-footer text-end bg-white border-0">
                  <small className="text-muted">
                    Last refreshed: {new Date().toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Update */}
      {selectedProduct && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-md" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Product Status</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input type="text" className="form-control" value={selectedProduct.productName} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input type="text" className="form-control" value={selectedProduct.description} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tank Capacity (L)</label>
                    <input type="number" className="form-control" value={selectedProduct.tankCapacity} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" className="form-control" value={selectedProduct.price} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">Save</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        .inventory-bg {
          min-height: 100vh;
        }
        .inventory-container {
          width: 98%;
          max-width: 100vw;
        }
        .inventory-card {
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .bg-gradient-primary {
          background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
        }
        .inventory-table thead th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
        }
        .inventory-table tbody tr {
          transition: background 0.2s;
        }
        .inventory-table tbody tr:hover {
          background: #f0f6ff;
        }
        .inventory-table td, .inventory-table th {
          vertical-align: middle;
        }
        `}
      </style>
    </>
  );
};

export default ViewProducts;