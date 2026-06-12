import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate, initials, avatarColor } from '../../lib/utils'
import { categoryColors } from '../../data/mock'
import RichTextEditor from '../../components/editor/RichTextEditor'

const INPUT =
  'text-sm border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent w-full'

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

function AdminNoteEditor({ note, categories, authorId, onSaved, onCancel }) {
  const isEditing = !!note
  const [title, setTitle] = useState(note?.title ?? '')
  const [categoryId, setCategoryId] = useState(note?.category_id ?? categories[0]?.id ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [tagInput, setTagInput] = useState(note?.tagInput ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isContentEmpty = !content || content === '<p></p>'

  async function save(status) {
    if (!title.trim() || isContentEmpty) {
      setError('Título e conteúdo são obrigatórios.')
      return
    }
    setError('')
    setLoading(true)

    let noteId
    if (isEditing) {
      const { error: noteErr } = await supabase
        .from('notes')
        .update({ title: title.trim(), category_id: categoryId, content, status })
        .eq('id', note.id)
      if (noteErr) {
        setError('Erro ao salvar nota. Tente novamente.')
        setLoading(false)
        return
      }
      noteId = note.id
      await supabase.from('note_tags').delete().eq('note_id', noteId)
    } else {
      const { data: newNote, error: noteErr } = await supabase
        .from('notes')
        .insert({ title: title.trim(), category_id: categoryId, content, author_id: authorId, status })
        .select()
        .single()
      if (noteErr) {
        setError('Erro ao salvar nota. Tente novamente.')
        setLoading(false)
        return
      }
      noteId = newNote.id
    }

    const tagNames = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)

    if (tagNames.length > 0) {
      await supabase
        .from('tags')
        .upsert(tagNames.map((name) => ({ name })), { onConflict: 'name', ignoreDuplicates: true })

      const { data: tagRows } = await supabase
        .from('tags')
        .select('id')
        .in('name', tagNames)

      if (tagRows?.length > 0) {
        await supabase
          .from('note_tags')
          .insert(tagRows.map((t) => ({ note_id: noteId, tag_id: t.id })))
      }
    }

    setLoading(false)
    onSaved()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4 mb-6">
      <h2 className="text-base font-medium text-gray-900">
        {isEditing ? 'Editar nota' : 'Nova nota'}
      </h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-700">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Ajuste de dose na insuficiência renal"
          className={INPUT}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-700">Categoria</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={INPUT}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-700">Conteúdo</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-700">
          Tags{' '}
          <span className="font-normal text-gray-400">(opcional, separadas por vírgula)</span>
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Ex: vancomicina, renal, TDM"
          className={INPUT}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          disabled={loading}
          onClick={() => save('draft')}
          className="text-sm font-medium bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar rascunho'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => save('published')}
          className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Publicar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
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
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('draft')
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  async function loadNotes() {
    setLoading(true)
    const [notesRes, catsRes] = await Promise.all([
      supabase
        .from('notes')
        .select('id, title, status, created_at, categories ( name ), users ( name )')
        .eq('status', filter)
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setNotes(notesRes.data ?? [])
    setCategories(catsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadNotes() }, [filter])

  async function handleEdit(note) {
    const [noteRes, tagsRes] = await Promise.all([
      supabase
        .from('notes')
        .select('id, title, content, status, category_id')
        .eq('id', note.id)
        .single(),
      supabase
        .from('note_tags')
        .select('tags ( name )')
        .eq('note_id', note.id),
    ])
    const tagInput = (tagsRes.data ?? [])
      .map((nt) => nt.tags?.name)
      .filter(Boolean)
      .join(', ')
    setEditingNote({ ...noteRes.data, tagInput })
    setShowEditor(true)
  }

  function handleNewNote() {
    setEditingNote(null)
    setShowEditor(true)
  }

  function handleCancelEditor() {
    setShowEditor(false)
    setEditingNote(null)
  }

  function handleSaved() {
    setShowEditor(false)
    setEditingNote(null)
    loadNotes()
  }

  async function publishNote(noteId) {
    await supabase.from('notes').update({ status: 'published' }).eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  async function unpublishNote(noteId) {
    await supabase.from('notes').update({ status: 'draft' }).eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  async function deleteNote(noteId) {
    if (!confirm('Excluir esta nota permanentemente?')) return
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  return (
    <div>
      {showEditor && (
        <AdminNoteEditor
          note={editingNote}
          categories={categories}
          authorId={user?.id}
          onSaved={handleSaved}
          onCancel={handleCancelEditor}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {['draft', 'published'].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setShowEditor(false) }}
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
        {!showEditor && (
          <button
            onClick={handleNewNote}
            className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Nova nota
          </button>
        )}
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
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Editar
                  </button>
                  {note.status === 'draft' && (
                    <button
                      onClick={() => publishNote(note.id)}
                      className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Publicar
                    </button>
                  )}
                  {note.status === 'published' && (
                    <button
                      onClick={() => unpublishNote(note.id)}
                      className="text-xs font-medium bg-white text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                    >
                      Despublicar
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
        <h1 className="text-xl font-semibold text-gray-900">Painel do Admin</h1>
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
