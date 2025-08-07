import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UpdatePrice.css'
import 'animate.css';

const UpdatePrice = () => {
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success', // 'success' or 'error'
    progress: 100
  });

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

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type, progress: 100 });

    let progress = 100;
    const interval = setInterval(() => {
      progress -= 1;
      if (progress <= 0) {
        clearInterval(interval);
        setToast((prev) => ({ ...prev, visible: false }));
      } else {
        setToast((prev) => ({ ...prev, progress }));
      }
    }, 30); // total duration = 3s
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
    <div className="container py-4">
      <h2 className="mb-4">Update Product Price</h2>

      {/* Toast Message */}
      {toast.visible && (
        <div
          className={`toast show position-fixed top-0 end-0 m-3 animate__animated animate__fadeInRight text-white ${
            toast.type === 'success' ? 'bg-success' : 'bg-danger'
          }`}
          role="alert"
          style={{ zIndex: 9999, minWidth: '250px' }}
        >
          <div className="toast-body d-flex justify-content-between align-items-center">
            {toast.message}
          </div>
          <div className="progress" style={{ height: '3px' }}>
            <div
              className={`progress-bar ${toast.type === 'success' ? 'bg-light' : 'bg-white'}`}
              role="progressbar"
              style={{
                width: `${toast.progress}%`,
                transition: 'width 0.03s linear'
              }}
            ></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
        <div className="mb-3">
          <label className="form-label">Select Product</label>
          <select
            className="form-select"
            value={selectedProduct?.productId || ''}
            onChange={handleProductSelect}
            required
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
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Select Employee</label>
              <select
                className="form-select"
                value={employeeId}
                onChange={handleEmployeeSelect}
                required
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
  );
};

export default UpdatePrice;
