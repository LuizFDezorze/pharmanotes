import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setError('')
    setLoading(true)
    const err = await signUp(email, password, name)
    setLoading(false)
    if (err) {
      setError(
        err.message.includes('already registered')
          ? 'Este e-mail já está cadastrado.'
          : 'Erro ao criar conta. Tente novamente.'
      )
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
            Cadastro enviado!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Seu cadastro está em análise. Você receberá acesso assim que o
            administrador aprovar sua conta.
          </p>
          <Link
            to="/"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <SEO title="Criar conta" description="Crie sua conta no PharmaNotes e colabore com notas clínicas e referências farmacêuticas." path="/register" />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-4xl">💊</span>
          <h1 className="mt-3 text-xl font-semibold text-gray-900">
            Criar conta
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Colaboradores precisam de aprovação para publicar notas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Nome completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. João Silva"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

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
            <label className="text-xs font-medium text-gray-700">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
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
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  )
}
