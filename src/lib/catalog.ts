import { useEffect, useState, useSyncExternalStore } from 'react'
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

function readLocalCatalog(): CatalogTitle[] {
  try {
    const saved = localStorage.getItem('glacier-catalogue')
    const parsed: unknown = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed as CatalogTitle[] : []
  } catch {
    return []
  }
}

let cachedTitles: CatalogTitle[] = readLocalCatalog()
let catalogHasLoaded = false
let catalogRequest: Promise<void> | null = null
const catalogListeners = new Set<() => void>()

function notifyCatalogChange() {
  catalogListeners.forEach((listener) => listener())
}

function markCatalogLoaded() {
  catalogHasLoaded = true
  window.dispatchEvent(new Event('glacier:catalogue-ready'))
}

function subscribeCatalog(listener: () => void) {
  catalogListeners.add(listener)
  return () => catalogListeners.delete(listener)
}

function getCatalogSnapshot() {
  return cachedTitles
}

async function loadCatalog(force = false) {
  if (!force && catalogHasLoaded) return
  if (catalogRequest) return catalogRequest

  if (!isSupabaseConfigured || !supabase) {
    cachedTitles = readLocalCatalog()
    catalogHasLoaded = true
    notifyCatalogChange()
    markCatalogLoaded()
    return
  }

  catalogRequest = (async () => {
    try {
      const { data, error } = await supabase
        .from('titles')
        .select('id,title,kind,release_year,genre,description,poster_url,featured,created_at')
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true })

      if (error) {
        console.error('Glacier catalogue could not be loaded:', error.message)
        // Keep previously cached data visible if a background refresh fails.
        catalogHasLoaded = true
        notifyCatalogChange()
        markCatalogLoaded()
        return
      }

      cachedTitles = (data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        kind: item.kind,
        year: item.release_year ?? 0,
        genre: item.genre,
        description: item.description,
        poster_url: item.poster_url,
        featured: item.featured,
        createdAt: item.created_at,
      }))
      catalogHasLoaded = true
      notifyCatalogChange()
      markCatalogLoaded()
    } catch (error) {
      console.error('Glacier catalogue request failed:', error)
      // Fall back to the previously cached/local catalogue if the network is unavailable.
      if (!catalogHasLoaded) {
        cachedTitles = readLocalCatalog()
        catalogHasLoaded = true
      }
      notifyCatalogChange()
      markCatalogLoaded()
    }
  })().finally(() => {
    catalogRequest = null
  })

  return catalogRequest
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

export function slugifyTitle(title: string) {
  const slug = title
    .normalize('NFKD')
    .replace(/\\p{M}/gu, '')
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

export function readCatalog(): CatalogTitle[] {
  return cachedTitles
}

export function saveCatalog(titles: CatalogTitle[]) {
  localStorage.setItem('glacier-catalogue', JSON.stringify(titles))
  cachedTitles = titles
  catalogHasLoaded = true
  notifyCatalogChange()
  window.dispatchEvent(new Event('glacier:catalogue-updated'))
}

export function useCatalog() {
  const titles = useSyncExternalStore(subscribeCatalog, getCatalogSnapshot, getCatalogSnapshot)

  useEffect(() => {
    const refresh = () => { void loadCatalog(true) }
    void loadCatalog()
    window.addEventListener('glacier:catalogue-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('glacier:catalogue-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return titles
}
