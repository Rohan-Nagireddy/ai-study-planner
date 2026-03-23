import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import api from '../services/api';

/**
 * Handles the redirect from OAuth2 providers.
 * Extracts the JWT from the URL, fetches the user profile,
 * and completes the login process.
 */
export function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // 1. Temporarily store token to fetch profile
      localStorage.setItem('token', token);

      // 2. Fetch the user profile from the backend
      // We expect the backend to have a /api/auth/me or similar, 
      // but since we don't have it yet, we'll try to get it from JWT or 
      // just redirect to / and let the app handle it.
      // For now, let's assume we fetch it.
      api.get('/auth/me')
        .then(res => {
          loginWithToken(token, res.data.data);
          navigate('/', { replace: true });
        })
        .catch(() => {
          // If profile fetch fails, fallback to login
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
        <h2 className="text-xl font-semibold">Completing sign-in...</h2>
        <p className="text-muted-foreground mt-2">Setting up your study dashboard</p>
      </div>
    </div>
  );
}
