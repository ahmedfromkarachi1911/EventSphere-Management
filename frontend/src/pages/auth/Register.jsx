import { Link } from "react-router-dom";
import {
  Sparkles,
  Store,
  Users,
  ArrowRight,
} from "lucide-react";

export default function Register() {
  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div
          className="brand"
          style={{ color: "#fff" }}
        >
          <span
            className="brand-mark"
            style={{
              background: "rgba(255,255,255,.15)",
            }}
          >
            <Sparkles size={20} />
          </span>

          <span>EventSphere</span>
        </div>

        <h2 className="mt-6">
          Join EventSphere
        </h2>

        <p>
          Register as an exhibitor to showcase your
          company or join as an attendee to explore
          expos and events.
        </p>

        <div className="auth-visual-art">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=80"
            alt="Register illustration"
            style={{
              borderRadius: 16,
              opacity: 0.9,
            }}
          />
        </div>
      </div>

      <div className="auth-form-wrap">
        <div
          className="auth-box"
          style={{ maxWidth: 680 }}
        >
          <h1>Create your account</h1>

          <p className="lead">
            Choose your role to get started
          </p>

          <div className="role-grid">
            <div className="role-card">
              <div
                className="role-icon"
                style={{
                  background: "var(--success)",
                }}
              >
                <Store size={24} />
              </div>

              <h3 style={{ fontSize: 16 }}>
                Exhibitor
              </h3>

              <p>
                Showcase your company and manage your
                booth.
              </p>

              <Link
                to="/register/exhibitor"
                className="btn btn-primary btn-block"
              >
                Continue
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="role-card">
              <div
                className="role-icon"
                style={{
                  background: "var(--primary)",
                }}
              >
                <Users size={24} />
              </div>

              <h3 style={{ fontSize: 16 }}>
                Attendee
              </h3>

              <p>
                Explore expos, register and connect.
              </p>

              <Link
                to="/register/attendee"
                className="btn btn-primary btn-block"
              >
                Continue
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <p className="auth-footer-note">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}