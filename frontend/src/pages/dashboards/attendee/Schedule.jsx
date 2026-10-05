import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  User,
} from "lucide-react";

import {
  getSessions,
  getMyRegistrations,
} from "../../../services/api";

import socket from "../../../services/socket.js";

export default function AttendeeSchedule() {
  const [sessions, setSessions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const sessionData = await getSessions();
        const registrationData =
          await getMyRegistrations();

        if (Array.isArray(sessionData)) {
          setSessions(sessionData);
        }

        if (Array.isArray(registrationData)) {
          setRegistrations(registrationData);
        }
      } catch (error) {
        setMessage("Unable to load schedule");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  useEffect(() => {
    const handleSessionCreated = (session) => {
      setSessions((previousSessions) => [
        ...previousSessions.filter(
          (item) => item._id !== session._id
        ),
        session,
      ]);
    };

    const handleSessionUpdated = (session) => {
      setSessions((previousSessions) => {
        const alreadyExists = previousSessions.some(
          (item) => item._id === session._id
        );

        if (alreadyExists) {
          return previousSessions.map((item) =>
            item._id === session._id
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
            String(session._id) !== String(sessionId)
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
  }, []);

  const registeredExpoIds = registrations
    .filter(
      (registration) =>
        registration.status === "registered" &&
        registration.expo
    )
    .map((registration) => {
      const expoId =
        registration.expo?._id ||
        registration.expo;

      return String(expoId);
    });

  const visibleSessions = sessions.filter(
    (session) => {
      const expoId =
        session.expo?._id ||
        session.expo;

      return registeredExpoIds.includes(
        String(expoId)
      );
    }
  );

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
          <h1>Schedule</h1>

          <p>
            Sessions across the expos you've registered for.
          </p>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 14,
            color: "#dc2626",
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="empty-state">
            Loading sessions...
          </div>
        </div>
      ) : visibleSessions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            No sessions available for your registered expos.
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {visibleSessions.map((session) => (
            <Link
              to={`/attendee/schedule/${session._id}`}
              key={session._id}
              className="card"
            >
              <div className="flex justify-between items-center">
                <span
                  className="cell-strong"
                  style={{ fontSize: 16 }}
                >
                  {session.title}
                </span>

                <span className="badge badge-info">
                  {formatDate(session.date)}
                </span>
              </div>

              <div
                className="text-muted mt-4"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <span className="flex items-center gap-2">
                  <User size={13} />
                  {session.speaker}
                </span>

                <span className="flex items-center gap-2">
                  <Clock size={13} />
                  {session.startTime} -{" "}
                  {session.endTime}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={13} />
                  {session.location}
                </span>

                <span style={{ marginTop: 4 }}>
                  Expo:{" "}
                  {session.expo?.title || "-"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}