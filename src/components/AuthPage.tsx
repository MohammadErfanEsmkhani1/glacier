import { useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type Props = { initialMode: 'login' | 'register' }

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string
    theme?: 'light' | 'dark' | 'auto'
    callback: (token: string) => void
    'expired-callback'?: () => void
    'error-callback'?: () => void
  }) => string
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

function safeReturnPath() {
  const requestedPath = new URLSearchParams(window.location.search).get('returnTo')
  return requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//')
    ? requestedPath
    : '/'
}

export default function AuthPage({ initialMode }: Props) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [verificationOpen, setVerificationOpen] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [verificationNotice, setVerificationNotice] = useState('')
  const [verificationBusy, setVerificationBusy] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaStatus, setCaptchaStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const captchaContainer = useRef<HTMLDivElement>(null)
  const captchaWidgetId = useRef<string | null>(null)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return

    let active = true
    const scriptId = 'glacier-cloudflare-turnstile'
    const renderWidget = () => {
      if (!active || !window.turnstile || !captchaContainer.current || captchaWidgetId.current) return
      try {
        captchaWidgetId.current = window.turnstile.render(captchaContainer.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: document.documentElement.dataset.mode === 'light' ? 'light' : 'dark',
          callback: (token) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(''),
          'error-callback': () => {
            setCaptchaToken('')
            setCaptchaStatus('error')
          },
        })
        setCaptchaStatus('ready')
      } catch {
        setCaptchaStatus('error')
      }
    }
    const handleScriptError = () => {
      if (active) setCaptchaStatus('error')
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
    }
    script.addEventListener('load', renderWidget)
    script.addEventListener('error', handleScriptError)
    if (window.turnstile) renderWidget()
    else if (!script.isConnected) document.head.appendChild(script)

    return () => {
      active = false
      script?.removeEventListener('load', renderWidget)
      script?.removeEventListener('error', handleScriptError)
      if (captchaWidgetId.current && window.turnstile) {
        window.turnstile.remove(captchaWidgetId.current)
        captchaWidgetId.current = null
      }
      setCaptchaToken('')
    }
  }, [mode])

  useEffect(() => {
    if (!verificationOpen || resendCooldown <= 0) return
    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [verificationOpen, resendCooldown])

  const openVerification = (address: string) => {
    setPendingEmail(address)
    setVerificationCode('')
    setVerificationError('')
    setVerificationNotice('')
    setResendCooldown(60)
    setVerificationOpen(true)
    setPassword('')
  }

  const closeVerification = () => {
    setVerificationOpen(false)
    setVerificationCode('')
    setVerificationError('')
    setVerificationNotice('')
    setResendCooldown(0)
  }

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

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError(captchaStatus === 'error'
        ? 'The security check could not load. Please refresh the page and try again.'
        : 'Please complete the quick security check before creating your account.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'register') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: TURNSTILE_SITE_KEY ? { captchaToken } : undefined,
        })
        if (authError) throw authError

        if (data.user?.identities?.length === 0) {
          setError('We could not start a new account with that address. Try signing in, or check the email address and try again.')
          return
        }

        // Email confirmation must be enabled in the Supabase project. If it is
        // disabled, do not let this browser continue into Glacier as verified.
        if (data.session) {
          await supabase.auth.signOut()
          setError('Email verification is not enabled for this Glacier deployment yet. Please enable Confirm email in Supabase Auth before accepting new registrations.')
          return
        }

        openVerification(trimmedEmail)
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
          options: TURNSTILE_SITE_KEY ? { captchaToken } : undefined,
        })
        if (authError) throw authError
        window.location.assign(safeReturnPath())
      }
    } catch (caught) {
      const authCode = caught && typeof caught === 'object' && 'code' in caught
        ? String((caught as { code?: unknown }).code ?? '')
        : ''
      const authMessage = caught instanceof Error ? caught.message.toLowerCase() : ''
      if (mode === 'login' && (authCode === 'email_not_confirmed' || authMessage.includes('email not confirmed'))) {
        try {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: trimmedEmail,
          })
          if (resendError) throw resendError
          openVerification(trimmedEmail)
        } catch (resendCaught) {
          setError(resendCaught instanceof Error
            ? resendCaught.message
            : 'We could not send a fresh verification code. Please try again in a little while.')
        }
      } else {
        setError(caught instanceof Error ? caught.message : 'Authentication failed. Please try again.')
      }
    } finally {
      setBusy(false)
      if (TURNSTILE_SITE_KEY && captchaWidgetId.current && window.turnstile) {
        window.turnstile.reset(captchaWidgetId.current)
        setCaptchaToken('')
      }
    }
  }

  const verifyEmailCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setVerificationError('')
    setVerificationNotice('')
    const token = verificationCode.replace(/\D/g, '').slice(0, 6)
    if (token.length !== 6) {
      setVerificationError('Enter the six-digit code from your email to continue.')
      return
    }
    if (!supabase) {
      setVerificationError('Glacier could not reach the account service. Please try again.')
      return
    }

    setVerificationBusy(true)
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token,
        type: 'email',
      })
      if (verifyError) throw verifyError
      if (!data.session) {
        throw new Error('The code was accepted, but we could not start your session. Please sign in and try again.')
      }
      window.location.assign(safeReturnPath())
    } catch (caught) {
      setVerificationError(caught instanceof Error
        ? caught.message
        : 'That code could not be verified. Check it and try again.')
    } finally {
      setVerificationBusy(false)
    }
  }

  const resendCode = async () => {
    if (!supabase || resendCooldown > 0 || verificationBusy) return
    setVerificationError('')
    setVerificationNotice('')
    setVerificationBusy(true)
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
      })
      if (resendError) throw resendError
      setVerificationCode('')
      setVerificationNotice('A fresh code is on its way. Check your inbox in a moment.')
      setResendCooldown(60)
    } catch (caught) {
      setVerificationError(caught instanceof Error
        ? caught.message
        : 'We could not send another code just yet. Please try again shortly.')
    } finally {
      setVerificationBusy(false)
    }
  }

  const changeMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setNotice('')
    setError('')
    setFieldErrors({})
    setShowPassword(false)
    closeVerification()
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
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-4 py-3.5 pr-12 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[#211923] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)]"
              >
                {showPassword ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 9 4.5 10 7-.4 1.1-1.3 2.5-2.7 3.8" />
                    <path d="M6.2 6.2C3.9 7.7 2.5 10 2 12c1 2.5 4.8 7 10 7 1.3 0 2.5-.3 3.6-.8" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <p id="auth-password-error" className="mt-2 text-xs text-red-400" role="alert">{fieldErrors.password}</p>}
          </div>

          {TURNSTILE_SITE_KEY && (
            <div className="space-y-2">
              <div ref={captchaContainer} className="min-h-[65px]" />
              {captchaStatus === 'loading' && <p className="text-xs text-[var(--muted)]">Loading a quick security check…</p>}
              {captchaStatus === 'error' && <p className="text-xs text-red-400" role="alert">The security check could not load. Please refresh and try again.</p>}
            </div>
          )}

          <button disabled={busy} type="submit" className="w-full rounded-full bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[#101628] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Continue to email verification'}</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-[var(--text)]">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--page)] p-3 text-xs leading-5 text-[var(--muted)]">{notice}</p>}
        {mode === 'register' && <p className="mt-4 text-xs leading-5 text-[var(--muted)]">We’ll send a short confirmation code before your new account is ready.</p>}
        <p className="mt-7 text-center text-sm text-[var(--muted)]">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={changeMode} className="font-semibold text-[var(--accent)] hover:underline">{mode === 'login' ? 'Create one' : 'Sign in'}</button>
        </p>
        <a href="/" className="mt-6 block text-center text-xs text-[var(--muted)] hover:text-[var(--text)]">Back to Glacier</a>
      </section>

      {verificationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#08070b]/75 px-4 py-8 backdrop-blur-md">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="glacier-verification-title"
            className="my-auto w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-2xl sm:p-9"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--page)] text-[var(--accent)]">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m4 7 8 6 8-6" />
                <path d="m16.5 3.5 1 1 2-2" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">A little note from Glacier</p>
            <h2 id="glacier-verification-title" className="mt-3 font-serif text-3xl text-[var(--text)]">Your place is almost ready.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              We sent a six-digit code to <span className="font-semibold text-[var(--text)]">{pendingEmail}</span>. Pop it in below to make sure this account belongs to you. Then we’ll let you straight in.
            </p>

            <form noValidate onSubmit={verifyEmailCode} className="mt-7 space-y-4">
              <label htmlFor="glacier-verification-code" className="block text-xs font-medium text-[var(--muted)]">Your six-digit code</label>
              <input
                id="glacier-verification-code"
                autoFocus
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={verificationCode}
                onChange={(event) => { setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setVerificationError('') }}
                aria-label="Six-digit email verification code"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--page)] px-4 py-4 text-center font-mono text-2xl tracking-[0.45em] text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                placeholder="••••••"
              />
              <button disabled={verificationBusy || verificationCode.length !== 6} type="submit" className="w-full rounded-full bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[#101628] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                {verificationBusy ? 'Checking your code…' : 'Verify and enter Glacier'}
              </button>
            </form>

            {verificationError && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-[var(--text)]">{verificationError}</p>}
            {verificationNotice && <p role="status" className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--page)] p-3 text-xs leading-5 text-[var(--muted)]">{verificationNotice}</p>}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button type="button" disabled={verificationBusy || resendCooldown > 0} onClick={resendCode} className="font-semibold text-[var(--accent)] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50">
                {resendCooldown > 0 ? `Send a new code in ${resendCooldown}s` : 'Send a new code'}
              </button>
              <button type="button" onClick={closeVerification} className="text-[var(--muted)] transition hover:text-[var(--text)]">Use a different email</button>
            </div>
            <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">No rush. If you didn’t ask for a Glacier account, you can simply ignore this email.</p>
          </section>
        </div>
      )}
    </main>
  )
}
