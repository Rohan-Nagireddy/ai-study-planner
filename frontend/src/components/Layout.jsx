import React, { useState } from 'react'
import { Sidebar } from './Sidebar'

export function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 72 : 240,
        transition: 'margin-left 0.3s ease',
        padding: '32px',
        minHeight: '100vh',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  )
}
