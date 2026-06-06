import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { normalizeNote } from '../lib/utils'
import NoteCard from '../components/notes/NoteCard'
import CategoryFilter from '../components/notes/CategoryFilter'

export default function PublicFeed() {
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const [notesRes, catsRes] = await Promise.all([
        supabase
          .from('notes')
          .select(`
            id, title, content, status, created_at,
            categories ( id, name ),
            users ( id, name, role ),
            note_tags ( tags ( id, name ) )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ])
      setNotes((notesRes.data ?? []).map(normalizeNote))
      setCategories(catsRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = notes
    if (selectedCategory) {
      const cat = categories.find((c) => c.id === selectedCategory)
      if (cat) result = result.filter((n) => n.category === cat.name)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [notes, categories, selectedCategory, search])

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Notas Clínicas
        </h1>
        <p className="text-sm text-gray-500">
          Referências farmacêuticas revisadas por especialistas.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
        <div className="sm:ml-auto">
          <input
            type="search"
            placeholder="Buscar notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 text-sm border border-gray-200 rounded-lg px-3 py-1.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 text-sm">
          Nenhuma nota encontrada.
        </div>
      )}
    </main>
  )
}
