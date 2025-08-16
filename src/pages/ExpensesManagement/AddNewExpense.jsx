import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

const AddNewExpense = () => {
  const [categories, setCategories] = useState([]);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [form, setForm] = useState({
    category: '',
    employeeId: '',
    expenseDate: '',
    description: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchEmployeeIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('https://pulse-766719709317.asia-south1.run.app/categoryList');
      setCategories(res.data || []);
    } catch {
      showToast('Failed to fetch categories.', 'error');
    }
  };

  const fetchEmployeeIds = async () => {
    try {
      const res = await axios.get('https://pulse-766719709317.asia-south1.run.app/active');
      setEmployeeIds(res.data || []);
    } catch {
      showToast('Failed to fetch employee list.', 'error');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    navigate('/dashboard/expenses/view');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        expenseDate: form.expenseDate,
        employeeId: form.employeeId
      };

      await axios.post('https://pulse-766719709317.asia-south1.run.app/expensesPost', payload);
      showToast('Expense added successfully.', 'success');

      setForm({
        category: '',
        employeeId: '',
        expenseDate: '',
        description: '',
        amount: ''
      });
    } catch {
      showToast('Failed to add expense. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventory-bg" style={{ minHeight: '100vh' }}>
      <div
        className="container inventory-container py-5"
        style={{ width: '98%', maxWidth: '100vw' }}
      >
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold">
                  <span role="img" aria-label="expense">💸</span> Add Expense
                </h3>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Category *</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="form-select form-control-lg"
                        required
                        style={{ height: '45px' }}
                      >
                        <option value="">Select</option>
                        {categories.map((cat, idx) => (
                          <option value={cat.name || cat} key={idx}>
                            {cat.name || cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Employee *</label>
                      <select
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        className="form-select form-control-lg"
                        required
                        style={{ height: '45px' }}
                      >
                        <option value="">Select</option>
                        {employeeIds.map((emp) => {
                          const id = emp.id || emp.employeeId || emp._id || emp;
                          const name = emp.name || emp.employeeName || '';
                          const label = name ? `${name} (${id})` : id;
                          return (
                            <option value={id} key={id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        name="expenseDate"
                        value={form.expenseDate}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="form-control form-control-lg"
                        required
                        style={{ height: '45px' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Description *</label>
                      <input
                        type="text"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        required
                        placeholder="e.g., Travel, Office Rent"
                        style={{ height: '45px' }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Amount (₹) *</label>
                      <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        required
                        placeholder="e.g., 1200"
                        step="0.01"
                        min="0"
                        style={{ height: '45px' }}
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
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Expense'}
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
        `}
      </style>
    </div>
  );
};

export default AddNewExpense;