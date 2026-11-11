import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Exhibit from './components/Exhibit'
import Visit from './components/Visit'
import Mission from './components/Mission'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import CategoryPage from './components/CategoryPage'
import AuthPage from './components/AuthPage'
import AdminPage from './components/AdminPage'
import { applyPalette, defaultSeo, getPalette, readAllSeo } from './lib/siteStorage'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import './index.css'

type Mode = 'dark' | 'light'
const specialPaths = ['/categories', '/login', '/register', '/admin']

function AdminRoute() {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied' | 'unconfigured'>('checking')

  useEffect(() => {
    let active = true
    const checkAdmin = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setStatus('unconfigured')
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (active) setStatus('denied')
        return
      }
      const { data, error } = await supabase.rpc('is_glacier_admin')
      if (active) setStatus(!error && data === true ? 'allowed' : 'denied')
    }
    void checkAdmin()
    const subscription = supabase?.auth.onAuthStateChange(() => { void checkAdmin() }).data.subscription
    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  if (status === 'checking') return <main className="flex min-h-screen items-center justify-center px-6 pt-32 text-sm text-[var(--muted)]">Checking administrator access…</main>
  if (status === 'unconfigured') return <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 pt-32 text-center"><h1 className="font-serif text-4xl text-[var(--text)]">Backend not configured</h1><p className="mt-4 text-sm leading-6 text-[var(--muted)]">Supabase connection details are missing from this deployment. Add the Vercel environment variables and redeploy.</p></main>
  if (status === 'denied') return <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 pt-32 text-center"><h1 className="font-serif text-4xl text-[var(--text)]">Administrator access required</h1><p className="mt-4 text-sm leading-6 text-[var(--muted)]">Sign in with the account assigned as Glacier's administrator. If this is your first setup, we still need to assign your account in Supabase.</p><a href="/login" className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Go to sign in</a></main>
  return <AdminPage />
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [mode, setMode] = useState<Mode>(() => localStorage.getItem('glacier-mode') === 'light' ? 'light' : 'dark')

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    localStorage.setItem('glacier-mode', mode)
  }, [mode])

  useEffect(() => {
    let active = true
    const loadPalette = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('site_settings').select('palette').eq('id', true).maybeSingle()
        if (active && !error && data?.palette) applyPalette(data.palette)
        else if (active && error) applyPalette(getPalette())
      } else if (active) applyPalette(getPalette())
    }
    void loadPalette()
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => { active = false; window.removeEventListener('popstate', onPop) }
  }, [])

  useEffect(() => {
    let active = true
    const updateSeo = async () => {
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
  const isSpecialPage = specialPaths.includes(path)

  return (
    <div className={isSpecialPage ? 'app-shell min-h-screen' : 'site-home min-h-screen'}>
      {path === '/' && <Navbar />}
      <SiteHeader mode={mode} onToggleMode={onToggleMode} />
      {path === '/categories' && <CategoryPage />}
      {(path === '/login' || path === '/register') && <AuthPage key={path} initialMode={path === '/register' ? 'register' : 'login'} />}
      {path === '/admin' && <AdminRoute />}
      {!isSpecialPage && <main><Hero /><Exhibit /><Visit /><Mission /></main>}
      <SiteFooter />
    </div>
  )
}
export default App
