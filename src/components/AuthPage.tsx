import { useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type Props = { initialMode: 'login' | 'register' }

export default function AuthPage({ initialMode }: Props) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setError('')
    if (!supabase || !isSupabaseConfigured) {
      setError('Supabase is not configured for this deployment. Check the Vercel environment variables and redeploy.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'register') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + '/login' },
        })
        if (authError) throw authError
        setNotice(data.session
          ? 'Your account has been created. You are signed in.'
          : 'Account created. Check your email and confirm your address before signing in.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (authError) throw authError
        window.location.assign('/')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 pb-16 pt-36">
      <section className="auth-card w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-2xl sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Your Glacier account</p>
        <h1 className="mt-4 font-serif text-4xl text-[var(--text)]">{mode === 'login' ? 'Welcome back.' : 'Join Glacier.'}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{mode === 'login' ? 'Sign in to your account to continue.' : 'Create an account with your email address and a password.'}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-xs font-medium text-[var(--muted)]">Email address
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-4 py-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="you@example.com" />
          </label>
          <label className="block text-xs font-medium text-[var(--muted)]">Password
            <input required type="password" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-4 py-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="At least 8 characters" />
          </label>
          <button disabled={busy} type="submit" className="w-full rounded-full bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[#101628] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-[var(--text)]">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--page)] p-3 text-xs leading-5 text-[var(--muted)]">{notice}</p>}
        {mode === 'register' && <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Email verification is required before a new account can sign in.</p>}
        <p className="mt-7 text-center text-sm text-[var(--muted)]">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setNotice(''); setError('') }} className="font-semibold text-[var(--accent)] hover:underline">{mode === 'login' ? 'Create one' : 'Sign in'}</button>
        </p>
        <a href="/" className="mt-6 block text-center text-xs text-[var(--muted)] hover:text-[var(--text)]">Back to Glacier</a>
      </section>
    </main>
  )
}
