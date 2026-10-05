import { useEffect, useState } from "react";

import {
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  Bell,
} from "lucide-react";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../../services/api.js";

const ICONS = {
  application: CheckCircle2,
  booth: AlertTriangle,
  session: Bell,
  message: MessageSquare,
  general: Bell,
};

const COLORS = {
  application: "var(--success)",
  booth: "var(--warning)",
  session: "var(--primary)",
  message: "var(--primary)",
  general: "var(--muted)",
};

export default function AttendeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getMyNotifications();

      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setMessage(
          data.message || "Unable to load notifications"
        );
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const data = await markNotificationAsRead(id);

      if (data.notification) {
        setNotifications((current) =>
          current.map((notification) =>
            notification._id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
          )
        );
      } else {
        setMessage(
          data.message || "Unable to update notification"
        );
      }
    } catch (error) {
      setMessage("Unable to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const data = await markAllNotificationsAsRead();

      if (
        data.message ===
        "All notifications marked as read"
      ) {
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
      } else {
        setMessage(
          data.message || "Unable to update notifications"
        );
      }
    } catch (error) {
      setMessage("Unable to update notifications");
    }
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <p>
            Updates about your registrations and sessions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={handleMarkAllRead}
          disabled={
            notifications.length === 0 ||
            notifications.every(
              (notification) => notification.read
            )
          }
        >
          Mark all as read
        </button>
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

      <div
        className="card"
        style={{ padding: 0 }}
      >
        {loading ? (
          <div className="empty-state">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={28} />

            <p className="mt-4">
              No notifications yet.
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon =
              ICONS[notification.type] || Bell;

            return (
              <div
                key={notification._id}
                className={`notif-item${
                  !notification.read
                    ? " unread"
                    : ""
                }`}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkRead(
                      notification._id
                    );
                  }
                }}
                style={{
                  cursor: notification.read
                    ? "default"
                    : "pointer",
                }}
              >
                <div
                  className="notif-icon"
                  style={{
                    background:
                      "var(--neutral-bg)",
                    color:
                      COLORS[
                        notification.type
                      ] || "var(--muted)",
                  }}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <div
                    className="cell-strong"
                    style={{ fontSize: 14 }}
                  >
                    {notification.title}
                  </div>

                  <div
                    className="text-muted"
                    style={{ fontSize: 13 }}
                  >
                    {notification.message}
                  </div>

                  <div className="notif-time">
                    {formatTime(
                      notification.createdAt
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}