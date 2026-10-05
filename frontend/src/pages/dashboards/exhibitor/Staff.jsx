import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  getMyStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../../services/api";

export default function ExhibitorStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const loadStaff = async () => {
    try {
      setLoading(true);

      const data = await getMyStaff();

      if (Array.isArray(data)) {
        setStaff(data);
      } else {
        setMessage(data.message || "Unable to load staff");
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const openAddForm = () => {
    setEditingStaff(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
    });

    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (staffMember) => {
    setEditingStaff(staffMember);

    setFormData({
      name: staffMember.name || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      role: staffMember.role || "",
    });

    setShowForm(true);
    setMessage("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStaff(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStaff) {
        const data = await updateStaff(
          editingStaff._id,
          formData
        );

        if (!data.staff) {
          setMessage(data.message || "Unable to update staff");
          return;
        }

        setStaff(
          staff.map((member) =>
            member._id === editingStaff._id
              ? data.staff
              : member
          )
        );

        setMessage("Staff member updated successfully");
      } else {
        const data = await createStaff(formData);

        if (!data.staff) {
          setMessage(data.message || "Unable to add staff");
          return;
        }

        setStaff([data.staff, ...staff]);

        setMessage("Staff member added successfully");
      }

      closeForm();
    } catch (error) {
      setMessage("Unable to save staff member");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this staff member?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await deleteStaff(id);

      if (data.message === "Staff member deleted successfully") {
        setStaff(
          staff.filter((member) => member._id !== id)
        );

        setMessage("Staff member deleted successfully");
      } else {
        setMessage(
          data.message || "Unable to delete staff member"
        );
      }
    } catch (error) {
      setMessage("Unable to delete staff member");
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Staff</h1>
          <p>Manage booth staff and their access.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddForm}
        >
          <Plus size={16} />
          Add Staff
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
              {editingStaff
                ? "Edit Staff Member"
                : "Add Staff Member"}
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
            <div className="form-group">
              <label className="form-label">
                Name
              </label>

              <input
                type="text"
                name="name"
                className="input"
                placeholder="Enter staff name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Role
              </label>

              <input
                type="text"
                name="role"
                className="input"
                placeholder="e.g. Sales Representative"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                className="input"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                className="input"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group span-2">
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingStaff
                    ? "Update Staff"
                    : "Add Staff"}
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
            Loading staff...
          </div>
        ) : staff.length === 0 ? (
          <div className="empty-state">
            No staff members added yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="avatar-cell">
                        <div className="avatar-round">
                          {member.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="cell-strong">
                          {member.name}
                        </span>
                      </div>
                    </td>

                    <td>{member.role}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>

                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() =>
                            openEditForm(member)
                          }
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() =>
                            handleDelete(member._id)
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