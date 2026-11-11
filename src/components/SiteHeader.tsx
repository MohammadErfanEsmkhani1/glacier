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
      <a href={signedIn ? '/#visit' : '/register'} className="account-header-link">
        {signedIn ? 'Your Account' : 'Sign in / Create account ↗'}
      </a>
      <button type="button" onClick={onToggleMode} aria-pressed={mode === 'light'} className="theme-control" aria-label={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'} title={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'}>
        <span className="theme-control-icon" aria-hidden="true">{mode === 'dark' ? '☼' : '☾'}</span>
        <span className="text-xs font-medium">Dark/Light mode</span>
        <span className={mode === 'light' ? 'theme-track is-on' : 'theme-track'} aria-hidden="true"><span /></span>
      </button>
    </header>
  )
}
