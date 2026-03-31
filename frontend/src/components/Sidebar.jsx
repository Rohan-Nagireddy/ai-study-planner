import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',        icon: '⬡', label: 'Dashboard' },
  { to: '/planner', icon: '📋', label: 'Planner'   },
]

export function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const w = collapsed ? 72 : 240

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: w, zIndex: 100,
      background: 'rgba(13,13,26,0.95)',
      borderRight: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
    }}>

      {/* Brand */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 72,
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', background: 'linear-gradient(90deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StudyAI
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>Planner Pro</div>
          </div>
        )}
        <button onClick={onToggle} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, width: 32, height: 32, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', fontSize: '0.8rem',
          transition: 'all var(--transition)',
          flexShrink: 0,
        }}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center',
            gap: 12, padding: collapsed ? '12px 0' : '11px 14px',
            borderRadius: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
            color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
            borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            fontWeight: isActive ? 600 : 400,
            fontSize: '0.9rem',
            transition: 'all var(--transition)',
            textDecoration: 'none',
          })}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', flexDirection: collapsed ? 'column' : 'row',
        alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.85rem', color: '#fff',
        }}>
          {(user?.name || user?.email || 'U')[0].toUpperCase()}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        )}
        <button onClick={handleLogout} title="Logout" style={{
          background: 'transparent', border: 'none',
          color: 'var(--text-muted)', fontSize: '1rem',
          padding: 4, borderRadius: 6, flexShrink: 0,
          transition: 'color var(--transition)',
        }}
          onMouseEnter={e => e.target.style.color = 'var(--danger)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          ⏻
        </button>
      </div>
    </aside>
  )
}
