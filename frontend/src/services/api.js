const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const registerUser = async (data) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const loginUser = async (data) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const forgotPassword = async (email) => {
  const response = await fetch(
    `${API_URL}/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  return response.json();
};

const resetPassword = async (token, data) => {
  const response = await fetch(
    `${API_URL}/auth/reset-password/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

const getExpos = async () => {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/expos`, {
    headers,
  });

  return response.json();
};

const getExpoById = async (id) => {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}/expos/${id}`,
    {
      headers,
    }
  );

  return response.json();
};

const createExpo = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/expos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const updateExpo = async (id, data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/expos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const deleteExpo = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/expos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const getApplications = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const updateApplicationStatus = async (id, status) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/applications/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  return response.json();
};

const getMyApplications = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/applications/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const registerForExpo = async (expo) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/registrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ expo }),
  });

  return response.json();
};

const getMyRegistrations = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/registrations/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const createApplication = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const getMyBooths = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/booths/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const getBooths = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/booths`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const assignBooth = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/booths`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const getAvailableBooths = async (expoId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/booths/available/${expoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getExpoFloorPlan = async (expoId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/booths/floor-plan/${expoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const reserveBooth = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/booths/${id}/reserve`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const createAvailableBooth = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/booths/available`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

const confirmBoothReservation = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/booths/${id}/confirm`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const updateBooth = async (id, data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/booths/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

const recordBoothVisit = async (boothId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/booth-visits/${boothId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getMyProducts = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/products/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const createProduct = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const updateProduct = async (id, data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/products/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

const deleteProduct = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/products/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getMyStaff = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/staff/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const createStaff = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const updateStaff = async (id, data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/staff/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

const deleteStaff = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/staff/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getSessions = async () => {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/sessions`, {
    headers,
  });

  return response.json();
};

const getSessionById = async (id) => {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}/sessions/${id}`,
    {
      headers,
    }
  );

  return response.json();
};

const createSession = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const updateSession = async (id, data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/sessions/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};

const deleteSession = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/sessions/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const registerForSession = async (session) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/session-registrations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ session }),
    }
  );

  return response.json();
};

const getMySessionRegistrations = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/session-registrations/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const cancelSessionRegistration = async (
  sessionId
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/session-registrations/${sessionId}/cancel`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const addBookmark = async (session) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session }),
  });

  return response.json();
};

const getMyBookmarks = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/bookmarks/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const removeBookmark = async (sessionId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/bookmarks/${sessionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getRegisteredExhibitors = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/exhibitors/registered`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getApprovedExhibitors = async () => {
  const response = await fetch(
    `${API_URL}/exhibitors`
  );

  return response.json();
};

const getExhibitorByApplicationId = async (
  applicationId
) => {
  const response = await fetch(
    `${API_URL}/exhibitors/${applicationId}`
  );

  return response.json();
};

const sendMessage = async (receiver, message) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receiver,
      message,
    }),
  });

  return response.json();
};

const getMessageContacts = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/messages/contacts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getMyMessages = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/messages/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const markMessageAsRead = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/messages/${id}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getMyNotifications = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/notifications/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const markNotificationAsRead = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/notifications/${id}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const markAllNotificationsAsRead = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/notifications/read-all`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getMyProfile = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const updateMyProfile = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const uploadProfileLogo = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("logo", file);

  const response = await fetch(
    `${API_URL}/auth/profile/logo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return response.json();
};

const uploadDocument = async (
  application,
  file
) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("application", application);
  formData.append("document", file);

  const response = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};

const getMyDocuments = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/documents/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const downloadDocument = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/documents/${id}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.message ||
        "Unable to download document"
    );
  }

  return response.blob();
};

const deleteDocument = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/documents/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const getAllDocuments = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/documents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const updateDocumentStatus = async (
  id,
  status
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/documents/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  return response.json();
};

const getAdminAnalytics = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/analytics/admin`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

const createFeedback = async (data) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

const getAllFeedback = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/feedback`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

const updateFeedbackStatus = async (
  id,
  status
) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/feedback/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  return response.json();
};

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,

  getExpos,
  getExpoById,
  createExpo,
  updateExpo,
  deleteExpo,

  getApplications,
  updateApplicationStatus,
  getMyApplications,
  createApplication,

  registerForExpo,
  getMyRegistrations,

  getMyBooths,
  getBooths,
  assignBooth,
  getAvailableBooths,
  getExpoFloorPlan,
  reserveBooth,
  createAvailableBooth,
  confirmBoothReservation,
  updateBooth,
  recordBoothVisit,

  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,

  getMyStaff,
  createStaff,
  updateStaff,
  deleteStaff,

  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,

  registerForSession,
  getMySessionRegistrations,
  cancelSessionRegistration,

  addBookmark,
  getMyBookmarks,
  removeBookmark,

  getRegisteredExhibitors,
  getApprovedExhibitors,
  getExhibitorByApplicationId,

  sendMessage,
  getMessageContacts,
  getMyMessages,
  markMessageAsRead,

  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  getMyProfile,
  updateMyProfile,
  uploadProfileLogo,

  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  downloadDocument,
  updateDocumentStatus,
  deleteDocument,

  getAdminAnalytics,

  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
};