import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function HomeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11.3 4.6 4.7 10.1c-.44.37-.7.92-.7 1.5V19a1.6 1.6 0 001.6 1.6H9v-4.4a3 3 0 016 0v4.4h3.4A1.6 1.6 0 0020 19v-7.4c0-.58-.26-1.13-.7-1.5L12.7 4.6a1.1 1.1 0 00-1.4 0Z" fill="currentColor"/></svg> }
function FilmIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4" stroke="currentColor" strokeWidth="1.5"/></svg> }
function AccountIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M4.5 20c.7-3.2 3.5-5.2 7.5-5.2s6.8 2 7.5 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function InfoIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }

const items = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'exhibit', label: 'Recommended movies', Icon: FilmIcon },
  { key: 'visit', label: 'Account', Icon: AccountIcon },
  { key: 'mission', label: 'About Glacier', Icon: InfoIcon },
]

export default function Navbar() {
  const [active, setActive] = useState('home')
  const [mode, setMode] = useState<'dark' | 'light'>(() => localStorage.getItem('glacier-mode') === 'light' ? 'light' : 'dark')

  useEffect(() => {
    const sections = items.map(({ key }) => document.getElementById(key)).filter((el): el is HTMLElement => el !== null)
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
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', updateActive); window.removeEventListener('resize', updateActive) }
  }, [])

  useEffect(() => {
    const syncMode = () => setMode(localStorage.getItem('glacier-mode') === 'light' ? 'light' : 'dark')
    window.addEventListener('storage', syncMode)
    return () => window.removeEventListener('storage', syncMode)
  }, [])

  const goTo = (key: string) => {
    const section = document.getElementById(key)
    if (!section) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    localStorage.setItem('glacier-mode', next)
    document.documentElement.dataset.mode = next
    setMode(next)
    window.dispatchEvent(new CustomEvent('glacier-mode-change', { detail: next }))
  }

  return (
    <div className="fixed left-0 right-0 top-5 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2">
        <motion.nav aria-label="Primary navigation" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.075] px-2.5 py-1.5 shadow-[0_12px_44px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.16)] backdrop-blur-[22px]">
          {items.map(({ key, label, Icon }) => {
            const isActive = active === key
            return <button key={key} type="button" onClick={() => goTo(key)} aria-label={label} title={label} aria-current={isActive ? 'location' : undefined}
              className={`glacier-focus relative flex h-10 w-[52px] items-center justify-center rounded-full border-0 bg-transparent transition-colors ${isActive ? 'text-white' : 'text-white/65 hover:text-white'}`}>
              {isActive && <motion.span layoutId="dock-active" className="absolute inset-0 rounded-full border border-white/[0.08] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]" transition={{ type: 'spring', stiffness: 420, damping: 36 }}/>}
              <span className="relative z-10 flex"><Icon/></span>
            </button>
          })}
        </motion.nav>
        <div className="flex items-center gap-1 rounded-full border border-white/[0.14] bg-white/[0.075] px-2 py-1.5 shadow-lg backdrop-blur-[22px]">
          <a href="/movies" className="glacier-focus rounded-full px-2 py-2 text-[11px] font-medium text-white/85 hover:bg-white/[0.12]">Movies</a>
          <a href="/series" className="glacier-focus rounded-full px-2 py-2 text-[11px] font-medium text-white/85 hover:bg-white/[0.12]">Series</a>
          <button type="button" onClick={toggleMode} aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            className="glacier-focus h-10 rounded-full px-3 text-xs font-medium text-white/85 hover:bg-white/[0.14]">{mode === 'dark' ? 'Light' : 'Dark'}</button>
        </div>
      </div>
    </div>
  )
}
