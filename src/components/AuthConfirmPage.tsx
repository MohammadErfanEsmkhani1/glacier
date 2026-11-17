import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthConfirmPage() {
  const [message, setMessage] = useState('We’re passing your confirmation safely back to the browser where you started.')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    const publish = async () => {
      const params = new URLSearchParams(window.location.search)
      const handoffId = params.get('handoff_id') ?? ''
      const tokenHash = params.get('token_hash') ?? ''
      const type = params.get('type') ?? ''

      // Remove one-time credentials from the visible URL and browser history immediately.
      window.history.replaceState({}, document.title, '/auth/confirm')

      if (!supabase || type !== 'email' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(handoffId) || !tokenHash) {
        if (active) {
          setFailed(true)
          setMessage('This confirmation link is incomplete or has expired. Return to Glacier and request a fresh email.')
        }
        return
      }

      try {
        const { error } = await supabase.functions.invoke('email-verification-handoff', {
          body: { action: 'publish', handoff_id: handoffId, token_hash: tokenHash },
        })
        if (error) throw error
        if (active) setMessage('Your email link has been received. Head back to the Glacier tab where you created your account — it will finish signing you in there.')
      } catch {
        if (active) {
          setFailed(true)
          setMessage('We couldn’t complete the handoff just yet. Please return to the original Glacier tab and try opening the email link again.')
        }
      }
    }
    void publish()
    return () => { active = false }
  }, [])

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
        <h1 className="mt-3 font-serif text-3xl text-[var(--text)]">{failed ? 'Let’s try that again.' : 'Your email is on its way back.'}</h1>
        <p role={failed ? 'alert' : 'status'} className="mt-4 text-sm leading-7 text-[var(--muted)]">{message}</p>
        <a href="/" className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Back to Glacier</a>
      </section>
    </main>
  )
}
