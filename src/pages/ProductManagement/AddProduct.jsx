import React, { useState } from 'react';
import axios from 'axios';
import './AddProduct.css';

const AddProduct = () => {
  const initialValues = {
    productName: '',
    description: '',
    tankCapacity: '',
    price: '',
    metric: 'LITERS',
    status: 'ACTIVE',
  };

  const [formData, setFormData] = useState(initialValues);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData(initialValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://pulse-766719709317.asia-south1.run.app/products', formData);
      setToast({ show: true, message: 'Product added successfully!', type: 'success' });
      handleClear();
    } catch (err) {
      setToast({ show: true, message: 'Failed to add product: ' + err.message, type: 'error' });
    }

    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="container py-5">
      {/* Toast */}
      {toast.show && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show animate__animated animate__fadeInRight border-0 text-white ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
            <div className="toast-body">
              {toast.message}
              <div className="progress mt-2" style={{ height: '4px' }}>
                <div
                  className="progress-bar bg-light"
                  role="progressbar"
                  style={{ width: '100%', animation: 'shrink 3s linear forwards' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg rounded-4 border-0">
            <div className="card-body p-5">
              <h3 className="mb-4 text-center fw-bold text-primary">Add New Product</h3>

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Product Name</label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tank Capacity</label>
                    <input
                      type="number"
                      name="tankCapacity"
                      value={formData.tankCapacity}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Metric</label>
                    <select
                      name="metric"
                      value={formData.metric}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="LITERS">Liters</option>
                      <option value="PACKETS">Packets</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 d-flex justify-content-center gap-3">
                  <button type="submit" className="btn btn-primary px-4">Add Product</button>
                  <button type="button" className="btn btn-outline-secondary px-4" onClick={handleClear}>Clear</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
