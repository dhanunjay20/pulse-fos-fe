import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

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
  const [toast, setToast] = useState({ type: '', message: '', ts: null });

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
      showToast('error', 'Failed to fetch categories.');
    }
  };

  const fetchEmployeeIds = async () => {
    try {
      const res = await axios.get('https://pulse-766719709317.asia-south1.run.app/active');
      setEmployeeIds(res.data || []);
    } catch {
      showToast('error', 'Failed to fetch employee list.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      showToast('success', 'Expense added successfully.');

      setForm({
        category: '',
        employeeId: '',
        expenseDate: '',
        description: '',
        amount: ''
      });
    } catch {
      showToast('error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message, ts: Date.now() });
    setTimeout(() => setToast({ type: '', message: '', ts: null }), 3000);
  };

  return (
    <>
      {/* Toast */}
      {toast.message && (
        <div
          className="position-fixed top-0 end-0 p-3 animate__animated animate__fadeInRight"
          style={{ zIndex: 10555 }}
          key={toast.ts}
        >
          <div className={`toast show text-white ${toast.type === 'success' ? 'bg-success' : 'bg-danger'} rounded-3 shadow-sm`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-body fw-semibold">
              {toast.message}
              <div className="progress mt-2 toast-progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: '100%',
                    animation: 'shrinkProgress 3s linear forwards'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: '90%', maxWidth: '1440px', margin: '0 auto' }} className="py-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card shadow-sm rounded-4 border-0">
              <div className="card-body p-4">
                <h4 className="text-center mb-4 text-primary">Add New Expense</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Category</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="form-select  shadow-sm"
                        required
                        style={{ height: '48px' }}
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
                      <label className="form-label fw-medium">Employee</label>
                      <select
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        className="form-select shadow-sm"
                        required
                        style={{ height: '48px' }}
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
                      <label className="form-label fw-medium">Date</label>
                      <input
                        type="date"
                        name="expenseDate"
                        value={form.expenseDate}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="form-control shadow-sm"
                        required
                        style={{ height: '48px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Description</label>
                      <input
                        type="text"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="form-control shadow-sm"
                        required
                        placeholder="e.g., Travel, Office Rent"
                        style={{ height: '48px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">Amount (₹)</label>
                      <input
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="form-control shadow-sm"
                        required
                        placeholder="e.g., 1200"
                        step="0.01"
                        min="0"
                        style={{ height: '48px' }}
                      />
                    </div>

                    <div className="col-12 text-end">
                      <button
                        type="submit"
                        className="btn btn-success px-4 mt-3 d-flex align-items-center justify-content-center"
                        disabled={loading}
                        style={{ height: '48px' }}
                      >
                        {loading ? 'Adding...' : 'Add Expense'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default AddNewExpense;
