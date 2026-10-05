import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  CalendarDays,
  MapPin,
  Tag,
  Users,
  Store,
} from "lucide-react";

import {
  getExpoById,
  getApprovedExhibitors,
  getSessions,
  getExpoFloorPlan,
} from "../../services/api.js";

const SERVER_URL = "http://localhost:5000";

const TABS = [
  "Overview",
  "Exhibitors",
  "Schedule",
  "Floor Plan",
];

export default function ExpoDetails() {
  const { id } = useParams();

  const [expo, setExpo] = useState(null);
  const [exhibitors, setExhibitors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [booths, setBooths] = useState([]);

  const [selectedHall, setSelectedHall] = useState("");
  const [tab, setTab] = useState("Overview");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setMessage("");

        const expoData = await getExpoById(id);

        if (!expoData || expoData.message) {
          setMessage(
            expoData?.message || "Expo not found"
          );
          return;
        }

        setExpo(expoData);

        const results = await Promise.allSettled([
          getApprovedExhibitors(),
          getSessions(),
          getExpoFloorPlan(id),
        ]);

        const exhibitorsData =
          results[0].status === "fulfilled"
            ? results[0].value
            : [];

        const sessionsData =
          results[1].status === "fulfilled"
            ? results[1].value
            : [];

        const floorPlanData =
          results[2].status === "fulfilled"
            ? results[2].value
            : [];

        if (Array.isArray(exhibitorsData)) {
          const expoExhibitors =
            exhibitorsData.filter((item) => {
              const itemExpoId =
                item.expo?._id ||
                item.expo ||
                item.application?.expo?._id ||
                item.application?.expo;

              return itemExpoId === id;
            });

          setExhibitors(expoExhibitors);
        }

        if (Array.isArray(sessionsData)) {
          const expoSessions =
            sessionsData.filter((session) => {
              const sessionExpoId =
                session.expo?._id ||
                session.expo;

              return sessionExpoId === id;
            });

          setSessions(expoSessions);
        }

        if (Array.isArray(floorPlanData)) {
          setBooths(floorPlanData);

          const halls = [
            ...new Set(
              floorPlanData
                .map((booth) => booth.hall)
                .filter(Boolean)
            ),
          ];

          if (halls.length > 0) {
            setSelectedHall(halls[0]);
          }
        }
      } catch (error) {
        setMessage("Unable to load expo");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const formatDate = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "Not specified";
    }

    const start =
      new Date(startDate).toLocaleDateString();

    const end =
      new Date(endDate).toLocaleDateString();

    return `${start} - ${end}`;
  };

  const formatSessionDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${SERVER_URL}${image}`;
  };

  const halls = [
    ...new Set(
      booths
        .map((booth) => booth.hall)
        .filter(Boolean)
    ),
  ];

  const hallBooths = selectedHall
    ? booths.filter(
        (booth) => booth.hall === selectedHall
      )
    : booths;

  if (loading) {
    return (
      <div className="container section">
        <div className="card">
          Loading expo...
        </div>
      </div>
    );
  }

  if (!expo) {
    return (
      <div className="container section">
        <div className="empty-state">
          {message || "Expo not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="banner">
        {expo.coverImage && (
          <img
            src={getImageUrl(expo.coverImage)}
            alt={expo.title}
          />
        )}

        <div className="banner-content">
          <span className="badge badge-info">
            {expo.category || "Expo"}
          </span>

          <h1>{expo.title}</h1>

          <div className="banner-meta">
            <span>
              <CalendarDays size={16} />

              {formatDate(
                expo.startDate,
                expo.endDate
              )}
            </span>

            <span>
              <MapPin size={16} />

              {expo.venue || "Venue not specified"}

              {expo.city
                ? `, ${expo.city}`
                : ""}
            </span>

            {expo.theme && (
              <span>
                <Tag size={16} />
                {expo.theme}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex justify-between items-center mt-6"
        style={{
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          className="text-muted"
          style={{
            fontSize: 14,
          }}
        >
          <Users
            size={14}
            style={{
              verticalAlign: -2,
            }}
          />{" "}
          {expo.expectedAttendees
            ? `${expo.expectedAttendees.toLocaleString()} attendees expected`
            : "Expected attendees not specified"}
        </div>

        <Link
          to="/login"
          className="btn btn-primary"
        >
          Register Now
        </Link>
      </div>

      {message && (
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            color: "#dc2626",
          }}
        >
          {message}
        </p>
      )}

      <div className="tab-row">
        {TABS.map((item) => (
          <button
            key={item}
            className={`tab${
              tab === item ? " active" : ""
            }`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">
              About This Expo
            </div>

            <p
              className="text-muted mt-4"
              style={{
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              {expo.description ||
                "No description available."}
            </p>
          </div>

          <div className="card">
            <div className="card-title">
              Event Details
            </div>

            <div
              className="mt-4"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 14,
                color: "var(--ink-soft)",
              }}
            >
              <span>
                <strong>Theme:</strong>{" "}
                {expo.theme || "Not specified"}
              </span>

              <span>
                <strong>Venue:</strong>{" "}
                {expo.venue || "Not specified"}

                {expo.city
                  ? `, ${expo.city}`
                  : ""}
              </span>

              <span>
                <strong>
                  Opening Time:
                </strong>{" "}
                {expo.openingTime ||
                  "Not specified"}
              </span>

              <span>
                <strong>
                  Closing Time:
                </strong>{" "}
                {expo.closingTime ||
                  "Not specified"}
              </span>

              <span>
                <strong>
                  Registration Deadline:
                </strong>{" "}
                {expo.registrationDeadline
                  ? new Date(
                      expo.registrationDeadline
                    ).toLocaleDateString()
                  : "Not specified"}
              </span>

              <span>
                <strong>
                  Expected Attendees:
                </strong>{" "}
                {expo.expectedAttendees
                  ? expo.expectedAttendees.toLocaleString()
                  : "Not specified"}
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === "Exhibitors" && (
        <>
          {exhibitors.length === 0 ? (
            <div className="empty-state">
              No approved exhibitors for this expo yet.
            </div>
          ) : (
            <div className="grid grid-3">
              {exhibitors.map((item) => {
                const exhibitor =
                  item.exhibitor || item;

                const booth =
                  item.booth ||
                  booths.find(
                    (boothItem) =>
                      boothItem.exhibitor?._id ===
                      exhibitor._id
                  );

                return (
                  <div
                    className="card"
                    key={
                      item._id ||
                      exhibitor._id
                    }
                  >
                    <div className="avatar-cell">
                      {exhibitor.logo ? (
                        <img
                          src={getImageUrl(
                            exhibitor.logo
                          )}
                          alt={
                            exhibitor.companyName ||
                            exhibitor.name
                          }
                          className="avatar-sq"
                        />
                      ) : (
                        <div className="avatar-sq">
                          <Store size={22} />
                        </div>
                      )}

                      <div>
                        <div className="cell-strong">
                          {exhibitor.companyName ||
                            exhibitor.name ||
                            "Exhibitor"}
                        </div>

                        <div
                          className="text-muted"
                          style={{
                            fontSize: 12,
                          }}
                        >
                          {exhibitor.category ||
                            "Exhibitor"}
                        </div>
                      </div>
                    </div>

                    {exhibitor.description && (
                      <p
                        className="text-muted mt-4"
                        style={{
                          fontSize: 13,
                        }}
                      >
                        {exhibitor.description}
                      </p>
                    )}

                    {booth ? (
                      <div className="badge badge-neutral mt-4">
                        Booth{" "}
                        {booth.boothNumber} ·{" "}
                        {booth.hall}
                      </div>
                    ) : (
                      <div className="badge badge-warning mt-4">
                        Booth not assigned yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "Schedule" && (
        <div className="card">
          {sessions.length === 0 ? (
            <div className="empty-state">
              No sessions scheduled for this expo yet.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Speaker</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((session) => (
                    <tr key={session._id}>
                      <td className="cell-strong">
                        {session.title}
                      </td>

                      <td>
                        {session.speaker || "-"}
                      </td>

                      <td>
                        {formatSessionDate(
                          session.date
                        )}
                      </td>

                      <td>
                        {session.time ||
                          session.startTime ||
                          "-"}
                      </td>

                      <td>
                        {session.location || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "Floor Plan" && (
        <div className="card">
          {booths.length === 0 ? (
            <div className="empty-state">
              No booths created for this expo yet.
            </div>
          ) : (
            <>
              <div className="floor-toolbar">
                <select
                  className="select"
                  style={{
                    maxWidth: 200,
                  }}
                  value={selectedHall}
                  onChange={(e) =>
                    setSelectedHall(
                      e.target.value
                    )
                  }
                >
                  {halls.map((hall) => (
                    <option
                      key={hall}
                      value={hall}
                    >
                      {hall}
                    </option>
                  ))}
                </select>

                <div className="floor-legend">
                  <span>
                    <span
                      className="legend-swatch"
                      style={{
                        background:
                          "var(--success)",
                      }}
                    />
                    Available
                  </span>

                  <span>
                    <span
                      className="legend-swatch"
                      style={{
                        background:
                          "var(--warning)",
                      }}
                    />
                    Reserved
                  </span>

                  <span>
                    <span
                      className="legend-swatch"
                      style={{
                        background:
                          "var(--danger)",
                      }}
                    />
                    Assigned
                  </span>
                </div>
              </div>

              {hallBooths.length === 0 ? (
                <div className="empty-state">
                  No booths in this hall.
                </div>
              ) : (
                <div className="booth-grid">
                  {hallBooths.map((booth) => {
                    const boothClass =
                      booth.status === "assigned"
                        ? "booked"
                        : booth.status;

                    const statusLabel =
                      booth.status === "assigned"
                        ? "Assigned"
                        : booth.status === "reserved"
                          ? "Reserved"
                          : "Available";

                    return (
                      <div
                        key={booth._id}
                        className={`booth ${boothClass}`}
                        title={
                          booth.exhibitor
                            ? `${
                                booth.exhibitor
                                  .companyName ||
                                booth.exhibitor.name
                              } - ${booth.boothType}`
                            : booth.boothType
                        }
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 5,
                          textAlign: "center",
                        }}
                      >
                        <strong>
                          {booth.boothNumber}
                        </strong>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {statusLabel}
                        </span>

                        {booth.status === "assigned" &&
                          booth.exhibitor && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 500,
                                lineHeight: 1.2,
                              }}
                            >
                              {booth.exhibitor
                                .companyName ||
                                booth.exhibitor.name}
                            </span>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="floor-entrance">
                Main Entrance
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}