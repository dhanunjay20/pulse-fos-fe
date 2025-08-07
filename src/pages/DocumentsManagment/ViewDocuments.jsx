import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ViewDocuments.css'; 

const ViewDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get('https://pulse-766719709317.asia-south1.run.app/api/documents');
        setDocuments(res.data || []);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setError('Failed to load documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDownload = async (fileUrl, docType) => {
    const blobName = fileUrl.split('/').pop();

    try {
      const response = await axios.get(`https://pulse-766719709317.asia-south1.run.app/api/documents/${blobName}`);
      const signedUrl = response.data;

      const link = document.createElement('a');
      link.href = signedUrl;
      link.setAttribute('download', `${docType || 'document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">📄 All Documents</h2>

      {loading ? (
        <div className="text-center text-secondary">Loading documents...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover custom-documents-table">
            <thead className="table-primary">
              <tr>
                <th>Document Type</th>
                <th>Issuing Authority</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th className="text-center">Document</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.documentType}</td>
                    <td>{doc.issuingAuthority || '-'}</td>
                    <td>{doc.issueDate || '-'}</td>
                    <td>{doc.expiryDate || '-'}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleDownload(doc.fileUrl, doc.documentType)}
                      >
                        View Document
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">No documents available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-success px-4"
          onClick={() => (window.location.href = '/dashboard/documents/upload')}
        >
          ➕ Upload New Document
        </button>
      </div>
    </div>
  );
};

export default ViewDocuments;
