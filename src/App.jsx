import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/layout/Header'
import ProtectedRoute from './components/layout/ProtectedRoute'
import PublicFeed from './pages/PublicFeed'
import NotePage from './pages/NotePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CollaboratorDashboard from './pages/collaborator/CollaboratorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<PublicFeed />} />
            <Route path="/notes/:id" element={<NotePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CollaboratorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
