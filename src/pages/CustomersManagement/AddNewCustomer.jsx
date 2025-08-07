import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddNewCustomer.css';

const AddNewCustomer = () => {
  const [form, setForm] = useState({
    customerName: '',
    customerVehicle: '',
    employeeId: '',
    amountBorrowed: '',
    borrowDate: '',
    dueDate: '',
    status: 'Pending',
    notes: '',
    phone: '',
    address: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return (
      form.customerName &&
      form.phone &&
      form.amountBorrowed &&
      form.borrowDate &&
      form.dueDate
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setToast({ show: false, message: '', type: '' });
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://pulse-766719709317.asia-south1.run.app/borrowers',
        {
          ...form,
          amountBorrowed: parseFloat(form.amountBorrowed) || 0,
          borrowDate: form.borrowDate ? `${form.borrowDate}T00:00:00` : null,
          dueDate: form.dueDate ? `${form.dueDate}T00:00:00` : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Customer added successfully!', 'success');
      setTimeout(() => navigate('/dashboard/customers/view'), 3000);
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || 'Error adding customer',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleCancel = () => {
    navigate('/dashboard/customer/view');
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-3">Add New Customer</h4>
          <p className="text-muted mb-4">Fill in the details below.</p>

          {toast.show && (
            <div
              className={`toast-message animate__animated animate__fadeInRight ${
                toast.type === 'success' ? 'toast-success' : 'toast-error'
              }`}
            >
              {toast.message}
              <div className="toast-progress"></div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  className="form-control"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Customer Vehicle</label>
                <input
                  type="text"
                  name="customerVehicle"
                  className="form-control"
                  value={form.customerVehicle}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-control"
                  value={form.employeeId}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Amount Borrowed (₹) *</label>
                <input
                  type="number"
                  name="amountBorrowed"
                  className="form-control"
                  value={form.amountBorrowed}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Borrow Date *</label>
                <input
                  type="date"
                  name="borrowDate"
                  className="form-control"
                  value={form.borrowDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-control"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  name="notes"
                  className="form-control"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                />
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
                {loading ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewCustomer;
