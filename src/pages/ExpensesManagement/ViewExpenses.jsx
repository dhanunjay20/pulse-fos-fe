import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import './ViewExpenses.css'; // you can keep your custom CSS; inline styles below enforce the UI rules

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '', ts: null });

  const [fromDate, setFromDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, fromDate, toDate, selectedCategory]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://pulse-766719709317.asia-south1.run.app/expensesList');
      const data = response.data || [];

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const currentMonthExpenses = data.filter((expense) => {
        const expenseDate = new Date(expense.expenseDate || expense.date);
        return expenseDate >= firstDay && expenseDate <= lastDay;
      });

      setExpenses(currentMonthExpenses);

      const uniqueCategories = [...new Set(currentMonthExpenses.map((e) => e.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (err) {
      showToast('Failed to fetch expenses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate || expense.date);
      const matchesDate = expenseDate >= from && expenseDate <= to;
      const matchesCategory = selectedCategory ? expense.category === selectedCategory : true;
      return matchesDate && matchesCategory;
    });

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`https://pulse-766719709317.asia-south1.run.app/categoryDelete/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id && e.id !== id));
      showToast('Expense deleted successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete expense.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type, ts: Date.now() });
    setTimeout(() => setToast({ show: false, message: '', type: '', ts: null }), 3000);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/expenses/edit/${id}`);
  };

  const handleAddNewExpense = () => {
    navigate('/dashboard/expenses/add');
  };

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  return (
    <>
      {/* Toast */}
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 10555 }} key={toast.ts}>
          <div
            className={`toast align-items-center show animate__animated animate__fadeInRight ${toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}
            role="alert"
          >
            <div className="d-flex justify-content-between align-items-center px-3 py-2">
              <div>{toast.message}</div>
            </div>
            <div className={`toast-progress ${toast.type === 'success' ? 'success' : 'error'}`} />
          </div>
        </div>
      )}

      {/* Main wrapper - 90% width, max 1440px */}
      <div style={{ width: '90%', maxWidth: '1440px', margin: '0 auto' }} className="my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-primary mb-0"><FaFileAlt className="me-2" />View Expenses</h3>
          <button
            className="btn btn-primary shadow-sm d-flex align-items-center"
            onClick={handleAddNewExpense}
            style={{ height: '48px' }}
          >
            <FaPlus className="me-1" /> Add Expense
          </button>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-control shadow-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ height: '48px' }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-control shadow-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ height: '48px' }}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <select
              className="form-select shadow-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ height: '48px' }}
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3 fw-bold text-success">
          Total Expenses: ₹{totalAmount.toFixed(2)}
        </div>

        {loading && <div className="text-primary">Loading...</div>}
        {!loading && filteredExpenses.length === 0 ? (
          <div className="alert alert-info">No expenses found for the selected criteria.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover text-center align-middle">
              <thead className="table-primary text-dark">
                <tr>
                  <th className="text-center">Date</th>
                  <th className="text-center">Description</th>
                  <th className="text-center">Amount</th>
                  <th className="text-center">Category</th>
                  <th className="text-center">Employee ID</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id || expense.id}>
                    <td className="text-center">{new Date(expense.expenseDate || expense.date).toLocaleDateString()}</td>
                    <td className="text-center">{expense.description}</td>
                    <td className="text-center">₹{expense.amount}</td>
                    <td className="text-center">{expense.category}</td>
                    <td className="text-center">{expense.employeeId}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center flex-wrap gap-2">
                        <button
                          className="btn btn-sm btn-outline-warning d-flex align-items-center"
                          onClick={() => handleEdit(expense._id || expense.id)}
                          title="Edit"
                        >
                          <FaEdit className="me-1" /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center"
                          onClick={() => handleDelete(expense._id || expense.id)}
                          title="Delete"
                        >
                          <FaTrashAlt className="me-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewExpenses;
