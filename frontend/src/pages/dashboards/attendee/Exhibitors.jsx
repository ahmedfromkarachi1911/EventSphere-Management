import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Building2 } from "lucide-react";

import {
  getApprovedExhibitors,
} from "../../../services/api";

export default function AttendeeExhibitors() {
  const [exhibitors, setExhibitors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadExhibitors = async () => {
      try {
        const data = await getApprovedExhibitors();

        if (Array.isArray(data)) {
          setExhibitors(data);
        } else {
          setMessage(
            data.message || "Unable to load exhibitors"
          );
        }
      } catch (error) {
        setMessage("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadExhibitors();
  }, []);

  const filteredExhibitors = exhibitors.filter(
    (exhibitor) => {
      const searchText = search
        .trim()
        .toLowerCase();

      if (!searchText) {
        return true;
      }

      const matchesProduct =
        exhibitor.products?.some((product) => {
          return (
            product.name
              ?.toLowerCase()
              .includes(searchText) ||
            product.category
              ?.toLowerCase()
              .includes(searchText) ||
            product.description
              ?.toLowerCase()
              .includes(searchText)
          );
        });

      return (
        exhibitor.companyName
          ?.toLowerCase()
          .includes(searchText) ||
        exhibitor.name
          ?.toLowerCase()
          .includes(searchText) ||
        exhibitor.category
          ?.toLowerCase()
          .includes(searchText) ||
        exhibitor.description
          ?.toLowerCase()
          .includes(searchText) ||
        exhibitor.expo?.title
          ?.toLowerCase()
          .includes(searchText) ||
        exhibitor.expo?.category
          ?.toLowerCase()
          .includes(searchText) ||
        matchesProduct
      );
    }
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Exhibitors</h1>

          <p>
            Browse approved exhibiting companies across expos.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="input-icon-wrap">
          <Search size={16} />

          <input
            className="input"
            placeholder="Search companies, categories, products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {message && (
        <div
          style={{
            marginTop: 16,
            fontSize: 14,
            color: "#dc2626",
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="card mt-6">
          <div className="empty-state">
            Loading exhibitors...
          </div>
        </div>
      ) : filteredExhibitors.length === 0 ? (
        <div className="card mt-6">
          <div className="empty-state">
            No exhibitors found.
          </div>
        </div>
      ) : (
        <div className="grid grid-3 mt-6">
          {filteredExhibitors.map((exhibitor) => (
            <Link
              to={`/attendee/exhibitors/${exhibitor.applicationId}`}
              key={exhibitor.applicationId}
              className="card"
            >
              <div className="avatar-cell">
                <div
                  className="avatar-sq"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={20} />
                </div>

                <div>
                  <div className="cell-strong">
                    {exhibitor.companyName ||
                      exhibitor.name}
                  </div>

                  <div
                    className="text-muted"
                    style={{ fontSize: 12 }}
                  >
                    {exhibitor.hall ===
                    "Not Assigned"
                      ? "Booth not assigned"
                      : `${exhibitor.hall}, Booth ${exhibitor.boothNumber}`}
                  </div>
                </div>
              </div>

              <div
                className="text-muted mt-4"
                style={{
                  fontSize: 13,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span>
                  Contact: {exhibitor.name}
                </span>

                <span>
                  Expo:{" "}
                  {exhibitor.expo?.title || "-"}
                </span>

                <span>
                  Category:{" "}
                  {exhibitor.category ||
                    exhibitor.expo?.category ||
                    "-"}
                </span>

                <span>
                  Booth Type:{" "}
                  {exhibitor.boothType}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}