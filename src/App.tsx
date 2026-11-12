import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Exhibit from './components/Exhibit'
import Visit from './components/Visit'
import Mission from './components/Mission'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import CategoryPage from './components/CategoryPage'
import AuthPage from './components/AuthPage'
import AccountPage from './components/AccountPage'
import AdminPage from './components/AdminPage'
import TitlePage from './components/TitlePage'
import ViewportPreloader from './components/ViewportPreloader'
import { applyPalette, defaultSeo, getPalette, readAllSeo } from './lib/siteStorage'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import './index.css'

type Mode = 'dark' | 'light'
const specialPaths = ['/categories', '/login', '/register', '/admin', '/account']

function AdminRoute() {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied' | 'unconfigured'>('checking')

  useEffect(() => {
    let active = true
    const verifySession = async (session: Session | null) => {
      if (!supabase) {
        if (active) setStatus('unconfigured')
        return
      }
      if (!session) {
        if (active) setStatus('denied')
        return
      }
      const { data, error } = await supabase.rpc('is_glacier_admin')
      if (!active) return
      setStatus(!error && data === true ? 'allowed' : 'denied')
    }

    const checkAdmin = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setStatus('unconfigured')
        return
      }
      const { data, error } = await supabase.auth.getSession()
      if (!active) return
      if (error) {
        setStatus('denied')
        return
      }
      await verifySession(data.session)
    }

    void checkAdmin()
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      // Defer the permission check until the auth callback has returned.
      Promise.resolve().then(() => verifySession(session))
    }).data.subscription
    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  if (status === 'checking') return <main data-preloader-pending="true" className="flex min-h-screen items-center justify-center px-6 pt-32 text-sm text-[var(--muted)]">Checking administrator access…</main>
  if (status === 'unconfigured') return <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 pt-32 text-center"><h1 className="font-serif text-4xl text-[var(--text)]">Backend not configured</h1><p className="mt-4 text-sm leading-6 text-[var(--muted)]">Supabase connection details are missing from this deployment. Add the Vercel environment variables and redeploy.</p></main>
  if (status === 'denied') return <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 pt-32 text-center"><h1 className="font-serif text-4xl text-[var(--text)]">Administrator access required</h1><p className="mt-4 text-sm leading-6 text-[var(--muted)]">This account does not have permission to access the admin panel.</p><a href="/login?returnTo=%2Fadmin" className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Go to sign in</a></main>
  return <AdminPage />
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [paletteReady, setPaletteReady] = useState(false)
  const [mode, setMode] = useState<Mode>(() => localStorage.getItem('glacier-mode') === 'light' ? 'light' : 'dark')

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    localStorage.setItem('glacier-mode', mode)
  }, [mode])

  useEffect(() => {
    let active = true
    const loadPalette = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.from('site_settings').select('palette').eq('id', true).maybeSingle()
          if (active && !error && data?.palette) applyPalette(data.palette)
          else if (active) applyPalette(getPalette())
        } else if (active) applyPalette(getPalette())
      } finally {
        if (active) setPaletteReady(true)
      }
    }
    void loadPalette()
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => { active = false; window.removeEventListener('popstate', onPop) }
  }, [])

  useEffect(() => {
    let active = true
    const updateSeo = async () => {
      if (path.startsWith('/title/')) return
      const pageKey = path === '/' ? 'home' : path.replace('/', '')
      let seo = readAllSeo()[pageKey] ?? defaultSeo.home
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('site_pages').select('seo_title,seo_description').eq('slug', pageKey).maybeSingle()
        if (data) seo = { title: data.seo_title, description: data.seo_description }
      }
      if (!active) return
      document.title = seo.title
      let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!description) {
        description = document.createElement('meta')
        description.name = 'description'
        document.head.appendChild(description)
      }
      description.content = seo.description
    }
    void updateSeo()
    window.addEventListener('glacier:seo-updated', updateSeo)
    return () => { active = false; window.removeEventListener('glacier:seo-updated', updateSeo) }
  }, [path])

  const onToggleMode = () => setMode((current) => current === 'dark' ? 'light' : 'dark')
  const titleMatch = path.match(/^\/title\/([^/]+)$/i)
  const legacyTitleId = titleMatch?.[1] && /^[0-9a-f-]{36}$/i.test(titleMatch[1]) ? titleMatch[1] : null
  const queryTitleId = new URLSearchParams(window.location.search).get('id')
  const titleId = queryTitleId || legacyTitleId
  const isTitlePage = Boolean(titleMatch)
  const isSpecialPage = specialPaths.includes(path) || isTitlePage

  return (
    <div data-preloader-pending={paletteReady ? undefined : 'true'} className={isSpecialPage ? 'app-shell min-h-screen' : 'site-home min-h-screen'}>
      {path === '/' && <Navbar mode={mode} onToggleMode={onToggleMode} />}
      {path !== '/' && <SiteHeader mode={mode} onToggleMode={onToggleMode} />}
      {path === '/categories' && <CategoryPage />}
      {(path === '/login' || path === '/register') && <AuthPage key={path} initialMode={path === '/register' ? 'register' : 'login'} />}
      {path === '/account' && <AccountPage />}
      {path === '/admin' && <AdminRoute />}
      {isTitlePage && titleId && <TitlePage titleId={titleId} />}
      {isTitlePage && !titleId && <main className="flex min-h-screen items-center justify-center px-6 pt-32 text-center"><div><h1 className="font-serif text-4xl text-[var(--text)]">Title link unavailable</h1><p className="mt-4 text-sm text-[var(--muted)]">This title link is missing its identifier.</p><a href="/categories" className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Browse the catalogue</a></div></main>}
      {!isSpecialPage && <main><Hero /><Exhibit /><Visit /><Mission /></main>}
      <SiteFooter />
      <ViewportPreloader mode={mode} />
    </div>
  )
}

export default App
