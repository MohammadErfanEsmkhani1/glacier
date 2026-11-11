import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './supabase'

export type CatalogKind = 'movie' | 'series'
export type CatalogTitle = {
  id: string
  title: string
  kind: CatalogKind
  year: number
  genre: string
  description: string
  poster_url: string | null
  featured: boolean
}

export const starterTitles: CatalogTitle[] = []

function readLocalCatalog(): CatalogTitle[] {
  try {
    const saved = localStorage.getItem('glacier-catalogue')
    const parsed: unknown = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed as CatalogTitle[] : []
  } catch { return [] }
}

export function readCatalog(): CatalogTitle[] {
  return readLocalCatalog()
}

export function saveCatalog(titles: CatalogTitle[]) {
  localStorage.setItem('glacier-catalogue', JSON.stringify(titles))
  window.dispatchEvent(new Event('glacier:catalogue-updated'))
}

export function useCatalog() {
  const [titles, setTitles] = useState<CatalogTitle[]>(() => readLocalCatalog())

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setTitles(readLocalCatalog())
        return
      }
      const { data, error } = await supabase
        .from('titles')
        .select('id,title,kind,release_year,genre,description,poster_url,featured')
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true })
      if (!active) return
      if (error) {
        console.error('Glacier catalogue could not be loaded:', error.message)
        return
      }
      setTitles((data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        kind: item.kind,
        year: item.release_year ?? 0,
        genre: item.genre,
        description: item.description,
        poster_url: item.poster_url,
        featured: item.featured,
      })))
    }
    void load()
    const refresh = () => { void load() }
    window.addEventListener('glacier:catalogue-updated', refresh)
    window.addEventListener('storage', refresh)
    // Refresh the same public catalogue when the auth state changes. The
    // recommendations remain independent of whether a visitor is signed in.
    const subscription = supabase?.auth.onAuthStateChange(() => {
      Promise.resolve().then(refresh)
    }).data.subscription
    return () => {
      active = false
      window.removeEventListener('glacier:catalogue-updated', refresh)
      window.removeEventListener('storage', refresh)
      subscription?.unsubscribe()
    }
  }, [])
  return titles
}
