import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M11.3 4.6 L4.7 10.1 c-.44.37-.7.92-.7 1.5 V19 a1.6 1.6 0 001.6 1.6 H9v-4.4a3 3 0 016 0v4.4h3.4A1.6 1.6 0 0020 19v-7.4c0-.58-.26-1.13-.7-1.5L12.7 4.6a1.1 1.1 0 00-1.4 0Z" fill="currentColor" />
    </svg>
  )
}

function FilmIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 4.8A1.8 1.8 0 017.8 3h8.4A1.8 1.8 0 0118 4.8V21l-6-3.8L6 21V4.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const items = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'exhibit', label: 'Recommended movies', Icon: FilmIcon },
  { key: 'visit', label: 'My movies', Icon: BookmarkIcon },
  { key: 'mission', label: 'About Glacier', Icon: InfoIcon },
]

type NavbarProps = { mode: 'dark' | 'light'; onToggleMode: () => void }

export default function Navbar({ mode, onToggleMode }: NavbarProps) {
  const [active, setActive] = useState('home')
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let mounted = true
    const syncSession = (session: { user: { id: string } } | null) => {
      if (mounted) setSignedIn(Boolean(session))
    }
    void supabase.auth.getSession().then(({ data }) => syncSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => syncSession(session))
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const sections = items
      .map(({ key }) => document.getElementById(key))
      .filter((el): el is HTMLElement => el !== null)

    let frame = 0

    const updateActive = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.45
        const current = sections.reduce<HTMLElement | null>((closest, section) => {
          if (!closest) return section

          const rect = section.getBoundingClientRect()
          const closestRect = closest.getBoundingClientRect()
          const distance = marker < rect.top ? rect.top - marker : marker > rect.bottom ? marker - rect.bottom : 0
          const closestDistance = marker < closestRect.top ? closestRect.top - marker : marker > closestRect.bottom ? marker - closestRect.bottom : 0

          return distance < closestDistance ? section : closest
        }, null)

        if (current) setActive(current.id)
      })
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [])

  const goTo = (key: string) => {
    if (window.location.pathname !== '/') {
      const destinations: Record<string, string> = {
        home: '/',
        exhibit: '/categories',
        visit: '/login',
        mission: '/#mission',
      }
      window.location.href = destinations[key] ?? '/'
      return
    }

    const section = document.getElementById(key)
    if (!section) return

    // Align the selected section itself with the top edge of the viewport.
    // Do not subtract a navbar offset: that was leaving a strip of the previous section visible.
    const targetTop = section.getBoundingClientRect().top + window.scrollY
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <>
      <header className="appearance-header fixed left-4 right-4 top-5 z-50 flex items-center justify-between gap-2">
        <a href={signedIn ? '/account' : '/register'} className="account-header-link">
          <span>{signedIn ? 'Your Account' : 'Sign in / Create account ↗'}</span>
          <svg className="account-header-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.2-5.2 7-5.2s6.3 1.8 7 5.2" />
          </svg>
        </a>
        <button type="button" onClick={onToggleMode} aria-pressed={mode === 'light'} className="theme-control" aria-label={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'} title={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'}>
          <span className="theme-control-icon" aria-hidden="true">{mode === 'dark' ? '☼' : '☾'}</span>
          <span className="text-xs font-medium">Dark/Light mode</span>
          <span className={mode === 'light' ? 'theme-track is-on' : 'theme-track'} aria-hidden="true"><span /></span>
        </button>
      </header>
      <div className="pointer-events-none fixed left-0 right-0 top-5 z-50 flex justify-center px-4">
      <motion.nav
        aria-label="Primary navigation"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.075] px-2.5 py-1.5 shadow-[0_12px_44px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.16)] backdrop-blur-[22px]"
      >
        {items.map(({ key, label, Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => goTo(key)}
              aria-label={label}
              title={label}
              aria-current={isActive ? 'location' : undefined}
              className={`glacier-focus relative flex h-10 w-[60px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-colors ${isActive ? 'text-white' : 'text-white/65 hover:text-white'}`}
            >
              {isActive && (
                <motion.span
                  layoutId="dock-active"
                  className="absolute inset-0 rounded-full border border-white/[0.08] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative z-10 flex"><Icon /></span>
            </button>
          )
        })}
      </motion.nav>
      </div>
    </>
  )
}
