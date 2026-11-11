import { useEffect, useState } from 'react'

export type Palette = 'glacier' | 'aurora' | 'ember'
export type SiteCopy = { title: string; description: string }
export type PageSeo = { title: string; description: string }

export const defaultCopy: Record<string, SiteCopy> = {
  homeHero: { title: 'Find a story worth staying for.', description: 'Discover remarkable movies and series, find your next favourite, and keep the stories you love close.' },
  recommendations: { title: 'Recommended movies & series', description: 'A starting collection of memorable stories. Explore by format or search for a title or genre.' },
  account: { title: 'A home for your discoveries', description: 'Create an account to get a more personal Glacier experience. You can explore the catalogue without signing in.' },
  about: { title: 'Great stories deserve to be found, remembered, and shared.', description: 'Glacier is a calm, considered home for movie and series discovery — focused on the stories, not the noise.' },
  categories: { title: 'Explore the collection', description: 'Browse the Glacier catalogue and search by title, genre, or year.' },
}
export const defaultSeo: Record<string, PageSeo> = {
  home: { title: 'Glacier — Movies, Series & Discovery', description: 'Discover remarkable movies and series with Glacier.' },
  categories: { title: 'Movies & Series — Glacier', description: 'Browse and search the Glacier collection.' },
  login: { title: 'Sign in — Glacier', description: 'Sign in to your Glacier account.' },
  register: { title: 'Create an account — Glacier', description: 'Create your Glacier account.' },
  admin: { title: 'Admin — Glacier', description: 'Manage the Glacier website.' },
}
function readObject<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } as T : fallback
  } catch { return fallback }
}
export function readAllCopy() { return readObject('glacier-site-copy', defaultCopy) }
export function readAllSeo() { return readObject('glacier-page-seo', defaultSeo) }
export function readSectionCopy(key: string) { return readAllCopy()[key] ?? defaultCopy[key] ?? { title: '', description: '' } }
export function saveAllCopy(copy: Record<string, SiteCopy>) {
  localStorage.setItem('glacier-site-copy', JSON.stringify(copy))
  window.dispatchEvent(new Event('glacier:site-copy-updated'))
}
export function saveAllSeo(seo: Record<string, PageSeo>) {
  localStorage.setItem('glacier-page-seo', JSON.stringify(seo))
  window.dispatchEvent(new Event('glacier:seo-updated'))
}
export function getPalette(): Palette {
  const value = localStorage.getItem('glacier-palette')
  return value === 'aurora' || value === 'ember' ? value : 'glacier'
}
export function applyPalette(palette: Palette) {
  localStorage.setItem('glacier-palette', palette)
  document.documentElement.dataset.palette = palette
  window.dispatchEvent(new Event('glacier:palette-updated'))
}
export function useSectionCopy(key: string) {
  const [copy, setCopy] = useState<SiteCopy>(() => readSectionCopy(key))
  useEffect(() => {
    const refresh = () => setCopy(readSectionCopy(key))
    window.addEventListener('glacier:site-copy-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('glacier:site-copy-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [key])
  return copy
}
