import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { getExpos } from "../../../services/api";
import socket from "../../../services/socket.js";

export default function AttendeeExploreExpos() {
  const [expos, setExpos] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const handleExpoCreated = (expo) => {
      if (expo.status !== "published") {
        return;
      }

      setExpos((previousExpos) => [
        expo,
        ...previousExpos.filter(
          (item) => item._id !== expo._id
        ),
      ]);
    };

    const handleExpoUpdated = (expo) => {
      setExpos((previousExpos) => {
        if (expo.status !== "published") {
          return previousExpos.filter(
            (item) => item._id !== expo._id
          );
        }

        const alreadyExists = previousExpos.some(
          (item) => item._id === expo._id
        );

        if (alreadyExists) {
          return previousExpos.map((item) =>
            item._id === expo._id ? expo : item
          );
        }

        return [expo, ...previousExpos];
      });
    };

    const handleExpoDeleted = (expoId) => {
      setExpos((previousExpos) =>
        previousExpos.filter(
          (expo) => expo._id !== expoId
        )
      );
    };

    socket.on("expoCreated", handleExpoCreated);
    socket.on("expoUpdated", handleExpoUpdated);
    socket.on("expoDeleted", handleExpoDeleted);

    return () => {
      socket.off(
        "expoCreated",
        handleExpoCreated
      );
      socket.off(
        "expoUpdated",
        handleExpoUpdated
      );
      socket.off(
        "expoDeleted",
        handleExpoDeleted
      );
    };
  }, []);

  const categories = [
    "All",
    ...new Set(
      expos.map((expo) => expo.category)
    ),
  ];

  const visible = expos.filter((expo) => {
    const matchesCategory =
      activeCat === "All" ||
      expo.category === activeCat;

    const searchText = search.toLowerCase();

    const matchesSearch =
      expo.title
        ?.toLowerCase()
        .includes(searchText) ||
      expo.city
        ?.toLowerCase()
        .includes(searchText) ||
      expo.category
        ?.toLowerCase()
        .includes(searchText);

    return matchesCategory && matchesSearch;
  });

  const formatDate = (
    startDate,
    endDate
  ) => {
    if (!startDate || !endDate) {
      return "-";
    }

    const start =
      new Date(
        startDate
      ).toLocaleDateString();

    const end =
      new Date(
        endDate
      ).toLocaleDateString();

    return `${start} - ${end}`;
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Explore Expos</h1>

          <p>
            Discover and register for upcoming expos.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="input-icon-wrap">
          <Search size={16} />

          <input
            className="input"
            placeholder="Search expos..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      <div
        className="chip-row mt-4"
        style={{ marginBottom: 24 }}
      >
        {categories.map((category) => (
          <button
            key={category}
            className={`chip${
              activeCat === category
                ? " active"
                : ""
            }`}
            onClick={() =>
              setActiveCat(category)
            }
          >
            {category}
          </button>
        ))}
      </div>

      {message && (
        <div className="empty-state">
          {message}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          Loading expos...
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          No expos available yet.
        </div>
      ) : (
        <div className="grid grid-3">
          {visible.map((expo) => (
            <Link
              to={`/attendee/explore/${expo._id}`}
              key={expo._id}
              className="expo-card"
            >
              {expo.coverImage ? (
                <img
                  src={expo.coverImage}
                  alt={expo.title}
                  className="expo-card-img"
                />
              ) : (
                <div className="expo-card-img flex items-center justify-center">
                  No Image Available
                </div>
              )}

              <div className="expo-card-body">
                <span className="expo-card-cat">
                  {expo.category}
                </span>

                <h3>{expo.title}</h3>

                <div className="expo-meta">
                  <span>
                    <CalendarDays size={14} />

                    {formatDate(
                      expo.startDate,
                      expo.endDate
                    )}
                  </span>

                  <span>
                    <MapPin size={14} />
                    {expo.city}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}