import api, { getErrorMessage } from './api';

/**
 * Auth service — wraps all authentication API calls.
 *
 * Every method returns the raw Axios response so callers
 * can access response.data.data (the unwrapped ApiResponse payload).
 */
const authService = {
  /**
   * POST /api/auth/register
   * @param {{ name: string, email: string, password: string }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * POST /api/auth/login
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * GET /api/auth/me  (requires valid JWT in Authorization header)
   */
  me: () => api.get('/auth/me'),
};

export { getErrorMessage };
export default authService;
