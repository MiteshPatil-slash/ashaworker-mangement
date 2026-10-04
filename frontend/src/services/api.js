const BASE_URL = '/api';

/**
 * Universal Fetch wrapper with JWT header and error handling
 */
async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem('asha_token');
  const headers = {
    ...options.headers
  };

  // Only set application/json if not uploading FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (networkErr) {
    throw new Error('Cannot reach the server. Check that the backend is running on port 5000.');
  }

  if (response.status === 401 && !endpoint.startsWith('/auth/login')) {
    // Session expired
    sessionStorage.removeItem('asha_token');
    sessionStorage.removeItem('asha_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  // If CSV export or binary
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.blob();
  }

  // Read as text first: a dev-proxy error (backend down) returns an empty, non-JSON body
  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    if (data && data.message) throw new Error(data.message);
    if (response.status >= 500 && !raw) {
      throw new Error('Server unavailable (HTTP ' + response.status + '). The backend is probably not running or crashed. Check its terminal.');
    }
    throw new Error('Request failed with status ' + response.status);
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => request('/auth/me'),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Workers
  getWorkers: () => request('/workers'),
  getWorkerById: (id) => request(`/workers/${id}`),
  createWorker: (data) => request('/workers', { method: 'POST', body: JSON.stringify(data) }),
  updateWorker: (id, data) => request(`/workers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleWorkerStatus: (id) => request(`/workers/${id}/status`, { method: 'PATCH' }),
  resetWorkerPassword: (id, data) => request(`/workers/${id}/reset-password`, { method: 'POST', body: JSON.stringify(data) }),
  deleteWorker: (id) => request(`/workers/${id}`, { method: 'DELETE' }),

  // Families
  getFamilies: (params = {}) => request(`/families?${new URLSearchParams(params).toString()}`),
  getFamilyById: (id) => request(`/families/${id}`),
  createFamily: (data) => request('/families', { method: 'POST', body: JSON.stringify(data) }),
  updateFamily: (id, data) => request(`/families/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Pregnancies
  getPregnancies: (params = {}) => request(`/pregnancies?${new URLSearchParams(params).toString()}`),
  getPregnancyById: (id) => request(`/pregnancies/${id}`),
  registerPregnancy: (data) => request('/pregnancies', { method: 'POST', body: JSON.stringify(data) }),
  addAncVisit: (id, data) => request(`/pregnancies/${id}/anc-visits`, { method: 'POST', body: JSON.stringify(data) }),
  createReferral: (id, data) => request(`/pregnancies/${id}/referrals`, { method: 'POST', body: JSON.stringify(data) }),
  // Supervisor / Admin: all uploaded photos & documents, and review actions
  getDocuments: () => request('/documents'),
  reviewDocument: (sourceType, parentId, docId, status, reason = '') =>
    request(`/documents/${sourceType}/${parentId}/${docId}/review`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),
  uploadPregnancyDoc: (id, formData) => request(`/pregnancies/${id}/documents`, { method: 'POST', body: formData }),
  deletePregnancy: (id) => request(`/pregnancies/${id}`, { method: 'DELETE' }),

  // Children & Birth
  getChildren: (params = {}) => request(`/children?${new URLSearchParams(params).toString()}`),
  getChildById: (id) => request(`/children/${id}`),
  registerBirth: (data) => request('/children/register-birth', { method: 'POST', body: JSON.stringify(data) }),
  recordVaccine: (id, data) => request(`/children/${id}/vaccines`, { method: 'POST', body: JSON.stringify(data) }),
  addGrowth: (id, data) => request(`/children/${id}/growth`, { method: 'POST', body: JSON.stringify(data) }),
  uploadChildDoc: (id, formData) => request(`/children/${id}/documents`, { method: 'POST', body: formData }),
  deleteChild: (id) => request(`/children/${id}`, { method: 'DELETE' }),

  // Medicines
  getMedicines: (params = {}) => request(`/medicines?${new URLSearchParams(params).toString()}`),
  addMedicine: (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  adjustStock: (id, data) => request(`/medicines/${id}/stock`, { method: 'PATCH', body: JSON.stringify(data) }),
  distributeMedicine: (data) => request('/medicines/distribute', { method: 'POST', body: JSON.stringify(data) }),
  getDistributions: (params = {}) => request(`/medicines/distributions?${new URLSearchParams(params).toString()}`),
  getMedicineReport: () => request('/medicines/report'),

  // Visits
  getVisits: (params = {}) => request(`/visits?${new URLSearchParams(params).toString()}`),
  scheduleVisit: (data) => request('/visits/schedule', { method: 'POST', body: JSON.stringify(data) }),
  recordVisit: (id, data) => request(`/visits/${id}/record`, { method: 'POST', body: JSON.stringify(data) }),
  updateVisitStatus: (id, status) => request(`/visits/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Smart Tasks & Notifications
  getTasks: (params = {}) => request(`/tasks?${new URLSearchParams(params).toString()}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  completeTask: (id) => request(`/tasks/${id}/complete`, { method: 'PATCH' }),
  updateTaskStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Facilities
  getFacilities: (params = {}) => request(`/facilities?${new URLSearchParams(params).toString()}`),
  addFacility: (data) => request('/facilities', { method: 'POST', body: JSON.stringify(data) }),

  // Admin Analytics & Reports
  getAnalytics: () => request('/reports/analytics'),
  downloadCSV: (category) => request(`/reports/export-csv?category=${category}`),
  getAuditLogs: (params = {}) => request(`/audit-logs?${new URLSearchParams(params).toString()}`)
};