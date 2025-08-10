import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../components/ToastProvider";

const ViewInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("https://pulse-766719709317.asia-south1.run.app/inventory/latest")
      .then((res) => {
        setInventoryData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load inventory: " + err.message);
        showToast("Failed to load inventory", "error");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="inventory-bg">
        <div className="container inventory-container py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="card inventory-card shadow-lg border-0">
                <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                  <h3 className="mb-0 fw-bold">
                    <span role="img" aria-label="box">📦</span> Inventory Overview
                  </h3>
                  <span className="badge bg-light text-primary fs-6">
                    {inventoryData.length} Products
                  </span>
                </div>
                <div className="card-body p-4">
                  {loading ? (
                    <div className="d-flex flex-column align-items-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <span className="text-muted">Loading inventory data...</span>
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
                            <th>#</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>
                              Tank Capacity ({inventoryData[0]?.metric || "L"})
                            </th>
                            <th>
                              Current Level ({inventoryData[0]?.metric || "L"})
                            </th>
                            <th>Price (₹)</th>
                            <th>Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryData.map((item, index) => (
                            <tr key={item.productId}>
                              <td className="fw-semibold text-secondary">{index + 1}</td>
                              <td className="fw-bold text-dark">
                                {item.productName || "—"}
                              </td>
                              <td>
                                <span
                                  className={`badge rounded-pill px-3 py-2 fs-6 ${
                                    item.status?.toLowerCase() === "active"
                                      ? "bg-success"
                                      : item.status?.toLowerCase() === "inactive"
                                      ? "bg-danger"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {item.status || "—"}
                                </span>
                              </td>
                              <td>{item.tankCapacity ?? "—"}</td>
                              <td>{item.currentLevel ?? "—"}</td>
                              <td>
                                <span className="fw-semibold text-primary">
                                  ₹ {item.currentPrice ?? "—"}
                                </span>
                              </td>
                              <td>
                                <span className="text-muted">
                                  {item.lastUpdated
                                    ? new Date(item.lastUpdated).toLocaleString()
                                    : "—"}
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

export default ViewInventory;
