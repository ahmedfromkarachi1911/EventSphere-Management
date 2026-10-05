import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye } from "lucide-react";

import { getMyApplications } from "../../../services/api";

const statusBadge = {
  approved: "badge-success",
  pending: "badge-warning",
  rejected: "badge-danger",
};

export default function ExhibitorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await getMyApplications();

        if (Array.isArray(data)) {
          setApplications(data);
        } else {
          setMessage(
            data.message || "Unable to load applications"
          );
        }
      } catch (error) {
        setMessage("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  const getBoothType = (applicationMessage) => {
    if (!applicationMessage) {
      return "-";
    }

    const line = applicationMessage
      .split("\n")
      .find((item) => item.startsWith("Booth Type:"));

    if (!line) {
      return "-";
    }

    return line.replace("Booth Type:", "").trim();
  };

  const handleView = (application) => {
    alert(application.message || "No application details");
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>My Applications</h1>

          <p>
            Track the status of your expo applications.
          </p>
        </div>

        <Link
          to="/exhibitor/applications/apply"
          className="btn btn-primary"
        >
          <Plus size={16} />
          Apply for Expo
        </Link>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            color: "#dc2626",
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            No applications yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expo</th>
                  <th>Submitted</th>
                  <th>Booth Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((application) => (
                  <tr key={application._id}>
                    <td className="cell-strong">
                      {application.expo?.title ||
                        "Expo unavailable"}
                    </td>

                    <td>
                      {formatDate(
                        application.createdAt
                      )}
                    </td>

                    <td>
                      {getBoothType(
                        application.message
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          statusBadge[
                            application.status
                          ] || "badge-neutral"
                        }`}
                      >
                        {application.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() =>
                          handleView(application)
                        }
                      >
                        <Eye size={15} />
                      </button>
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