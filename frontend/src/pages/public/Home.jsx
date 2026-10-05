import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users2,
  Building2,
  Layers,
  Award,
} from "lucide-react";

import { getExpos } from "../../services/api";

export default function Home() {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpos = async () => {
      try {
        const data = await getExpos();

        if (Array.isArray(data)) {
          const publishedExpos = data.filter(
            (expo) => expo.status === "published"
          );

          setExpos(publishedExpos);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadExpos();
  }, []);

  const featured = expos.slice(0, 3);

  const categoryCount = new Set(
    expos.map((expo) => expo.category)
  ).size;

  const stats = [
    {
      value: expos.length,
      label: "Expos Organized",
    },
    {
      value: 0,
      label: "Exhibitors",
    },
    {
      value: 0,
      label: "Attendees",
    },
    {
      value: categoryCount,
      label: "Categories",
    },
  ];

  const formatDate = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return "-";
    }

    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();

    return `${start} - ${end}`;
  };

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">
              <Award size={14} />
              Pakistan's Leading Expo Platform
            </span>

            <h1>
              Manage Expos.
              <br />

              <span className="accent">
                Connect People.
              </span>

              <br />
              Create Experiences.
            </h1>

            <p className="lead">
              A complete platform to organize, manage and
              explore expos, exhibitions and trade shows —
              all in one place.
            </p>

            <div className="hero-actions">
              <Link
                to="/expos"
                className="btn btn-primary"
              >
                Explore Expos
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/about"
                className="btn btn-outline"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80"
              alt="Expo hall"
            />
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container grid grid-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="stat-num">
                {stat.value}
              </div>

              <div className="stat-label">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured Expos</h2>

            <p>
              Discover upcoming exhibitions and trade shows
              happening across the country.
            </p>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading expos...
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              No expos available yet.
            </div>
          ) : (
            <div className="grid grid-3">
              {featured.map((expo) => (
                <Link
                  to={`/expos/${expo._id}`}
                  key={expo._id}
                  className="expo-card"
                >
                  <img
                    src={
                      expo.coverImage ||
                      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
                    }
                    alt={expo.title}
                    className="expo-card-img"
                  />

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
      </section>

      <section
        className="section"
        style={{
          background: "#fff",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div className="container grid grid-3">
          <div className="card">
            <div
              className="stat-icon"
              style={{ marginBottom: 14 }}
            >
              <Building2 size={20} />
            </div>

            <h3 style={{ fontSize: 16 }}>
              For Organizers
            </h3>

            <p
              className="text-muted mt-2"
              style={{ fontSize: 14 }}
            >
              Plan, publish and manage expos with dedicated
              analytics and exhibitor tools.
            </p>
          </div>

          <div className="card">
            <div
              className="stat-icon"
              style={{ marginBottom: 14 }}
            >
              <Layers size={20} />
            </div>

            <h3 style={{ fontSize: 16 }}>
              For Exhibitors
            </h3>

            <p
              className="text-muted mt-2"
              style={{ fontSize: 14 }}
            >
              Showcase your company, manage your booth and
              connect with attendees.
            </p>
          </div>

          <div className="card">
            <div
              className="stat-icon"
              style={{ marginBottom: 14 }}
            >
              <Users2 size={20} />
            </div>

            <h3 style={{ fontSize: 16 }}>
              For Attendees
            </h3>

            <p
              className="text-muted mt-2"
              style={{ fontSize: 14 }}
            >
              Explore expos, register for sessions and
              connect with exhibitors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}