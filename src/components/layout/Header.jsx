import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { initials, avatarColor } from '../../lib/utils'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <span className="font-semibold text-gray-900 tracking-tight">
            PharmaNotes
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {user && profile ? (
            <>
              {profile.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Admin
                </Link>
              )}
              {profile.status === 'active' && profile.role === 'collaborator' && (
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Minhas notas
                </Link>
              )}
              <div
                title={profile.name}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColor(profile.name)}`}
              >
                {initials(profile.name)}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
