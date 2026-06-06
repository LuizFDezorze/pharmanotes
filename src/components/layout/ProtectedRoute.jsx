import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Centered({ children }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">{children}</div>
    </div>
  )
}

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <Centered>
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto" />
      </Centered>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (profile?.status === 'pending') {
    return (
      <Centered>
        <p className="text-3xl mb-3">⏳</p>
        <h2 className="text-base font-medium text-gray-900 mb-1">
          Cadastro em análise
        </h2>
        <p className="text-sm text-gray-500">
          Seu cadastro está aguardando aprovação do administrador.
        </p>
      </Centered>
    )
  }

  if (profile?.status === 'rejected') {
    return (
      <Centered>
        <p className="text-3xl mb-3">✗</p>
        <h2 className="text-base font-medium text-gray-900 mb-1">
          Acesso não aprovado
        </h2>
        <p className="text-sm text-gray-500">
          Seu cadastro não foi aprovado. Entre em contato com o administrador.
        </p>
      </Centered>
    )
  }

  if (requiredRole === 'admin' && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
