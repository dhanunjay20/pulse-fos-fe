import React, { useState } from 'react';
import axios from 'axios';
import { showToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    tankCapacity: '',
    price: '',
    metric: 'LITERS',
    status: 'ACTIVE',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.productName &&
      formData.description &&
      formData.tankCapacity &&
      formData.price
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post('https://pulse-766719709317.asia-south1.run.app/products', formData);
      showToast('Product added successfully!', 'success');
      setTimeout(() => navigate('/dashboard/products/view'), 2000);
    } catch (err) {
      showToast('Failed to add product: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/products/view');
  };

  return (
    <div className="inventory-bg">
      <div
        className="container inventory-container py-5"
        style={{ width: '98%', maxWidth: '100vw', margin: '0 auto' }}
      >
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold" aria-label="Add New Product">
                  <span role="img" aria-label="product">💼</span> Add New Product
                </h3>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleCancel}
                  aria-label="Go back"
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} autoComplete="off">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="productName">Product Name *</label>
                      <input
                        id="productName"
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="description">Description *</label>
                      <input
                        id="description"
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="tankCapacity">Tank Capacity *</label>
                      <input
                        id="tankCapacity"
                        type="number"
                        name="tankCapacity"
                        value={formData.tankCapacity}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        required
                        disabled={loading}
                        min="0"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="metric">Metric</label>
                      <select
                        id="metric"
                        name="metric"
                        value={formData.metric}
                        onChange={handleChange}
                        className="form-select form-select-lg"
                        required
                        disabled={loading}
                      >
                        <option value="LITERS">Liters</option>
                        <option value="PACKETS">Packets</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="price">Price (₹) *</label>
                      <input
                        id="price"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        required
                        disabled={loading}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select form-select-lg"
                        required
                        disabled={loading}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!isFormValid() || loading}
                    >
                      {loading ? 'Saving...' : 'Save Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          .inventory-bg {
            min-height: 100vh;
            background: #f8fafc;
          }
          .inventory-container {
            width: 98%;
            max-width: 100vw;
            margin: 0 auto;
          }
          .inventory-card {
            border-radius: 1.25rem;
            overflow: hidden;
          }
          .bg-gradient-primary {
            background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%) !important;
          }
        `}
      </style>
    </div>
  );
};

export default AddProduct;