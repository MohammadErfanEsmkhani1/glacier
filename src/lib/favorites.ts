import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

type FavoriteChange = { userId: string; titleId: string; saved: boolean }
const FAVORITES_EVENT = 'glacier:favorites-updated'

function applyFavoriteChange(current: string[], change: FavoriteChange) {
  if (change.saved) return current.includes(change.titleId) ? current : [...current, change.titleId]
  return current.filter((id) => id !== change.titleId)
}

export function useFavorites() {
  const [userId, setUserId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const currentUserId = useRef<string | null>(null)
  const pendingTitles = useRef(new Set<string>())

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
    const onFavoriteChange = (event: Event) => {
      const change = (event as CustomEvent<FavoriteChange>).detail
      if (!change || change.userId !== currentUserId.current) return
      setFavoriteIds((current) => applyFavoriteChange(current, change))
    }
    window.addEventListener(FAVORITES_EVENT, onFavoriteChange)

    const sync = (id: string | null) => {
      if (!active) return
      // Token refreshes and browser resume can emit auth events for the same
      // user. Keep the current favorites visible instead of clearing and
      // querying Supabase again.
      if (currentUserId.current === id) return
      currentUserId.current = id
      pendingTitles.current.clear()
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
      window.removeEventListener(FAVORITES_EVENT, onFavoriteChange)
      subscription.unsubscribe()
    }
  }, [load])

  const toggleFavorite = useCallback(async (titleId: string) => {
    const id = userId
    if (!supabase || !id || currentUserId.current !== id || pendingTitles.current.has(titleId)) return false

    const shouldSave = !favoriteIds.includes(titleId)
    const change: FavoriteChange = { userId: id, titleId, saved: shouldSave }

    // Update every mounted favorites view immediately, before waiting for Supabase.
    pendingTitles.current.add(titleId)
    setError('')
    setFavoriteIds((current) => applyFavoriteChange(current, change))
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: change }))

    const result = shouldSave
      ? await supabase.from('user_favorites').insert({ user_id: id, title_id: titleId })
      : await supabase.from('user_favorites').delete().eq('user_id', id).eq('title_id', titleId)

    pendingTitles.current.delete(titleId)
    if (currentUserId.current !== id) return false

    if (result.error) {
      // Roll back the optimistic change if the database did not accept it.
      const rollback: FavoriteChange = { ...change, saved: !shouldSave }
      setFavoriteIds((current) => applyFavoriteChange(current, rollback))
      window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: rollback }))
      setError(result.error.message)
      return false
    }

    return true
  }, [favoriteIds, userId])

  return { userId, favoriteIds, loading, error, toggleFavorite, refresh: () => load(userId) }
}
