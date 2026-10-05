import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  MapPin,
  Tag,
  MessageSquare,
  Mail,
  Phone,
  Building2,
  Globe,
} from "lucide-react";

import {
  getExhibitorByApplicationId,
  sendMessage,
  recordBoothVisit,
} from "../../../services/api.js";

const SERVER_URL = "http://localhost:5000";

export default function AttendeeExhibitorDetails() {
  const { id } = useParams();

  const [exhibitor, setExhibitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showMessageBox, setShowMessageBox] =
    useState(false);

  const [messageText, setMessageText] =
    useState("");

  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadExhibitor = async () => {
      try {
        const data =
          await getExhibitorByApplicationId(id);

        if (data.applicationId) {
          setExhibitor(data);

          if (data.boothId) {
            try {
              await recordBoothVisit(
                data.boothId
              );
            } catch (error) {
              console.log(
                "Unable to record booth visit"
              );
            }
          }
        } else {
          setMessage(
            data.message ||
              "Exhibitor not found"
          );
        }
      } catch (error) {
        setMessage(
          "Unable to load exhibitor"
        );
      } finally {
        setLoading(false);
      }
    };

    loadExhibitor();
  }, [id]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setMessage(
        "Please enter a message"
      );

      return;
    }

    try {
      setSending(true);
      setMessage("");

      const data = await sendMessage(
        exhibitor._id,
        messageText
      );

      if (data.data) {
        setMessage(
          "Message sent successfully"
        );

        setMessageText("");
        setShowMessageBox(false);
      } else {
        setMessage(
          data.message ||
            "Unable to send message"
        );
      }
    } catch (error) {
      setMessage(
        "Unable to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const getLogoUrl = (logo) => {
    if (!logo) {
      return "";
    }

    if (
      logo.startsWith("http://") ||
      logo.startsWith("https://")
    ) {
      return logo;
    }

    return `${SERVER_URL}${logo}`;
  };

  const logoUrl = getLogoUrl(
    exhibitor?.logo
  );

  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">
          Loading exhibitor...
        </div>
      </div>
    );
  }

  if (!exhibitor) {
    return (
      <div className="card">
        <div className="empty-state">
          {message ||
            "Exhibitor not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
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
        <div
          className="flex justify-between items-center"
          style={{
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div className="avatar-cell">
            <div
              className="avatar-sq"
              style={{
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                overflow: "hidden",
                background: "#f1f5f9",
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={
                    exhibitor.companyName ||
                    exhibitor.name
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Building2 size={26} />
              )}
            </div>

            <div>
              <h2
                style={{
                  fontSize: 20,
                }}
              >
                {exhibitor.companyName ||
                  exhibitor.name}
              </h2>

              <div
                className="text-muted flex gap-3 mt-2"
                style={{
                  fontSize: 13,
                  flexWrap: "wrap",
                }}
              >
                <span className="flex items-center gap-2">
                  <Tag size={13} />

                  {exhibitor.category ||
                    exhibitor.expo
                      ?.category ||
                    "-"}
                </span>

                <span className="flex items-center gap-2">
                  <MapPin size={13} />

                  {exhibitor.hall ===
                  "Not Assigned"
                    ? "Booth not assigned"
                    : `${exhibitor.hall}, Booth ${exhibitor.boothNumber}`}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              setShowMessageBox(
                !showMessageBox
              )
            }
          >
            <MessageSquare size={16} />
            Message
          </button>
        </div>

        {exhibitor.description && (
          <div
            className="mt-6"
            style={{
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            <div
              className="cell-strong"
              style={{
                marginBottom: 6,
              }}
            >
              About Company
            </div>

            <p className="text-muted">
              {exhibitor.description}
            </p>
          </div>
        )}

        <div
          className="text-muted mt-6"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontSize: 14,
          }}
        >
          <span>
            Expo:{" "}
            {exhibitor.expo?.title ||
              "-"}
          </span>

          <span>
            Booth Type:{" "}
            {exhibitor.boothType ||
              "Not Assigned"}
          </span>

          <span className="flex items-center gap-2">
            <Mail size={14} />
            {exhibitor.email}
          </span>

          <span className="flex items-center gap-2">
            <Phone size={14} />
            {exhibitor.phone}
          </span>

          <span>
            Contact Person:{" "}
            {exhibitor.name}
          </span>

          {exhibitor.website && (
            <span className="flex items-center gap-2">
              <Globe size={14} />

              <a
                href={
                  exhibitor.website.startsWith(
                    "http://"
                  ) ||
                  exhibitor.website.startsWith(
                    "https://"
                  )
                    ? exhibitor.website
                    : `https://${exhibitor.website}`
                }
                target="_blank"
                rel="noreferrer"
                style={{
                  color:
                    "var(--primary)",
                }}
              >
                {exhibitor.website}
              </a>
            </span>
          )}
        </div>

        {showMessageBox && (
          <div className="mt-6">
            <label className="form-label">
              Message
            </label>

            <textarea
              className="textarea"
              placeholder={`Write a message to ${
                exhibitor.companyName ||
                exhibitor.name
              }...`}
              value={messageText}
              onChange={(e) =>
                setMessageText(
                  e.target.value
                )
              }
            />

            <div className="flex gap-3 mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  handleSendMessage
                }
                disabled={sending}
              >
                {sending
                  ? "Sending..."
                  : "Send Message"}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setShowMessageBox(
                    false
                  );

                  setMessageText("");
                }}
                disabled={sending}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Showcased Products
        </div>

        {exhibitor.products?.length ===
        0 ? (
          <div className="empty-state mt-4">
            No products added by this
            exhibitor yet.
          </div>
        ) : (
          <div className="grid grid-3 mt-4">
            {exhibitor.products?.map(
              (product) => (
                <div
                  key={product._id}
                  className="card"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        marginBottom: 12,
                        objectFit:
                          "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        marginBottom: 12,
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          "#f1f5f9",
                        fontWeight: 700,
                      }}
                    >
                      {product.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="cell-strong">
                    {product.name}
                  </div>

                  <div
                    className="text-muted"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    {product.category}
                  </div>

                  {product.description && (
                    <p
                      className="text-muted mt-2"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      {
                        product.description
                      }
                    </p>
                  )}

                  <div
                    className="mt-3"
                    style={{
                      fontWeight: 700,
                      color:
                        "var(--primary)",
                    }}
                  >
                    Rs.{" "}
                    {Number(
                      product.price
                    ).toLocaleString()}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}