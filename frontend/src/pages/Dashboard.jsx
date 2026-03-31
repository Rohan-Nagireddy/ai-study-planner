import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const STATS = [
  { key: 'tasks',    label: 'Tasks Today',    icon: '✅', color: '#8b5cf6' },
  { key: 'streak',   label: 'Day Streak',     icon: '🔥', color: '#f59e0b' },
  { key: 'minutes',  label: 'Study Minutes',  icon: '⏱️', color: '#06b6d4' },
  { key: 'score',    label: 'Focus Score',    icon: '⚡', color: '#10b981' },
]

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]   = useState({ tasks: 0, streak: 0, minutes: 0, score: 0 })
  const [tasks, setTasks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [plansRes] = await Promise.allSettled([
          api.get('/study-plans'),
        ])
        const plans = plansRes.status === 'fulfilled' ? plansRes.value.data : []
        const arr   = Array.isArray(plans) ? plans : []
        setTasks(arr.slice(0, 5))
        setStats(s => ({ ...s, tasks: arr.length }))
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page" style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
          {greeting()}, {user?.name || 'Student'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STATS.map(({ key, label, icon, color }) => (
          <div key={key} className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats[key]}</p>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem',
              }}>{icon}</div>
            </div>
            <div style={{ marginTop: 16, height: 3, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(stats[key] * 10, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, borderRadius: 99, transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* Recent Plans */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Study Plans</h2>
            <span className="badge badge-purple">{tasks.length} plans</span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 52, background: 'var(--bg-card-hover)', borderRadius: 8, animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <p>No study plans yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Go to Planner to create one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((t, i) => (
                <div key={t.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--bg-card-hover)', border: '1px solid var(--border)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title || t.subject || 'Study Session'}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{t.status || 'In Progress'}</p>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'New Study Plan', icon: '📋', href: '/planner', color: 'var(--accent)' },
                { label: 'Start Focus Session', icon: '⏱️', href: '/planner', color: '#06b6d4' },
                { label: 'View Progress', icon: '📈', href: '/', color: '#10b981' },
              ].map(({ label, icon, href, color }) => (
                <a key={label} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10, textDecoration: 'none',
                  background: `${color}11`, border: `1px solid ${color}33`,
                  color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem',
                  transition: 'all var(--transition)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.borderColor = color }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}11`; e.currentTarget.style.borderColor = `${color}33` }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Tip Card */}
          <div className="card" style={{ padding: 24, borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>💡 Study Tip</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Use the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break to maximize retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
