import { useEffect, useState } from "react";
import {
  Check,
  X,
  Eye,
  Search,
} from "lucide-react";

import {
  getRegisteredExhibitors,
  getApplications,
  updateApplicationStatus,
} from "../../../services/api";

const statusBadge = {
  approved: "badge-success",
  pending: "badge-warning",
  rejected: "badge-danger",
};

export default function AdminExhibitors() {
  const [registeredExhibitors, setRegisteredExhibitors] =
    useState([]);

  const [applications, setApplications] = useState([]);

  const [registeredSearch, setRegisteredSearch] =
    useState("");

  const [applicationSearch, setApplicationSearch] =
    useState("");

  const [status, setStatus] =
    useState("All Status");

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [
        registeredData,
        applicationData,
      ] = await Promise.all([
        getRegisteredExhibitors(),
        getApplications(),
      ]);

      if (Array.isArray(registeredData)) {
        setRegisteredExhibitors(
          registeredData
        );
      } else {
        setRegisteredExhibitors([]);

        setMessage(
          registeredData.message ||
            "Unable to load registered exhibitors"
        );
      }

      if (Array.isArray(applicationData)) {
        setApplications(applicationData);
      } else {
        setApplications([]);

        setMessage(
          applicationData.message ||
            "Unable to load applications"
        );
      }
    } catch (error) {
      setMessage(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatus = async (
    id,
    newStatus
  ) => {
    try {
      setUpdatingId(id);

      const data =
        await updateApplicationStatus(
          id,
          newStatus
        );

      if (data.application) {
        setApplications(
          (currentApplications) =>
            currentApplications.map(
              (application) =>
                application._id === id
                  ? {
                      ...application,
                      status:
                        data.application
                          .status,
                    }
                  : application
            )
        );
      } else {
        alert(
          data.message ||
            "Unable to update application"
        );
      }
    } catch (error) {
      alert(
        "Unable to update application"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRegisteredExhibitors =
    registeredExhibitors.filter(
      (exhibitor) => {
        const searchText =
          registeredSearch
            .trim()
            .toLowerCase();

        const companyName =
          exhibitor.companyName || "";

        const name =
          exhibitor.name || "";

        const email =
          exhibitor.email || "";

        const phone =
          exhibitor.phone || "";

        return (
          companyName
            .toLowerCase()
            .includes(searchText) ||
          name
            .toLowerCase()
            .includes(searchText) ||
          email
            .toLowerCase()
            .includes(searchText) ||
          phone
            .toLowerCase()
            .includes(searchText)
        );
      }
    );

  const filteredApplications =
    applications.filter(
      (application) => {
        const companyName =
          application.exhibitor
            ?.companyName || "";

        const exhibitorName =
          application.exhibitor?.name ||
          "";

        const expoTitle =
          application.expo?.title || "";

        const searchText =
          applicationSearch
            .trim()
            .toLowerCase();

        const matchesSearch =
          companyName
            .toLowerCase()
            .includes(searchText) ||
          exhibitorName
            .toLowerCase()
            .includes(searchText) ||
          expoTitle
            .toLowerCase()
            .includes(searchText);

        const matchesStatus =
          status === "All Status" ||
          application.status ===
            status.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Exhibitors</h1>

          <p>
            View registered exhibitors and
            manage expo applications.
          </p>
        </div>
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
        <div className="card-title">
          Registered Exhibitors
        </div>

        <p
          className="text-muted"
          style={{
            marginTop: 6,
            fontSize: 13,
          }}
        >
          All exhibitor accounts registered
          on EventSphere.
        </p>

        <div
          className="filter-bar"
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <div className="input-icon-wrap">
            <Search size={16} />

            <input
              className="input"
              placeholder="Search registered exhibitors..."
              value={registeredSearch}
              onChange={(e) =>
                setRegisteredSearch(
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    Loading registered
                    exhibitors...
                  </td>
                </tr>
              ) : filteredRegisteredExhibitors
                  .length === 0 ? (
                <tr>
                  <td colSpan="5">
                    No registered exhibitors
                    found.
                  </td>
                </tr>
              ) : (
                filteredRegisteredExhibitors.map(
                  (exhibitor) => (
                    <tr
                      key={
                        exhibitor._id
                      }
                    >
                      <td>
                        <div className="avatar-cell">
                          <div className="avatar-sq">
                            {exhibitor.companyName
                              ?.charAt(0)
                              .toUpperCase() ||
                              exhibitor.name
                                ?.charAt(0)
                                .toUpperCase() ||
                              "E"}
                          </div>

                          <span className="cell-strong">
                            {exhibitor.companyName ||
                              "Not Provided"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {exhibitor.name ||
                          "-"}
                      </td>

                      <td>
                        {exhibitor.email ||
                          "-"}
                      </td>

                      <td>
                        {exhibitor.phone ||
                          "-"}
                      </td>

                      <td>
                        {formatDate(
                          exhibitor.createdAt
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Expo Applications
        </div>

        <p
          className="text-muted"
          style={{
            marginTop: 6,
            fontSize: 13,
          }}
        >
          Review and manage exhibitor expo
          applications.
        </p>

        <div
          className="filter-bar"
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <div className="input-icon-wrap">
            <Search size={16} />

            <input
              className="input"
              placeholder="Search applications..."
              value={applicationSearch}
              onChange={(e) =>
                setApplicationSearch(
                  e.target.value
                )
              }
            />
          </div>

          <select
            className="select"
            style={{
              maxWidth: 180,
            }}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option>
              All Status
            </option>

            <option>
              Approved
            </option>

            <option>
              Pending
            </option>

            <option>
              Rejected
            </option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Expo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    Loading applications...
                  </td>
                </tr>
              ) : filteredApplications
                  .length === 0 ? (
                <tr>
                  <td colSpan="5">
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredApplications.map(
                  (application) => (
                    <tr
                      key={
                        application._id
                      }
                    >
                      <td>
                        <div className="avatar-cell">
                          <div className="avatar-sq">
                            {application
                              .exhibitor
                              ?.companyName
                              ?.charAt(0)
                              .toUpperCase() ||
                              "E"}
                          </div>

                          <span className="cell-strong">
                            {application
                              .exhibitor
                              ?.companyName ||
                              "Unknown Company"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {application
                          .exhibitor
                          ?.name || "-"}
                      </td>

                      <td>
                        {application.expo
                          ?.title || "-"}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            statusBadge[
                              application
                                .status
                            ] ||
                            "badge-neutral"
                          }`}
                        >
                          {
                            application.status
                          }
                        </span>
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="View application message"
                            onClick={() =>
                              alert(
                                application.message ||
                                  "No message provided"
                              )
                            }
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="btn-icon"
                            title="Approve application"
                            style={{
                              color:
                                "var(--success)",
                            }}
                            disabled={
                              updatingId ===
                                application._id ||
                              application.status ===
                                "approved"
                            }
                            onClick={() =>
                              handleStatus(
                                application._id,
                                "approved"
                              )
                            }
                          >
                            <Check
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="btn-icon"
                            title="Reject application"
                            style={{
                              color:
                                "var(--danger)",
                            }}
                            disabled={
                              updatingId ===
                                application._id ||
                              application.status ===
                                "rejected"
                            }
                            onClick={() =>
                              handleStatus(
                                application._id,
                                "rejected"
                              )
                            }
                          >
                            <X
                              size={15}
                            />
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