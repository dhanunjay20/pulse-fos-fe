import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showToast } from '../../components/ToastProvider';

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

    if (!isFormValid()) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

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
      setTimeout(() => navigate('/dashboard/customers/view'), 2000);
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || 'Error adding customer',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/customers/view');
  };

  return (
    <div
      className="container mt-4"
      style={{ width: '96%', maxWidth: '100vw'}}
    >
      <h2 className="mb-4">Add New Customer</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              name="customerName"
              className="form-control form-control-lg"
              value={form.customerName}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Customer Vehicle</label>
            <input
              type="text"
              name="customerVehicle"
              className="form-control form-control-lg"
              value={form.customerVehicle}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              className="form-control form-control-lg"
              value={form.employeeId}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Amount Borrowed (₹) *</label>
            <input
              type="number"
              name="amountBorrowed"
              className="form-control form-control-lg"
              value={form.amountBorrowed}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Borrow Date *</label>
            <input
              type="date"
              name="borrowDate"
              className="form-control form-control-lg"
              value={form.borrowDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              name="dueDate"
              className="form-control form-control-lg"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select form-control-lg"
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
              className="form-control form-control-lg"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Phone *</label>
            <input
              type="tel"
              name="phone"
              className="form-control form-control-lg"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-lg"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-control form-control-lg"
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
  );
};

export default AddNewCustomer;
