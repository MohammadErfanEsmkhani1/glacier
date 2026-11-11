import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { useSectionCopy } from '../lib/siteStorage'
import { supabase } from '../lib/supabase'

export default function Visit() {
  const copy = useSectionCopy('account')
  const [signedIn, setSignedIn] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!supabase) return
    let active = true
    const updateSession = (session: { user: { email?: string } } | null) => {
      if (!active) return
      setSignedIn(Boolean(session))
      setEmail(session?.user.email ?? '')
    }

    void supabase.auth.getSession().then(({ data }) => updateSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Update local UI state only inside the auth callback.
      updateSession(session)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <section id="visit" className="relative scroll-mt-0 overflow-hidden border-t border-[var(--line)] px-6 py-24 md:px-10 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-[#78d8ce]/[0.08] blur-[110px]" />
      <div className="relative mx-auto max-w-6xl">
        {signedIn ? (
          <>
            <SectionHeading eyebrow="Your Glacier collection" title="Your favorites" intro="The stories you choose to keep close will live here." />
            <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }} className="mx-auto mt-14 flex max-w-4xl flex-col items-start gap-5 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 md:p-12">
              <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--page)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Signed in{email ? ' · ' + email : ''}</span>
              <h3 className="font-serif text-3xl leading-tight text-[var(--text)] md:text-4xl">Your personal shelf is ready.</h3>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">Your favorite movies and series will appear here. You can keep exploring the admin-curated recommendations above while we build the save-to-favorites experience.</p>
              <a href="#exhibit" className="glacier-focus inline-flex justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[#101628] transition hover:-translate-y-0.5 hover:brightness-110">Explore recommendations</a>
            </motion.div>
          </>
        ) : (
          <>
            <SectionHeading eyebrow="Your Glacier account" title={copy.title} intro={copy.description} />
            <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }} className="mx-auto mt-14 flex max-w-4xl flex-col items-start justify-between gap-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 md:flex-row md:items-center md:p-12">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--page)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Glacier account</span>
                <h3 className="mt-6 font-serif text-3xl leading-tight text-[var(--text)] md:text-4xl">Your next favourite story starts here.</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Sign up with your email and password. New accounts will confirm their email address before signing in.</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3">
                <a href="/register" className="glacier-focus inline-flex justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[#101628] transition hover:-translate-y-0.5 hover:brightness-110">Create account</a>
                <a href="/login" className="glacier-focus inline-flex justify-center rounded-full border border-[var(--line)] px-6 py-3.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]">Sign in</a>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
