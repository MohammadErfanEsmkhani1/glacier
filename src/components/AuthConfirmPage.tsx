import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthConfirmPage() {
  const [message, setMessage] = useState('We’re checking your confirmation link.')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    let timer: number | undefined
    let busy = false

    const finishOnThisBrowser = async (handoffId: string, secret: string) => {
      if (!supabase || busy) return
      busy = true
      try {
        const { data, error } = await supabase.functions.invoke('email-verification-handoff', {
          body: { action: 'poll', handoff_id: handoffId, secret },
        })
        if (error) throw error
        if (!data?.token_hash) {
          busy = false
          return
        }
        const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: 'email',
        })
        if (verifyError) throw verifyError
        if (!verified.session) throw new Error('Your email was confirmed, but we could not start your Glacier session.')
        await supabase.functions.invoke('email-verification-handoff', {
          body: { action: 'ack', handoff_id: handoffId, secret },
        })
        localStorage.removeItem('glacier-auth-handoff-id')
        localStorage.removeItem('glacier-auth-handoff-secret')
        localStorage.removeItem('glacier-auth-pending-email')
        if (active) window.location.replace('/')
      } catch (error) {
        busy = false
        if (active && error instanceof Error) {
          setFailed(true)
          setMessage(error.message)
        }
      }
    }

    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const handoffId = params.get('handoff_id') ?? ''
      const tokenHash = params.get('token_hash') ?? ''
      const type = params.get('type') ?? ''
      window.history.replaceState({}, document.title, '/auth/confirm')

      if (!supabase || type !== 'email' || !handoffId || !tokenHash) {
        setFailed(true)
        setMessage('This confirmation link is incomplete or expired. Return to the Glacier tab where you started and request a fresh link.')
        return
      }
      try {
        const { error } = await supabase.functions.invoke('email-verification-handoff', {
          body: { action: 'publish', handoff_id: handoffId, token_hash: tokenHash },
        })
        if (error) throw error

        const localId = localStorage.getItem('glacier-auth-handoff-id')
        const localSecret = localStorage.getItem('glacier-auth-handoff-secret')
        if (localId === handoffId && localSecret) {
          setMessage('Lovely — your email is confirmed. We’re signing you into Glacier now.')
          await finishOnThisBrowser(handoffId, localSecret)
        } else {
          setMessage('Your email is confirmed. Head back to the Glacier tab where you created your account — it will sign you in automatically.')
        }
        if (localId === handoffId && localSecret) return
        if (active) setFailed(false)
      } catch (error) {
        if (active) {
          setFailed(true)
          setMessage(error instanceof Error ? error.message : 'We could not complete this confirmation. Please request a fresh link from Glacier.')
        }
      }
    }

    void run()
    return () => {
      active = false
      if (timer !== undefined) window.clearInterval(timer)
    }
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
        <h1 className="mt-3 font-serif text-3xl text-[var(--text)]">{failed ? 'Let’s try that again.' : 'You’re nearly there.'}</h1>
        <p role={failed ? 'alert' : 'status'} className="mt-4 text-sm leading-7 text-[var(--muted)]">{message}</p>
        <a href="/" className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Back to Glacier</a>
      </section>
    </main>
  )
}
