import { useNavigate, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { categoryColors } from '../../data/mock'
import { formatDate, initials, avatarColor } from '../../lib/utils'
import FavoriteButton from './FavoriteButton'

export default function NoteCard({ note, isFavorite, onToggleFavorite }) {
  const navigate = useNavigate()
  const color = categoryColors[note.category] ?? categoryColors['Geral']

  function handleContentClick(e) {
    const anchor = e.target.closest('a')
    if (!anchor) return
    e.stopPropagation()
    const href = anchor.getAttribute('href')
    if (href?.startsWith('/notes/')) {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <article
      onClick={() => navigate(`/notes/${note.id}`)}
      className="bg-white border border-gray-200 rounded-xl flex flex-col gap-3 p-5 hover:border-gray-300 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}
        >
          {note.category}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatDate(note.date)}</span>
          {onToggleFavorite && (
            <FavoriteButton active={isFavorite} onClick={() => onToggleFavorite(note.id)} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <h2 className="text-sm font-medium text-gray-900 leading-snug">
          {note.title}
        </h2>
        {note.content.startsWith('<') ? (
          <div
            className="text-sm text-gray-500 leading-relaxed line-clamp-3 [&_*]:!m-0 [&_*]:!p-0"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
          />
        ) : (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
            {note.content}
          </p>
        )}
      </div>

      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-auto">
        <Link
          to={`/profile/${note.author.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColor(note.author.name)}`}
          >
            {initials(note.author.name)}
          </div>
          <span className="text-xs text-gray-600">
            {note.author.name.split(' ')[0]}
          </span>
        </Link>
        {note.author.role === 'admin' && (
          <span className="ml-auto text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            admin
          </span>
        )}
      </div>
    </article>
  )
}
