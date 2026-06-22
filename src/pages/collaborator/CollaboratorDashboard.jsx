import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../hooks/useFavorites'
import { formatDate, normalizeNote } from '../../lib/utils'
import { categoryColors } from '../../data/mock'
import NoteCard from '../../components/notes/NoteCard'
import RichTextEditor from '../../components/editor/RichTextEditor'

const INPUT =
  'text-sm border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent w-full'

function NoteEditor({ note, categories, onSaved, onCancel }) {
  const { user } = useAuth()
  const isEditing = !!note
  const [title, setTitle] = useState(note?.title ?? '')
  const [categoryId, setCategoryId] = useState(note?.category_id ?? categories[0]?.id ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [tagInput, setTagInput] = useState(note?.tagInput ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isContentEmpty = !content || content === '<p></p>'

  async function handleSubmit(e) {
    e.preventDefault()
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
        .update({
          title: title.trim(),
          category_id: categoryId,
          content,
        })
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
        .insert({
          title: title.trim(),
          category_id: categoryId,
          content,
          author_id: user.id,
        })
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
        .upsert(tagNames.map((name) => ({ name })), {
          onConflict: 'name',
          ignoreDuplicates: true,
        })

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
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4"
    >
      <h2 className="text-base font-medium text-gray-900">
        {isEditing ? 'Editar nota' : 'Nova nota'}
      </h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-700">Título</label>
        <input
          type="text"
          required
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
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
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
          <span className="font-normal text-gray-400">
            (opcional, separadas por vírgula)
          </span>
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

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading
            ? 'Salvando...'
            : isEditing
              ? 'Salvar alterações'
              : 'Salvar rascunho'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function CollaboratorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isFavorite, toggle, favoriteIds } = useFavorites()
  const [notes, setNotes] = useState([])
  const [favoriteNotes, setFavoriteNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  async function loadData() {
    const [notesRes, catsRes] = await Promise.all([
      supabase
        .from('notes')
        .select('id, title, content, status, category_id, created_at, categories ( name )')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setNotes(notesRes.data ?? [])
    setCategories(catsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (favoriteIds.size === 0) {
      setFavoriteNotes([])
      return
    }
    supabase
      .from('notes')
      .select(`
        id, title, content, status, created_at,
        categories ( id, name ),
        users ( id, name, role ),
        note_tags ( tags ( id, name ) )
      `)
      .eq('status', 'published')
      .in('id', [...favoriteIds])
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFavoriteNotes((data ?? []).map(normalizeNote))
      })
  }, [favoriteIds])

  useEffect(() => {
    loadData()
  }, [])

  async function handleDelete(noteId) {
    if (!confirm('Excluir este rascunho?')) return
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  async function handleEdit(note) {
    const { data } = await supabase
      .from('note_tags')
      .select('tags ( name )')
      .eq('note_id', note.id)

    const tagInput = (data ?? [])
      .map((nt) => nt.tags?.name)
      .filter(Boolean)
      .join(', ')

    setEditingNote({ ...note, tagInput })
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
    loadData()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Minhas notas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Rascunhos aguardam revisão do admin antes de serem publicados.
          </p>
        </div>
        {!showEditor && (
          <button
            onClick={handleNewNote}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Nova nota
          </button>
        )}
      </div>

      {showEditor && (
        <div className="mb-6">
          <NoteEditor
            note={editingNote}
            categories={categories}
            onSaved={handleSaved}
            onCancel={handleCancelEditor}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Você ainda não escreveu nenhuma nota.
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
                <p className="text-sm text-gray-800 flex-1 truncate">
                  {note.title}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    note.status === 'published'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {note.status === 'published' ? 'Publicada' : 'Rascunho'}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatDate(note.created_at)}
                </span>
                {note.status === 'draft' && (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Notas favoritas</h2>
        <p className="text-sm text-gray-500 mb-4">
          Notas que você salvou para consulta rápida.
        </p>
        {favoriteNotes.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Você ainda não favoritou nenhuma nota.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoriteNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isFavorite={isFavorite(note.id)}
                onToggleFavorite={toggle}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
