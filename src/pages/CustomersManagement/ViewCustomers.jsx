import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewCustomers.css";
import "animate.css";

const ViewCustomers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

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
      setToast({ show: true, message: "Borrower updated successfully", type: "success" });
    } catch (err) {
      setToast({ show: true, message: "Failed to update borrower", type: "error" });
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
      alert("Failed to fetch transaction details");
    }
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Borrowers</h2>

      {toast.show && (
        <div
          className={`toast-container position-fixed top-0 end-0 p-3 animate__animated animate__fadeInRight`}
          style={{ zIndex: 1055 }}
        >
          <div className={`toast align-items-center text-white bg-${toast.type === "success" ? "success" : "danger"} border-0 show`}>
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
            </div>
            <div className="toast-progress bg-light"></div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by ID, Name, Vehicle, Phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading borrowers...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover custom-expense-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Last Borrowed</th>
                <th>Due Amount (₹)</th>
                <th>Actions</th>
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
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleUpdateClick(b)}>
                      Update
                    </button>
                    <button className="btn btn-sm btn-info" onClick={() => handleViewDetailsClick(b)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {updateModalOpen && selectedBorrower && (
        <div className="modal d-block" tabIndex="-1">
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
                <p>Current Due Amount: ₹ {selectedBorrower.amountBorrowed}</p>
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

      {detailsModalOpen && (
        <div className="modal d-block" tabIndex="-1">
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
    </div>
  );
};

export default ViewCustomers;
