import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Trash2,
  Clock,
  CalendarDays,
} from "lucide-react";

import {
  getMyBookmarks,
  removeBookmark,
} from "../../../services/api";

export default function AttendeeBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadBookmarks = async () => {
    try {
      setLoading(true);

      const data = await getMyBookmarks();

      if (Array.isArray(data)) {
        setBookmarks(data);
      } else {
        setMessage(
          data.message || "Unable to load bookmarks"
        );
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemove = async (sessionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this bookmark?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await removeBookmark(sessionId);

      if (
        data.message ===
        "Bookmark removed successfully"
      ) {
        setBookmarks(
          bookmarks.filter(
            (bookmark) =>
              bookmark.session?._id !== sessionId
          )
        );

        setMessage(
          "Bookmark removed successfully"
        );
      } else {
        setMessage(
          data.message ||
            "Unable to remove bookmark"
        );
      }
    } catch (error) {
      setMessage("Unable to remove bookmark");
    }
  };

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
          <h1>My Bookmarks</h1>
          <p>
            Sessions you've saved for later.
          </p>
        </div>
      </div>

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

      {loading ? (
        <div className="card">
          <div className="empty-state">
            Loading bookmarks...
          </div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Bookmark size={28} />

            <p className="mt-4">
              No bookmarks yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {bookmarks.map((bookmark) => {
            const session = bookmark.session;

            return (
              <div
                className="card"
                key={bookmark._id}
              >
                <div className="flex justify-between items-center">
                  <span className="badge badge-neutral">
                    Session
                  </span>

                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() =>
                      handleRemove(session?._id)
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Link
                  to={`/attendee/schedule/${session?._id}`}
                >
                  <div
                    className="cell-strong mt-4"
                    style={{ fontSize: 15 }}
                  >
                    {session?.title || "Session"}
                  </div>
                </Link>

                <div
                  className="text-muted mt-2"
                  style={{
                    fontSize: 13,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays size={13} />
                    {formatDate(session?.date)}
                  </span>

                  <span className="flex items-center gap-2">
                    <Clock size={13} />
                    {session?.startTime} -{" "}
                    {session?.endTime}
                  </span>

                  <span>
                    Expo:{" "}
                    {session?.expo?.title || "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}