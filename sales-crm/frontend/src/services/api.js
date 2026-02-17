import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

export const clientAPI = {
  getAll: () => api.get("/clients"),
  getById: (id) => api.get("/clients/" + id),
  create: (data) => api.post("/clients", data),
  update: (id, data) => api.put("/clients/" + id, data),
  delete: (id) => api.delete("/clients/" + id),
  assign: (postId, picId) => api.post('/clients/assign', { postId, picId }),
  checkAssignment: (postId) => api.get('/clients/check-assignment/' + postId),
};

export const buildDemoAPI = {
  create: (clientId, demoData) => api.post("/clients/" + clientId + "/build-demo", demoData),
};

export const chatAPI = {
  getHistory: (clientId) => api.get("/chat/" + clientId),
  sendMessage: (clientId, message, isOutgoing, sendViaWhatsApp) =>
    api.post("/chat", { clientId, message, isOutgoing, sendViaWhatsApp }),
};

export const whatsappAPI = {
  getStatus: () => api.get("/whatsapp/status"),
  sendMessage: (phoneNumber, message) => api.post("/whatsapp/send", { phoneNumber, message }),
  restart: () => api.post("/whatsapp/restart"),
  getClientInfo: () => api.get("/whatsapp/client-info"),
  parseNumber: (phoneNumber) => api.post("/whatsapp/parse-number", { phoneNumber }),
};

export const templateAPI = {
  getAll: (params) => api.get("/templates", { params }),
  getById: (id) => api.get("/templates/" + id),
  create: (data) => api.post("/templates", data),
  update: (id, data) => api.put("/templates/" + id, data),
  delete: (id) => api.delete("/templates/" + id),
  toggle: (id) => api.patch("/templates/" + id + "/toggle"),
  duplicate: (id) => api.post("/templates/" + id + "/duplicate"),
  preview: (data) => api.post("/templates/preview", data),
  getCategories: () => api.get("/templates/meta/categories"),
  getVariables: () => api.get("/templates/meta/variables"),
  incrementUsage: (id) => api.post("/templates/" + id + "/usage"),
  process: (templateId, clientId) => api.post("/templates/process", { templateId, clientId }),
};

export const logsAPI = {
  getLogs: (serviceName, lines, type) =>
    api.get("/logs/" + serviceName + "?lines=" + (lines || 100) + "&type=" + (type || "all")),
  getStatus: (serviceName) =>
    api.get("/logs/" + serviceName + "/status"),
  restartService: (serviceName) =>
    api.post("/logs/" + serviceName + "/restart"),
  flushService: (serviceName) =>
    api.post("/logs/" + serviceName + "/flush"),
  getBackend: (lines, type) =>
    api.get("/logs/sales-crm-backend?lines=" + (lines || 100) + "&type=" + (type || "all")),
};

export const scraperAPI = {
  start: (data) => api.post("/scraper/start", data),
  getSessions: (params) => api.get("/scraper/sessions", { params }),
  getSession: (id) => api.get("/scraper/sessions/" + id),
  getSessionBySlug: (slug) => api.get("/scraper/sessions/by-slug/" + slug),
  cancelSession: (id) => api.post("/scraper/sessions/" + id + "/cancel"),
  deleteSession: (id) => api.delete("/scraper/sessions/" + id),
  connectLive: (sessionId, onMessage, onError) => {
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_API_URL || API_BASE_URL;
    const url = baseUrl + "/scraper/live/" + sessionId;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    };

    eventSource.onerror = (error) => {
      if (onError) onError(error);
      eventSource.close();
    };

    return eventSource;
  }
};

export default api;

export const monitorAPI = {
  getAllMetrics: () => api.get("/monitor/metrics"),
};

export const adminAPI = {
  create: (email, password, name, role) => api.post('/admin/create', { email, password, name, role }),
  changePassword: (currentPassword, newPassword) => api.post('/admin/change-password', { currentPassword, newPassword }),
  getAll: () => api.get('/admin/list'),
  delete: (id) => api.delete('/admin/' + id),
  getSalesList: () => api.get('/admin/sales-list'),
};

export const flowAPI = {
  getCanvas: () => api.get('/flow'),
  saveCanvas: (data) => api.post('/flow', data),
};

export const createAdmin = adminAPI.create;
export const changePassword = adminAPI.changePassword;
export const getAdmins = adminAPI.getAll;
export const deleteAdmin = adminAPI.delete;
