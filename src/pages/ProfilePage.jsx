import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { normalizeNote, initials, avatarColor } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../hooks/useFavorites'
import SEO from '../components/SEO'
import NoteCard from '../components/notes/NoteCard'

export default function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { isFavorite, toggle } = useFavorites()
  const [profile, setProfile] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [profileRes, notesRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, bio, role')
          .eq('id', id)
          .single(),
        supabase
          .from('notes')
          .select(`
            id, title, content, status, created_at,
            categories ( id, name ),
            users ( id, name, role ),
            note_tags ( tags ( id, name ) )
          `)
          .eq('author_id', id)
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
      ])
      setProfile(profileRes.data)
      setNotes((notesRes.data ?? []).map(normalizeNote))
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Perfil não encontrado.
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      <SEO
        title={profile.name}
        description={profile.bio || `Notas publicadas por ${profile.name} no PharmaNotes.`}
        path={`/profile/${id}`}
      />

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0 ${avatarColor(profile.name)}`}
        >
          {initials(profile.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {profile.name}
            </h1>
            {profile.role === 'admin' && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                admin
              </span>
            )}
          </div>
          {profile.bio ? (
            <p className="text-sm text-gray-500 mt-1">{profile.bio}</p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">
              {notes.length} {notes.length === 1 ? 'nota publicada' : 'notas publicadas'}
            </p>
          )}
        </div>
      </div>

      <h2 className="text-base font-medium text-gray-900 mb-4">
        Notas publicadas
      </h2>

      {notes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Nenhuma nota publicada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isFavorite={user ? isFavorite(note.id) : false}
              onToggleFavorite={user ? toggle : undefined}
            />
          ))}
        </div>
      )}
    </main>
  )
}
