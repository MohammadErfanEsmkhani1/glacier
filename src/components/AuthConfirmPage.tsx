import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthConfirmPage() {
  const [handoffId, setHandoffId] = useState('')
  const [handoffSecret, setHandoffSecret] = useState('')
  const [message, setMessage] = useState('Checking your confirmation…')
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('handoff_id') ?? ''
    const secret = params.get('handoff_secret') ?? ''
    if (!id || !secret) {
      setFailed(true)
      setMessage('This confirmation link is incomplete. Return to Glacier and request a fresh link.')
      return
    }
    setHandoffId(id)
    setHandoffSecret(secret)

    let active = true
    const checkSession = async () => {
      if (!supabase) {
        setFailed(true)
        setMessage('Glacier authentication is not configured. Please return to Glacier.')
        return
      }
      const { data, error } = await supabase.auth.getSession()
      if (!active) return
      if (error || !data.session) {
        setFailed(true)
        setMessage('Your email link could not be verified. It may have expired; return to Glacier and request a fresh one.')
        return
      }
      setMessage('Your email is confirmed. Complete the sign-in handoff to the browser where you created your account.')
    }
    void checkSession()
    return () => { active = false }
  }, [])

  const completeHandoff = async () => {
    if (!supabase || !handoffId || !handoffSecret || busy || confirmed) return
    setBusy(true)
    setFailed(false)
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!data.session?.access_token || !data.session.refresh_token) {
        throw new Error('The confirmation session is missing. Please open the confirmation email again.')
      }
      const localId = localStorage.getItem('glacier-auth-handoff-id')
      const localSecret = localStorage.getItem('glacier-auth-handoff-secret')
      if (localId === handoffId && localSecret === handoffSecret) {
        const { error: ackError } = await supabase.functions.invoke('email-verification-handoff', {
          body: { action: 'ack', handoff_id: handoffId, secret: handoffSecret },
        })
        if (ackError) throw ackError
        localStorage.removeItem('glacier-auth-handoff-id')
        localStorage.removeItem('glacier-auth-handoff-secret')
        localStorage.removeItem('glacier-auth-pending-email')
        setConfirmed(true)
        setMessage('Your email is confirmed. You’re signed in to Glacier.')
        window.setTimeout(() => window.location.replace('/'), 700)
      } else {
        const { error: publishError } = await supabase.functions.invoke('email-verification-handoff', {
          body: {
            action: 'publish',
            handoff_id: handoffId,
            secret: handoffSecret,
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          },
        })
        if (publishError) throw publishError
        await supabase.auth.signOut({ scope: 'local' })
        setConfirmed(true)
        setMessage('Email confirmed. Return to the original Glacier browser — it will finish signing you in automatically.')
        window.history.replaceState({}, document.title, '/auth/confirm')
      }
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'We could not complete sign-in. Please try again.')
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
        <h1 className="mt-3 font-serif text-3xl text-[var(--text)]">{failed ? 'Let’s try that again.' : confirmed ? 'You’re all set.' : 'You’re nearly there.'}</h1>
        <p role={failed ? 'alert' : 'status'} className="mt-4 text-sm leading-7 text-[var(--muted)]">{message}</p>
        {!failed && !confirmed && (
          <button type="button" onClick={completeHandoff} disabled={busy || !handoffId || !handoffSecret} className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628] disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? 'Finishing…' : 'Continue to Glacier'}
          </button>
        )}
        {(failed || confirmed) && <a href="/" className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Back to Glacier</a>}
      </section>
    </main>
  )
}
