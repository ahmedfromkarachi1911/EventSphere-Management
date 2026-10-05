import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
} from "lucide-react";

import {
  getMyApplications,
  getMyDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../../../services/api";

export default function ExhibitorDocuments() {
  const fileInputRef = useRef(null);

  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [applicationId, setApplicationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [applicationData, documentData] =
        await Promise.all([
          getMyApplications(),
          getMyDocuments(),
        ]);

      if (Array.isArray(applicationData)) {
        setApplications(applicationData);
      }

      if (Array.isArray(documentData)) {
        setDocuments(documentData);
      }
    } catch (error) {
      setMessage("Unable to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUploadClick = () => {
    if (!applicationId) {
      setMessage("Please select an expo application first");
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Only PDF and DOCX files are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size must be 10MB or less");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const data = await uploadDocument(
        applicationId,
        file
      );

      if (data.document) {
        setMessage("Document uploaded successfully");

        await loadData();
      } else {
        setMessage(
          data.message || "Unable to upload document"
        );
      }
    } catch (error) {
      setMessage("Unable to upload document");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (document) => {
    try {
      setMessage("");

      const blob = await downloadDocument(document._id);

      const url = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");

      link.href = url;
      link.download = document.name;

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(
        error.message || "Unable to download document"
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const data = await deleteDocument(id);

      if (data.message === "Document deleted successfully") {
        setDocuments((currentDocuments) =>
          currentDocuments.filter(
            (document) => document._id !== id
          )
        );

        setMessage("Document deleted successfully");
      } else {
        setMessage(
          data.message || "Unable to delete document"
        );
      }
    } catch (error) {
      setMessage("Unable to delete document");
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">
          Loading documents...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Documents</h1>

          <p>
            Upload and manage your company's compliance
            documents.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      <div className="card">
        <div
          className="form-group"
          style={{ marginBottom: 16 }}
        >
          <label className="form-label">
            Expo Application
          </label>

          <select
            className="input"
            value={applicationId}
            onChange={(e) => {
              setApplicationId(e.target.value);
              setMessage("");
            }}
          >
            <option value="">
              Select expo application
            </option>

            {applications.map((application) => (
              <option
                key={application._id}
                value={application._id}
              >
                {application.expo?.title ||
                  "Expo"}{" "}
                - {application.status}
              </option>
            ))}
          </select>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div
          className="upload-box"
          onClick={handleUploadClick}
          style={{
            cursor: uploading
              ? "not-allowed"
              : "pointer",
          }}
        >
          <UploadCloud size={26} />

          <span style={{ fontSize: 13 }}>
            {uploading
              ? "Uploading document..."
              : "Click to upload document"}
          </span>

          <span style={{ fontSize: 12 }}>
            PDF, DOCX up to 10MB
          </span>
        </div>
      </div>

      <div className="card mt-6">
        {documents.length === 0 ? (
          <div className="empty-state">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Expo</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => (
                  <tr key={document._id}>
                    <td className="avatar-cell">
                      <span
                        className="stat-icon"
                        style={{
                          width: 32,
                          height: 32,
                        }}
                      >
                        <FileText size={15} />
                      </span>

                      <span className="cell-strong">
                        {document.name}
                      </span>
                    </td>

                    <td>
                      {document.expo?.title || "-"}
                    </td>

                    <td>
                      {document.fileType ===
                      "application/pdf"
                        ? "PDF"
                        : "DOCX"}
                    </td>

                    <td>
                      {formatSize(document.fileSize)}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          document.status === "verified"
                            ? "badge-success"
                            : document.status === "rejected"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-icon"
                          onClick={() =>
                            handleDownload(document)
                          }
                          title="Download"
                        >
                          <Download size={15} />
                        </button>

                        <button
                          className="btn-icon"
                          onClick={() =>
                            handleDelete(document._id)
                          }
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}