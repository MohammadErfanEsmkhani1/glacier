import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { useSectionCopy } from '../lib/siteStorage'
import { supabase } from '../lib/supabase'
import { useCatalog } from '../lib/catalog'
import { useFavorites } from '../lib/favorites'

export default function Visit() {
  const copy = useSectionCopy('account')
  const catalog = useCatalog()
  const { favoriteIds, loading: favoritesLoading, error: favoritesError, toggleFavorite } = useFavorites()
  const favoriteTitles = catalog.filter((item) => favoriteIds.includes(item.id))
  const [signedIn, setSignedIn] = useState(false)
  const [emailName, setEmailName] = useState('')

  useEffect(() => {
    if (!supabase) return
    let active = true
    const updateSession = (session: { user: { email?: string } } | null) => {
      if (!active) return
      setSignedIn(Boolean(session))
      setEmailName(session?.user.email?.split('@')[0] ?? '')
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
              <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--page)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Signed in{emailName ? ' · ' + emailName : ''}</span>
              <h3 className="font-serif text-3xl leading-tight text-[var(--text)] md:text-4xl">Your personal shelf is ready.</h3>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">Your personal collection of movies and series, saved from Explore.</p>
              {favoritesLoading ? <p className="text-sm text-[var(--muted)]">Loading your favorites…</p> : favoriteTitles.length > 0 ? (
                <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {favoriteTitles.map((item, index) => <article key={item.id} className="min-w-0">
                    {item.poster_url ? <img src={item.poster_url} alt={'Poster for ' + item.title} className="aspect-[2/3] w-full rounded-xl border border-[var(--line)] object-cover" loading="lazy" /> : <div className={'catalogue-artwork artwork-' + (index % 4)}><span className="rounded-full border border-white/25 bg-black/20 px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-white">{item.kind}</span></div>}
                    <h4 className="mt-3 font-serif text-lg text-[var(--text)]">{item.title}</h4>
                    <p className="mt-1 text-[10px] text-[var(--muted)]">{item.year} · {item.genre}</p>
                    <button type="button" aria-pressed="true" onClick={() => void toggleFavorite(item.id)} className="mt-3 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">Remove from favorites</button>
                  </article>)}
                </div>
              ) : <div className="rounded-2xl border border-dashed border-[var(--line)] p-7">
                <p className="text-sm text-[var(--muted)]">Your favorites shelf is empty for now. Find a title you like in Explore and add it here.</p>
              </div>}
              {favoritesError && <p role="status" className="text-xs text-[var(--muted)]">Your favorites could not be loaded or updated. Please try again.</p>}
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
                <a href="/register" className="glacier-focus inline-flex justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[#101628] transition hover:-translate-y-0.5 hover:brightness-110">Sign in / Create account ↗</a>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
