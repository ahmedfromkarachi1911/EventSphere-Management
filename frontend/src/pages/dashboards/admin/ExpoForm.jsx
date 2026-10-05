import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";

import {
  getExpoById,
  createExpo,
  updateExpo,
} from "../../../services/api";

export default function AdminExpoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    category: "Technology",
    theme: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    status: "draft",
    venue: "",
    city: "",
    openingTime: "",
    closingTime: "",
    expectedAttendees: "",
    coverImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] =
    useState(isEdit);
  const [message, setMessage] = useState("");

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadExpo = async () => {
      try {
        const data = await getExpoById(id);

        if (data.message) {
          setMessage(data.message);
          return;
        }

        setFormData({
          title: data.title || "",
          category:
            data.category || "Technology",
          theme: data.theme || "",
          description:
            data.description || "",
          startDate: data.startDate
            ? data.startDate.split("T")[0]
            : "",
          endDate: data.endDate
            ? data.endDate.split("T")[0]
            : "",
          registrationDeadline:
            data.registrationDeadline
              ? data.registrationDeadline.split(
                  "T"
                )[0]
              : "",
          status: data.status || "draft",
          venue: data.venue || "",
          city: data.city || "",
          openingTime:
            data.openingTime || "",
          closingTime:
            data.closingTime || "",
          expectedAttendees:
            data.expectedAttendees || "",
          coverImage:
            data.coverImage || "",
        });
      } catch (error) {
        setMessage("Unable to load expo");
      } finally {
        setPageLoading(false);
      }
    };

    loadExpo();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Title is required";
    }

    if (!formData.description.trim()) {
      return "Description is required";
    }

    if (!formData.venue.trim()) {
      return "Venue is required";
    }

    if (!formData.city.trim()) {
      return "City is required";
    }

    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.registrationDeadline
    ) {
      return "All dates are required";
    }

    if (
      !isEdit &&
      formData.startDate < todayString
    ) {
      return "Start date cannot be in the past";
    }

    if (
      formData.endDate <
      formData.startDate
    ) {
      return "End date cannot be before start date";
    }

    if (
      formData.registrationDeadline >
      formData.startDate
    ) {
      return "Registration deadline cannot be after expo start date";
    }

    if (
      !isEdit &&
      formData.registrationDeadline <
        todayString
    ) {
      return "Registration deadline cannot be in the past";
    }

    if (
      !formData.openingTime ||
      !formData.closingTime
    ) {
      return "Opening and closing time are required";
    }

    if (
      formData.closingTime <=
      formData.openingTime
    ) {
      return "Closing time must be after opening time";
    }

    const attendees = Number(
      formData.expectedAttendees
    );

    if (
      !formData.expectedAttendees ||
      !Number.isInteger(attendees) ||
      attendees <= 0
    ) {
      return "Expected attendees must be greater than 0";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationMessage =
      validateForm();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        ...formData,
        title: formData.title.trim(),
        theme: formData.theme.trim(),
        description:
          formData.description.trim(),
        venue: formData.venue.trim(),
        city: formData.city.trim(),
        expectedAttendees: Number(
          formData.expectedAttendees
        ),
      };

      const data = isEdit
        ? await updateExpo(id, payload)
        : await createExpo(payload);

      if (
        data.message ===
          "Expo created successfully" ||
        data.message ===
          "Expo updated successfully"
      ) {
        navigate("/admin/expos");
        return;
      }

      setMessage(
        data.message ||
          "Something went wrong"
      );
    } catch (error) {
      setMessage(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="card">
        <p>Loading expo...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>
            {isEdit
              ? "Edit Expo"
              : "Create Expo"}
          </h1>

          <p>
            {isEdit
              ? "Update the details for this expo."
              : "Fill in the details to publish a new expo."}
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Title
              </label>

              <input
                className="input"
                type="text"
                name="title"
                placeholder="e.g. Tech Innovation Expo 2026"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Category
              </label>

              <select
                className="select"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Technology">
                  Technology
                </option>

                <option value="Energy">
                  Energy
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Construction">
                  Construction
                </option>
              </select>
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Theme
              </label>

              <input
                className="input"
                type="text"
                name="theme"
                placeholder="e.g. AI & The Future of Work"
                value={formData.theme}
                onChange={handleChange}
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Description
              </label>

              <textarea
                className="textarea"
                name="description"
                placeholder="Describe the expo..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Cover Image
              </label>

              <div className="upload-box">
                <UploadCloud size={26} />

                <span
                  style={{
                    fontSize: 13,
                  }}
                >
                  Click to upload or drag and drop
                </span>

                <span
                  style={{
                    fontSize: 12,
                  }}
                >
                  PNG, JPG up to 5MB
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Start Date
              </label>

              <input
                className="input"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={
                  isEdit
                    ? undefined
                    : todayString
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                End Date
              </label>

              <input
                className="input"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={
                  formData.startDate ||
                  undefined
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Registration Deadline
              </label>

              <input
                className="input"
                type="date"
                name="registrationDeadline"
                value={
                  formData.registrationDeadline
                }
                onChange={handleChange}
                min={
                  isEdit
                    ? undefined
                    : todayString
                }
                max={
                  formData.startDate ||
                  undefined
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>

              <select
                className="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Venue
              </label>

              <input
                className="input"
                type="text"
                name="venue"
                placeholder="e.g. Expo Centre Karachi"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                City
              </label>

              <input
                className="input"
                type="text"
                name="city"
                placeholder="e.g. Karachi, Pakistan"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Opening Time
              </label>

              <input
                className="input"
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Closing Time
              </label>

              <input
                className="input"
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                min={
                  formData.openingTime ||
                  undefined
                }
                required
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Expected Attendees
              </label>

              <input
                className="input"
                type="number"
                name="expectedAttendees"
                placeholder="e.g. 12000"
                value={
                  formData.expectedAttendees
                }
                onChange={handleChange}
                min="1"
                step="1"
                required
              />
            </div>
          </div>

          {message && (
            <p
              style={{
                marginTop: 12,
                color: "#dc2626",
                fontSize: 14,
              }}
            >
              {message}
            </p>
          )}

          <div
            className="flex gap-3"
            style={{ marginTop: 8 }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create Expo"}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                navigate("/admin/expos")
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}