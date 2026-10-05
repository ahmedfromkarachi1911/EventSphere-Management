import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

import {
  getAllDocuments,
  downloadDocument,
  updateDocumentStatus,
} from "../../../services/api";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState("");
  const [downloadingId, setDownloadingId] =
    useState("");
  const [message, setMessage] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAllDocuments();

      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setMessage(
          data.message || "Unable to load documents"
        );
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const companyName =
        document.exhibitor?.companyName || "";

      const exhibitorName =
        document.exhibitor?.name || "";

      const expoTitle =
        document.expo?.title || "";

      const fileName =
        document.name || "";

      const matchesSearch =
        !query ||
        companyName.toLowerCase().includes(query) ||
        exhibitorName.toLowerCase().includes(query) ||
        expoTitle.toLowerCase().includes(query) ||
        fileName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        document.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  const handleStatusUpdate = async (
    document,
    status
  ) => {
    const action =
      status === "verified"
        ? "verify"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${document.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(document._id);
      setMessage("");

      const data = await updateDocumentStatus(
        document._id,
        status
      );

      if (!data.document) {
        setMessage(
          data.message ||
            "Unable to update document status"
        );
        return;
      }

      setDocuments((currentDocuments) =>
        currentDocuments.map((item) =>
          item._id === document._id
            ? data.document
            : item
        )
      );

      setMessage(data.message);
    } catch (error) {
      setMessage(
        "Unable to update document status"
      );
    } finally {
      setProcessingId("");
    }
  };

  const handleDownload = async (document) => {
    try {
      setDownloadingId(document._id);
      setMessage("");

      const blob = await downloadDocument(
        document._id
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = url;
      link.download =
        document.name || "document";

      window.document.body.appendChild(link);

      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to download document"
      );
    } finally {
      setDownloadingId("");
    }
  };

  const formatFileSize = (bytes) => {
    const size = Number(bytes || 0);

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  const getStatusStyle = (status) => {
    if (status === "verified") {
      return {
        color: "#15803d",
        background: "#dcfce7",
      };
    }

    if (status === "rejected") {
      return {
        color: "#b91c1c",
        background: "#fee2e2",
      };
    }

    return {
      color: "#a16207",
      background: "#fef3c7",
    };
  };

  const successMessage =
    message ===
      "Document verified successfully" ||
    message ===
      "Document rejected successfully";

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Documents</h1>

          <p>
            Review and verify documents uploaded by
            exhibitors.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 14,
            color: successMessage
              ? "#16a34a"
              : "#dc2626",
          }}
        >
          {message}
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            className="input-icon-wrap"
            style={{
              flex: 1,
              minWidth: 240,
            }}
          >
            <Search size={15} />

            <input
              className="input"
              placeholder="Search company, exhibitor, expo or document..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <select
            className="select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            style={{
              maxWidth: 180,
            }}
          >
            <option value="all">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="verified">
              Verified
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Exhibitor Documents
        </div>

        <div className="table-wrap mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Exhibitor</th>
                <th>Expo</th>
                <th>Application</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">
                    Loading documents...
                  </td>
                </tr>
              ) : filteredDocuments.length ===
                0 ? (
                <tr>
                  <td colSpan="8">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(
                  (document) => (
                    <tr key={document._id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <FileText size={18} />

                          <div>
                            <div className="cell-strong">
                              {document.name}
                            </div>

                            <div
                              className="text-muted"
                              style={{
                                fontSize: 11,
                              }}
                            >
                              {document.fileType}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="cell-strong">
                          {document.exhibitor
                            ?.companyName ||
                            document.exhibitor
                              ?.name ||
                            "-"}
                        </div>

                        <div
                          className="text-muted"
                          style={{
                            fontSize: 11,
                          }}
                        >
                          {document.exhibitor
                            ?.name || "-"}
                        </div>
                      </td>

                      <td>
                        {document.expo?.title ||
                          "-"}
                      </td>

                      <td>
                        <span
                          style={{
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {document.application
                            ?.status || "-"}
                        </span>
                      </td>

                      <td>
                        {formatFileSize(
                          document.fileSize
                        )}
                      </td>

                      <td>
                        {formatDate(
                          document.createdAt
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            ...getStatusStyle(
                              document.status
                            ),
                            padding: "5px 9px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {document.status}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 7,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="btn"
                            onClick={() =>
                              handleDownload(
                                document
                              )
                            }
                            disabled={
                              downloadingId ===
                              document._id
                            }
                          >
                            <Download size={14} />

                            {downloadingId ===
                            document._id
                              ? "Downloading..."
                              : "Download"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              handleStatusUpdate(
                                document,
                                "verified"
                              )
                            }
                            disabled={
                              processingId ===
                                document._id ||
                              document.status ===
                                "verified"
                            }
                          >
                            <CheckCircle2
                              size={14}
                            />
                            Verify
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() =>
                              handleStatusUpdate(
                                document,
                                "rejected"
                              )
                            }
                            disabled={
                              processingId ===
                                document._id ||
                              document.status ===
                                "rejected"
                            }
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}