import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Sparkles,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { resetPassword } from "../../services/api.js";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid password reset link");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await resetPassword(
        token,
        formData
      );

      if (data.message === "Password reset successfully") {
        setSuccess(true);
        setMessage(data.message);

        setFormData({
          password: "",
          confirmPassword: "",
        });
      } else {
        setMessage(
          data.message || "Unable to reset password"
        );
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

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

        <h2 className="mt-6">Almost There</h2>

        <p>
          Set a new password to secure your
          EventSphere account.
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
            <ShieldCheck
              size={32}
              color="#fff"
            />
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-box">
          <h1>Set New Password</h1>

          <p className="lead">
            Your new password must be different
            from previous passwords
          </p>

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

          {!success ? (
            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label className="form-label">
                  New Password
                </label>

                <div className="input-icon-wrap">
                  <Lock size={16} />

                  <input
                    className="input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm New Password
                </label>

                <div className="input-icon-wrap">
                  <Lock size={16} />

                  <input
                    className="input"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
            </form>
          ) : (
            <button
              className="btn btn-primary btn-block"
              onClick={() =>
                navigate("/login", {
                  replace: true,
                })
              }
            >
              Go to Login
            </button>
          )}

          <p className="auth-footer-note">
            <Link to="/login">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}