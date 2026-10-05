import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";

export default function DashboardLayout({ role }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!token || !savedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  const validRoles = ["admin", "exhibitor", "attendee"];

  if (!validRoles.includes(user.role)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={`/${user.role}/dashboard`}
        replace
      />
    );
  }

  return (
    <div className="dashboard-shell" data-theme={role}>
      <Sidebar
        role={role}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="dashboard-main">
        <DashboardHeader
          role={role}
          onMenuClick={() => setMenuOpen(true)}
        />

        <div className="dashboard-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}