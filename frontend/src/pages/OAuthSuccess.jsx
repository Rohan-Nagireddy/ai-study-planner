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
          // res.data is ApiResponse<AuthResponse>
          const authData = res.data.data; 
          loginWithToken(token, {
            id: authData.userId,
            name: authData.name,
            email: authData.email,
            role: authData.role
          });
          navigate('/', { replace: true });
        })
        .catch((err) => {
          console.error('Profile fetch failed', err);
          localStorage.removeItem('token');
          navigate('/login?error=true', { replace: true });
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-primary)',
      padding: 20, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Blobs (same as Login for consistency) */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ 
        textAlign: 'center', position: 'relative', zIndex: 1,
        background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(16px)',
        padding: '60px 80px', borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="loader-wrapper" style={{ marginBottom: 32, position: 'relative' }}>
          <Loader2 
            className="animate-spin" 
            size={64} 
            strokeWidth={1.5}
            style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 12px var(--accent-glow))' }} 
          />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '100px', height: '100px', borderRadius: '50%',
            border: '2px solid rgba(139, 92, 246, 0.1)', borderTopColor: 'transparent'
          }} />
        </div>
        
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>
          Preparing your workspace
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '280px', margin: '0 auto', lineHeight: 1.6 }}>
          Syncing your account details and setting up your study dashboard...
        </p>

        <div style={{ 
          marginTop: 40, width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', 
          margin: '40px auto 0', borderRadius: '2px', overflow: 'hidden'
        }}>
          <div className="progress-bar" style={{ 
            width: '100%', height: '100%', background: 'var(--accent)',
            animation: 'loading-bar 2s infinite ease-in-out'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
