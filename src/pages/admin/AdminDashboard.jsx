import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate, initials, avatarColor } from '../../lib/utils'
import { categoryColors } from '../../data/mock'

function TabButton({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
      {count > 0 && (
        <span
          className={`text-xs rounded-full px-1.5 py-0.5 ${
            active ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(userId, status) {
    await supabase.from('users').update({ status }).eq('id', userId)
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nenhum cadastro pendente.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {users.map((u) => (
        <div
          key={u.id}
          className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColor(u.name)}`}
          >
            {initials(u.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-400 truncate">{u.email}</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {formatDate(u.created_at)}
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => updateStatus(u.id, 'active')}
              className="text-xs font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              Aprovar
            </button>
            <button
              onClick={() => updateStatus(u.id, 'rejected')}
              className="text-xs font-medium bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Recusar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function NotesTab() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('draft')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('notes')
      .select('id, title, status, created_at, categories ( name ), users ( name )')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setNotes(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function publishNote(noteId) {
    await supabase.from('notes').update({ status: 'published' }).eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  async function deleteNote(noteId) {
    if (!confirm('Excluir esta nota permanentemente?')) return
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {['draft', 'published'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === s
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {s === 'draft' ? 'Rascunhos' : 'Publicadas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Nenhuma nota {filter === 'draft' ? 'em rascunho' : 'publicada'}.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => {
            const catName = note.categories?.name ?? 'Geral'
            const color = categoryColors[catName] ?? categoryColors['Geral']
            return (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4"
              >
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${color.bg} ${color.text}`}
                >
                  {catName}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{note.title}</p>
                  <p className="text-xs text-gray-400">
                    por {note.users?.name ?? '—'}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatDate(note.created_at)}
                </span>
                <div className="flex gap-2 shrink-0">
                  {note.status === 'draft' && (
                    <button
                      onClick={() => publishNote(note.id)}
                      className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Publicar
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors px-1"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('users')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingCount(count ?? 0))
  }, [])

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Painel do Admin
        </h1>
      </div>

      <div className="flex gap-2 mb-6">
        <TabButton
          active={tab === 'users'}
          onClick={() => setTab('users')}
          count={pendingCount}
        >
          Usuários
        </TabButton>
        <TabButton active={tab === 'notes'} onClick={() => setTab('notes')}>
          Notas
        </TabButton>
      </div>

      {tab === 'users' ? <UsersTab /> : <NotesTab />}
    </main>
  )
}
