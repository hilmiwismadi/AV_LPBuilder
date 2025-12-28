import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Client API
export const clientAPI = {
  getAll: (startup) => api.get('/clients', { params: { startup } }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Chat API
export const chatAPI = {
  getHistory: (clientId) => api.get(`/chat/${clientId}`),
  addMessage: (data) => api.post('/chat', data),
};

// Template API
export const templateAPI = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
  process: (templateId, variables) => api.post('/templates/process', { templateId, variables }),
};

// WhatsApp API
export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  sendMessage: (clientId, message) => api.post('/whatsapp/send', { clientId, message }),
  refreshWhitelist: () => api.post('/whatsapp/refresh-whitelist'),
};

export default api;
