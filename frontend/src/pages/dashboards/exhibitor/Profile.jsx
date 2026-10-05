import { useEffect, useState } from "react";
import {
  Building2,
  Upload,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
  uploadProfileLogo,
} from "../../../services/api";

const SERVER_URL = "http://localhost:5000";

export default function ExhibitorProfile() {
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    website: "",
    category: "",
    description: "",
    shareContactInfo: false,
  });

  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] =
    useState(null);
  const [logoPreview, setLogoPreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [uploadingLogo, setUploadingLogo] =
    useState(false);
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();

        if (data._id) {
          setFormData({
            companyName:
              data.companyName || "",
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            website: data.website || "",
            category: data.category || "",
            description:
              data.description || "",
            shareContactInfo:
              data.shareContactInfo || false,
          });

          setLogo(data.logo || "");
        } else {
          setMessage(
            data.message ||
              "Unable to load profile"
          );
        }
      } catch (error) {
        setMessage(
          "Unable to connect to server"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(
          logoPreview
        );
      }
    };
  }, [logoPreview]);

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
        type === "checkbox"
          ? checked
          : value,
    }));

    setMessage("");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setMessage(
        "Only JPG, PNG and WEBP images are allowed"
      );

      e.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Logo image must be smaller than 5 MB"
      );

      e.target.value = "";
      return;
    }

    if (logoPreview) {
      URL.revokeObjectURL(
        logoPreview
      );
    }

    setLogoFile(file);

    setLogoPreview(
      URL.createObjectURL(file)
    );

    setMessage("");
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setMessage(
        "Please select a logo first"
      );

      return;
    }

    try {
      setUploadingLogo(true);
      setMessage("");

      const data =
        await uploadProfileLogo(
          logoFile
        );

      if (data.logo) {
        setLogo(data.logo);
        setLogoFile(null);

        if (logoPreview) {
          URL.revokeObjectURL(
            logoPreview
          );
        }

        setLogoPreview("");

        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              data.user
            )
          );
        }

        setMessage(
          "Company logo uploaded successfully"
        );
      } else {
        setMessage(
          data.message ||
            "Unable to upload logo"
        );
      }
    } catch (error) {
      setMessage(
        "Unable to upload logo"
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const data =
        await updateMyProfile(
          formData
        );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setFormData({
          companyName:
            data.user.companyName || "",
          name:
            data.user.name || "",
          email:
            data.user.email || "",
          phone:
            data.user.phone || "",
          website:
            data.user.website || "",
          category:
            data.user.category || "",
          description:
            data.user.description || "",
          shareContactInfo:
            data.user
              .shareContactInfo ||
            false,
        });

        setLogo(
          data.user.logo || ""
        );

        setMessage(
          "Profile updated successfully"
        );
      } else {
        setMessage(
          data.message ||
            "Unable to update profile"
        );
      }
    } catch (error) {
      setMessage(
        "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const displayLogo =
    logoPreview
      ? logoPreview
      : logo
      ? `${SERVER_URL}${logo}`
      : "";

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
          <h1>My Profile</h1>

          <p>
            Company information shown to
            attendees and organizers.
          </p>
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
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              background: "#f1f5f9",
              overflow: "hidden",
            }}
          >
            {displayLogo ? (
              <img
                src={displayLogo}
                alt="Company Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Building2
                size={30}
              />
            )}
          </div>

          <div>
            <h2
              style={{
                fontSize: 18,
              }}
            >
              {formData.companyName ||
                formData.name ||
                "Exhibitor"}
            </h2>

            <p
              className="text-muted"
              style={{
                fontSize: 13,
              }}
            >
              {formData.category ||
                "No category selected"}
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            marginBottom: 24,
          }}
        >
          <label className="form-label">
            Company Logo
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={
                handleLogoChange
              }
              className="input"
              style={{
                maxWidth: 320,
              }}
            />

            <button
              type="button"
              className="btn btn-primary"
              onClick={
                handleLogoUpload
              }
              disabled={
                uploadingLogo ||
                !logoFile
              }
            >
              <Upload size={15} />

              {uploadingLogo
                ? "Uploading..."
                : "Upload Logo"}
            </button>
          </div>

          <p
            className="text-muted"
            style={{
              fontSize: 12,
              marginTop: 6,
            }}
          >
            JPG, PNG or WEBP.
            Maximum 5 MB.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div className="form-grid mt-6">
            <div className="form-group">
              <label className="form-label">
                Company Name
              </label>

              <input
                className="input"
                name="companyName"
                value={
                  formData.companyName
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Person
              </label>

              <input
                className="input"
                name="name"
                value={formData.name}
                onChange={
                  handleChange
                }
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
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
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
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Website
              </label>

              <input
                className="input"
                name="website"
                value={
                  formData.website
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. www.company.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Category
              </label>

              <input
                className="input"
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Technology"
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Company Description
              </label>

              <textarea
                className="textarea"
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe your company..."
              />
            </div>

            <div className="form-group span-2">
              <label
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="shareContactInfo"
                  checked={
                    formData.shareContactInfo
                  }
                  onChange={
                    handleChange
                  }
                  style={{
                    marginTop: 4,
                  }}
                />

                <span>
                  <strong>
                    Share my contact
                    information
                  </strong>

                  <div
                    className="text-muted"
                    style={{
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    Allow attendees to
                    view my email address
                    and phone number on
                    my exhibitor profile.
                  </div>
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}