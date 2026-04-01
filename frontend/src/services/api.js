import axios from 'axios';

// ── Base URL (set VITE_API_URL in .env.local or Vercel/Netlify dashboard) ────
const API_URL = import.meta.env.VITE_API_URL || 'https://ai-study-planner-9mkx.onrender.com/api';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: global 401/403 handling ───────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Helper: extract readable error message ───────────────────────────────────
export function getErrorMessage(error, fallback = 'Something went wrong') {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  );
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Login with email + password.
 * Returns { token, user } on success.
 */
export async function login(email, password) {
  try {
    const { data } = await client.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user ?? { email }));
    }
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Login failed'));
  }
}

/**
 * Register a new user.
 * Returns the created user object on success.
 */
export async function register(name, email, password) {
  try {
    const { data } = await client.post('/auth/register', { name, email, password });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed'));
  }
}

// ── Tasks / Study Plans ──────────────────────────────────────────────────────

/**
 * Fetch all study plans for the logged-in user.
 * Returns an array of plan objects.
 */
export async function getTasks() {
  try {
    const { data } = await client.get('/study-plans');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to fetch tasks'));
  }
}

/**
 * Create a new study plan / task.
 * @param {{ title, subject, description, priority, targetDate, estimatedHours }} task
 */
export async function createTask(task) {
  try {
    const { data } = await client.post('/study-plans', task);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to create task'));
  }
}

/**
 * Update an existing study plan by ID.
 */
export async function updateTask(id, updates) {
  try {
    const { data } = await client.put(`/study-plans/${id}`, updates);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to update task'));
  }
}

/**
 * Delete a study plan by ID.
 */
export async function deleteTask(id) {
  try {
    await client.delete(`/study-plans/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to delete task'));
  }
}

export default client;
