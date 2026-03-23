import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import api from '../services/api';

/**
 * OAuthSuccess handler — captures JWT from the URL after social login.
 * 1. Extract token from ?token=...
 * 2. Store in localStorage
 * 3. Fetch user profile to sync global state
 * 4. Redirect to dashboard
 */
export function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Temporarily set token for the profile fetch
      localStorage.setItem('token', token);

      // Fetch user profile to complete login state
      api.get('/auth/me')
        .then(res => {
          loginWithToken(token, res.data.data);
          navigate('/', { replace: true });
        })
        .catch(() => {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-6" size={48} />
        <h2 className="text-2xl font-bold">Authenticating...</h2>
        <p className="text-muted-foreground mt-2">Connecting to your study workspace</p>
      </div>
    </div>
  );
}
