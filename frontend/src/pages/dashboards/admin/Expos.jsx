import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { getExpos, deleteExpo } from "../../../services/api";

export default function AdminExpos() {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  const fetchExpos = async () => {
    try {
      setLoading(true);

      const data = await getExpos();

      if (Array.isArray(data)) {
        setExpos(data);
      } else {
        setMessage(data.message || "Unable to load expos");
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpos();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expo?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const data = await deleteExpo(id);

      if (data.message === "Expo deleted successfully") {
        setExpos(expos.filter((expo) => expo._id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Unable to delete expo");
    }
  };

  const filteredExpos = expos.filter((expo) => {
    const matchesSearch = expo.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      status === "All Status" ||
      expo.status.toLowerCase() === status.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const formatDate = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();

    return `${start} - ${end}`;
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Expos</h1>
          <p>Manage all expos on the platform.</p>
        </div>

        <Link to="/admin/expos/new" className="btn btn-primary">
          <Plus size={16} />
          Create Expo
        </Link>
      </div>

      {message && (
        <div className="mb-4 text-sm text-red-600">
          {message}
        </div>
      )}

      <div className="card">
        <div className="filter-bar" style={{ marginBottom: 20 }}>
          <div className="input-icon-wrap">
            <Search size={16} />

            <input
              className="input"
              placeholder="Search expos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select"
            style={{ maxWidth: 180 }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expo Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading expos...</td>
                </tr>
              ) : filteredExpos.length === 0 ? (
                <tr>
                  <td colSpan="5">No expos found.</td>
                </tr>
              ) : (
                filteredExpos.map((expo) => (
                  <tr key={expo._id}>
                    <td className="cell-strong">
                      {expo.title}
                    </td>

                    <td>
                      {formatDate(
                        expo.startDate,
                        expo.endDate
                      )}
                    </td>

                    <td>
                      {expo.venue}, {expo.city}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          expo.status === "published"
                            ? "badge-success"
                            : "badge-neutral"
                        }`}
                      >
                        {expo.status}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <Link
                          to={`/admin/expos/${expo._id}/edit`}
                          className="btn-icon"
                        >
                          <Pencil size={15} />
                        </Link>

                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() =>
                            handleDelete(expo._id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}