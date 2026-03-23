import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { FocusMode } from './pages/FocusMode'
import { StudyPlanner } from './pages/StudyPlanner'
import { Analytics } from './pages/Analytics'
import { AdminDashboard } from './pages/AdminDashboard'
import { Profile } from './pages/Profile'
import { Achievements } from './pages/Achievements'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OAuthSuccess } from './pages/OAuthSuccess'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/planner" element={<StudyPlanner />} />
                  <Route path="/focus" element={<FocusMode />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
