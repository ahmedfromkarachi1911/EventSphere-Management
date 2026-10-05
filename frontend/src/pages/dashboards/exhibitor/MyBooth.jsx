import { useEffect, useState } from "react";

import {
  getMyBooths,
  getMyApplications,
  getAvailableBooths,
  reserveBooth,
} from "../../../services/api";

import socket from "../../../services/socket";

export default function ExhibitorMyBooth() {
  const [booths, setBooths] = useState([]);
  const [applications, setApplications] = useState([]);
  const [availableBooths, setAvailableBooths] = useState([]);

  const [selectedExpoId, setSelectedExpoId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingBooths, setLoadingBooths] = useState(false);
  const [reservingId, setReservingId] = useState("");
  const [message, setMessage] = useState("");

  const loadMyData = async () => {
    try {
      const [boothData, applicationData] = await Promise.all([
        getMyBooths(),
        getMyApplications(),
      ]);

      if (Array.isArray(boothData)) {
        setBooths(boothData);
      }

      if (Array.isArray(applicationData)) {
        const approvedApplications = applicationData.filter(
          (application) => application.status === "approved"
        );

        setApplications(approvedApplications);

        if (
          approvedApplications.length > 0 &&
          !selectedExpoId
        ) {
          setSelectedExpoId(
            approvedApplications[0].expo?._id || ""
          );
        }
      }
    } catch (error) {
      setMessage("Unable to load booth information");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBooths = async (expoId) => {
    if (!expoId) {
      setAvailableBooths([]);
      return;
    }

    try {
      setLoadingBooths(true);

      const data = await getAvailableBooths(expoId);

      if (Array.isArray(data)) {
        setAvailableBooths(data);
      } else {
        setAvailableBooths([]);
        setMessage(
          data.message || "Unable to load available booths"
        );
      }
    } catch (error) {
      setMessage("Unable to load available booths");
    } finally {
      setLoadingBooths(false);
    }
  };

  useEffect(() => {
    loadMyData();
  }, []);

  useEffect(() => {
    if (selectedExpoId) {
      loadAvailableBooths(selectedExpoId);
    }
  }, [selectedExpoId]);

  useEffect(() => {
    const handleBoothChange = async () => {
      const updatedBooths = await getMyBooths();

      if (Array.isArray(updatedBooths)) {
        setBooths(updatedBooths);
      }

      if (selectedExpoId) {
        await loadAvailableBooths(selectedExpoId);
      }
    };

    socket.on("boothCreated", handleBoothChange);
    socket.on("boothUpdated", handleBoothChange);

    return () => {
      socket.off("boothCreated", handleBoothChange);
      socket.off("boothUpdated", handleBoothChange);
    };
  }, [selectedExpoId]);

  const getExpoId = (booth) => {
    if (!booth?.expo) {
      return "";
    }

    if (typeof booth.expo === "string") {
      return booth.expo;
    }

    return booth.expo._id;
  };

  const mySelectedBooth = booths.find(
    (booth) => getExpoId(booth) === selectedExpoId
  );

  const selectedApplication = applications.find(
    (application) =>
      application.expo?._id === selectedExpoId
  );

  const handleReserve = async (booth) => {
    const confirmed = window.confirm(
      `Reserve booth ${booth.boothNumber}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setReservingId(booth._id);
      setMessage("");

      const data = await reserveBooth(booth._id);

      if (data.booth) {
        setMessage("Booth reserved successfully");

        const updatedBooths = await getMyBooths();

        if (Array.isArray(updatedBooths)) {
          setBooths(updatedBooths);
        }

        await loadAvailableBooths(selectedExpoId);
      } else {
        setMessage(
          data.message || "Unable to reserve booth"
        );
      }
    } catch (error) {
      setMessage("Unable to reserve booth");
    } finally {
      setReservingId("");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1>My Booth</h1>
            <p>
              View available booths and manage your booth
              reservations.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="empty-state">
            Loading booth information...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>My Booth</h1>

          <p>
            View available booths and manage your booth
            reservations.
          </p>
        </div>
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

      {applications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            You need an approved expo application before
            selecting a booth.
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="form-group">
              <label className="form-label">
                Select Expo
              </label>

              <select
                className="input"
                value={selectedExpoId}
                onChange={(e) => {
                  setSelectedExpoId(e.target.value);
                  setMessage("");
                }}
              >
                {applications.map((application) => (
                  <option
                    key={application._id}
                    value={application.expo?._id}
                  >
                    {application.expo?.title || "Expo"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-2 mt-6">
            <div className="card">
              <div className="card-title">
                My Booth Details
              </div>

              {mySelectedBooth ? (
                <div
                  className="mt-4"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    fontSize: 14,
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-muted">
                      Booth Number
                    </span>

                    <span className="cell-strong">
                      {mySelectedBooth.boothNumber}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">
                      Hall
                    </span>

                    <span className="cell-strong">
                      {mySelectedBooth.hall}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">
                      Booth Type
                    </span>

                    <span className="cell-strong">
                      {mySelectedBooth.boothType}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">
                      Expo
                    </span>

                    <span className="cell-strong">
                      {mySelectedBooth.expo?.title ||
                        selectedApplication?.expo?.title ||
                        "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted">
                      Status
                    </span>

                    <span
                      className={`badge ${
                        mySelectedBooth.status === "assigned"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {mySelectedBooth.status}
                    </span>
                  </div>

                  {mySelectedBooth.status === "reserved" && (
                    <p
                      className="text-muted"
                      style={{
                        fontSize: 13,
                        marginTop: 8,
                      }}
                    >
                      Your booth is reserved and waiting for
                      organizer confirmation.
                    </p>
                  )}
                </div>
              ) : (
                <div className="empty-state mt-4">
                  You have not reserved a booth for this expo
                  yet.
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title">
                Booth Selection
              </div>

              <p
                className="text-muted mt-2"
                style={{ fontSize: 13 }}
              >
                Select an available booth for this expo.
              </p>

              {loadingBooths ? (
                <div className="empty-state">
                  Loading available booths...
                </div>
              ) : mySelectedBooth ? (
                <div className="booth-grid mt-4">
                  <div
                    className="booth booked"
                    style={{
                      outline: "2px solid var(--ink)",
                    }}
                  >
                    {mySelectedBooth.boothNumber}
                  </div>
                </div>
              ) : availableBooths.length === 0 ? (
                <div className="empty-state">
                  No available booths for this expo.
                </div>
              ) : (
                <div className="booth-grid mt-4">
                  {availableBooths.map((booth) => (
                    <div
                      key={booth._id}
                      className="booth available"
                      style={{
                        height: "auto",
                        minHeight: 95,
                        padding: 10,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 6,
                      }}
                    >
                      <strong>{booth.boothNumber}</strong>

                      <span style={{ fontSize: 11 }}>
                        {booth.hall}
                      </span>

                      <span style={{ fontSize: 11 }}>
                        {booth.boothType}
                      </span>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          padding: "5px 8px",
                          fontSize: 11,
                        }}
                        disabled={reservingId === booth._id}
                        onClick={() =>
                          handleReserve(booth)
                        }
                      >
                        {reservingId === booth._id
                          ? "Reserving..."
                          : "Reserve"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="floor-entrance">
                Main Entrance
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}