import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { useSectionCopy } from '../lib/siteStorage'
import { supabase } from '../lib/supabase'

export default function Visit() {
  const copy = useSectionCopy('account')
  const [signedIn, setSignedIn] = useState(false)
  const [emailName, setEmailName] = useState('')

  useEffect(() => {
    if (!supabase) return
    let active = true
    const updateSession = (session: { user: { email?: string | null } } | null) => {
      if (!active) return
      setSignedIn(Boolean(session))
      setEmailName(session?.user.email?.split('@')[0] ?? '')
    }

    void supabase.auth.getSession().then(({ data }) => updateSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => updateSession(session))
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const scrollToRecommendations = () => {
    const section = document.getElementById('exhibit')
    if (!section) return
    const targetTop = section.getBoundingClientRect().top + window.scrollY
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <section id="visit" className="relative scroll-mt-0 overflow-hidden border-t border-[var(--line)] px-6 py-24 md:px-10 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-[#78d8ce]/[0.08] blur-[110px]" />
      <div className="relative mx-auto max-w-6xl">
        {signedIn ? (
          <>
            <SectionHeading eyebrow="Your Glacier account" title="A home for your favourites." intro="Keep the stories you love together, ready whenever you feel like revisiting them." />
            <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }} className="favorites-feature-card mx-auto mt-14 flex max-w-4xl flex-col items-start gap-5 rounded-3xl border border-[var(--line)] p-8 md:p-12">
              <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--page)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Signed in{emailName ? ' · ' + emailName : ''}</span>
              <h3 className="font-serif text-3xl leading-tight text-[var(--text)] md:text-4xl">Your personal shelf is waiting.</h3>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">Your saved movies and series now have their own little home. Visit your account to see your collection and manage it whenever you like.</p>
              <div className="flex flex-wrap gap-3">
                <a href="/account" className="glacier-focus inline-flex justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[#101628] transition hover:-translate-y-0.5 hover:brightness-110">Open your account</a>
                <button type="button" onClick={scrollToRecommendations} className="glacier-focus inline-flex justify-center rounded-full border border-[var(--line)] px-6 py-3.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">Explore recommendations</button>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <SectionHeading eyebrow="Your Glacier account" title={copy.title} intro={copy.description} />
            <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }} className="mx-auto mt-14 flex max-w-4xl flex-col items-start justify-between gap-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 md:flex-row md:items-center md:p-12">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--page)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Glacier account</span>
                <h3 className="mt-6 font-serif text-3xl leading-tight text-[var(--text)] md:text-4xl">Your next favourite story starts here.</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Sign in or create a free account to save the movies and series you want to remember.</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3">
                <a href="/register" className="glacier-focus inline-flex justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[#101628] transition hover:-translate-y-0.5 hover:brightness-110">Sign in / Create account ↗</a>
                <button type="button" onClick={scrollToRecommendations} className="glacier-focus inline-flex justify-center rounded-full border border-[var(--line)] px-6 py-3.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">Explore recommendations</button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
