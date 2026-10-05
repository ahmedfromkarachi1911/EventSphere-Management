import { useEffect, useState } from "react";

import {
  CalendarDays,
  Users,
  UserRound,
  TicketCheck,
  TrendingUp,
} from "lucide-react";

import {
  getExpos,
  getAdminAnalytics,
} from "../../../services/api.js";

export default function AdminDashboard() {
  const [expos, setExpos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const [expoData, analyticsData] =
          await Promise.all([
            getExpos(),
            getAdminAnalytics(),
          ]);

        if (Array.isArray(expoData)) {
          setExpos(expoData);
        }

        if (
          analyticsData &&
          !analyticsData.message
        ) {
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = analytics?.stats || {
    totalExpos: 0,
    totalExhibitors: 0,
    totalAttendees: 0,
    totalRegistrations: 0,
  };

  const cards = [
    {
      label: "Total Expos",
      value: stats.totalExpos,
      icon: CalendarDays,
    },
    {
      label: "Total Exhibitors",
      value: stats.totalExhibitors,
      icon: Users,
    },
    {
      label: "Total Attendees",
      value: stats.totalAttendees.toLocaleString(),
      icon: UserRound,
    },
    {
      label: "Expo Registrations",
      value: stats.totalRegistrations.toLocaleString(),
      icon: TicketCheck,
    },
  ];

  const monthlyAttendance =
    analytics?.monthlyAttendance || [];

  const monthlyValues = monthlyAttendance.map(
    (item) => item.registrations
  );

  const maxVal =
    monthlyValues.length > 0
      ? Math.max(...monthlyValues)
      : 1;

  const applicationStatus =
    analytics?.applicationStatus || {
      approved: 0,
      pending: 0,
      rejected: 0,
    };

  const applicationsBreakdown = [
    {
      label: "Approved",
      value: applicationStatus.approved,
      color: "#22C55E",
    },
    {
      label: "Pending",
      value: applicationStatus.pending,
      color: "#F59E0B",
    },
    {
      label: "Rejected",
      value: applicationStatus.rejected,
      color: "#EF4444",
    },
  ];

  const totalApplications =
    applicationsBreakdown.reduce(
      (total, item) => total + item.value,
      0
    );

  let acc = 0;

  const gradientParts =
    totalApplications > 0
      ? applicationsBreakdown.map((segment) => {
          const start =
            (acc / totalApplications) * 360;

          acc += segment.value;

          const end =
            (acc / totalApplications) * 360;

          return `${segment.color} ${start}deg ${end}deg`;
        })
      : ["#E5E7EB 0deg 360deg"];

  const recentExpos = expos.slice(0, 5);

  const formatDate = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "-";
    }

    const start =
      new Date(startDate).toLocaleDateString();

    const end =
      new Date(endDate).toLocaleDateString();

    return `${start} - ${end}`;
  };

  const formatMonth = (month) => {
    if (!month) {
      return "-";
    }

    return new Date(
      `${month}-01T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
    });
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of all expos, exhibitors and
            platform activity.
          </p>
        </div>
      </div>

      <div className="grid grid-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="card stat-card"
              key={card.label}
            >
              <div className="stat-icon">
                <Icon size={22} />
              </div>

              <div>
                <div className="stat-value">
                  {loading ? "..." : card.value}
                </div>

                <div className="stat-label">
                  {card.label}
                </div>

                <div className="stat-trend up">
                  <TrendingUp size={13} />
                  Platform overview
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2 mt-6">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                Registration Overview
              </div>

              <div className="card-subtitle">
                Monthly expo registrations
              </div>
            </div>
          </div>

          {monthlyAttendance.length === 0 ? (
            <div className="empty-state">
              No registration data yet.
            </div>
          ) : (
            <div className="bar-chart">
              {monthlyAttendance.map((item) => (
                <div
                  className="bar-col"
                  key={item.month}
                  title={`${item.registrations} registrations`}
                >
                  <div
                    className="bar"
                    style={{
                      height: `${
                        (item.registrations /
                          maxVal) *
                        140
                      }px`,
                    }}
                  />

                  <span>
                    {formatMonth(item.month)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                Exhibitor Applications
              </div>

              <div className="card-subtitle">
                Status breakdown
              </div>
            </div>
          </div>

          {totalApplications === 0 ? (
            <div className="empty-state">
              No exhibitor applications yet.
            </div>
          ) : (
            <div className="donut-wrap">
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
                      key={segment.label}
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
          )}
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <div className="card-title">
            Recent Expos
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expo</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">
                    Loading expos...
                  </td>
                </tr>
              ) : recentExpos.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    No expos available yet.
                  </td>
                </tr>
              ) : (
                recentExpos.map((expo) => (
                  <tr key={expo._id}>
                    <td className="cell-strong">
                      {expo.title}
                    </td>

                    <td>
                      {formatDate(
                        expo.startDate,
                        expo.endDate
                      )}
                    </td>

                    <td>{expo.city}</td>

                    <td>
                      <span
                        className={`badge ${
                          expo.status ===
                          "published"
                            ? "badge-success"
                            : "badge-neutral"
                        }`}
                      >
                        {expo.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}