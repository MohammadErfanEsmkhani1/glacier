import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = { mode: 'dark' | 'light'; onToggleMode: () => void }

export default function SiteHeader({ mode, onToggleMode }: Props) {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let active = true
    const syncSession = (session: { user: { id: string } } | null) => {
      if (active) setSignedIn(Boolean(session))
    }
    void supabase.auth.getSession().then(({ data }) => syncSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => syncSession(session))
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  return (
    <header className="appearance-header fixed left-4 right-4 top-5 z-50 flex items-center justify-between gap-2">
      <a href={signedIn ? '/account' : '/register'} className="account-header-link">
        <span>{signedIn ? 'Your Account' : 'Sign in / Create account ↗'}</span>
        <svg className="account-header-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c.7-3.4 3.2-5.2 7-5.2s6.3 1.8 7 5.2" />
        </svg>
      </a>
      <button type="button" onClick={onToggleMode} aria-pressed={mode === 'light'} className="theme-control" aria-label={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'} title={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'}>
        <span className="theme-control-icon" aria-hidden="true">{mode === 'dark' ? '☼' : '☾'}</span>
        <span className="text-xs font-medium">Dark/Light mode</span>
        <span className={mode === 'light' ? 'theme-track is-on' : 'theme-track'} aria-hidden="true"><span /></span>
      </button>
    </header>
  )
}
