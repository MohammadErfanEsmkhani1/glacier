import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useCatalog, type CatalogKind } from '../lib/catalog'
import { useSectionCopy } from '../lib/siteStorage'
import { useFavorites } from '../lib/favorites'

type Filter = 'all' | CatalogKind

export default function CategoryPage() {
  const [kind, setKind] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const titles = useCatalog()
  const copy = useSectionCopy('categories')
  const { userId, favoriteIds, toggleFavorite, error: favoriteError } = useFavorites()
  const filtered = useMemo(() => titles.filter((item) => {
    const term = query.trim().toLowerCase()
    return (kind === 'all' || item.kind === kind) &&
      (!term || (item.title + ' ' + item.genre + ' ' + item.year + ' ' + item.description).toLowerCase().includes(term))
  }), [titles, kind, query])
  const heading = kind === 'all' ? 'Everything' : kind === 'movie' ? 'Movies' : 'Series'

  return (
    <main className="min-h-screen px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Glacier catalogue · made for curious minds</p>
          <h1 className="mt-4 font-serif text-5xl text-[var(--text)] sm:text-6xl">{copy.title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">{copy.description}</p>
        </motion.header>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter catalogue">
            {([['all', 'Everything'], ['movie', 'Movies'], ['series', 'Series']] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)} className={kind === value ? 'recommendation-filter is-active' : 'recommendation-filter'}>{label}</button>
            ))}
          </div>
          <label className="flex w-full items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:max-w-[320px]">
            <span aria-hidden="true" className="text-lg text-[var(--accent)]">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, genres or years" aria-label="Search the catalogue" className="glacier-focus w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]" />
            {query && <button type="button" onClick={() => setQuery('')} className="text-xs text-[var(--muted)] hover:text-[var(--text)]">Clear</button>}
          </label>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[var(--text)]">{heading}</h2>
          <span className="text-xs text-[var(--muted)]">{filtered.length} {filtered.length === 1 ? 'title' : 'titles'}</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {filtered.map((item, index) => (
            <motion.article key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(index * 0.035, 0.28) }} className="group min-w-0">
              {item.poster_url ? <img src={item.poster_url} alt={'Poster for ' + item.title} className="aspect-[2/3] w-full rounded-xl border border-[var(--line)] object-cover shadow-lg transition duration-300 group-hover:-translate-y-1" loading="lazy" /> : <div className={'catalogue-artwork home-artwork artwork-' + (index % 4)}><span className="rounded-full border border-white/25 bg-black/20 px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-white">{item.kind}</span></div>}
              <h3 className="mt-3 font-serif text-xl leading-tight text-[var(--text)]">{item.title}</h3>
              <p className="mt-1 text-[10px] text-[var(--muted)]">{item.year} · {item.genre}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">{item.description}</p>
              {userId ? (
                <button type="button" aria-pressed={favoriteIds.includes(item.id)} onClick={() => void toggleFavorite(item.id)} className="mt-3 rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">
                  {favoriteIds.includes(item.id) ? '♥ Saved' : '♡ Add to favorites'}
                </button>
              ) : (
                <a href="/register" className="mt-3 inline-flex rounded-full border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]">Sign in to save</a>
              )}
            </motion.article>
          ))}
        </div>
        {favoriteError && <p role="status" className="mt-5 text-xs text-[var(--muted)]">Favorites could not be updated. Please try again.</p>}
        {filtered.length === 0 && <p className="mt-12 rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">No titles found. Try another search or choose a different category.</p>}
      </div>
    </main>
  )
}
