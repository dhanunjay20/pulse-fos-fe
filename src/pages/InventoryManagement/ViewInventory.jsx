import React, { useEffect, useState } from "react";
import axios from "axios";
import "animate.css";

const ViewInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    axios
      .get("https://pulse-766719709317.asia-south1.run.app/inventory/latest")
      .then((res) => {
        setInventoryData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("❌ Failed to load inventory: " + err.message);
        showToast("Failed to load inventory", "error");
        setLoading(false);
      });
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`position-fixed top-0 end-0 p-3 animate__animated animate__fadeInRight`}
          style={{ zIndex: 1055 }}
        >
          <div
            className={`toast align-items-center text-white border-0 show ${
              toast.type === "success" ? "bg-success" : "bg-danger"
            }`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
            </div>
            <div
              style={{
                height: "4px",
                background: "rgba(255,255,255,0.7)",
                animation: "progressShrink 3s linear forwards",
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div
        className="container mt-4"
        style={{ width: "90%", maxWidth: "1440px" }}
      >
        <div className="card shadow">
          <div className="card-body">
            <h3 className="card-title text-center mb-4">
              📦 Inventory Overview
            </h3>

            {loading ? (
              <p className="text-center text-muted">Loading inventory data...</p>
            ) : error ? (
              <div
                className="alert alert-danger text-center"
                role="alert"
              >
                {error}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle text-center">
                  <thead className="table-light">
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
                        <td>{index + 1}</td>
                        <td className="fw-semibold">
                          {item.productName || "—"}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
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
                        <td>₹ {item.currentPrice ?? "—"}</td>
                        <td>
                          {item.lastUpdated
                            ? new Date(item.lastUpdated).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast progress bar animation */}
      <style>
        {`
          @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </>
  );
};

export default ViewInventory;
