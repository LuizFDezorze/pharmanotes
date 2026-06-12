import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { normalizeNote, formatDate, initials, avatarColor } from '../lib/utils'
import { categoryColors } from '../data/mock'

export default function NotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('notes')
      .select(`
        id, title, content, status, created_at,
        categories ( id, name ),
        users ( id, name, role ),
        note_tags ( tags ( id, name ) )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single()
      .then(({ data }) => {
        setNote(data ? normalizeNote(data) : null)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Nota não encontrada.
      </div>
    )
  }

  const color = categoryColors[note.category] ?? categoryColors['Geral']

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
      >
        ← Voltar
      </button>

      <article className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}
          >
            {note.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(note.date)}</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-5">
          {note.title}
        </h1>

        {note.content.startsWith('<') ? (
          <div
            className="prose prose-sm max-w-none text-gray-600 mb-6"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
            {note.content}
          </p>
        )}

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-5 border-t border-gray-100">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColor(note.author.name)}`}
          >
            {initials(note.author.name)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">
              {note.author.name}
            </span>
            <span className="text-xs text-gray-400">Autor</span>
          </div>
          {note.author.role === 'admin' && (
            <span className="ml-auto text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              admin
            </span>
          )}
        </div>
      </article>
    </main>
  )
}
