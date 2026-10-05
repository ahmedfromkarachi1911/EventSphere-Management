import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Mail,
  KeyRound,
} from "lucide-react";

import {
  forgotPassword,
} from "../../services/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Email address is required");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      const data = await forgotPassword(cleanEmail);

      if (
        data.message ===
        "Password reset link sent to your email"
      ) {
        setSuccess(true);
        setMessage(data.message);
        return;
      }

      setMessage(
        data.message ||
          "Unable to send password reset link"
      );
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
              background:
                "rgba(255,255,255,.15)",
            }}
          >
            <Sparkles size={20} />
          </span>

          <span>EventSphere</span>
        </div>

        <h2 className="mt-6">
          Forgot Password?
        </h2>

        <p>
          No worries — enter your email and
          we'll help you reset it.
        </p>

        <div className="auth-visual-art">
          <div
            className="role-icon"
            style={{
              background:
                "rgba(255,255,255,.15)",
              width: 72,
              height: 72,
              borderRadius: 20,
            }}
          >
            <KeyRound
              size={32}
              color="#fff"
            />
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-box">
          <h1>Reset your password</h1>

          <p className="lead">
            Enter your email address and we'll
            send you a reset link
          </p>

          {message && (
            <div
              style={{
                marginBottom: 16,
                fontSize: 14,
                color: success
                  ? "#16a34a"
                  : "#dc2626",
              }}
            >
              {message}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>

              <div className="input-icon-wrap">
                <Mail size={16} />

                <input
                  className="input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage("");
                    setSuccess(false);
                  }}
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
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          <p className="auth-footer-note">
            Remember your password?{" "}
            <Link to="/login">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}