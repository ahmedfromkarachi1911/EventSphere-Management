import { useEffect, useState } from "react";

import {
  getBooths,
  getExpos,
  getApplications,
  assignBooth,
  createAvailableBooth,
  confirmBoothReservation,
  updateBooth,
} from "../../../services/api.js";

import socket from "../../../services/socket.js";

export default function AdminBooths() {
  const [booths, setBooths] = useState([]);
  const [expos, setExpos] = useState([]);
  const [applications, setApplications] = useState([]);

  const [selectedExpo, setSelectedExpo] = useState("");
  const [selectedHall, setSelectedHall] = useState("Hall A");

  const [createData, setCreateData] = useState({
    expo: "",
    boothNumber: "",
    hall: "Hall A",
    boothType: "Standard 3x3",
  });

  const [assignData, setAssignData] = useState({
    expo: "",
    exhibitor: "",
    boothNumber: "",
    hall: "Hall A",
    boothType: "",
  });

  const [editingId, setEditingId] = useState("");

  const [editData, setEditData] = useState({
    boothNumber: "",
    hall: "Hall A",
    boothType: "Standard 3x3",
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [confirmingId, setConfirmingId] = useState("");

  const [message, setMessage] = useState("");

  const getExpoId = (expo) => {
    return expo?._id || expo || "";
  };

  const loadBooths = async () => {
    const data = await getBooths();

    if (Array.isArray(data)) {
      setBooths(data);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        boothData,
        expoData,
        applicationData,
      ] = await Promise.all([
        getBooths(),
        getExpos(),
        getApplications(),
      ]);

      if (Array.isArray(boothData)) {
        setBooths(boothData);
      }

      if (Array.isArray(applicationData)) {
        setApplications(
          applicationData.filter(
            (application) =>
              application.status === "approved" &&
              application.exhibitor &&
              application.expo
          )
        );
      }

      if (Array.isArray(expoData)) {
        const publishedExpos = expoData.filter(
          (expo) => expo.status === "published"
        );

        setExpos(publishedExpos);

        if (publishedExpos.length > 0) {
          const firstExpo = publishedExpos[0]._id;

          setSelectedExpo(firstExpo);

          setCreateData((current) => ({
            ...current,
            expo: firstExpo,
          }));

          setAssignData((current) => ({
            ...current,
            expo: firstExpo,
          }));
        }
      }
    } catch (error) {
      setMessage("Unable to load booth data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleBoothCreated = (booth) => {
      setBooths((previousBooths) => [
        booth,
        ...previousBooths.filter(
          (item) =>
            String(item._id) !== String(booth._id)
        ),
      ]);
    };

    const handleBoothUpdated = (booth) => {
      setBooths((previousBooths) => {
        const exists = previousBooths.some(
          (item) =>
            String(item._id) === String(booth._id)
        );

        if (exists) {
          return previousBooths.map((item) =>
            String(item._id) === String(booth._id)
              ? booth
              : item
          );
        }

        return [booth, ...previousBooths];
      });
    };

    socket.on(
      "boothCreated",
      handleBoothCreated
    );

    socket.on(
      "boothUpdated",
      handleBoothUpdated
    );

    return () => {
      socket.off(
        "boothCreated",
        handleBoothCreated
      );

      socket.off(
        "boothUpdated",
        handleBoothUpdated
      );
    };
  }, []);

  const floorPlanBooths = booths
    .filter(
      (booth) =>
        String(getExpoId(booth.expo)) ===
          String(selectedExpo) &&
        booth.hall === selectedHall &&
        booth.status !== "cancelled"
    )
    .sort((a, b) =>
      a.boothNumber.localeCompare(
        b.boothNumber,
        undefined,
        {
          numeric: true,
        }
      )
    );

  const availableBoothsForAssign = booths.filter(
    (booth) =>
      String(getExpoId(booth.expo)) ===
        String(assignData.expo) &&
      booth.hall === assignData.hall &&
      booth.status === "available"
  );

  const approvedApplicationsForExpo =
    applications.filter(
      (application) =>
        String(getExpoId(application.expo)) ===
        String(assignData.expo)
    );

  const reservedBooths = booths.filter(
    (booth) => booth.status === "reserved"
  );

  const assignedBooths = booths.filter(
    (booth) => booth.status === "assigned"
  );

  const activeBooths = booths
    .filter(
      (booth) => booth.status !== "cancelled"
    )
    .sort((a, b) => {
      const expoA = a.expo?.title || "";
      const expoB = b.expo?.title || "";

      if (expoA !== expoB) {
        return expoA.localeCompare(expoB);
      }

      if (a.hall !== b.hall) {
        return a.hall.localeCompare(b.hall);
      }

      return a.boothNumber.localeCompare(
        b.boothNumber,
        undefined,
        {
          numeric: true,
        }
      );
    });

  const handleCreateChange = (e) => {
    const { name, value } = e.target;

    setCreateData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handleCreateBooth = async (e) => {
    e.preventDefault();

    if (
      !createData.expo ||
      !createData.boothNumber.trim() ||
      !createData.hall ||
      !createData.boothType
    ) {
      setMessage(
        "Please complete all booth details"
      );

      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const data = await createAvailableBooth({
        ...createData,
        boothNumber:
          createData.boothNumber.trim(),
      });

      if (!data.booth) {
        setMessage(
          data.message ||
            "Unable to create booth"
        );

        return;
      }

      await loadBooths();

      setSelectedExpo(createData.expo);
      setSelectedHall(createData.hall);

      setCreateData((current) => ({
        ...current,
        boothNumber: "",
      }));

      setMessage(
        "Booth created successfully"
      );
    } catch (error) {
      setMessage("Unable to create booth");
    } finally {
      setCreating(false);
    }
  };

  const handleAssignExpoChange = (e) => {
    const expo = e.target.value;

    setAssignData((current) => ({
      ...current,
      expo,
      exhibitor: "",
      boothNumber: "",
      boothType: "",
    }));

    setMessage("");
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;

    if (name === "hall") {
      setAssignData((current) => ({
        ...current,
        hall: value,
        boothNumber: "",
        boothType: "",
      }));

      setMessage("");
      return;
    }

    if (name === "boothNumber") {
      const booth =
        availableBoothsForAssign.find(
          (item) =>
            item.boothNumber === value
        );

      setAssignData((current) => ({
        ...current,
        boothNumber: value,
        boothType:
          booth?.boothType || "",
      }));

      setMessage("");
      return;
    }

    setAssignData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handleAssignBooth = async (e) => {
    e.preventDefault();

    if (
      !assignData.expo ||
      !assignData.exhibitor ||
      !assignData.boothNumber
    ) {
      setMessage(
        "Please complete all assignment details"
      );

      return;
    }

    try {
      setAssigning(true);
      setMessage("");

      const data =
        await assignBooth(assignData);

      if (!data.booth) {
        setMessage(
          data.message ||
            "Unable to assign booth"
        );

        return;
      }

      await loadBooths();

      setSelectedExpo(assignData.expo);
      setSelectedHall(assignData.hall);

      setAssignData((current) => ({
        ...current,
        exhibitor: "",
        boothNumber: "",
        boothType: "",
      }));

      setMessage(
        "Booth assigned successfully"
      );
    } catch (error) {
      setMessage("Unable to assign booth");
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmReservation = async (
    boothId
  ) => {
    try {
      setConfirmingId(boothId);
      setMessage("");

      const data =
        await confirmBoothReservation(
          boothId
        );

      if (!data.booth) {
        setMessage(
          data.message ||
            "Unable to confirm reservation"
        );

        return;
      }

      await loadBooths();

      setMessage(
        "Booth reservation confirmed successfully"
      );
    } catch (error) {
      setMessage(
        "Unable to confirm reservation"
      );
    } finally {
      setConfirmingId("");
    }
  };

  const handleStartEdit = (booth) => {
    setEditingId(booth._id);

    setEditData({
      boothNumber: booth.boothNumber || "",
      hall: booth.hall || "Hall A",
      boothType:
        booth.boothType || "Standard 3x3",
    });

    setMessage("");
  };

  const handleCancelEdit = () => {
    setEditingId("");

    setEditData({
      boothNumber: "",
      hall: "Hall A",
      boothType: "Standard 3x3",
    });

    setMessage("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handleUpdateBooth = async () => {
    if (
      !editingId ||
      !editData.boothNumber.trim() ||
      !editData.hall ||
      !editData.boothType
    ) {
      setMessage(
        "Please complete all booth details"
      );

      return;
    }

    try {
      setUpdating(true);
      setMessage("");

      const data = await updateBooth(
        editingId,
        {
          boothNumber:
            editData.boothNumber.trim(),
          hall: editData.hall,
          boothType:
            editData.boothType,
        }
      );

      if (!data.booth) {
        setMessage(
          data.message ||
            "Unable to update booth"
        );

        return;
      }

      await loadBooths();

      setEditingId("");

      setEditData({
        boothNumber: "",
        hall: "Hall A",
        boothType: "Standard 3x3",
      });

      setMessage(
        "Booth updated successfully"
      );
    } catch (error) {
      setMessage("Unable to update booth");
    } finally {
      setUpdating(false);
    }
  };

  const getBoothClass = (status) => {
    if (status === "assigned") {
      return "booked";
    }

    return status;
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Booths</h1>

          <p>
            Visual floor plan management for
            each expo hall.
          </p>
        </div>
      </div>

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

      <div className="card">
        <div className="card-title">
          Create Available Booth
        </div>

        <form
          className="form-grid mt-4"
          onSubmit={handleCreateBooth}
        >
          <div className="form-group">
            <label className="form-label">
              Expo
            </label>

            <select
              className="select"
              name="expo"
              value={createData.expo}
              onChange={handleCreateChange}
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
              Booth Number
            </label>

            <input
              className="input"
              name="boothNumber"
              placeholder="e.g. A-01"
              value={createData.boothNumber}
              onChange={handleCreateChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Hall
            </label>

            <select
              className="select"
              name="hall"
              value={createData.hall}
              onChange={handleCreateChange}
            >
              <option>Hall A</option>
              <option>Hall B</option>
              <option>Hall C</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Booth Type
            </label>

            <select
              className="select"
              name="boothType"
              value={
                createData.boothType
              }
              onChange={handleCreateChange}
            >
              <option>
                Standard 3x3
              </option>

              <option>
                Premium 6x3
              </option>

              <option>
                Corner Booth
              </option>
            </select>
          </div>

          <div
            className="form-group"
            style={{
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Booth"}
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Assign Booth
        </div>

        <form
          className="form-grid mt-4"
          onSubmit={handleAssignBooth}
        >
          <div className="form-group">
            <label className="form-label">
              Expo
            </label>

            <select
              className="select"
              value={assignData.expo}
              onChange={
                handleAssignExpoChange
              }
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
              Approved Exhibitor
            </label>

            <select
              className="select"
              name="exhibitor"
              value={
                assignData.exhibitor
              }
              onChange={handleAssignChange}
              required
            >
              <option value="">
                Select Exhibitor
              </option>

              {approvedApplicationsForExpo.map(
                (application) => (
                  <option
                    key={application._id}
                    value={
                      application
                        .exhibitor?._id
                    }
                  >
                    {application
                      .exhibitor
                      ?.companyName ||
                      application
                        .exhibitor?.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Hall
            </label>

            <select
              className="select"
              name="hall"
              value={assignData.hall}
              onChange={handleAssignChange}
            >
              <option>Hall A</option>
              <option>Hall B</option>
              <option>Hall C</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Available Booth
            </label>

            <select
              className="select"
              name="boothNumber"
              value={
                assignData.boothNumber
              }
              onChange={handleAssignChange}
              required
            >
              <option value="">
                Select Available Booth
              </option>

              {availableBoothsForAssign.map(
                (booth) => (
                  <option
                    key={booth._id}
                    value={
                      booth.boothNumber
                    }
                  >
                    {booth.boothNumber} -{" "}
                    {booth.boothType}
                  </option>
                )
              )}
            </select>
          </div>

          <div
            className="form-group"
            style={{
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                assigning ||
                availableBoothsForAssign
                  .length === 0
              }
            >
              {assigning
                ? "Assigning..."
                : "Assign Booth"}
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Reserved Booths
        </div>

        <div className="table-wrap mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booth</th>
                <th>Hall</th>
                <th>Expo</th>
                <th>Company</th>
                <th>Booth Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {reservedBooths.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No reserved booths.
                  </td>
                </tr>
              ) : (
                reservedBooths.map(
                  (booth) => (
                    <tr key={booth._id}>
                      <td className="cell-strong">
                        {booth.boothNumber}
                      </td>

                      <td>
                        {booth.hall}
                      </td>

                      <td>
                        {booth.expo?.title ||
                          "-"}
                      </td>

                      <td>
                        {booth.exhibitor
                          ?.companyName ||
                          booth.exhibitor
                            ?.name ||
                          "-"}
                      </td>

                      <td>
                        {booth.boothType}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={
                            confirmingId ===
                            booth._id
                          }
                          onClick={() =>
                            handleConfirmReservation(
                              booth._id
                            )
                          }
                        >
                          {confirmingId ===
                          booth._id
                            ? "Confirming..."
                            : "Confirm"}
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6">
        <div className="floor-toolbar">
          <select
            className="select"
            style={{ maxWidth: 280 }}
            value={selectedExpo}
            onChange={(e) =>
              setSelectedExpo(
                e.target.value
              )
            }
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

          <select
            className="select"
            style={{ maxWidth: 160 }}
            value={selectedHall}
            onChange={(e) =>
              setSelectedHall(
                e.target.value
              )
            }
          >
            <option>Hall A</option>
            <option>Hall B</option>
            <option>Hall C</option>
          </select>

          <div className="floor-legend">
            <span>
              <span
                className="legend-swatch"
                style={{
                  background:
                    "var(--success)",
                }}
              />
              Available
            </span>

            <span>
              <span
                className="legend-swatch"
                style={{
                  background:
                    "var(--warning)",
                }}
              />
              Reserved
            </span>

            <span>
              <span
                className="legend-swatch"
                style={{
                  background:
                    "var(--danger)",
                }}
              />
              Assigned
            </span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading booths...
          </div>
        ) : floorPlanBooths.length ===
          0 ? (
          <div className="empty-state">
            No booths created in this hall.
          </div>
        ) : (
          <>
            <div className="booth-grid">
              {floorPlanBooths.map(
                (booth) => (
                  <div
                    key={booth._id}
                    className={`booth ${getBoothClass(
                      booth.status
                    )}`}
                    title={`${booth.boothNumber} - ${booth.status}`}
                  >
                    {booth.boothNumber}
                  </div>
                )
              )}
            </div>

            <div className="floor-entrance">
              Main Entrance
            </div>
          </>
        )}
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Manage Booth Details
        </div>

        <div className="table-wrap mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booth</th>
                <th>Hall</th>
                <th>Expo</th>
                <th>Company</th>
                <th>Booth Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {activeBooths.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    No booths available.
                  </td>
                </tr>
              ) : (
                activeBooths.map((booth) => (
                  <tr key={booth._id}>
                    <td>
                      {editingId ===
                      booth._id ? (
                        <input
                          className="input"
                          name="boothNumber"
                          value={
                            editData.boothNumber
                          }
                          onChange={
                            handleEditChange
                          }
                          style={{
                            minWidth: 110,
                          }}
                        />
                      ) : (
                        <span className="cell-strong">
                          {
                            booth.boothNumber
                          }
                        </span>
                      )}
                    </td>

                    <td>
                      {editingId ===
                      booth._id ? (
                        <select
                          className="select"
                          name="hall"
                          value={editData.hall}
                          onChange={
                            handleEditChange
                          }
                          style={{
                            minWidth: 110,
                          }}
                        >
                          <option>
                            Hall A
                          </option>
                          <option>
                            Hall B
                          </option>
                          <option>
                            Hall C
                          </option>
                        </select>
                      ) : (
                        booth.hall
                      )}
                    </td>

                    <td>
                      {booth.expo?.title ||
                        "-"}
                    </td>

                    <td>
                      {booth.exhibitor
                        ?.companyName ||
                        booth.exhibitor
                          ?.name ||
                        "-"}
                    </td>

                    <td>
                      {editingId ===
                      booth._id ? (
                        <select
                          className="select"
                          name="boothType"
                          value={
                            editData.boothType
                          }
                          onChange={
                            handleEditChange
                          }
                          style={{
                            minWidth: 150,
                          }}
                        >
                          <option>
                            Standard 3x3
                          </option>

                          <option>
                            Premium 6x3
                          </option>

                          <option>
                            Corner Booth
                          </option>
                        </select>
                      ) : (
                        booth.boothType
                      )}
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {booth.status}
                      </span>
                    </td>

                    <td>
                      {editingId ===
                      booth._id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={updating}
                            onClick={
                              handleUpdateBooth
                            }
                          >
                            {updating
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={updating}
                            onClick={
                              handleCancelEdit
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() =>
                            handleStartEdit(
                              booth
                            )
                          }
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-title">
          Assigned Booths
        </div>

        <div className="table-wrap mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booth</th>
                <th>Hall</th>
                <th>Expo</th>
                <th>Company</th>
                <th>
                  Contact Person
                </th>
                <th>Booth Type</th>
              </tr>
            </thead>

            <tbody>
              {assignedBooths.length ===
              0 ? (
                <tr>
                  <td colSpan="6">
                    No assigned booths.
                  </td>
                </tr>
              ) : (
                assignedBooths.map(
                  (booth) => (
                    <tr key={booth._id}>
                      <td className="cell-strong">
                        {booth.boothNumber}
                      </td>

                      <td>
                        {booth.hall}
                      </td>

                      <td>
                        {booth.expo?.title ||
                          "-"}
                      </td>

                      <td>
                        {booth.exhibitor
                          ?.companyName ||
                          "-"}
                      </td>

                      <td>
                        {booth.exhibitor
                          ?.name || "-"}
                      </td>

                      <td>
                        {booth.boothType}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}