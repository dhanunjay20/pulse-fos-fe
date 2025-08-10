import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { showToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

const inputStyle = { height: '48px', borderRadius: '8px' };

const UpdateInventory = () => {
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    currentLevel: 0,
    tankCapacity: 0,
    newQty: '',
    refillSpace: 0,
    metric: 'liters',
    employeeId: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://pulse-766719709317.asia-south1.run.app/inventory/latest')
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast('Failed to load products.', 'error'));

    axios.get('https://pulse-766719709317.asia-south1.run.app/active')
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast('Failed to load employees.', 'error'));
  }, []);

  const resetForm = () => {
    setFormData({
      productId: '',
      productName: '',
      currentLevel: 0,
      tankCapacity: 0,
      newQty: '',
      refillSpace: 0,
      metric: 'liters',
      employeeId: ''
    });
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => String(p.productId) === productId);

    if (!product) {
      resetForm();
      return;
    }

    const currentLevel = parseFloat(product.currentLevel ?? 0);
    const tankCapacity = parseFloat(product.tankCapacity ?? 0);
    const refillSpace = parseFloat((tankCapacity - currentLevel).toFixed(2));

    setFormData((prev) => ({
      ...prev,
      productId: product.productId,
      productName: product.productName || '',
      currentLevel,
      tankCapacity,
      newQty: '',
      refillSpace,
      metric: product.metric || 'liters'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'newQty') {
      const newQtyNumber = parseFloat(value || 0);
      const newCurrent = parseFloat(formData.currentLevel ?? 0) + newQtyNumber;
      let refillSpace = parseFloat(formData.tankCapacity ?? 0) - newCurrent;
      if (refillSpace < 0) refillSpace = 0;

      setFormData((prev) => ({
        ...prev,
        newQty: value,
        refillSpace: parseFloat(refillSpace.toFixed(2))
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const { productId, newQty, metric, employeeId, currentLevel, tankCapacity } = formData;

    if (!productId || !newQty || isNaN(Number(newQty)) || !employeeId) {
      showToast('Please fill all required fields.', 'error');
      setLoading(false);
      return;
    }

    const total = parseFloat(currentLevel) + parseFloat(newQty);
    if (total - parseFloat(tankCapacity) > 0.01) {
      showToast('Tank capacity exceeded.', 'error');
      setLoading(false);
      return;
    }

    const payload = {
      productId: Number(productId),
      quantity: Number(newQty),
      metric,
      employeeId: Number(employeeId)
    };

    axios.post('https://pulse-766719709317.asia-south1.run.app/inventory', payload)
      .then((res) => {
        if (res.status === 201 || res.status === 200) {
          showToast('Entry added successfully!', 'success');
          resetForm();
        } else {
          showToast('Failed to add entry.', 'error');
        }
      })
      .catch((err) => {
        showToast(err.response?.data || 'Failed to add entry.', 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="inventory-bg">
      <div
        className="container inventory-container py-5"
        style={{ width: '98%', maxWidth: '100vw', margin: '0 auto', paddingTop: '70px' }}
      >
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold" aria-label="Update Inventory">
                  <span role="img" aria-label="inventory">🛢️</span> Update Inventory
                </h3>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  style={{ borderRadius: '4px', padding: '4px 8px' }}
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Product</label>
                    <select
                      className="form-select form-control-lg"
                      name="productId"
                      value={formData.productId}
                      onChange={handleProductSelect}
                      style={inputStyle}
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.productId} value={p.productId}>{p.productName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Employee</label>
                    <select
                      className="form-select form-control-lg"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      style={inputStyle}
                      required
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map((e) => (
                        <option key={e.employeeId} value={e.employeeId}>{e.name} ({e.employeeId})</option>
                      ))}
                    </select>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Current Level ({formData.metric})</label>
                      <input
                        type="number"
                        className="form-control form-control-lg readonly-input"
                        value={formData.currentLevel}
                        readOnly
                        style={inputStyle}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Tank Capacity ({formData.metric})</label>
                      <input
                        type="number"
                        className="form-control form-control-lg readonly-input"
                        value={formData.tankCapacity}
                        readOnly
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">New Quantity ({formData.metric})</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="newQty"
                        value={formData.newQty}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        style={inputStyle}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Refill Space ({formData.metric})</label>
                      <input
                        type="number"
                        className="form-control form-control-lg readonly-input"
                        value={formData.refillSpace}
                        readOnly
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading}>Clear</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Entry'}
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

export default UpdateInventory;