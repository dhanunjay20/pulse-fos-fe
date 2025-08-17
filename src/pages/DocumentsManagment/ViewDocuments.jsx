import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { showToast } from '../../components/ToastProvider';

const ViewDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://pulse-766719709317.asia-south1.run.app/api/documents");
      setDocuments(res.data || []);
    } catch (err) {
      setError("Failed to load documents.");
      showToast("Failed to load documents.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (fileUrl) => {
    const blobName = fileUrl.split("/").pop();
    try {
      const response = await axios.get(
        `https://pulse-766719709317.asia-south1.run.app/api/documents/${blobName}`
      );
      const signedUrl = response.data;
      window.open(signedUrl, "_blank");
    } catch (error) {
      showToast("Failed to open document.", "error");
    }
  };

  const handleUploadClick = () => {
    navigate("/dashboard/documents/upload");
  };

  return (
    <>
      <div className="inventory-bg">
        <div className="container inventory-container py-5">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="card inventory-card shadow-lg border-0">
                <div className="card-header bg-gradient-primary text-white d-flex align-items-center justify-content-between">
                  <h3 className="mb-0 fw-bold">
                    <FaFileAlt className="me-2" /> All Documents
                  </h3>
                  <span className="badge bg-light text-primary fs-6">
                    {documents.length} Documents
                  </span>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3 d-flex flex-column flex-sm-row gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={handleUploadClick}
                    >
                      Upload Document
                    </button>
                  </div>
                  {loading ? (
                    <div className="text-center text-secondary">Loading documents...</div>
                  ) : error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle inventory-table">
                        <thead>
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
                                <td>{doc.issuingAuthority || "-"}</td>
                                <td>{doc.issueDate || "-"}</td>
                                <td>{doc.expiryDate || "-"}</td>
                                <td className="text-center">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleViewDocument(doc.fileUrl)}
                                  >
                                    View Document
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center text-muted">
                                No documents available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="card-footer text-end bg-white border-0">
                  <small className="text-muted">
                    Last refreshed: {new Date().toLocaleString()}
                  </small>
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
        .inventory-table thead th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
        }
        .inventory-table tbody tr {
          transition: background 0.2s;
        }
        .inventory-table tbody tr:hover {
          background: #f0f6ff;
        }
        .inventory-table td, .inventory-table th {
          vertical-align: middle;
        }
        `}
      </style>
    </>
  );
};

export default ViewDocuments;