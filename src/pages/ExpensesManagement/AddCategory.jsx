import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://pulse-766719709317.asia-south1.run.app/categoryList');
      setCategories(response.data || []);
    } catch (err) {
      showToast('Failed to fetch categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await axios.post('https://pulse-766719709317.asia-south1.run.app/categoryPost', { name: categoryName });
      setCategoryName('');
      showToast('Category added successfully!', 'success');
      fetchCategories();
    } catch (err) {
      showToast('Category might already exist.', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await axios.delete(`https://pulse-766719709317.asia-south1.run.app/categoryDelete/${id}`);
      showToast('Category deleted.', 'success');
      fetchCategories();
    } catch (err) {
      showToast('Failed to delete category.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h3 className="fw-bold text-primary"><FaPlus className="me-2" />Add Expense Category</h3>
      </div>

      {/* Toast Message */}
      {toast.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
          <div className={`toast show animate__animated animate__fadeInRight text-white ${toast.type === 'success' ? 'bg-success-soft' : 'bg-danger-soft'} shadow rounded`}>
            <div className="d-flex justify-content-between align-items-center px-3 py-2">
              <strong className="me-auto">{toast.message}</strong>
            </div>
            <div className={`toast-progress-bar ${toast.type}`} />
          </div>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={handleSubmitCategory} className="row g-3 justify-content-center mb-4">
        <div className="col-md-6 col-sm-10">
          <input
            type="text"
            className="form-control rounded shadow-sm"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-primary px-4 shadow-sm">Add</button>
        </div>
      </form>

      {/* Category Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="text-center text-muted">Loading...</div>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted">No categories added yet.</p>
        ) : (
          <table className="table table-bordered table-hover align-middle text-center shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>{index + 1}</td>
                  <td>{cat.name}</td>
                  <td>
                    <FaTrashAlt
                      className="text-danger"
                      role="button"
                      title="Delete"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddCategory;
