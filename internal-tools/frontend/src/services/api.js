import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const cci = {
  list: (params) => api.get('/cci', { params }),
  create: (data) => api.post('/cci', data),
  get: (id) => api.get(`/cci/${id}`),
  update: (id, data) => api.put(`/cci/${id}`, data),
  delete: (id) => api.delete(`/cci/${id}`),
  addNote: (id, data) => api.post(`/cci/${id}/notes`, data),
  updateNote: (id, noteId, data) => api.patch(`/cci/${id}/notes/${noteId}`, data),
  deleteNote: (id, noteId) => api.delete(`/cci/${id}/notes/${noteId}`),
  flaggedTech: () => api.get('/cci/flagged-tech'),
  searchNotes: (params) => api.get('/cci/notes/search', { params }),
  addLink: (id, data) => api.post(`/cci/${id}/links`, data),
  updateLink: (id, linkId, data) => api.patch(`/cci/${id}/links/${linkId}`, data),
  deleteLink: (id, linkId) => api.delete(`/cci/${id}/links/${linkId}`),
};

export const techsprint = {
  listTasks: (params) => api.get('/techsprint/tasks', { params }),
  createTask: (data) => api.post('/techsprint/tasks', data),
  getTask: (id) => api.get(`/techsprint/tasks/${id}`),
  updateTask: (id, data) => api.put(`/techsprint/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/techsprint/tasks/${id}`),
  workload: () => api.get('/techsprint/workload'),
  calendar: (week) => api.get('/techsprint/calendar', { params: { week } }),
};

export const mou = {
  list: (params) => api.get('/mou', { params }),
  create: (data) => api.post('/mou', data),
  get: (id) => api.get(`/mou/${id}`),
  update: (id, data) => api.put(`/mou/${id}`, data),
  delete: (id) => api.delete(`/mou/${id}`),
};

export const openclaw = {
  chat: (data) => api.post('/openclaw/chat', data),
  confirm: (data) => api.post('/openclaw/confirm', data),
  listConversations: () => api.get('/openclaw/conversations'),
  getConversation: (id) => api.get(`/openclaw/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/openclaw/conversations/${id}`),
};

export default api;
