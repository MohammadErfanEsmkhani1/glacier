import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthConfirmPage() {
  const [handoffId, setHandoffId] = useState('')
  const [tokenHash, setTokenHash] = useState('')
  const [message, setMessage] = useState('Your email link is ready. Confirm below when you’re ready.')
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('handoff_id') ?? ''
    const token = params.get('token_hash') ?? ''
    const type = params.get('type') ?? ''
    window.history.replaceState({}, document.title, '/auth/confirm')
    if (type !== 'email' || !id || !token) {
      setFailed(true)
      setMessage('This confirmation link is incomplete or expired. Return to Glacier and request a fresh link.')
      return
    }
    setHandoffId(id)
    setTokenHash(token)
  }, [])

  const confirmEmail = async () => {
    if (!supabase || !handoffId || !tokenHash || busy || confirmed) return
    setBusy(true)
    setFailed(false)
    try {
      const { error } = await supabase.functions.invoke('email-verification-handoff', {
        body: { action: 'publish', handoff_id: handoffId, token_hash: tokenHash },
      })
      if (error) throw error

      const localId = localStorage.getItem('glacier-auth-handoff-id')
      const localSecret = localStorage.getItem('glacier-auth-handoff-secret')
      if (localId === handoffId && localSecret) {
        const { data, error: pollError } = await supabase.functions.invoke('email-verification-handoff', {
          body: { action: 'poll', handoff_id: handoffId, secret: localSecret },
        })
        if (pollError) throw pollError
        const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'email',
        })
        if (verifyError) throw verifyError
        if (!verified.session) throw new Error('Your email was confirmed, but Glacier could not start your session.')
        await supabase.functions.invoke('email-verification-handoff', {
          body: { action: 'ack', handoff_id: handoffId, secret: localSecret },
        })
        localStorage.removeItem('glacier-auth-handoff-id')
        localStorage.removeItem('glacier-auth-handoff-secret')
        localStorage.removeItem('glacier-auth-pending-email')
        setConfirmed(true)
        setMessage('Lovely — your email is confirmed. You’re signed in to Glacier now.')
        window.setTimeout(() => window.location.replace('/'), 900)
      } else {
        setConfirmed(true)
        setMessage('Your email is confirmed. Head back to the Glacier tab where you created your account — it will sign you in automatically.')
      }
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'We could not complete this confirmation. Please request a fresh link from Glacier.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--page)] text-[var(--accent)]">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M5 12.5 9.2 17 19 7" />
            <path d="M12 3v2M4.9 5l1.4 1.4M3 12h2" />
          </svg>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">A note from Glacier</p>
        <h1 className="mt-3 font-serif text-3xl text-[var(--text)]">{failed ? 'Let’s try that again.' : 'You’re nearly there.'}</h1>
        <p role={failed ? 'alert' : 'status'} className="mt-4 text-sm leading-7 text-[var(--muted)]">{message}</p>
        {!failed && !confirmed && (
          <button type="button" onClick={confirmEmail} disabled={busy || !tokenHash} className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628] disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? 'Confirming your email…' : 'Confirm my email'}
          </button>
        )}
        {(failed || confirmed) && <a href="/" className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Back to Glacier</a>}
      </section>
    </main>
  )
}
