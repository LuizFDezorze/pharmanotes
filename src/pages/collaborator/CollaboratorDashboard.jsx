import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/utils'
import { categoryColors } from '../../data/mock'

const INPUT =
  'text-sm border border-gray-200 rounded-lg px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent w-full'

function NoteEditor({ categories, onSaved, onCancel }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Título e conteúdo são obrigatórios.')
      return
    }
    setError('')
    setLoading(true)

    const { data: note, error: noteErr } = await supabase
      .from('notes')
      .insert({
        title: title.trim(),
        category_id: categoryId,
        content: content.trim(),
        author_id: user.id,
      })
      .select()
      .single()

    if (noteErr) {
      setError('Erro ao salvar nota. Tente novamente.')
      setLoading(false)
      return
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
          .insert(tagRows.map((t) => ({ note_id: note.id, tag_id: t.id })))
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
      <h2 className="text-base font-medium text-gray-900">Nova nota</h2>

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
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Escreva a nota clínica aqui..."
          className={INPUT + ' resize-none'}
        />
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
          {loading ? 'Salvando...' : 'Salvar rascunho'}
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
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)

  async function loadData() {
    const [notesRes, catsRes] = await Promise.all([
      supabase
        .from('notes')
        .select('id, title, status, created_at, categories ( name )')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setNotes(notesRes.data ?? [])
    setCategories(catsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleDelete(noteId) {
    if (!confirm('Excluir este rascunho?')) return
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  function handleSaved() {
    setShowEditor(false)
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
            onClick={() => setShowEditor(true)}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Nova nota
          </button>
        )}
      </div>

      {showEditor && (
        <div className="mb-6">
          <NoteEditor
            categories={categories}
            onSaved={handleSaved}
            onCancel={() => setShowEditor(false)}
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
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    Excluir
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
