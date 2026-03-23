import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { getErrorMessage } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider — manages JWT token + user state globally.
 *
 * Token is stored in localStorage under the key "token".
 * User profile is stored under the key "user" (JSON).
 *
 * On mount: rehydrates state from localStorage so the user stays
 * logged in across page refreshes.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate from localStorage on first render ────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupt data — clear and force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Persist token + user profile and update React state. */
  const persistSession = (token, authData) => {
    const userData = {
      id:    authData.userId,
      name:  authData.name,
      email: authData.email,
      role:  authData.role,
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // ── Auth actions ───────────────────────────────────────────────────────────

  /**
   * Register a new account.
   * On success → stores token + user, returns { success: true, user }.
   * On failure → returns { success: false, message }.
   */
  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });
      const authData = response.data.data;
      const userData = persistSession(authData.accessToken, authData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Registration failed') };
    }
  };

  /**
   * Login with email + password.
   * On success → stores token + user, returns { success: true, user }.
   * On failure → returns { success: false, message }.
   */
  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const authData = response.data.data;
      const userData = persistSession(authData.accessToken, authData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Login failed') };
    }
  };

  /** Clear session and log the user out. */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Sets the token and user state directly (used for OAuth2 callbacks).
   */
  const loginWithToken = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Returns the auth context. Must be used inside <AuthProvider>. */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
