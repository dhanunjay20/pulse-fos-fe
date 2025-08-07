import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css/animate.min.css";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://pulse-766719709317.asia-south1.run.app/products");
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showMessage = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(""), 3000);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`https://pulse-766719709317.asia-south1.run.app/products/${productId}`);
      setProducts((prev) => prev.filter((p) => (p.productId ?? p.id) !== productId));
      showMessage(setSuccess, "Product deleted successfully.");
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
        showMessage(setError, "Delete failed: " + (err.response?.data || err.message));
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
      showMessage(setSuccess, "Product has been deactivated.");
    } catch (err) {
      showMessage(setError, "Failed to deactivate product: " + (err.response?.data || err.message));
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
      showMessage(setSuccess, "Product updated successfully.");
    } catch (err) {
      showMessage(setError, "Update failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">View Products</h2>

      {/* Success Toast */}
      {success && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="toast show animate__animated animate__fadeInRight text-white bg-success" role="alert">
            <div className="toast-body">{success}</div>
            <div className="progress bg-success" style={{ height: "4px" }}>
              <div
                className="progress-bar bg-white"
                role="progressbar"
                style={{ width: "100%", animation: "shrink 3s linear forwards" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="toast show animate__animated animate__fadeInRight text-white bg-danger" role="alert">
            <div className="toast-body">{error}</div>
            <div className="progress bg-danger" style={{ height: "4px" }}>
              <div
                className="progress-bar bg-white"
                role="progressbar"
                style={{ width: "100%", animation: "shrink 3s linear forwards" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-primary text-white">
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Description</th>
                <th>Tank Capacity (L)</th>
                <th>Price (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const productId = product.productId ?? product.id;
                return (
                  <tr key={productId}>
                    <td>{index + 1}</td>
                    <td>{product.productName}</td>
                    <td>{product.description}</td>
                    <td>{product.tankCapacity}</td>
                    <td>{product.price}</td>
                    <td>{product.status}</td>
                    <td>
                     <td>
                        <div className="d-flex flex-column flex-sm-row gap-2">
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdateClick(product)}>
                            Update
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(productId)}>
                            Delete
                          </button>
                        </div>
                    </td>

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bootstrap Modal for Update Form */}
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

    </div>
  );
};

export default ViewProducts;
