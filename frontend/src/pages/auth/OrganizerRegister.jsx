import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ShieldCheck } from "lucide-react";
import { registerUser } from "../../services/api";

export default function OrganizerRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    organizerCode: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await registerUser({
        name: formData.name,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "admin",
        organizerCode: formData.organizerCode,
      });

      if (data.user) {
        alert("Organizer registration successful");
        navigate("/login");
      } else {
        setMessage(data.message || "Unable to register organizer");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="brand" style={{ color: "#fff" }}>
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
          Create Organizer Account
        </h2>

        <p>
          Register as an authorized organizer to create and
          manage expos, exhibitors, booths and schedules.
        </p>

        <div className="auth-visual-art">
          <div
            className="role-icon"
            style={{
              background: "rgba(255,255,255,.15)",
              width: 72,
              height: 72,
              borderRadius: 20,
            }}
          >
            <ShieldCheck size={32} color="#fff" />
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div
          className="auth-box"
          style={{ maxWidth: 460 }}
        >
          <h1>Create Organizer Account</h1>

          <p className="lead">
            Enter your organizer details
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Organization Name
                </label>

                <input
                  className="input"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  className="input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email Address
                </label>

                <input
                  className="input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone Number
                </label>

                <input
                  className="input"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password
                </label>

                <input
                  className="input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>

                <input
                  className="input"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">
                  Organizer Registration Code
                </label>

                <input
                  className="input"
                  type="password"
                  name="organizerCode"
                  value={formData.organizerCode}
                  onChange={handleChange}
                  placeholder="Enter organizer registration code"
                  required
                />
              </div>
            </div>

            {message && (
              <p className="mt-2 text-sm text-red-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block mt-2"
            >
              {loading
                ? "Creating Account..."
                : "Register"}
            </button>
          </form>

          <p className="auth-footer-note">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}