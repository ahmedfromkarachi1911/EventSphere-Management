import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
} from "lucide-react";

import {
  getExpos,
  createApplication,
  uploadDocument,
} from "../../../services/api";

export default function ExhibitorApplyExpo() {
  const navigate = useNavigate();

  const [expos, setExpos] = useState([]);

  const [formData, setFormData] = useState({
    expo: "",
    boothType: "Standard 3x3",
    preferredHall: "Hall A",
    productsServices: "",
  });

  const [supportingDocument, setSupportingDocument] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadExpos = async () => {
      try {
        const data = await getExpos();

        if (Array.isArray(data)) {
          const publishedExpos = data.filter(
            (expo) => expo.status === "published"
          );

          setExpos(publishedExpos);

          if (publishedExpos.length > 0) {
            setFormData((prev) => ({
              ...prev,
              expo: publishedExpos[0]._id,
            }));
          }
        } else {
          setMessage(
            data.message || "Unable to load expos"
          );
        }
      } catch (error) {
        setMessage("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadExpos();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSupportingDocument(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSupportingDocument(null);
      setMessage(
        "Only PDF and DOCX documents are allowed"
      );

      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSupportingDocument(null);
      setMessage(
        "Document must be smaller than 10 MB"
      );

      e.target.value = "";
      return;
    }

    setSupportingDocument(file);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.expo) {
      setMessage("Please select an expo");
      return;
    }

    if (!formData.productsServices.trim()) {
      setMessage(
        "Please describe your products or services"
      );
      return;
    }

    if (!supportingDocument) {
      setMessage(
        "Supporting document is required"
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const applicationMessage = `
Booth Type: ${formData.boothType}
Preferred Hall: ${formData.preferredHall}
Products / Services: ${formData.productsServices}
      `.trim();

      const applicationData =
        await createApplication({
          expo: formData.expo,
          message: applicationMessage,
        });

      if (!applicationData.application) {
        setMessage(
          applicationData.message ||
            "Unable to submit application"
        );
        return;
      }

      const documentData =
        await uploadDocument(
          applicationData.application._id,
          supportingDocument
        );

      if (!documentData.document) {
        setMessage(
          documentData.message ||
            "Application submitted, but document upload failed. Please upload the document from the Documents page."
        );

        return;
      }

      navigate("/exhibitor/applications");
    } catch (error) {
      setMessage(
        "Unable to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Apply for Expo</h1>

          <p>
            Submit your booth application for an
            upcoming expo.
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label className="form-label">
                Select Expo
              </label>

              {loading ? (
                <div className="empty-state">
                  Loading expos...
                </div>
              ) : expos.length === 0 ? (
                <div className="empty-state">
                  No published expos available yet.
                </div>
              ) : (
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
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Booth Type
              </label>

              <select
                className="select"
                name="boothType"
                value={formData.boothType}
                onChange={handleChange}
              >
                <option>Standard 3x3</option>
                <option>Premium 6x3</option>
                <option>Corner Booth</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Preferred Hall
              </label>

              <select
                className="select"
                name="preferredHall"
                value={formData.preferredHall}
                onChange={handleChange}
              >
                <option>Hall A</option>
                <option>Hall B</option>
                <option>Hall C</option>
              </select>
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Products / Services to Showcase
              </label>

              <textarea
                className="textarea"
                name="productsServices"
                value={formData.productsServices}
                onChange={handleChange}
                placeholder="Briefly describe what you'll showcase..."
                required
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">
                Supporting Document
              </label>

              <label
                className="upload-box"
                style={{
                  cursor: "pointer",
                }}
              >
                {supportingDocument ? (
                  <>
                    <FileText size={26} />

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {supportingDocument.name}
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Click to choose another file
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={26} />

                    <span
                      style={{
                        fontSize: 13,
                      }}
                    >
                      Click to select supporting
                      document
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                      }}
                    >
                      PDF or DOCX up to 10 MB
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleDocumentChange}
                  style={{
                    display: "none",
                  }}
                />
              </label>
            </div>
          </div>

          {message && (
            <p
              style={{
                marginTop: 12,
                fontSize: 14,
                color: "#dc2626",
              }}
            >
              {message}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                submitting ||
                expos.length === 0
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit Application"}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                navigate(
                  "/exhibitor/applications"
                )
              }
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}