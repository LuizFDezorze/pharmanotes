import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFavorites() {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState(new Set())

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set())
      return
    }
    supabase
      .from('favorites')
      .select('note_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setFavoriteIds(new Set((data ?? []).map((f) => f.note_id)))
      })
  }, [user])

  const toggle = useCallback(
    async (noteId) => {
      if (!user) return
      const isFav = favoriteIds.has(noteId)
      if (isFav) {
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(noteId)
          return next
        })
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('note_id', noteId)
      } else {
        setFavoriteIds((prev) => new Set(prev).add(noteId))
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, note_id: noteId })
      }
    },
    [user, favoriteIds],
  )

  const isFavorite = useCallback(
    (noteId) => favoriteIds.has(noteId),
    [favoriteIds],
  )

  return { isFavorite, toggle, favoriteIds }
}
