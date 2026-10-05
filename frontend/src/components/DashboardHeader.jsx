import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu } from "lucide-react";

import {
  getMyProfile,
  getMyNotifications,
} from "../services/api.js";

const SERVER_URL = "http://localhost:5000";

export default function DashboardHeader({
  role,
  onMenuClick,
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadHeaderData = async () => {
    try {
      const [profileData, notificationsData] =
        await Promise.all([
          getMyProfile(),
          getMyNotifications(),
        ]);

      const profile =
        profileData?.user || profileData;

      if (profile && !profile.message) {
        setUser(profile);
      }

      if (Array.isArray(notificationsData)) {
        const unread = notificationsData.filter(
          (notification) => !notification.read
        ).length;

        setUnreadCount(unread);
      }
    } catch (error) {
      console.error(
        "Unable to load dashboard header:",
        error.message
      );
    }
  };

  useEffect(() => {
    loadHeaderData();

    const interval = setInterval(() => {
      loadHeaderData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getNotificationPath = () => {
    if (role === "admin") {
      return "/admin/notifications";
    }

    if (role === "exhibitor") {
      return "/exhibitor/notifications";
    }

    return "/attendee/notifications";
  };

  const getRoleLabel = () => {
    if (role === "admin") {
      return "Admin / Organizer";
    }

    if (role === "exhibitor") {
      return "Exhibitor";
    }

    return "Attendee";
  };

  const getDisplayName = () => {
    if (!user) {
      return "User";
    }

    if (
      role === "exhibitor" &&
      user.companyName
    ) {
      return user.companyName;
    }

    return user.name || "User";
  };

  const getLogoUrl = () => {
    if (!user?.logo) {
      return "";
    }

    if (
      user.logo.startsWith("http://") ||
      user.logo.startsWith("https://")
    ) {
      return user.logo;
    }

    return `${SERVER_URL}${user.logo}`;
  };

  const getInitials = () => {
    const name = getDisplayName();

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const logoUrl = getLogoUrl();

  return (
    <header className="dashboard-topbar">
      <button
        className="btn-icon sidebar-toggle"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="topbar-search input-icon-wrap">
        <Search size={16} />

        <input
          className="input"
          placeholder="Search..."
        />
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="topbar-icon-btn"
          aria-label="Notifications"
          onClick={() =>
            navigate(getNotificationPath())
          }
          style={{
            position: "relative",
          }}
        >
          <Bell size={18} />

          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                minWidth: 17,
                height: 17,
                padding: "0 4px",
                borderRadius: 999,
                background: "#ef4444",
                color: "#ffffff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
              }}
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        <div className="topbar-user">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={getDisplayName()}
            />
          ) : (
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background:
                  "var(--neutral-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {getInitials()}
            </div>
          )}

          <div>
            <div className="name">
              {getDisplayName()}
            </div>

            <div className="role">
              {getRoleLabel()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}