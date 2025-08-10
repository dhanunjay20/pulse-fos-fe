import React, { useState } from 'react';
import axios from 'axios';
import { showToast } from '../../components/ToastProvider';
import { useNavigate } from 'react-router-dom';

const UploadDocument = () => {
  const [formData, setFormData] = useState({
    documentType: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    renewalPeriodDays: '',
    responsibleParty: '',
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      documentType: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      renewalPeriodDays: '',
      responsibleParty: '',
      notes: ''
    });
    setFile(null);
    document.getElementById('fileInput').value = '';
  };

  const handleCancel = () => {
    navigate('/dashboard/documents/view');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload.', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      data.append('file', file);

      await axios.post(
        'https://pulse-766719709317.asia-south1.run.app/api/documents',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      showToast('Document uploaded successfully', 'success');
      resetForm();
      setTimeout(() => navigate('/dashboard/documents/view'), 2000);
    } catch (err) {
      showToast('Failed to upload document', 'error');
    } finally {
      setLoading(false);
    }
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
                  <span role="img" aria-label="doc">📄</span> Upload New Document
                </h3>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Document Type *</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Fitness Certificate"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Issuing Authority</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="issuingAuthority"
                        value={formData.issuingAuthority}
                        onChange={handleChange}
                        placeholder="e.g., RTO"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Issue Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Renewal Period (Days)</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="renewalPeriodDays"
                        value={formData.renewalPeriodDays}
                        onChange={handleChange}
                        placeholder="e.g., 365"
                        min="0"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Responsible Party</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="responsibleParty"
                        value={formData.responsibleParty}
                        onChange={handleChange}
                        placeholder="e.g., Rahul Sharma"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Scanned Copy / Digital File *</label>
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        id="fileInput"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes / Comments</label>
                      <textarea
                        className="form-control form-control-lg"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="e.g., Must renew before expiry"
                      />
                    </div>
                  </div>
                  <div className="mt-4 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Document'}
                    </button>
                  </div>
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

export default UploadDocument;