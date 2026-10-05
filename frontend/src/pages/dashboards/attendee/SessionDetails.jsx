import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Clock,
  MapPin,
  CalendarDays,
  Bookmark,
  User,
} from "lucide-react";

import {
  getSessionById,
  registerForSession,
  getMySessionRegistrations,
  cancelSessionRegistration,
  addBookmark,
  getMyBookmarks,
  removeBookmark,
} from "../../../services/api";

export default function AttendeeSessionDetails() {
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] =
    useState(false);
  const [bookmarkLoading, setBookmarkLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await getSessionById(id);

        const registrationData =
          await getMySessionRegistrations();

        const bookmarkData =
          await getMyBookmarks();

        if (sessionData._id) {
          setSession(sessionData);
        } else {
          setMessage(
            sessionData.message || "Session not found"
          );
        }

        if (Array.isArray(registrationData)) {
          const alreadyRegistered =
            registrationData.some(
              (registration) =>
                registration.session?._id === id
            );

          setRegistered(alreadyRegistered);
        }

        if (Array.isArray(bookmarkData)) {
          const alreadyBookmarked =
            bookmarkData.some(
              (bookmark) =>
                bookmark.session?._id === id
            );

          setBookmarked(alreadyBookmarked);
        }
      } catch (error) {
        setMessage("Unable to load session");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);

  const handleRegistration = async () => {
    try {
      setRegistrationLoading(true);
      setMessage("");

      if (registered) {
        const data =
          await cancelSessionRegistration(id);

        if (
          data.message ===
          "Session registration cancelled successfully"
        ) {
          setRegistered(false);
          setMessage(
            "Session registration cancelled successfully"
          );
        } else {
          setMessage(
            data.message ||
              "Unable to cancel registration"
          );
        }

        return;
      }

      const data = await registerForSession(id);

      if (data.registration) {
        setRegistered(true);
        setMessage(
          "Session registered successfully"
        );
      } else {
        setMessage(
          data.message ||
            "Unable to register for session"
        );
      }
    } catch (error) {
      setMessage(
        "Unable to process session registration"
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setBookmarkLoading(true);
      setMessage("");

      if (bookmarked) {
        const data = await removeBookmark(id);

        if (
          data.message ===
          "Bookmark removed successfully"
        ) {
          setBookmarked(false);
          setMessage(
            "Bookmark removed successfully"
          );
        } else {
          setMessage(
            data.message ||
              "Unable to remove bookmark"
          );
        }

        return;
      }

      const data = await addBookmark(id);

      if (data.bookmark) {
        setBookmarked(true);
        setMessage(
          "Session bookmarked successfully"
        );
      } else {
        setMessage(
          data.message ||
            "Unable to bookmark session"
        );
      }
    } catch (error) {
      setMessage(
        "Unable to process bookmark"
      );
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">
          Loading session...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card">
        <div className="empty-state">
          {message || "Session not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          style={{
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      <div className="card">
        <span className="badge badge-info">
          {session.location}
        </span>

        <h1
          className="mt-4"
          style={{ fontSize: 26 }}
        >
          {session.title}
        </h1>

        <div
          className="banner-meta text-muted mt-4"
          style={{ color: "var(--muted)" }}
        >
          <span className="flex items-center gap-2">
            <CalendarDays size={15} />
            {formatDate(session.date)}
          </span>

          <span className="flex items-center gap-2">
            <Clock size={15} />
            {session.startTime} - {session.endTime}
          </span>

          <span className="flex items-center gap-2">
            <MapPin size={15} />
            {session.location}
          </span>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            className={
              registered
                ? "btn btn-outline"
                : "btn btn-primary"
            }
            onClick={handleRegistration}
            disabled={registrationLoading}
          >
            {registrationLoading
              ? "Please wait..."
              : registered
              ? "Cancel Registration"
              : "Register Now"}
          </button>

          <button
            type="button"
            className={
              bookmarked
                ? "btn btn-primary"
                : "btn btn-outline"
            }
            onClick={handleBookmark}
            disabled={bookmarkLoading}
          >
            <Bookmark size={16} />

            {bookmarkLoading
              ? "Please wait..."
              : bookmarked
              ? "Bookmarked"
              : "Bookmark"}
          </button>
        </div>
      </div>

      <div className="grid grid-2 mt-6">
        <div className="card">
          <div className="card-title">
            About This Session
          </div>

          <p
            className="text-muted mt-4"
            style={{
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {session.description ||
              "No session description available."}
          </p>
        </div>

        <div className="card">
          <div className="card-title">
            Speaker
          </div>

          <div className="avatar-cell mt-4">
            <div
              className="avatar-round"
              style={{
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={22} />
            </div>

            <div>
              <div className="cell-strong">
                {session.speaker}
              </div>

              <div
                className="text-muted"
                style={{ fontSize: 13 }}
              >
                Session Speaker
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}