import { useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type Props = { initialMode: 'login' | 'register' }

export default function AuthPage({ initialMode }: Props) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setError('')

    const nextFieldErrors: { email?: string; password?: string } = {}
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      nextFieldErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextFieldErrors.email = 'Please enter a valid email address.'
    }
    if (!password) {
      nextFieldErrors.password = 'Please enter your password.'
    } else if (mode === 'register' && password.length < 8) {
      nextFieldErrors.password = 'Your password must be at least 8 characters.'
    }
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

    if (!supabase || !isSupabaseConfigured) {
      setError('Supabase is not configured for this deployment. Check the Vercel environment variables and redeploy.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'register') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { emailRedirectTo: window.location.origin + '/login' },
        })
        if (authError) throw authError
        setNotice(data.session
          ? 'Your account has been created. You are signed in.'
          : 'Account created. Check your email and confirm your address before signing in.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (authError) throw authError
        const requestedPath = new URLSearchParams(window.location.search).get('returnTo')
        const destination = requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : '/'
        window.location.assign(destination)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const changeMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setNotice('')
    setError('')
    setFieldErrors({})
    setShowPassword(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 pb-16 pt-36">
      <section className="auth-card w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-2xl sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Your Glacier account</p>
        <h1 className="mt-4 font-serif text-4xl text-[var(--text)]">{mode === 'login' ? 'Welcome back.' : 'Join Glacier.'}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{mode === 'login' ? 'Sign in to your account to continue.' : 'Create an account with your email address and a password.'}</p>
        <form noValidate onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-xs font-medium text-[var(--muted)]">Email address
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })) }}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-4 py-3.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              placeholder="you@example.com"
            />
            {fieldErrors.email && <span id="auth-email-error" className="mt-2 block text-xs text-red-400" role="alert">{fieldErrors.email}</span>}
          </label>
          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-[var(--muted)]">Password</label>
            <div className="relative mt-2">
              <input
                id="auth-password"
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: undefined })) }}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-4 py-3.5 pr-20 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[var(--muted)] shadow-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--page)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && <p id="auth-password-error" className="mt-2 text-xs text-red-400" role="alert">{fieldErrors.password}</p>}
          </div>
          <button disabled={busy} type="submit" className="w-full rounded-full bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[#101628] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-[var(--text)]">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--page)] p-3 text-xs leading-5 text-[var(--muted)]">{notice}</p>}
        {mode === 'register' && <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Email verification is required before a new account can sign in.</p>}
        <p className="mt-7 text-center text-sm text-[var(--muted)]">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={changeMode} className="font-semibold text-[var(--accent)] hover:underline">{mode === 'login' ? 'Create one' : 'Sign in'}</button>
        </p>
        <a href="/" className="mt-6 block text-center text-xs text-[var(--muted)] hover:text-[var(--text)]">Back to Glacier</a>
      </section>
    </main>
  )
}
