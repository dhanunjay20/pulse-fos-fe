import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

const inputStyle = { height: '48px', borderRadius: '8px' };

const UpdatePrice = () => {
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://pulse-766719709317.asia-south1.run.app/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Error fetching products:', err));

    axios
      .get('https://pulse-766719709317.asia-south1.run.app/active')
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error('Error fetching employees:', err));
  }, []);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.productId.toString() === productId);
    setSelectedProduct(product);
    setPrice(product?.price || '');
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleEmployeeSelect = (e) => {
    setEmployeeId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !price || !employeeId) {
      showToast('Please select product, new price, and employee.', 'error');
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `https://pulse-766719709317.asia-south1.run.app/products/${selectedProduct.productId}/price`,
        null,
        {
          params: {
            newPrice: price,
            employeeId: employeeId
          }
        }
      );

      showToast(`Price updated successfully for ${selectedProduct.productName}.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update price.', 'error');
    }

    setLoading(false);
  };

  return (
    <div className="inventory-bg">
      <div
        className="container inventory-container py-5"
        style={{ width: '98%', maxWidth: '100vw', margin: '0 auto' }}
      >
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold" aria-label="Update Product Price">
                  <span role="img" aria-label="price">💲</span> Update Product Price
                </h3>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  style={{ borderRadius: '4px', padding: '4px 8px' }}
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} className="border-0 p-0 bg-transparent">
                  <div className="mb-3">
                    <label className="form-label">Select Product</label>
                    <select
                      className="form-select"
                      value={selectedProduct?.productId || ''}
                      onChange={handleProductSelect}
                      required
                      style={inputStyle}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((product) => (
                        <option key={product.productId} value={product.productId}>
                          {product.productName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProduct && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Current Price</label>
                        <input
                          type="text"
                          className="form-control"
                          value={selectedProduct.price}
                          readOnly
                          style={inputStyle}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">New Price</label>
                        <input
                          type="number"
                          className="form-control"
                          value={price}
                          onChange={handlePriceChange}
                          required
                          min="0"
                          step="0.01"
                          style={inputStyle}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Select Employee</label>
                        <select
                          className="form-select"
                          value={employeeId}
                          onChange={handleEmployeeSelect}
                          required
                          style={inputStyle}
                        >
                          <option value="">-- Select Employee --</option>
                          {employees.map((e) => (
                            <option key={e.employeeId} value={e.employeeId}>
                              {e.name} ({e.employeeId})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Price'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          .inventory-bg {
            min-height: 100vh;
            background: #f8fafc;
          }
          .inventory-container {
            width: 98%;
            max-width: 100vw;
            margin: 0 auto;
          }
          .inventory-card {
            border-radius: 1.25rem;
            overflow: hidden;
          }
          .bg-gradient-primary {
            background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%) !important;
          }
        `}
      </style>
    </div>
  );
};

export default UpdatePrice;