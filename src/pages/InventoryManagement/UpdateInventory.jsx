import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import './UpdateInventory.css';

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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', timestamp: null });

  useEffect(() => {
    axios.get('https://pulse-766719709317.asia-south1.run.app/inventory/latest')
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast('Failed to load products.', 'danger'));

    axios.get('https://pulse-766719709317.asia-south1.run.app/active')
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast('Failed to load employees.', 'danger'));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type, timestamp: Date.now() });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

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
      showToast('Please fill all required fields.', 'danger');
      setLoading(false);
      return;
    }

    const total = parseFloat(currentLevel) + parseFloat(newQty);
    if (total - parseFloat(tankCapacity) > 0.01) {
      showToast('Tank capacity exceeded.', 'danger');
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
          showToast('Failed to add entry.', 'danger');
        }
      })
      .catch((err) => {
        showToast(err.response?.data || 'Failed to add entry.', 'danger');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mt-4" style={{ width: '90%', maxWidth: '1440px' }}>
      <h2 className="mb-4">Update Inventory</h2>

      {toast.show && (
        <div
          key={toast.timestamp}
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1050 }}
        >
          <div className={`toast show text-white animate__animated animate__fadeInRight bg-${toast.type}`}>
            <div className="toast-body">
              {toast.message}
              <div className="progress mt-2" style={{ height: '4px' }}>
                <div className="progress-bar shrink-bar-animate" />
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Select Product</label>
          <select className="form-select form-control-lg" name="productId" value={formData.productId} onChange={handleProductSelect}>
            <option value="">-- Select Product --</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>{p.productName}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Select Employee</label>
          <select className="form-select form-control-lg" name="employeeId" value={formData.employeeId} onChange={handleChange}>
            <option value="">-- Select Employee --</option>
            {employees.map((e) => (
              <option key={e.employeeId} value={e.employeeId}>{e.name} ({e.employeeId})</option>
            ))}
          </select>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Current Level ({formData.metric})</label>
            <input type="number" className="form-control form-control-lg readonly-input" value={formData.currentLevel} readOnly />
          </div>
          <div className="col-md-6">
            <label>Tank Capacity ({formData.metric})</label>
            <input type="number" className="form-control form-control-lg readonly-input" value={formData.tankCapacity} readOnly />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <label>New Quantity ({formData.metric})</label>
            <input type="number" className="form-control form-control-lg" name="newQty" value={formData.newQty} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div className="col-md-6">
            <label>Refill Space ({formData.metric})</label>
            <input type="number" className="form-control form-control-lg readonly-input" value={formData.refillSpace} readOnly />
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
  );
};

export default UpdateInventory;
