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
  createdAt?: string
}

export const starterTitles: CatalogTitle[] = []

let catalogHasLoaded = false

function markCatalogLoaded() {
  catalogHasLoaded = true
  window.dispatchEvent(new Event('glacier:catalogue-ready'))
}

export function slugifyTitle(title: string) {
  const slug = title
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'title'
}

export function getTitleUrl(item: Pick<CatalogTitle, 'id' | 'title'>, from?: string) {
  const params = new URLSearchParams({ id: item.id })
  if (from) params.set('from', from)
  return `/title/${slugifyTitle(item.title)}?${params.toString()}`
}

export function useCatalogReady() {
  const [ready, setReady] = useState(catalogHasLoaded)

  useEffect(() => {
    const onReady = () => setReady(true)
    window.addEventListener('glacier:catalogue-ready', onReady)
    if (catalogHasLoaded) setReady(true)
    return () => window.removeEventListener('glacier:catalogue-ready', onReady)
  }, [])

  return ready
}

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
        if (active) {
          setTitles(readLocalCatalog())
          markCatalogLoaded()
        }
        return
      }
      const { data, error } = await supabase
        .from('titles')
        .select('id,title,kind,release_year,genre,description,poster_url,featured,created_at')
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true })
      if (!active) return
      if (error) {
        console.error('Glacier catalogue could not be loaded:', error.message)
        markCatalogLoaded()
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
        createdAt: item.created_at,
      })))
      markCatalogLoaded()
    }
    void load()
    const refresh = () => { void load() }
    window.addEventListener('glacier:catalogue-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      active = false
      window.removeEventListener('glacier:catalogue-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return titles
}
