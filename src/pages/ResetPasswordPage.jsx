import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setError('')
    setLoading(true)
    const err = await updatePassword(password)
    setLoading(false)
    if (err) {
      setError('Erro ao redefinir a senha. Tente novamente.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <p className="text-4xl mb-4">✓</p>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Senha redefinida!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Sua senha foi alterada com sucesso. Você já pode entrar com a nova
            senha.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Ir para o login
          </button>
        </div>
      </main>
    )
  }

  if (!ready) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <p className="text-3xl mb-3">⏳</p>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Link inválido ou expirado
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Solicite um novo link de redefinição de senha.
          </p>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl">💊</span>
          <h1 className="mt-3 text-xl font-semibold text-gray-900">
            Redefinir senha
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Nova senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Confirmar nova senha
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </main>
  )
}
