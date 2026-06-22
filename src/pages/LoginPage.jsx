import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err, profile } = await signIn(email, password)
    setLoading(false)

    if (err) {
      setError('E-mail ou senha inválidos.')
      return
    }

    if (profile?.role === 'admin') navigate('/admin')
    else if (profile?.status === 'active') navigate('/dashboard')
    else navigate('/')
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <SEO title="Entrar" path="/login" />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl">💊</span>
          <h1 className="mt-3 text-xl font-semibold text-gray-900">
            Entrar no PharmaNotes
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">Senha</label>
              <Link
                to="/forgot-password"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem conta?{' '}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">
            Cadastrar
          </Link>
        </p>
      </div>
    </main>
  )
}
