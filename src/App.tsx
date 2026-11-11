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
import './index.css'

type Mode = 'dark' | 'light'
const specialPaths = ['/categories', '/login', '/register', '/admin']

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [mode, setMode] = useState<Mode>(() => localStorage.getItem('glacier-mode') === 'light' ? 'light' : 'dark')

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    localStorage.setItem('glacier-mode', mode)
  }, [mode])

  useEffect(() => {
    applyPalette(getPalette())
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const pageKey = path === '/' ? 'home' : path.replace('/', '')
    const updateSeo = () => {
      const seo = readAllSeo()[pageKey] ?? defaultSeo.home
      document.title = seo.title
      let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!description) {
        description = document.createElement('meta')
        description.name = 'description'
        document.head.appendChild(description)
      }
      description.content = seo.description
    }
    updateSeo()
    window.addEventListener('glacier:seo-updated', updateSeo)
    return () => window.removeEventListener('glacier:seo-updated', updateSeo)
  }, [path])

  const onToggleMode = () => setMode((current) => current === 'dark' ? 'light' : 'dark')
  const isSpecialPage = specialPaths.includes(path)

  return (
    <div className={isSpecialPage ? 'app-shell min-h-screen' : 'site-home min-h-screen'}>
      {!isSpecialPage && <Navbar />}
      <SiteHeader mode={mode} onToggleMode={onToggleMode} />
      {path === '/categories' && <CategoryPage />}
      {(path === '/login' || path === '/register') && <AuthPage key={path} initialMode={path === '/register' ? 'register' : 'login'} />}
      {path === '/admin' && <AdminPage />}
      {!isSpecialPage && <main><Hero /><Exhibit /><Visit /><Mission /></main>}
      <SiteFooter />
    </div>
  )
}
export default App
