import { NavLink, useNavigate } from "react-router-dom";
import {
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  Users,
  Grid3x3,
  Clock,
  BarChart3,
  MessageSquareText,
  Mail,
  Bell,
  User,
  Settings,
  LogOut,
  ClipboardList,
  Store,
  Package,
  UserSquare2,
  FileText,
  Compass,
  Bookmark,
  ListChecks,
  X,
} from "lucide-react";

const NAV = {
  admin: [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/admin/expos",
      label: "Expos",
      icon: CalendarDays,
    },
    {
      to: "/admin/exhibitors",
      label: "Exhibitors",
      icon: Users,
    },
    {
      to: "/admin/booths",
      label: "Booths",
      icon: Grid3x3,
    },
    {
      to: "/admin/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      to: "/admin/schedule",
      label: "Schedule",
      icon: Clock,
    },
    {
      to: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      to: "/admin/feedback",
      label: "Feedback",
      icon: MessageSquareText,
    },
    {
      to: "/admin/messages",
      label: "Messages",
      icon: Mail,
    },
    {
      to: "/admin/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      to: "/admin/profile",
      label: "Profile",
      icon: User,
    },
    {
      to: "/admin/settings",
      label: "Settings",
      icon: Settings,
    },
  ],

  exhibitor: [
    {
      to: "/exhibitor/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/exhibitor/profile",
      label: "My Profile",
      icon: UserSquare2,
    },
    {
      to: "/exhibitor/applications",
      label: "My Applications",
      icon: ClipboardList,
    },
    {
      to: "/exhibitor/booth",
      label: "My Booth",
      icon: Store,
    },
    {
      to: "/exhibitor/products",
      label: "Products",
      icon: Package,
    },
    {
      to: "/exhibitor/staff",
      label: "Staff",
      icon: Users,
    },
    {
      to: "/exhibitor/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      to: "/exhibitor/messages",
      label: "Messages",
      icon: Mail,
    },
    {
      to: "/exhibitor/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      to: "/exhibitor/feedback",
      label: "Feedback",
      icon: MessageSquareText,
    },
    {
      to: "/exhibitor/settings",
      label: "Settings",
      icon: Settings,
    },
  ],

  attendee: [
    {
      to: "/attendee/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/attendee/explore",
      label: "Explore Expos",
      icon: Compass,
    },
    {
      to: "/attendee/registrations",
      label: "My Registrations",
      icon: ListChecks,
    },
    {
      to: "/attendee/exhibitors",
      label: "Exhibitors",
      icon: Users,
    },
    {
      to: "/attendee/schedule",
      label: "Schedule",
      icon: Clock,
    },
    {
      to: "/attendee/bookmarks",
      label: "My Bookmarks",
      icon: Bookmark,
    },
    {
      to: "/attendee/messages",
      label: "Messages",
      icon: Mail,
    },
    {
      to: "/attendee/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      to: "/attendee/feedback",
      label: "Feedback",
      icon: MessageSquareText,
    },
    {
      to: "/attendee/profile",
      label: "Profile",
      icon: User,
    },
    {
      to: "/attendee/settings",
      label: "Settings",
      icon: Settings,
    },
  ],
};

const BRAND_LABEL = {
  admin: "Admin / Organizer",
  exhibitor: "Exhibitor",
  attendee: "Attendee",
};

export default function Sidebar({
  role,
  open,
  onClose,
}) {
  const items = NAV[role] || [];
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside
      className={`sidebar ${open ? "open" : ""}`}
    >
      <div className="sidebar-brand">
        <span className="brand-mark">
          <Sparkles size={18} />
        </span>

        <div
          style={{
            lineHeight: 1.15,
          }}
        >
          <div>EventSphere</div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#94A3B8",
            }}
          >
            {BRAND_LABEL[role]}
          </div>
        </div>

        <button
          className="btn-icon sidebar-toggle"
          style={{
            marginLeft: "auto",
            background:
              "rgba(255,255,255,.08)",
            color: "#fff",
          }}
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link${
                  isActive ? " active" : ""
                }`
              }
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{
            width: "100%",
            border: "none",
            cursor: "pointer",
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}