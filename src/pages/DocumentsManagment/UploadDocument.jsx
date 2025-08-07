import React, { useState } from 'react';
import axios from 'axios';
import 'animate.css';
import './UploadDocument.css';

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
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      showToast('Please select a file to upload.', 'error');
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      data.append('file', file);

      await axios.post(
        'https://pulse-766719709317.asia-south1.run.app/api/documents',
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      showToast('✅ Document uploaded successfully.', 'success');
      resetForm();
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('❌ Failed to upload document. Please try again.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Upload New Document</h2>

      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label">Document Type *</label>
            <input
              type="text"
              className="form-control"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
              placeholder="e.g., Fitness Certificate"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Issuing Authority</label>
            <input
              type="text"
              className="form-control"
              name="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={handleChange}
              placeholder="e.g., RTO"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label">Issue Date</label>
            <input
              type="date"
              className="form-control"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className="form-control"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label">Renewal Period (Days)</label>
            <input
              type="number"
              className="form-control"
              name="renewalPeriodDays"
              value={formData.renewalPeriodDays}
              onChange={handleChange}
              placeholder="e.g., 365"
              min="0"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Responsible Party</label>
            <input
              type="text"
              className="form-control"
              name="responsibleParty"
              value={formData.responsibleParty}
              onChange={handleChange}
              placeholder="e.g., Rahul Sharma"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Scanned Copy / Digital File *</label>
          <input
            type="file"
            className="form-control"
            id="fileInput"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notes / Comments</label>
          <textarea
            className="form-control"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="e.g., Must renew before expiry"
          />
        </div>

        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Save Document
          </button>
        </div>
      </form>

      {/* Toast Message */}
      {toast.show && (
        <div
          className={`toast-container position-fixed top-0 end-0 p-3 animate__animated animate__fadeInRight`}
          style={{ zIndex: 9999 }}
        >
          <div
            className={`toast align-items-center text-white ${
              toast.type === 'success' ? 'bg-success' : 'bg-danger'
            } show`}
          >
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
            </div>
            <div
              className={`toast-progress ${
                toast.type === 'success' ? 'bg-light' : 'bg-warning'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;
