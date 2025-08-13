import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../components/ToastProvider";

const ViewAllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("https://pulse-766719709317.asia-south1.run.app/active")
      .then((res) => {
        const filtered = res.data.filter(
          (emp) => emp.employeeRole?.toUpperCase() === "EMPLOYEE"
        );
        setEmployees(filtered);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load employees.");
        showToast("Failed to load employees", "error");
        setLoading(false);
      });
  }, []);

  return (
    <div className="inventory-bg">
      <div className="container inventory-container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold">
                  <span role="img" aria-label="employee">👤</span> Employees List
                </h3>
                <span className="badge bg-light text-primary fs-6">
                  {employees.length} Employees
                </span>
              </div>
              <div className="card-body p-4">
                {loading ? (
                  <div className="d-flex flex-column align-items-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <span className="text-muted">Loading employees...</span>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger text-center" role="alert">
                    {error}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp, idx) => (
                          <tr key={emp.employeeId}>
                            <td className="fw-semibold text-secondary">{idx + 1}</td>
                            <td className="fw-bold text-dark">
                              {emp.employeeFirstName} {emp.employeeLastName}
                            </td>
                            <td>{emp.employeeEmail}</td>
                            <td>{emp.employeePhoneNumber}</td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {emp.employeeRole}
                              </span>
                            </td>
                            <td>
                              <span className={`badge rounded-pill px-3 py-2 fs-6 ${
                                emp.active === true ? "bg-success" : "bg-danger"
                              }`}>
                                {emp.active === true ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="card-footer text-end bg-white border-0">
                <small className="text-muted">
                  Last refreshed: {new Date().toLocaleString()}
                </small>
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
        table thead th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
        }
        table tbody tr {
          transition: background 0.2s;
        }
        table tbody tr:hover {
          background: #f0f6ff;
        }
        table td, table th {
          vertical-align: middle;
        }
        `}
      </style>
    </div>
  );
};

export default ViewAllEmployees;