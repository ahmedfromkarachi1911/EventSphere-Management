import { useEffect, useState } from "react";

import {
  getAdminAnalytics,
} from "../../../services/api.js";

import socket from "../../../services/socket.js";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAnalytics = async (
    showLoading = true
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setMessage("");

      const data = await getAdminAnalytics();

      if (!data || data.message) {
        setMessage(
          data?.message ||
            "Unable to load analytics"
        );

        return;
      }

      setAnalytics(data);
    } catch (error) {
      setMessage("Unable to load analytics");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    const refreshAnalytics = () => {
      loadAnalytics(false);
    };

    socket.on(
      "boothTrafficUpdated",
      refreshAnalytics
    );

    socket.on(
      "boothCreated",
      refreshAnalytics
    );

    socket.on(
      "boothUpdated",
      refreshAnalytics
    );

    socket.on(
      "expoCreated",
      refreshAnalytics
    );

    socket.on(
      "expoUpdated",
      refreshAnalytics
    );

    socket.on(
      "expoDeleted",
      refreshAnalytics
    );

    socket.on(
      "sessionCreated",
      refreshAnalytics
    );

    socket.on(
      "sessionUpdated",
      refreshAnalytics
    );

    socket.on(
      "sessionDeleted",
      refreshAnalytics
    );

    socket.on(
      "expoRegistrationUpdated",
      refreshAnalytics
    );

    socket.on(
      "sessionRegistrationUpdated",
      refreshAnalytics
    );

    socket.on(
      "applicationStatusUpdated",
      refreshAnalytics
    );

    return () => {
      socket.off(
        "boothTrafficUpdated",
        refreshAnalytics
      );

      socket.off(
        "boothCreated",
        refreshAnalytics
      );

      socket.off(
        "boothUpdated",
        refreshAnalytics
      );

      socket.off(
        "expoCreated",
        refreshAnalytics
      );

      socket.off(
        "expoUpdated",
        refreshAnalytics
      );

      socket.off(
        "expoDeleted",
        refreshAnalytics
      );

      socket.off(
        "sessionCreated",
        refreshAnalytics
      );

      socket.off(
        "sessionUpdated",
        refreshAnalytics
      );

      socket.off(
        "sessionDeleted",
        refreshAnalytics
      );

      socket.off(
        "expoRegistrationUpdated",
        refreshAnalytics
      );

      socket.off(
        "sessionRegistrationUpdated",
        refreshAnalytics
      );

      socket.off(
        "applicationStatusUpdated",
        refreshAnalytics
      );
    };
  }, []);

  if (loading) {
    return (
      <div className="empty-state">
        Loading analytics...
      </div>
    );
  }

  if (message || !analytics) {
    return (
      <div className="empty-state">
        {message || "Analytics unavailable"}
      </div>
    );
  }

  const {
    stats = {},
    applicationStatus = {
      pending: 0,
      approved: 0,
      rejected: 0,
    },
    boothStatus = {
      available: 0,
      reserved: 0,
      assigned: 0,
    },
    monthlyAttendance = [],
    popularSessions = [],
    categoryPerformance = [],
    boothTraffic = [],
    expoPerformance = [],
  } = analytics;

  const handleExportReport = () => {
    const rows = [];

    rows.push(["EventSphere Analytics Report"]);

    rows.push([
      "Generated At",
      new Date().toLocaleString(),
    ]);

    rows.push([]);

    rows.push(["Platform Summary"]);
    rows.push(["Metric", "Value"]);
    rows.push([
      "Total Expos",
      stats.totalExpos || 0,
    ]);
    rows.push([
      "Total Exhibitors",
      stats.totalExhibitors || 0,
    ]);
    rows.push([
      "Total Attendees",
      stats.totalAttendees || 0,
    ]);
    rows.push([
      "Expo Registrations",
      stats.totalRegistrations || 0,
    ]);
    rows.push([
      "Total Sessions",
      stats.totalSessions || 0,
    ]);
    rows.push([
      "Total Active Booths",
      stats.totalBooths || 0,
    ]);
    rows.push([
      "Total Booth Visits",
      stats.totalBoothVisits || 0,
    ]);
    rows.push([
      "Unique Booth Visitors",
      stats.uniqueBoothVisitors || 0,
    ]);

    rows.push([]);

    rows.push(["Application Status"]);
    rows.push(["Status", "Count"]);
    rows.push([
      "Pending",
      applicationStatus.pending || 0,
    ]);
    rows.push([
      "Approved",
      applicationStatus.approved || 0,
    ]);
    rows.push([
      "Rejected",
      applicationStatus.rejected || 0,
    ]);

    rows.push([]);

    rows.push(["Booth Allocation"]);
    rows.push(["Status", "Count"]);
    rows.push([
      "Available",
      boothStatus.available || 0,
    ]);
    rows.push([
      "Reserved",
      boothStatus.reserved || 0,
    ]);
    rows.push([
      "Assigned",
      boothStatus.assigned || 0,
    ]);

    rows.push([]);

    rows.push(["Monthly Attendance"]);
    rows.push([
      "Month",
      "Registrations",
    ]);

    monthlyAttendance.forEach((item) => {
      rows.push([
        item.month,
        item.registrations,
      ]);
    });

    rows.push([]);

    rows.push(["Popular Sessions"]);
    rows.push([
      "Session",
      "Expo",
      "Registrations",
    ]);

    popularSessions.forEach((session) => {
      rows.push([
        session.title,
        session.expo,
        session.registrations,
      ]);
    });

    rows.push([]);

    rows.push(["Category Performance"]);
    rows.push([
      "Category",
      "Registrations",
      "Percentage",
    ]);

    categoryPerformance.forEach((item) => {
      rows.push([
        item.category,
        item.registrations,
        `${item.percentage}%`,
      ]);
    });

    rows.push([]);

    rows.push(["Booth Traffic"]);
    rows.push([
      "Booth",
      "Hall",
      "Expo",
      "Company",
      "Total Visits",
      "Unique Visitors",
    ]);

    boothTraffic.forEach((booth) => {
      rows.push([
        booth.boothNumber,
        booth.hall,
        booth.expo,
        booth.company,
        booth.totalVisits,
        booth.uniqueVisitors,
      ]);
    });

    rows.push([]);

    rows.push(["Expo Performance"]);
    rows.push([
      "Expo",
      "Category",
      "Registrations",
      "Occupied Booths",
      "Total Booths",
      "Booth Utilization",
      "Booth Visits",
      "Unique Booth Visitors",
      "Sessions",
      "Session Registrations",
    ]);

    expoPerformance.forEach((expo) => {
      rows.push([
        expo.title,
        expo.category,
        expo.registrations,
        expo.occupiedBooths,
        expo.booths,
        `${expo.boothUtilization}%`,
        expo.boothVisits || 0,
        expo.uniqueBoothVisitors || 0,
        expo.sessions,
        expo.sessionRegistrations,
      ]);
    });

    const escapeCSV = (value) => {
      const text = String(
        value ?? ""
      ).replace(/"/g, '""');

      return `"${text}"`;
    };

    const csvContent = rows
      .map((row) =>
        row.map(escapeCSV).join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    const date =
      new Date()
        .toISOString()
        .split("T")[0];

    link.href = url;

    link.download =
      `EventSphere-Analytics-${date}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const attendanceData =
    monthlyAttendance.map((item) => ({
      label: new Date(
        `${item.month}-01`
      ).toLocaleDateString("en-US", {
        month: "short",
      }),
      value: item.registrations,
    }));

  const maxVal = Math.max(
    ...attendanceData.map(
      (item) => item.value
    ),
    1
  );

  const applicationsBreakdown = [
    {
      label: "Pending",
      value:
        applicationStatus.pending || 0,
      color: "var(--warning)",
    },
    {
      label: "Approved",
      value:
        applicationStatus.approved || 0,
      color: "var(--success)",
    },
    {
      label: "Rejected",
      value:
        applicationStatus.rejected || 0,
      color: "var(--danger)",
    },
  ];

  const totalApplications =
    applicationsBreakdown.reduce(
      (total, item) =>
        total + item.value,
      0
    );

  let accumulated = 0;

  const gradientParts =
    totalApplications > 0
      ? applicationsBreakdown.map(
          (segment) => {
            const start =
              (accumulated /
                totalApplications) *
              360;

            accumulated += segment.value;

            const end =
              (accumulated /
                totalApplications) *
              360;

            return `${segment.color} ${start}deg ${end}deg`;
          }
        )
      : [
          "var(--neutral-bg) 0deg 360deg",
        ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Analytics</h1>

          <p>
            Platform-wide performance at a glance.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleExportReport}
        >
          Export Report
        </button>
      </div>

      <div className="grid grid-4">
        <div className="card">
          <div className="stat-value">
            {stats.totalExpos || 0}
          </div>

          <div className="stat-label">
            Total Expos
          </div>
        </div>

        <div className="card">
          <div className="stat-value">
            {stats.totalExhibitors || 0}
          </div>

          <div className="stat-label">
            Total Exhibitors
          </div>
        </div>

        <div className="card">
          <div className="stat-value">
            {(
              stats.totalAttendees || 0
            ).toLocaleString()}
          </div>

          <div className="stat-label">
            Total Attendees
          </div>
        </div>

        <div className="card">
          <div className="stat-value">
            {(
              stats.totalRegistrations || 0
            ).toLocaleString()}
          </div>

          <div className="stat-label">
            Expo Registrations
          </div>
        </div>
      </div>

      <div className="grid grid-2 mt-6">
        <div className="card">
          <div className="stat-value">
            {(
              stats.totalBoothVisits || 0
            ).toLocaleString()}
          </div>

          <div className="stat-label">
            Total Booth Visits
          </div>
        </div>

        <div className="card">
          <div className="stat-value">
            {(
              stats.uniqueBoothVisitors || 0
            ).toLocaleString()}
          </div>

          <div className="stat-label">
            Unique Booth Visitors
          </div>
        </div>
      </div>

      <div className="grid grid-2 mt-6">
        <div className="card">
          <div className="card-title">
            Attendance Trend
          </div>

          {attendanceData.length === 0 ? (
            <div className="empty-state mt-4">
              No registration data yet.
            </div>
          ) : (
            <div className="bar-chart mt-4">
              {attendanceData.map(
                (item) => (
                  <div
                    className="bar-col"
                    key={item.label}
                    title={`${item.value} registrations`}
                  >
                    <div
                      className="bar"
                      style={{
                        height: `${
                          (item.value /
                            maxVal) *
                          140
                        }px`,
                      }}
                    />

                    <span>
                      {item.label}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">
            Application Status
          </div>

          <div className="donut-wrap mt-4">
            <div
              className="donut"
              style={{
                background: `conic-gradient(${gradientParts.join(
                  ","
                )})`,
              }}
            />

            <div>
              {applicationsBreakdown.map(
                (segment) => (
                  <div
                    className="legend-item"
                    key={
                      segment.label
                    }
                  >
                    <span
                      className="legend-dot"
                      style={{
                        background:
                          segment.color,
                      }}
                    />

                    {segment.label} —{" "}
                    {segment.value}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2 mt-6">
        <div className="card">
          <div className="card-title">
            Booth Allocation
          </div>

          <div
            className="mt-4"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div className="flex justify-between">
              <span>Available</span>

              <span className="text-muted">
                {boothStatus.available ||
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Reserved</span>

              <span className="text-muted">
                {boothStatus.reserved ||
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Assigned</span>

              <span className="text-muted">
                {boothStatus.assigned ||
                  0}
              </span>
            </div>

            <div className="flex justify-between">
              <span>
                Total Active Booths
              </span>

              <span className="text-muted">
                {stats.totalBooths || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            Popular Sessions
          </div>

          {popularSessions.length ===
          0 ? (
            <div className="empty-state mt-4">
              No session registrations yet.
            </div>
          ) : (
            <div
              className="mt-4"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {popularSessions.map(
                (session) => (
                  <div
                    key={
                      session.sessionId
                    }
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="cell-strong">
                          {
                            session.title
                          }
                        </div>

                        <div
                          className="text-muted"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {session.expo}
                        </div>
                      </div>

                      <span className="badge badge-neutral">
                        {
                          session.registrations
                        }{" "}
                        registered
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Booth Traffic
        </div>

        {boothTraffic.length === 0 ? (
          <div className="empty-state mt-4">
            No booth visits recorded yet.
          </div>
        ) : (
          <div className="table-wrap mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booth</th>
                  <th>Hall</th>
                  <th>Expo</th>
                  <th>Company</th>
                  <th>Total Visits</th>
                  <th>
                    Unique Visitors
                  </th>
                </tr>
              </thead>

              <tbody>
                {boothTraffic.map(
                  (booth) => (
                    <tr
                      key={
                        booth.boothId
                      }
                    >
                      <td className="cell-strong">
                        {
                          booth.boothNumber
                        }
                      </td>

                      <td>
                        {booth.hall}
                      </td>

                      <td>
                        {booth.expo}
                      </td>

                      <td>
                        {booth.company}
                      </td>

                      <td>
                        {booth.totalVisits}
                      </td>

                      <td>
                        {
                          booth.uniqueVisitors
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Category Performance
        </div>

        {categoryPerformance.length ===
        0 ? (
          <div className="empty-state mt-4">
            No category registration data yet.
          </div>
        ) : (
          <div
            className="mt-4"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {categoryPerformance.map(
              (item) => (
                <div
                  key={item.category}
                >
                  <div
                    className="flex justify-between"
                    style={{
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span>
                      {item.category}
                    </span>

                    <span className="text-muted">
                      {item.registrations}{" "}
                      registrations ·{" "}
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Expo Performance
        </div>

        {expoPerformance.length ===
        0 ? (
          <div className="empty-state mt-4">
            No expo data available.
          </div>
        ) : (
          <div className="table-wrap mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expo</th>
                  <th>
                    Registrations
                  </th>
                  <th>Booths</th>
                  <th>
                    Booth Utilization
                  </th>
                  <th>
                    Booth Visits
                  </th>
                  <th>
                    Unique Visitors
                  </th>
                  <th>Sessions</th>
                  <th>
                    Session Registrations
                  </th>
                </tr>
              </thead>

              <tbody>
                {expoPerformance.map(
                  (expo) => (
                    <tr
                      key={
                        expo.expoId
                      }
                    >
                      <td>
                        <div className="cell-strong">
                          {expo.title}
                        </div>

                        <div
                          className="text-muted"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {
                            expo.category
                          }
                        </div>
                      </td>

                      <td>
                        {
                          expo.registrations
                        }
                      </td>

                      <td>
                        {
                          expo.occupiedBooths
                        }
                        /{expo.booths}
                      </td>

                      <td>
                        {
                          expo.boothUtilization
                        }
                        %
                      </td>

                      <td>
                        {expo.boothVisits ||
                          0}
                      </td>

                      <td>
                        {expo.uniqueBoothVisitors ||
                          0}
                      </td>

                      <td>
                        {expo.sessions}
                      </td>

                      <td>
                        {
                          expo.sessionRegistrations
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}