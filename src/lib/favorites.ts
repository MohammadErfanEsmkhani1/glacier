import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

export function useFavorites() {
  const [userId, setUserId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Ignore responses that finish after the visitor has switched accounts.
  const currentUserId = useRef<string | null>(null)

  const load = useCallback(async (id: string | null) => {
    if (!supabase || !id) {
      setFavoriteIds([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('user_favorites')
      .select('title_id')
      .eq('user_id', id)

    if (currentUserId.current !== id) return
    if (queryError) {
      setError(queryError.message)
    } else {
      setError('')
      setFavoriteIds((data ?? []).map((row) => row.title_id))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true
    const sync = (id: string | null) => {
      if (!active) return
      currentUserId.current = id
      setUserId(id)
      setFavoriteIds([])
      setError('')
      if (!id) {
        setLoading(false)
        return
      }
      void load(id)
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (active) sync(data.session?.user.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      Promise.resolve().then(() => sync(session?.user.id ?? null))
    })

    return () => {
      active = false
      currentUserId.current = null
      subscription.unsubscribe()
    }
  }, [load])

  const toggleFavorite = useCallback(async (titleId: string) => {
    const id = userId
    if (!supabase || !id || currentUserId.current !== id) return false

    setError('')
    const exists = favoriteIds.includes(titleId)
    const result = exists
      ? await supabase.from('user_favorites').delete().eq('user_id', id).eq('title_id', titleId)
      : await supabase.from('user_favorites').insert({ user_id: id, title_id: titleId })

    // Do not let a completed request for an old account alter the new account's UI.
    if (currentUserId.current !== id) return false
    if (result.error) {
      setError(result.error.message)
      return false
    }

    setFavoriteIds((current) => exists
      ? current.filter((favoriteId) => favoriteId !== titleId)
      : [...current, titleId])
    return true
  }, [favoriteIds, userId])

  return { userId, favoriteIds, loading, error, toggleFavorite, refresh: () => load(userId) }
}
