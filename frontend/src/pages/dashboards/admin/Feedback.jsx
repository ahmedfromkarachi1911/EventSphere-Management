import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import {
  getAllFeedback,
  updateFeedbackStatus,
} from "../../../services/api.js";

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAllFeedback();

      if (Array.isArray(data)) {
        setFeedbackList(data);
        return;
      }

      if (Array.isArray(data?.feedback)) {
        setFeedbackList(data.feedback);
        return;
      }

      if (Array.isArray(data?.data)) {
        setFeedbackList(data.data);
        return;
      }

      if (data?.message) {
        setMessage(data.message);
        setFeedbackList([]);
        return;
      }

      setFeedbackList([]);
    } catch (error) {
      setMessage("Unable to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);
      setMessage("");

      const data = await updateFeedbackStatus(
        id,
        status
      );

      if (data?.message && !data?._id && !data?.feedback) {
        setMessage(data.message);
      }

      await loadFeedback();
    } catch (error) {
      setMessage("Unable to update feedback status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getUserName = (feedback) => {
    return (
      feedback.user?.name ||
      feedback.attendee?.name ||
      "Attendee"
    );
  };

  const getExpoTitle = (feedback) => {
    return (
      feedback.expo?.title ||
      "Expo unavailable"
    );
  };

  if (loading) {
    return (
      <div className="empty-state">
        Loading feedback...
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Feedback</h1>
          <p>
            Attendee feedback submitted across all expos.
          </p>
        </div>
      </div>

      {message && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      {feedbackList.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            No feedback submitted yet.
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {feedbackList.map((feedback) => (
            <div
              className="card"
              key={feedback._id}
            >
              <div className="flex justify-between items-center">
                <span className="cell-strong">
                  {getUserName(feedback)}
                </span>

                <span
                  className="flex"
                  style={{
                    color: "#F59E0B",
                  }}
                >
                  {Array.from({
                    length: Number(
                      feedback.rating || 0
                    ),
                  }).map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      fill="#F59E0B"
                    />
                  ))}
                </span>
              </div>

              <div
                className="text-muted mt-2"
                style={{
                  fontSize: 12,
                }}
              >
                {getExpoTitle(feedback)}
              </div>

              <div
                className="mt-3"
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span className="badge badge-neutral">
                  {feedback.type || "feedback"}
                </span>

                <span className="badge badge-neutral">
                  {feedback.status || "new"}
                </span>
              </div>

              <p
                className="mt-4"
                style={{
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  lineHeight: 1.6,
                }}
              >
                "{feedback.comment}"
              </p>

              <div className="mt-4">
                <label className="form-label">
                  Status
                </label>

                <select
                  className="input"
                  value={feedback.status || "new"}
                  disabled={
                    updatingId === feedback._id
                  }
                  onChange={(e) =>
                    handleStatusChange(
                      feedback._id,
                      e.target.value
                    )
                  }
                >
                  <option value="new">
                    New
                  </option>

                  <option value="reviewed">
                    Reviewed
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>
                </select>
              </div>

              {feedback.createdAt && (
                <div
                  className="text-muted mt-3"
                  style={{
                    fontSize: 11,
                  }}
                >
                  {new Date(
                    feedback.createdAt
                  ).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}