import api from './api';

export const taskService = {
  getTasks: () => api.get('/tasks'),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  markCompleted: (id) => api.patch(`/tasks/${id}/complete`),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const focusService = {
  getHistory: () => api.get('/focus/history'),
  startSession: () => api.post('/focus/start'),
  getActive: () => api.get('/focus/active'),
  endSession: (id, distractionCount) => api.post(`/focus/${id}/end`, { distractionCount }),
};

export const analyticsService = {
  getDaily: (date) => api.get('/analytics/daily', { params: { date } }),
  getWeekly: () => api.get('/analytics/weekly'),
  getStreak: () => api.get('/analytics/streak'),
};

export const aiService = {
  generatePlan: (data) => api.post('/ai/generate-study-plan', data),
  getPlans: () => api.get('/ai/study-plans'),
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPlatformStats: () => api.get('/admin/platform-stats'),
  getBurnoutRisk: () => api.get('/admin/burnout-risk'),
};
