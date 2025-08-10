import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaFileAlt } from "react-icons/fa";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "", ts: null });

  const [fromDate, setFromDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [expenses, fromDate, toDate, selectedCategory]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://pulse-766719709317.asia-south1.run.app/expensesList");
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
      showToast("Failed to fetch expenses.", "error");
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
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`https://pulse-766719709317.asia-south1.run.app/categoryDelete/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id && e.id !== id));
      showToast("Expense deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete expense.", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type, ts: Date.now() });
    setTimeout(() => setToast({ show: false, message: "", type: "", ts: null }), 3000);
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/expenses/edit/${id}`);
  };

  // totalAmount and counts come from filteredExpenses (so badges reflect current filters)
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const expensesCount = filteredExpenses.length;

  return (
    <>
      {/* Toast */}
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 10555 }} key={toast.ts}>
          <div
            className={`toast align-items-center show animate__animated animate__fadeInRight ${
              toast.type === "success" ? "bg-success text-white" : "bg-danger text-white"
            }`}
            role="alert"
          >
            <div className="d-flex justify-content-between align-items-center px-3 py-2">
              <div>{toast.message}</div>
            </div>
            <div className={`toast-progress ${toast.type === "success" ? "success" : "error"}`} />
          </div>
        </div>
      )}

      <div className="inventory-bg">
        <div className="container inventory-container py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="card inventory-card shadow-lg border-0">
                <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between flex-wrap">
                  <div className="d-flex align-items-center">
                    <FaFileAlt className="me-2 fs-4" />
                    <h3 className="mb-0 fw-bold">All Expenses</h3>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-2 mt-sm-0">
                    <span className="badge bg-light text-primary fs-6">
                      {expensesCount} {expensesCount === 1 ? "Expense" : "Expenses"}
                    </span>
                    <span className="badge bg-light text-primary fs-6">
                      Total: ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Filters */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label">From Date</label>
                      <input
                        type="date"
                        className="form-control shadow-sm"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={{ height: "48px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">To Date</label>
                      <input
                        type="date"
                        className="form-control shadow-sm"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        style={{ height: "48px" }}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select shadow-sm"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ height: "48px" }}
                      >
                        <option value="">All</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table / content */}
                  {loading && <div className="text-primary">Loading...</div>}
                  {!loading && filteredExpenses.length === 0 ? (
                    <div className="alert alert-info">No expenses found for the selected criteria.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle inventory-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Employee ID</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExpenses.map((expense) => (
                            <tr key={expense._id || expense.id}>
                              <td>{new Date(expense.expenseDate || expense.date).toLocaleDateString()}</td>
                              <td>{expense.description}</td>
                              <td>₹{expense.amount}</td>
                              <td>{expense.category}</td>
                              <td>{expense.employeeId}</td>
                              <td className="text-center">
                                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
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

                <div className="card-footer text-end bg-white border-0">
                  <small className="text-muted">Last refreshed: {new Date().toLocaleString()}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        .inventory-bg {
          min-height: 100vh;
          padding-top: 70px;
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
        .inventory-table thead th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
        }
        .inventory-table tbody tr {
          transition: background 0.2s;
        }
        .inventory-table tbody tr:hover {
          background: #f0f6ff;
        }
        .inventory-table td, .inventory-table th {
          vertical-align: middle;
        }
        `}
      </style>
    </>
  );
};

export default ViewExpenses;
