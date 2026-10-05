import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getExpos,
} from "../../../services/api";

export default function AdminSchedule() {
  const [sessions, setSessions] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    expo: "",
    title: "",
    speaker: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const sessionData = await getSessions();
      const expoData = await getExpos();

      if (Array.isArray(sessionData)) {
        setSessions(sessionData);
      }

      if (Array.isArray(expoData)) {
        const publishedExpos = expoData.filter(
          (expo) => expo.status === "published"
        );

        setExpos(publishedExpos);
      }
    } catch (error) {
      setMessage("Unable to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const openAddForm = () => {
    setEditingSession(null);

    setFormData({
      expo: expos[0]?._id || "",
      title: "",
      speaker: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
    });

    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (session) => {
    setEditingSession(session);

    setFormData({
      expo: session.expo?._id || "",
      title: session.title || "",
      speaker: session.speaker || "",
      date: session.date
        ? new Date(session.date).toISOString().split("T")[0]
        : "",
      startTime: session.startTime || "",
      endTime: session.endTime || "",
      location: session.location || "",
      description: session.description || "",
    });

    setShowForm(true);
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSession) {
        const data = await updateSession(
          editingSession._id,
          formData
        );

        if (!data.session) {
          setMessage(data.message || "Unable to update session");
          return;
        }

        await loadData();
        setMessage("Session updated successfully");
      } else {
        const data = await createSession(formData);

        if (!data.session) {
          setMessage(data.message || "Unable to create session");
          return;
        }

        await loadData();
        setMessage("Session created successfully");
      }

      closeForm();
    } catch (error) {
      setMessage("Unable to save session");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this session?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await deleteSession(id);

      if (data.message === "Session deleted successfully") {
        setSessions(
          sessions.filter((session) => session._id !== id)
        );

        setMessage("Session deleted successfully");
      } else {
        setMessage(data.message || "Unable to delete session");
      }
    } catch (error) {
      setMessage("Unable to delete session");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Schedule</h1>
          <p>Manage sessions across all expos.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddForm}
        >
          <Plus size={16} />
          Add Session
        </button>
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

      {showForm && (
        <div
          className="card"
          style={{ marginBottom: 24 }}
        >
          <div className="flex justify-between items-center">
            <div className="card-title">
              {editingSession
                ? "Edit Session"
                : "Add Session"}
            </div>

            <button
              type="button"
              className="btn-icon"
              onClick={closeForm}
            >
              <X size={16} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="form-grid mt-4"
          >
            <div className="form-group span-2">
              <label className="form-label">
                Expo
              </label>

              <select
                className="select"
                name="expo"
                value={formData.expo}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Expo
                </option>

                {expos.map((expo) => (
                  <option
                    key={expo._id}
                    value={expo._id}
                  >
                    {expo.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Session Title
              </label>

              <input
                type="text"
                name="title"
                className="input"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter session title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Speaker
              </label>

              <input
                type="text"
                name="speaker"
                className="input"
                value={formData.speaker}
                onChange={handleChange}
                placeholder="Enter speaker name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Date
              </label>

              <input
                type="date"
                name="date"
                className="input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Location
              </label>

              <input
                type="text"
                name="location"
                className="input"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Conference Hall A"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Start Time
              </label>

              <input
                type="time"
                name="startTime"
                className="input"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                End Time
              </label>

              <input
                type="time"
                name="endTime"
                className="input"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Description
              </label>

              <textarea
                name="description"
                className="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the session..."
              />
            </div>

            <div className="form-group span-2">
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingSession
                    ? "Update Session"
                    : "Add Session"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            No sessions available yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Title</th>
                  <th>Expo</th>
                  <th>Speaker</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id}>
                    <td className="cell-strong">
                      {session.title}
                    </td>

                    <td>
                      {session.expo?.title || "-"}
                    </td>

                    <td>{session.speaker}</td>

                    <td>
                      {formatDate(session.date)}
                    </td>

                    <td>
                      {session.startTime} -{" "}
                      {session.endTime}
                    </td>

                    <td>{session.location}</td>

                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() =>
                            openEditForm(session)
                          }
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() =>
                            handleDelete(session._id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}