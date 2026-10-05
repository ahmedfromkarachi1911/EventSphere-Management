import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Store,
  Mail,
  CheckCircle2,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { getMyApplications } from "../../../services/api";

export default function ExhibitorDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await getMyApplications();

        if (Array.isArray(data)) {
          setApplications(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const approvedApplication = applications.find(
    (application) => application.status === "approved"
  );

  const upcomingExpo = approvedApplication?.expo;

  const latestApplication =
    applications.length > 0 ? applications[0] : null;

  const formatDate = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "-";
    }

    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();

    return `${start} - ${end}`;
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>
            Welcome, {user?.companyName || "Exhibitor"}
          </h1>

          <p>
            Here's what's happening with your booth and applications.
          </p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-icon">
            <ClipboardList size={20} />
          </div>

          <div>
            <div className="stat-value">
              {applications.length}
            </div>

            <div className="stat-label">
              My Applications
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <Store size={20} />
          </div>

          <div>
            <div className="stat-value">
              -
            </div>

            <div className="stat-label">
              Booth Number
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <div className="stat-value">
              {latestApplication
                ? latestApplication.status
                : "No Application"}
            </div>

            <div className="stat-label">
              Application Status
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
              Unread Messages
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <div className="card-title">
            My Upcoming Expo
          </div>

          <Link
            to="/exhibitor/applications"
            className="btn btn-outline btn-sm"
          >
            View Details
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading...
          </div>
        ) : upcomingExpo ? (
          <div
            className="flex gap-3"
            style={{
              alignItems: "center",
            }}
          >
            <img
              src={
                upcomingExpo.coverImage ||
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80"
              }
              alt={upcomingExpo.title}
              style={{
                width: 96,
                height: 72,
                borderRadius: 10,
                objectFit: "cover",
              }}
            />

            <div>
              <div className="cell-strong">
                {upcomingExpo.title}
              </div>

              <div
                className="expo-meta"
                style={{
                  flexDirection: "row",
                  gap: 16,
                  marginTop: 6,
                }}
              >
                <span>
                  <CalendarDays size={13} />
                  {formatDate(
                    upcomingExpo.startDate,
                    upcomingExpo.endDate
                  )}
                </span>

                <span>
                  <MapPin size={13} />
                  {upcomingExpo.city}
                </span>
              </div>

              <span className="badge badge-success mt-2">
                Approved
              </span>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            No approved expo application yet.
          </div>
        )}
      </div>
    </div>
  );
} 