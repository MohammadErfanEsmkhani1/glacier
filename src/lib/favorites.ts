import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useFavorites() {
  const [userId, setUserId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    const sync = async (id: string | null) => {
      if (!active) return
      setUserId(id)
      if (!id) {
        setFavoriteIds([])
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('user_favorites')
        .select('title_id')
        .eq('user_id', id)
      if (!active) return
      if (queryError) setError(queryError.message)
      else {
        setError('')
        setFavoriteIds((data ?? []).map((row) => row.title_id))
      }
      setLoading(false)
    }
    void supabase.auth.getSession().then(({ data }) => sync(data.session?.user.id ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      Promise.resolve().then(() => sync(session?.user.id ?? null))
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const toggleFavorite = useCallback(async (titleId: string) => {
    if (!supabase || !userId) return false
    setError('')
    const exists = favoriteIds.includes(titleId)
    const result = exists
      ? await supabase.from('user_favorites').delete().eq('user_id', userId).eq('title_id', titleId)
      : await supabase.from('user_favorites').insert({ user_id: userId, title_id: titleId })
    if (result.error) {
      setError(result.error.message)
      return false
    }
    setFavoriteIds((current) => exists ? current.filter((id) => id !== titleId) : [...current, titleId])
    return true
  }, [favoriteIds, userId])

  return { userId, favoriteIds, loading, error, toggleFavorite, refresh: () => load(userId) }
}
