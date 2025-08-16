import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import { showToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://pulse-766719709317.asia-south1.run.app/categoryList');
      setCategories(response.data || []);
    } catch {
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
    } catch {
      showToast('Category might already exist.', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await axios.delete(`https://pulse-766719709317.asia-south1.run.app/categoryDelete/${id}`);
      showToast('Category deleted.', 'success');
      fetchCategories();
    } catch {
      showToast('Failed to delete category.', 'error');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="inventory-bg" style={{ minHeight: '100vh' }}>
      <div
        className="container inventory-container py-5"
        style={{ width: '98%', maxWidth: '100vw' }}
      >
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card inventory-card shadow-lg border-0">
              <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                <h3 className="mb-0 fw-bold">
                  <FaPlus className="me-2" /> Add Category
                </h3>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmitCategory} className="row g-3 justify-content-center mb-4">
                  <div className="col-md-6 col-sm-10">
                    <input
                      type="text"
                      className="form-control form-control-lg rounded shadow-sm"
                      style={{ height: '45px' }}
                      placeholder="Enter category name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-auto">
                    <button type="submit" className="btn btn-primary px-4 shadow-sm" style={{ height: '45px' }}>
                      Add
                    </button>
                  </div>
                </form>
                <div className="table-responsive">
                  {loading ? (
                    <div className="text-center text-muted">Loading...</div>
                  ) : categories.length === 0 ? (
                    <p className="text-center text-muted">No categories added yet.</p>
                  ) : (
                    <table className="table table-striped table-hover align-middle text-center shadow-sm">
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

export default AddCategory;