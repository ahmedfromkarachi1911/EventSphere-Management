import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { getMyRegistrations } from "../../../services/api";

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const data = await getMyRegistrations();

        if (Array.isArray(data)) {
          setRegistrations(data);
        } else {
          setMessage(
            data.message || "Unable to load registrations"
          );
        }
      } catch (error) {
        setMessage("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, []);

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
          <h1>My Registrations</h1>
          <p>Your registered expos will appear here.</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 text-sm text-red-600">
          {message}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">
            Loading registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            No registrations yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Expo</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {registrations.map((registration) => {
                  const expo = registration.expo;

                  return (
                    <tr key={registration._id}>
                      <td className="cell-strong">
                        {expo?.title || "Expo unavailable"}
                      </td>

                      <td>
                        {formatDate(
                          expo?.startDate,
                          expo?.endDate
                        )}
                      </td>

                      <td>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          {expo
                            ? `${expo.venue}, ${expo.city}`
                            : "-"}
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-success">
                          {registration.status}
                        </span>
                      </td>

                      <td>
                        {expo && (
                          <Link
                            to={`/attendee/explore/${expo._id}`}
                            className="btn-icon"
                          >
                            <Eye size={15} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}