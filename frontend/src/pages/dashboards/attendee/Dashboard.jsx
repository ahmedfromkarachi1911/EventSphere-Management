import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ListChecks,
  Bookmark,
  CalendarCheck,
  Mail,
  Clock,
  MapPin,
} from "lucide-react";

import {
  getMyRegistrations,
  getMySessionRegistrations,
  getMyBookmarks,
} from "../../../services/api";

export default function AttendeeDashboard() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [registrations, setRegistrations] = useState([]);
  const [sessionRegistrations, setSessionRegistrations] =
    useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const registrationData =
          await getMyRegistrations();

        const sessionRegistrationData =
          await getMySessionRegistrations();

        const bookmarkData =
          await getMyBookmarks();

        if (Array.isArray(registrationData)) {
          setRegistrations(registrationData);
        }

        if (Array.isArray(sessionRegistrationData)) {
          setSessionRegistrations(
            sessionRegistrationData
          );
        }

        if (Array.isArray(bookmarkData)) {
          setBookmarks(bookmarkData);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const upcomingSessions = sessionRegistrations
    .filter((registration) => {
      if (!registration.session?.date) {
        return false;
      }

      const sessionDate = new Date(
        registration.session.date
      );

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      return sessionDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.session.date) -
        new Date(b.session.date)
    )
    .slice(0, 3);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>
            Welcome, {user?.name || "Attendee"}
          </h1>

          <p>
            Here's what's coming up for you.
          </p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-icon">
            <CalendarCheck size={20} />
          </div>

          <div>
            <div className="stat-value">
              {loading
                ? "..."
                : registrations.length}
            </div>

            <div className="stat-label">
              Registered Events
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <ListChecks size={20} />
          </div>

          <div>
            <div className="stat-value">
              {loading
                ? "..."
                : sessionRegistrations.length}
            </div>

            <div className="stat-label">
              Saved Sessions
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Bookmark size={20} />
          </div>

          <div>
            <div className="stat-value">
              {loading
                ? "..."
                : bookmarks.length}
            </div>

            <div className="stat-label">
              Bookmarks
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Mail size={20} />
          </div>

          <div>
            <div className="stat-value">
              0
            </div>

            <div className="stat-label">
              Messages
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <div className="card-title">
            Upcoming Sessions
          </div>

          <Link
            to="/attendee/schedule"
            className="btn btn-outline btn-sm"
          >
            View Full Schedule
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading sessions...
          </div>
        ) : upcomingSessions.length === 0 ? (
          <div className="empty-state">
            No upcoming sessions yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Expo</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                </tr>
              </thead>

              <tbody>
                {upcomingSessions.map(
                  (registration) => {
                    const session =
                      registration.session;

                    return (
                      <tr key={registration._id}>
                        <td>
                          <Link
                            to={`/attendee/schedule/${session._id}`}
                            className="cell-strong"
                          >
                            {session.title}
                          </Link>
                        </td>

                        <td>
                          {session.expo?.title || "-"}
                        </td>

                        <td>
                          {formatDate(session.date)}
                        </td>

                        <td>
                          <span className="flex items-center gap-2">
                            <Clock size={13} />
                            {session.startTime} -{" "}
                            {session.endTime}
                          </span>
                        </td>

                        <td>
                          <span className="flex items-center gap-2">
                            <MapPin size={13} />
                            {session.location}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}