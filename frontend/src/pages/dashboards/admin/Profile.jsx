import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
} from "../../../services/api";

export default function AdminProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();

        if (data._id) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        } else {
          setMessage(data.message || "Unable to load profile");
        }
      } catch (error) {
        setMessage("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const data = await updateMyProfile(formData);

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
        });

        setMessage("Profile updated successfully");
      } else {
        setMessage(data.message || "Unable to update profile");
      }
    } catch (error) {
      setMessage("Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Manage your administrator account details.</p>
        </div>
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

      <div className="card">
        <div className="profile-head">
          <div
            className="profile-avatar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f1f5f9",
            }}
          >
            <ShieldCheck size={30} />
          </div>

          <div>
            <h2 style={{ fontSize: 18 }}>
              {formData.name || "Administrator"}
            </h2>

            <p
              className="text-muted"
              style={{ fontSize: 13 }}
            >
              Admin
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid mt-6">
            <div className="form-group">
              <label className="form-label">
                Full Name
              </label>

              <input
                className="input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>

              <input
                type="email"
                className="input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number
              </label>

              <input
                className="input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}