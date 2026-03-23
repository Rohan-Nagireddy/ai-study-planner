import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

/**
 * Axios instance pre-configured with the backend base URL.
 * - Attaches JWT Bearer token on every request via request interceptor.
 * - Handles 401 Unauthorized globally — clears storage and redirects to /login.
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: global error handling ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired, invalid, or permissions missing — force re-login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a human-readable error message from an Axios error.
 * Checks the backend's { message } field first, then falls back to
 * the HTTP status text or a generic message.
 */
export function getErrorMessage(error, fallback = 'Something went wrong') {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  );
}

export default api;
