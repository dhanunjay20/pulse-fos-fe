import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../components/ToastProvider";

const API_URL = "https://pulse-766719709317.asia-south1.run.app/recent-entries";
const DELETE_URL = "https://pulse-766719709317.asia-south1.run.app/entry";

const SalesCollectionHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = () => {
    setLoading(true);
    axios
      .get(API_URL)
      .then((res) => {
        setEntries(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        showToast("Failed to load recent entries.", "error");
        setLoading(false);
      });
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${DELETE_URL}/${entryId}`);
      showToast("Entry deleted successfully.", "success");
      fetchEntries();
    } catch {
      showToast("Failed to delete entry.", "error");
    }
  };

  // Find the entry with the latest date
  const latestEntryIdx = entries.reduce((latestIdx, entry, idx, arr) => {
    const date = new Date(entry?.entrySaleData?.date ?? 0);
    const latestDate = new Date(arr[latestIdx]?.entrySaleData?.date ?? 0);
    return date > latestDate ? idx : latestIdx;
  }, 0);

  return (
    <div className="inventory-bg">
      <div className="container inventory-container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white">
                <h3 className="mb-0 fw-bold">
                  <span role="img" aria-label="history">📜</span> Recent Sales & Collections
                </h3>
              </div>
              <div className="card-body p-4">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Gun</th>
                          <th>Opening</th>
                          <th>Closing</th>
                          <th>Cash Received</th>
                          <th>Phone Pay</th>
                          <th>Credit Card</th>
                          <th>Employee ID</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, idx) => {
                          const sale = entry.entrySaleData ?? {};
                          const collection = entry.entryCollectionData ?? {};
                          const products = Array.isArray(sale.products) ? sale.products : [];
                          return products.map((p, i) => (
                            <tr key={`${entry.entryId}-${p.productName}-${p.gun}-${i}`}>
                              <td>{p.productName ?? ""}</td>
                              <td>{p.gun ?? ""}</td>
                              <td>{p.opening !== undefined ? Number(p.opening).toFixed(2) : ""}</td>
                              <td>{p.closing !== undefined ? Number(p.closing).toFixed(2) : ""}</td>
                              <td>{collection.cashReceived !== undefined ? Number(collection.cashReceived).toFixed(2) : ""}</td>
                              <td>{collection.phonePay !== undefined ? Number(collection.phonePay).toFixed(2) : ""}</td>
                              <td>{collection.creditCard !== undefined ? Number(collection.creditCard).toFixed(2) : ""}</td>
                              <td>{sale.employeeId ?? ""}</td>
                              <td>
                                {idx === latestEntryIdx && i === products.length - 1 && (
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(entry.entryId)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ));
                        })}
                        {entries.length === 0 && (
                          <tr>
                            <td colSpan={9} className="text-center">No entries found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
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

export default SalesCollectionHistory;