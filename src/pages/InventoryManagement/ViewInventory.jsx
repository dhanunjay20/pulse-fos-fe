import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewInventory.css';

const ViewInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('https://pulse-766719709317.asia-south1.run.app/inventory/latest')
      .then((res) => {
        setInventoryData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('❌ Failed to load inventory: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-5">
      <div className="card shadow fade-in-up">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">📦 Inventory Overview</h3>

          {loading ? (
            <p className="text-center text-muted">Loading inventory data...</p>
          ) : error ? (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Tank Capacity ({inventoryData[0]?.metric || 'L'})</th>
                    <th>Current Level ({inventoryData[0]?.metric || 'L'})</th>
                    <th>Price (₹)</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item, index) => (
                    <tr key={item.productId}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{item.productName || '—'}</td>
                    <td>
                        <span
                          className={`badge rounded-pill ${
                            item.status?.toLowerCase() === 'active'
                              ? 'bg-success'
                              : item.status?.toLowerCase() === 'inactive'
                              ? 'bg-danger'
                              : 'bg-secondary'
                          }`}
                        >
                          {item.status || '—'}
                        </span>
                    </td>

                      <td>{item.tankCapacity ?? '—'}</td>
                      <td>{item.currentLevel ?? '—'}</td>
                      <td>₹ {item.currentPrice ?? '—'}</td>
                      <td>
                        {item.lastUpdated
                          ? new Date(item.lastUpdated).toLocaleString()
                          : '—'}
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
  );
};

export default ViewInventory;
