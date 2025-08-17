import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../components/ToastProvider";

const ViewCustomers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://pulse-766719709317.asia-south1.run.app/borrowers",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBorrowers(res.data);
      } catch (err) {
        setError("Failed to load borrowers");
        showToast("Failed to load borrowers", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowers();
  }, []);

  const filteredBorrowers = borrowers.filter((b) => {
    const s = searchTerm.toLowerCase();
    return (
      String(b.id).includes(s) ||
      b.customerName?.toLowerCase().includes(s) ||
      b.customerVehicle?.toLowerCase().includes(s) ||
      b.phone?.toLowerCase().includes(s)
    );
  });

  const handleUpdateClick = (borrower) => {
    setSelectedBorrower({
      ...borrower,
      duePaid: "",
      extraBorrowed: "",
      status: borrower.status,
    });
    setUpdateModalOpen(true);
  };

  const getUpdatedDue = () => {
    if (!selectedBorrower) return 0;
    const dueAmount = parseFloat(selectedBorrower.dueAmount) || 0;
    const duePaid = parseFloat(selectedBorrower.duePaid) || 0;
    const extraBorrowed = parseFloat(selectedBorrower.extraBorrowed) || 0;
    return (dueAmount - duePaid + extraBorrowed).toFixed(2);
  };

  const handleUpdateSubmit = async () => {
    const { id, duePaid, extraBorrowed, status } = selectedBorrower;
    const updatedDueAmount = parseFloat(getUpdatedDue());

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://pulse-766719709317.asia-south1.run.app/borrowers/${id}/update`,
        {
          duePaid: parseFloat(duePaid) || 0,
          extraBorrowed: parseFloat(extraBorrowed) || 0,
          status,
          updatedDueAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBorrowers((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, dueAmount: updatedDueAmount, status } : b
        )
      );
      setUpdateModalOpen(false);
      showToast("Borrower updated successfully", "success");
    } catch (err) {
      showToast("Failed to update borrower", "error");
    }
  };

  const handleViewDetailsClick = async (borrower) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://pulse-766719709317.asia-south1.run.app/borrowers/${borrower.id}/transactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions(res.data);
      setDetailsModalOpen(true);
    } catch (err) {
      showToast("Failed to fetch transaction details", "error");
    }
  };

  return (
    <>
      <div className="inventory-bg">
        <div className="container inventory-container py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="card inventory-card shadow-lg border-0">
                <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                  <h3 className="mb-0 fw-bold">
                    <span role="img" aria-label="user">👥</span> Customers
                  </h3>
                  <span className="badge bg-light text-primary fs-6">
                    {borrowers.length} Customers
                  </span>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by ID, Name, Vehicle, Phone"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => navigate("/dashboard/customers/add")}
                    >
                      Add Customer
                    </button>
                  </div>
                  {loading ? (
                    <div className="d-flex flex-column align-items-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <span className="text-muted">Loading borrowers...</span>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger text-center" role="alert">
                      {error}
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle inventory-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Vehicle</th>
                            <th>Last Borrowed</th>
                            <th>Due Amount (₹)</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBorrowers.map((b) => (
                            <tr key={b.id}>
                              <td>{b.id}</td>
                              <td>{b.customerName}</td>
                              <td>{b.phone}</td>
                              <td>{b.customerVehicle}</td>
                              <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                              <td>{b.amountBorrowed?.toLocaleString("en-IN")}</td>
                              <td className="text-center">
                                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                                  <button className="btn btn-sm btn-primary" onClick={() => handleUpdateClick(b)}>
                                    Update
                                  </button>
                                  <button className="btn btn-sm btn-info" onClick={() => handleViewDetailsClick(b)}>
                                    View Details
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
                  <small className="text-muted">
                    Last refreshed: {new Date().toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {updateModalOpen && selectedBorrower && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Borrower</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUpdateModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{selectedBorrower.customerName}</strong> (ID: {selectedBorrower.id})
                </p>
                <p>Current Due Amount: ₹ {selectedBorrower.dueAmount}</p>
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Due Paid"
                  value={selectedBorrower.duePaid}
                  onChange={(e) =>
                    setSelectedBorrower({ ...selectedBorrower, duePaid: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Extra Borrowed"
                  value={selectedBorrower.extraBorrowed}
                  onChange={(e) =>
                    setSelectedBorrower({ ...selectedBorrower, extraBorrowed: e.target.value })
                  }
                />
                <p>Updated Due Amount: ₹ {getUpdatedDue()}</p>
                <select
                  className="form-select"
                  value={selectedBorrower.status}
                  onChange={(e) =>
                    setSelectedBorrower({ ...selectedBorrower, status: e.target.value })
                  }
                >
                  <option>Pending</option>
                  <option>Closed</option>
                  <option>Overdue</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={handleUpdateSubmit}>Save</button>
                <button className="btn btn-secondary" onClick={() => setUpdateModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transaction Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetailsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount Borrowed</th>
                      <th>Due Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={i}>
                        <td>{new Date(t.date).toLocaleDateString()}</td>
                        <td>{t.amountBorrowed}</td>
                        <td>{t.duePaid}</td>
                        <td>{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDetailsModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ViewCustomers;