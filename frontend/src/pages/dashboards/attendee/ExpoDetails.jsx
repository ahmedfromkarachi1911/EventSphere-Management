import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  registerForExpo,
  getMyRegistrations,
} from "../../../services/api.js";

import socket from "../../../services/socket.js";

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

  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

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
          getMyRegistrations(),
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

        const registrationsData =
          results[3].status === "fulfilled"
            ? results[3].value
            : [];

        if (Array.isArray(exhibitorsData)) {
          const expoExhibitors =
            exhibitorsData.filter((item) => {
              const expoId =
                item.expo?._id ||
                item.expo ||
                item.application?.expo?._id ||
                item.application?.expo;

              return String(expoId) === String(id);
            });

          setExhibitors(expoExhibitors);
        }

        if (Array.isArray(sessionsData)) {
          const expoSessions =
            sessionsData.filter((session) => {
              const expoId =
                session.expo?._id ||
                session.expo;

              return String(expoId) === String(id);
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

        if (Array.isArray(registrationsData)) {
          const alreadyRegistered =
            registrationsData.some((registration) => {
              const expoId =
                registration.expo?._id ||
                registration.expo;

              return String(expoId) === String(id);
            });

          setRegistered(alreadyRegistered);
        }
      } catch (error) {
        setMessage("Unable to load expo");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const handleExpoUpdated = (updatedExpo) => {
      if (String(updatedExpo._id) !== String(id)) {
        return;
      }

      if (updatedExpo.status !== "published") {
        setExpo(null);
        setMessage(
          "This expo is no longer available."
        );
        return;
      }

      setExpo(updatedExpo);
      setMessage("");
    };

    const handleExpoDeleted = (expoId) => {
      if (String(expoId) !== String(id)) {
        return;
      }

      setExpo(null);
      setMessage("This expo has been deleted.");
    };

    socket.on(
      "expoUpdated",
      handleExpoUpdated
    );

    socket.on(
      "expoDeleted",
      handleExpoDeleted
    );

    return () => {
      socket.off(
        "expoUpdated",
        handleExpoUpdated
      );

      socket.off(
        "expoDeleted",
        handleExpoDeleted
      );
    };
  }, [id]);

  useEffect(() => {
    const handleSessionCreated = (session) => {
      const expoId =
        session.expo?._id ||
        session.expo;

      if (String(expoId) !== String(id)) {
        return;
      }

      setSessions((previousSessions) => [
        ...previousSessions.filter(
          (item) =>
            String(item._id) !==
            String(session._id)
        ),
        session,
      ]);
    };

    const handleSessionUpdated = (session) => {
      const expoId =
        session.expo?._id ||
        session.expo;

      setSessions((previousSessions) => {
        if (String(expoId) !== String(id)) {
          return previousSessions.filter(
            (item) =>
              String(item._id) !==
              String(session._id)
          );
        }

        const alreadyExists =
          previousSessions.some(
            (item) =>
              String(item._id) ===
              String(session._id)
          );

        if (alreadyExists) {
          return previousSessions.map((item) =>
            String(item._id) ===
            String(session._id)
              ? session
              : item
          );
        }

        return [...previousSessions, session];
      });
    };

    const handleSessionDeleted = (sessionId) => {
      setSessions((previousSessions) =>
        previousSessions.filter(
          (session) =>
            String(session._id) !==
            String(sessionId)
        )
      );
    };

    socket.on(
      "sessionCreated",
      handleSessionCreated
    );

    socket.on(
      "sessionUpdated",
      handleSessionUpdated
    );

    socket.on(
      "sessionDeleted",
      handleSessionDeleted
    );

    return () => {
      socket.off(
        "sessionCreated",
        handleSessionCreated
      );

      socket.off(
        "sessionUpdated",
        handleSessionUpdated
      );

      socket.off(
        "sessionDeleted",
        handleSessionDeleted
      );
    };
  }, [id]);

  useEffect(() => {
    const sortBooths = (boothList) => {
      return [...boothList].sort((a, b) =>
        String(a.boothNumber).localeCompare(
          String(b.boothNumber),
          undefined,
          {
            numeric: true,
          }
        )
      );
    };

    const handleBoothCreated = (booth) => {
      const expoId =
        booth.expo?._id ||
        booth.expo;

      if (String(expoId) !== String(id)) {
        return;
      }

      if (booth.status === "cancelled") {
        return;
      }

      setBooths((previousBooths) => {
        const updatedBooths = [
          ...previousBooths.filter(
            (item) =>
              String(item._id) !==
              String(booth._id)
          ),
          booth,
        ];

        return sortBooths(updatedBooths);
      });

      if (booth.hall) {
        setSelectedHall(
          (previousHall) =>
            previousHall || booth.hall
        );
      }
    };

    const handleBoothUpdated = (booth) => {
      const expoId =
        booth.expo?._id ||
        booth.expo;

      if (String(expoId) !== String(id)) {
        return;
      }

      setBooths((previousBooths) => {
        if (booth.status === "cancelled") {
          return previousBooths.filter(
            (item) =>
              String(item._id) !==
              String(booth._id)
          );
        }

        const alreadyExists =
          previousBooths.some(
            (item) =>
              String(item._id) ===
              String(booth._id)
          );

        if (alreadyExists) {
          const updatedBooths =
            previousBooths.map((item) =>
              String(item._id) ===
              String(booth._id)
                ? booth
                : item
            );

          return sortBooths(updatedBooths);
        }

        return sortBooths([
          ...previousBooths,
          booth,
        ]);
      });

      if (booth.hall) {
        setSelectedHall(
          (previousHall) =>
            previousHall || booth.hall
        );
      }
    };

    socket.on(
      "boothCreated",
      handleBoothCreated
    );

    socket.on(
      "boothUpdated",
      handleBoothUpdated
    );

    return () => {
      socket.off(
        "boothCreated",
        handleBoothCreated
      );

      socket.off(
        "boothUpdated",
        handleBoothUpdated
      );
    };
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

  const getLogoUrl = (logo) => {
    if (!logo) {
      return "";
    }

    if (
      logo.startsWith("http://") ||
      logo.startsWith("https://")
    ) {
      return logo;
    }

    return `${SERVER_URL}${logo}`;
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      setRegisterMessage("");

      const data = await registerForExpo(id);

      if (data.registration) {
        setRegistered(true);

        setRegisterMessage(
          "Expo registration successful"
        );
      } else {
        setRegisterMessage(
          data.message || "Unable to register"
        );
      }
    } catch (error) {
      setRegisterMessage(
        "Unable to register for expo"
      );
    } finally {
      setRegistering(false);
    }
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

  if (message || !expo) {
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
            src={expo.coverImage}
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

              {expo.venue ||
                "Venue not specified"}

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
          style={{ fontSize: 14 }}
        >
          <Users
            size={14}
            style={{ verticalAlign: -2 }}
          />{" "}
          {expo.expectedAttendees
            ? `${expo.expectedAttendees.toLocaleString()} attendees expected`
            : "Expected attendees not specified"}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleRegister}
          disabled={registered || registering}
        >
          {registering
            ? "Registering..."
            : registered
              ? "Registered"
              : "Register Now"}
        </button>
      </div>

      {registerMessage && (
        <div
          style={{
            marginTop: 10,
            fontSize: 14,
          }}
        >
          {registerMessage}
        </div>
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
                      String(
                        boothItem.exhibitor?._id
                      ) ===
                      String(exhibitor._id)
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
                          src={getLogoUrl(
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
                            exhibitor.name}
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
                        {session.startTime &&
                        session.endTime
                          ? `${session.startTime} - ${session.endTime}`
                          : session.startTime ||
                            session.endTime ||
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
                  style={{ maxWidth: 200 }}
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

                    return (
                      <div
                        key={booth._id}
                        className={`booth ${boothClass}`}
                        title={
                          booth.exhibitor
                            ? `${
                                booth.exhibitor
                                  .companyName ||
                                booth.exhibitor
                                  .name
                              } - ${booth.boothType}`
                            : booth.boothType
                        }
                      >
                        {booth.boothNumber}
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