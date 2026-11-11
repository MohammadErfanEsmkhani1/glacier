import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useCatalog } from '../lib/catalog'
import { useFavorites } from '../lib/favorites'
import { supabase } from '../lib/supabase'

export default function AccountPage() {
  const catalog = useCatalog()
  const { favoriteIds, loading: favoritesLoading, error: favoritesError, toggleFavorite } = useFavorites()
  const [checkingSession, setCheckingSession] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [emailName, setEmailName] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false)
      return
    }
    let active = true
    const syncSession = (session: { user: { email?: string } } | null) => {
      if (!active) return
      setSignedIn(Boolean(session))
      setEmailName(session?.user.email?.split('@')[0] ?? '')
      setCheckingSession(false)
    }
    void supabase.auth.getSession().then(({ data }) => syncSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => syncSession(session))
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const favoriteTitles = catalog.filter((item) => favoriteIds.includes(item.id))

  const logOut = async () => {
    if (!supabase || signingOut) return
    setSigningOut(true)
    setSignOutError('')
    const { error } = await supabase.auth.signOut()
    if (error) {
      setSignOutError('We could not sign you out just now. Please try again.')
      setSigningOut(false)
      return
    }
    window.location.assign('/')
  }

  if (checkingSession) {
    return <main className="account-page flex min-h-screen items-center justify-center px-6 pt-32"><p className="text-sm text-[var(--muted)]">Opening your Glacier account…</p></main>
  }

  if (!signedIn) {
    return (
      <main className="account-page flex min-h-screen items-center justify-center px-5 pb-16 pt-36">
        <section className="account-welcome-card w-full max-w-xl rounded-3xl border border-[var(--line)] p-8 text-center shadow-xl sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">A little place for your favourites</p>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-[var(--text)] sm:text-5xl">Your Glacier account.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">Sign in to keep your favourite movies and series together, all in one cosy corner.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/login" className="glacier-focus rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Sign in</a>
            <a href="/register" className="glacier-focus rounded-full border border-[var(--line)] px-6 py-3 text-sm font-medium text-[var(--text)]">Create account</a>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="account-page min-h-screen px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Your own little corner of Glacier</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-[var(--text)] sm:text-6xl">{'Welcome back' + (emailName ? ', ' + emailName : '') + '.'}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">A good story is even better when you can find it again. Here are the movies and series you have kept close.</p>
        </motion.header>

        <section aria-labelledby="account-favorites-heading" className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Collected by you</p>
              <h2 id="account-favorites-heading" className="mt-2 font-serif text-3xl text-[var(--text)] sm:text-4xl">Your favorites</h2>
            </div>
            <a href="/categories" className="glacier-focus inline-flex w-fit items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">Explore recommendations <span aria-hidden="true" className="ml-2">↗</span></a>
          </div>

          <div className="account-welcome-card mt-7 rounded-3xl border border-[var(--line)] p-5 sm:p-8">
            {favoritesLoading ? (
              <p className="py-10 text-center text-sm text-[var(--muted)]">Gathering your favorites…</p>
            ) : favoriteTitles.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {favoriteTitles.map((item, index) => (
                  <motion.article key={item.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }} className="group min-w-0">
                    {item.poster_url
                      ? <img src={item.poster_url} alt={'Poster for ' + item.title} className="aspect-[2/3] w-full rounded-xl border border-[var(--line)] object-cover shadow-lg transition duration-300 group-hover:-translate-y-1" loading="lazy" />
                      : <div className={'catalogue-artwork home-artwork artwork-' + (index % 4)}><span className="rounded-full border border-white/25 bg-black/20 px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-white">{item.kind}</span></div>}
                    <h3 className="mt-3 font-serif text-lg leading-tight text-[var(--text)]">{item.title}</h3>
                    <p className="mt-1 text-[10px] text-[var(--muted)]">{item.year} · {item.genre}</p>
                    <button type="button" aria-pressed="true" onClick={() => void toggleFavorite(item.id)} className="mt-3 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">Remove from favorites</button>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] bg-[var(--page)] text-[var(--accent)]" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4.8A1.8 1.8 0 017.8 3h8.4A1.8 1.8 0 0118 4.8V21l-6-3.8L6 21V4.8Z" /></svg>
                </span>
                <h3 className="mt-5 font-serif text-2xl text-[var(--text)]">Your shelf is waiting for its first story.</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">When a movie or series catches your eye, save it from Explore and it will be waiting here for you.</p>
                <a href="/categories" className="mt-6 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628] transition hover:-translate-y-0.5 hover:brightness-110">Find something to love</a>
              </div>
            )}
            {favoritesError && <p role="status" className="mt-5 text-center text-xs text-[var(--muted)]">Your favorites could not be updated. Please try again.</p>}
          </div>
        </section>

        <section aria-labelledby="account-signout-heading" className="mt-12">
          <div className="flex flex-col gap-5 rounded-3xl border border-[var(--line)] bg-[var(--surface)]/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Whenever you're ready</p>
              <h2 id="account-signout-heading" className="mt-2 font-serif text-2xl text-[var(--text)]">Until next time.</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">You can sign out safely. Your saved favorites will be here when you return.</p>
            </div>
            <button type="button" onClick={() => void logOut()} disabled={signingOut} className="glacier-focus inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--page)] disabled:cursor-not-allowed disabled:opacity-60">{signingOut ? 'Signing out…' : 'Log out'}</button>
          </div>
          {signOutError && <p role="alert" className="mt-3 text-right text-xs text-[var(--muted)]">{signOutError}</p>}
        </section>
      </div>
    </main>
  )
}
