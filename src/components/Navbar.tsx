import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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
  { key: 'exhibit', label: 'Discover', Icon: FilmIcon },
  { key: 'visit', label: 'My movies', Icon: BookmarkIcon },
  { key: 'mission', label: 'About Glacier', Icon: InfoIcon },
]

export default function Navbar() {
  const [active, setActive] = useState('home')

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
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="fixed left-0 right-0 top-5 z-50 flex justify-center px-4">
      <motion.nav
        aria-label="Primary navigation"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#111a2b]/85 p-1.5 shadow-[0_12px_44px_rgba(0,0,0,.38)] backdrop-blur-xl"
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
              className={`glacier-focus relative flex h-10 w-11 items-center justify-center rounded-full transition-colors sm:w-12 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {isActive && (
                <motion.span
                  layoutId="dock-active"
                  className="absolute inset-0 rounded-full border border-violet-200/15 bg-[#9270ff]/25"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative z-10"><Icon /></span>
            </button>
          )
        })}
      </motion.nav>
    </div>
  )
}
