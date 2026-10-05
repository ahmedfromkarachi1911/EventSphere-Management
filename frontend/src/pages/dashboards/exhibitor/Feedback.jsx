import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import {
  getMyApplications,
  createFeedback,
} from "../../../services/api.js";

export default function ExhibitorFeedback() {
  const [expos, setExpos] = useState([]);

  const [formData, setFormData] = useState({
    expo: "",
    type: "feedback",
    rating: 0,
    comment: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadExpos = async () => {
      try {
        setLoading(true);
        setMessage("");

        const data = await getMyApplications();

        if (Array.isArray(data)) {
          const expoMap = new Map();

          data.forEach((application) => {
            const expo = application.expo;

            if (
              expo?._id &&
              expo.status === "published"
            ) {
              expoMap.set(expo._id, expo);
            }
          });

          const availableExpos = Array.from(
            expoMap.values()
          );

          setExpos(availableExpos);

          if (availableExpos.length > 0) {
            setFormData((current) => ({
              ...current,
              expo: availableExpos[0]._id,
            }));
          }
        } else {
          setMessage(
            data.message ||
              "Unable to load your expos"
          );
        }
      } catch (error) {
        setMessage(
          "Unable to load your expos"
        );
      } finally {
        setLoading(false);
      }
    };

    loadExpos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handleRating = (rating) => {
    setFormData((current) => ({
      ...current,
      rating,
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.expo) {
      setMessage("Please select an expo");
      return;
    }

    if (!formData.rating) {
      setMessage("Please select a rating");
      return;
    }

    if (!formData.comment.trim()) {
      setMessage(
        "Please enter your feedback"
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const data = await createFeedback({
        expo: formData.expo,
        type: formData.type,
        rating: formData.rating,
        comment: formData.comment.trim(),
      });

      if (!data.feedback) {
        setMessage(
          data.message ||
            "Unable to submit feedback"
        );
        return;
      }

      setMessage(
        "Feedback submitted successfully"
      );

      setFormData((current) => ({
        ...current,
        type: "feedback",
        rating: 0,
        comment: "",
      }));
    } catch (error) {
      setMessage(
        "Unable to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Feedback</h1>

          <p>
            Submit feedback, suggestions, or
            report issues related to your expos.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          maxWidth: 560,
        }}
      >
        {message && (
          <div
            style={{
              marginBottom: 16,
              fontSize: 14,
              color: message
                .toLowerCase()
                .includes("successfully")
                ? "#16a34a"
                : "#dc2626",
            }}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            Loading your expos...
          </div>
        ) : expos.length === 0 ? (
          <div className="empty-state">
            No published expo associated with
            your applications is available.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Select Expo
              </label>

              <select
                className="select"
                name="expo"
                value={formData.expo}
                onChange={handleChange}
                required
              >
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
                Feedback Type
              </label>

              <select
                className="select"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="feedback">
                  Feedback
                </option>

                <option value="suggestion">
                  Suggestion
                </option>

                <option value="issue">
                  Report Issue
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Your Rating
              </label>

              <div className="flex gap-2">
                {Array.from({
                  length: 5,
                }).map((_, index) => {
                  const rating = index + 1;

                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        handleRating(rating)
                      }
                      title={`${rating} Star`}
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <Star
                        size={24}
                        color="#F59E0B"
                        fill={
                          rating <=
                          formData.rating
                            ? "#F59E0B"
                            : "none"
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Your Feedback
              </label>

              <textarea
                className="textarea"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Share your feedback, suggestion, or issue..."
                rows={5}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}