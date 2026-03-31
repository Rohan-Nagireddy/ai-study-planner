import React, { useState, useEffect } from 'react'
import api from '../services/api'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science', 'Economics']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const PRIORITY_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' }

export function Planner() {
  const [plans, setPlans]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [form, setForm] = useState({
    title: '', subject: '', description: '', priority: 'MEDIUM',
    targetDate: '', estimatedHours: '',
  })

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    setLoading(true)
    try {
      const { data } = await api.get('/study-plans')
      setPlans(Array.isArray(data) ? data : [])
    } catch { setPlans([]) } finally { setLoading(false) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/study-plans', form)
      setForm({ title: '', subject: '', description: '', priority: 'MEDIUM', targetDate: '', estimatedHours: '' })
      setShowForm(false)
      fetchPlans()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan')
    } finally { setSubmitting(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this study plan?')) return
    try {
      await api.delete(`/study-plans/${id}`)
      setPlans(p => p.filter(x => x.id !== id))
    } catch { /* ignore */ }
  }

  const update = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="page" style={{ maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Study Planner</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Organize your learning goals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Plan'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card animate-in" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20 }}>Create Study Plan</h2>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }}>{error}</div>
          )}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="e.g. Calculus Chapter 5" value={form.title} onChange={update('title')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-input" value={form.subject} onChange={update('subject')} style={{ cursor: 'pointer' }}>
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" value={form.priority} onChange={update('priority')} style={{ cursor: 'pointer' }}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Date</label>
                <input className="form-input" type="date" value={form.targetDate} onChange={update('targetDate')} style={{ colorScheme: 'dark' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Est. Hours</label>
                <input className="form-input" type="number" min="0.5" step="0.5" placeholder="e.g. 3" value={form.estimatedHours} onChange={update('estimatedHours')} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} placeholder="Topics to cover, goals, notes…" value={form.description} onChange={update('description')} style={{ resize: 'vertical', minHeight: 80 }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : '✓ Create Plan'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 80, background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)' }} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📋</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No study plans yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>Create your first plan to get started</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Create Plan</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plans.map((plan, i) => (
            <div key={plan.id || i} className="card animate-in" style={{ padding: '20px 24px', animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{plan.title || 'Study Session'}</h3>
                    {plan.priority && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                        background: `${PRIORITY_COLORS[plan.priority]}22`,
                        color: PRIORITY_COLORS[plan.priority],
                        border: `1px solid ${PRIORITY_COLORS[plan.priority]}44`
                      }}>{plan.priority}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {plan.subject && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>📚 {plan.subject}</span>}
                    {plan.targetDate && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>📅 {plan.targetDate}</span>}
                    {plan.estimatedHours && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>⏱ {plan.estimatedHours}h</span>}
                  </div>
                  {plan.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>{plan.description}</p>}
                </div>
                <button onClick={() => handleDelete(plan.id)} style={{
                  background: 'transparent', border: 'none', color: 'var(--text-muted)',
                  fontSize: '1rem', padding: 6, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                  transition: 'color var(--transition)',
                }}
                  onMouseEnter={e => e.target.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
