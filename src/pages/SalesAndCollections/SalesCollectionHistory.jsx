import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../components/ToastProvider";

const SalesCollectionHistory = () => {
  const [sales, setSales] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:8080/sales"),
      axios.get("http://localhost:8080/collections"),
    ])
      .then(([salesRes, collectionsRes]) => {
        setSales(salesRes.data);
        setCollections(collectionsRes.data);
        setLoading(false);
      })
      .catch(() => {
        showToast("Failed to load sales/collections history.", "error");
        setLoading(false);
      });
  }, []);

  return (
    <div className="inventory-bg">
      <div className="container inventory-container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white">
                <h3 className="mb-0 fw-bold">
                  <span role="img" aria-label="history">📜</span> Sales & Collections History
                </h3>
              </div>
              <div className="card-body p-4">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <h4 className="text-secondary mt-2 mb-3">Sales History</h4>
                    <div className="table-responsive mb-4">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Entry ID</th>
                            <th>Date</th>
                            <th>Employee ID</th>
                            <th>Products</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map((s) => (
                            <tr key={s.entryId}>
                              <td>{s.entryId}</td>
                              <td>{s.date}</td>
                              <td>{s.employeeId}</td>
                              <td>
                                {s.products?.map((p, i) => (
                                  <div key={i}>
                                    {p.productName} ({p.gun}): {p.salesLiters}L, ₹{p.salesRupees}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h4 className="text-secondary mb-3">Collections History</h4>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Entry ID</th>
                            <th>Date</th>
                            <th>Employee ID</th>
                            <th>Cash</th>
                            <th>Phone Pay</th>
                            <th>Credit Card</th>
                            <th>Short Collections</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collections.map((c) => (
                            <tr key={c.entryId}>
                              <td>{c.entryId}</td>
                              <td>{c.date}</td>
                              <td>{c.employeeId}</td>
                              <td>{c.cashReceived}</td>
                              <td>{c.phonePay}</td>
                              <td>{c.creditCard}</td>
                              <td>{c.shortCollections}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
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