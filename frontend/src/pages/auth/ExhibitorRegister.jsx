import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Store } from "lucide-react";
import { registerUser } from "../../services/api";

export default function ExhibitorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consentAccepted: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setMessage("Passwords do not match");
      return;
    }

    if (!formData.consentAccepted) {
      setMessage(
        "Please accept the privacy consent to continue"
      );
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
        role: "exhibitor",
        consentAccepted:
          formData.consentAccepted,
      });

      if (data.user) {
        alert("Registration successful");
        navigate("/login");
      } else {
        setMessage(
          data.message ||
            "Unable to register"
        );
      }
    } catch (error) {
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div
        className="auth-visual"
        style={{
          background:
            "linear-gradient(160deg, #15803D, #16A34A)",
        }}
      >
        <div
          className="brand"
          style={{
            color: "#fff",
          }}
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
          Create Exhibitor Account
        </h2>

        <p>
          Fill in your company details to
          showcase your brand and manage your
          booth at upcoming expos.
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
            <Store
              size={32}
              color="#fff"
            />
          </div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div
          className="auth-box"
          style={{
            maxWidth: 460,
          }}
        >
          <h1>
            Create Exhibitor Account
          </h1>

          <p className="lead">
            Fill in your company details
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Company Name
                </label>

                <input
                  className="input"
                  type="text"
                  name="companyName"
                  value={
                    formData.companyName
                  }
                  onChange={handleChange}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contact Person
                </label>

                <input
                  className="input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter contact person name"
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
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 13,
                lineHeight: 1.5,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="consentAccepted"
                checked={
                  formData.consentAccepted
                }
                onChange={handleChange}
                required
                style={{
                  marginTop: 3,
                }}
              />

              <span>
                I consent to EventSphere
                processing and storing my
                personal and company information
                for account management and expo
                services.
              </span>
            </label>

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
            <Link to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}