import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import socket from "./services/socket.js";

import PublicLayout from "./layouts/PublicLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Home from "./pages/public/Home.jsx";
import ExploreExpos from "./pages/public/ExploreExpos.jsx";
import ExpoDetails from "./pages/public/ExpoDetails.jsx";
import About from "./pages/public/About.jsx";
import Contact from "./pages/public/Contact.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ExhibitorRegister from "./pages/auth/ExhibitorRegister.jsx";
import AttendeeRegister from "./pages/auth/AttendeeRegister.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import AdminDashboard from "./pages/dashboards/admin/Dashboard.jsx";
import AdminExpos from "./pages/dashboards/admin/Expos.jsx";
import AdminExpoForm from "./pages/dashboards/admin/ExpoForm.jsx";
import AdminExhibitors from "./pages/dashboards/admin/Exhibitors.jsx";
import AdminBooths from "./pages/dashboards/admin/Booths.jsx";
import AdminDocuments from "./pages/dashboards/admin/Documents.jsx";
import AdminSchedule from "./pages/dashboards/admin/Schedule.jsx";
import AdminAnalytics from "./pages/dashboards/admin/Analytics.jsx";
import AdminFeedback from "./pages/dashboards/admin/Feedback.jsx";
import AdminMessages from "./pages/dashboards/admin/Messages.jsx";
import AdminNotifications from "./pages/dashboards/admin/Notifications.jsx";
import AdminProfile from "./pages/dashboards/admin/Profile.jsx";
import AdminSettings from "./pages/dashboards/admin/Settings.jsx";

import ExhibitorDashboard from "./pages/dashboards/exhibitor/Dashboard.jsx";
import ExhibitorProfile from "./pages/dashboards/exhibitor/Profile.jsx";
import ExhibitorApplications from "./pages/dashboards/exhibitor/Applications.jsx";
import ExhibitorApplyExpo from "./pages/dashboards/exhibitor/ApplyExpo.jsx";
import ExhibitorMyBooth from "./pages/dashboards/exhibitor/MyBooth.jsx";
import ExhibitorProducts from "./pages/dashboards/exhibitor/Products.jsx";
import ExhibitorStaff from "./pages/dashboards/exhibitor/Staff.jsx";
import ExhibitorDocuments from "./pages/dashboards/exhibitor/Documents.jsx";
import ExhibitorMessages from "./pages/dashboards/exhibitor/Messages.jsx";
import ExhibitorNotifications from "./pages/dashboards/exhibitor/Notifications.jsx";
import ExhibitorFeedback from "./pages/dashboards/exhibitor/Feedback.jsx";
import ExhibitorSettings from "./pages/dashboards/exhibitor/Settings.jsx";

import AttendeeDashboard from "./pages/dashboards/attendee/Dashboard.jsx";
import AttendeeExploreExpos from "./pages/dashboards/attendee/ExploreExpos.jsx";
import AttendeeExpoDetails from "./pages/dashboards/attendee/ExpoDetails.jsx";
import AttendeeRegistrations from "./pages/dashboards/attendee/Registrations.jsx";
import AttendeeExhibitors from "./pages/dashboards/attendee/Exhibitors.jsx";
import AttendeeExhibitorDetails from "./pages/dashboards/attendee/ExhibitorDetails.jsx";
import AttendeeSchedule from "./pages/dashboards/attendee/Schedule.jsx";
import AttendeeSessionDetails from "./pages/dashboards/attendee/SessionDetails.jsx";
import AttendeeBookmarks from "./pages/dashboards/attendee/Bookmarks.jsx";
import AttendeeMessages from "./pages/dashboards/attendee/Messages.jsx";
import AttendeeNotifications from "./pages/dashboards/attendee/Notifications.jsx";
import AttendeeFeedback from "./pages/dashboards/attendee/Feedback.jsx";
import AttendeeProfile from "./pages/dashboards/attendee/Profile.jsx";
import AttendeeSettings from "./pages/dashboards/attendee/Settings.jsx";

export default function App() {
  useEffect(() => {
    const handleConnect = () => {
      console.log(
        "Frontend socket connected:",
        socket.id
      );
    };

    const handleDisconnect = () => {
      console.log(
        "Frontend socket disconnected"
      );
    };

    socket.on("connect", handleConnect);
    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off(
        "disconnect",
        handleDisconnect
      );
      socket.disconnect();
    };
  }, []);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/expos"
          element={<ExploreExpos />}
        />

        <Route
          path="/expos/:id"
          element={<ExpoDetails />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />
      </Route>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/register/exhibitor"
        element={<ExhibitorRegister />}
      />

      <Route
        path="/register/attendee"
        element={<AttendeeRegister />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      <Route
        path="/admin"
        element={
          <DashboardLayout role="admin" />
        }
      >
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="expos"
          element={<AdminExpos />}
        />

        <Route
          path="expos/new"
          element={<AdminExpoForm />}
        />

        <Route
          path="expos/:id/edit"
          element={<AdminExpoForm />}
        />

        <Route
          path="exhibitors"
          element={<AdminExhibitors />}
        />

        <Route
          path="booths"
          element={<AdminBooths />}
        />

        <Route
          path="documents"
          element={<AdminDocuments />}
        />

        <Route
          path="schedule"
          element={<AdminSchedule />}
        />

        <Route
          path="analytics"
          element={<AdminAnalytics />}
        />

        <Route
          path="feedback"
          element={<AdminFeedback />}
        />

        <Route
          path="messages"
          element={<AdminMessages />}
        />

        <Route
          path="notifications"
          element={<AdminNotifications />}
        />

        <Route
          path="profile"
          element={<AdminProfile />}
        />

        <Route
          path="settings"
          element={<AdminSettings />}
        />
      </Route>

      <Route
        path="/exhibitor"
        element={
          <DashboardLayout role="exhibitor" />
        }
      >
        <Route
          path="dashboard"
          element={<ExhibitorDashboard />}
        />

        <Route
          path="profile"
          element={<ExhibitorProfile />}
        />

        <Route
          path="applications"
          element={<ExhibitorApplications />}
        />

        <Route
          path="applications/apply"
          element={<ExhibitorApplyExpo />}
        />

        <Route
          path="booth"
          element={<ExhibitorMyBooth />}
        />

        <Route
          path="products"
          element={<ExhibitorProducts />}
        />

        <Route
          path="staff"
          element={<ExhibitorStaff />}
        />

        <Route
          path="documents"
          element={<ExhibitorDocuments />}
        />

        <Route
          path="messages"
          element={<ExhibitorMessages />}
        />

        <Route
          path="notifications"
          element={
            <ExhibitorNotifications />
          }
        />

        <Route
          path="feedback"
          element={<ExhibitorFeedback />}
        />

        <Route
          path="settings"
          element={<ExhibitorSettings />}
        />
      </Route>

      <Route
        path="/attendee"
        element={
          <DashboardLayout role="attendee" />
        }
      >
        <Route
          path="dashboard"
          element={<AttendeeDashboard />}
        />

        <Route
          path="explore"
          element={<AttendeeExploreExpos />}
        />

        <Route
          path="explore/:id"
          element={<AttendeeExpoDetails />}
        />

        <Route
          path="registrations"
          element={<AttendeeRegistrations />}
        />

        <Route
          path="exhibitors"
          element={<AttendeeExhibitors />}
        />

        <Route
          path="exhibitors/:id"
          element={
            <AttendeeExhibitorDetails />
          }
        />

        <Route
          path="schedule"
          element={<AttendeeSchedule />}
        />

        <Route
          path="schedule/:id"
          element={
            <AttendeeSessionDetails />
          }
        />

        <Route
          path="bookmarks"
          element={<AttendeeBookmarks />}
        />

        <Route
          path="messages"
          element={<AttendeeMessages />}
        />

        <Route
          path="notifications"
          element={
            <AttendeeNotifications />
          }
        />

        <Route
          path="feedback"
          element={<AttendeeFeedback />}
        />

        <Route
          path="profile"
          element={<AttendeeProfile />}
        />

        <Route
          path="settings"
          element={<AttendeeSettings />}
        />
      </Route>
    </Routes>
  );
}