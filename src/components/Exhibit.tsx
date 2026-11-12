import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { useCatalog } from '../lib/catalog'
import { useSectionCopy } from '../lib/siteStorage'
import { useFavorites } from '../lib/favorites'

export default function Exhibit() {
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all')
  const titles = useCatalog().filter((item) => item.featured)
  const copy = useSectionCopy('recommendations')
  const { userId, favoriteIds, toggleFavorite, error: favoriteError } = useFavorites()
  const visible = useMemo(() => titles.filter((item) => filter === 'all' || item.kind === filter), [titles, filter])

  return (
    <section id="exhibit" className="recommendations-atmosphere scroll-mt-0 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Explore · selected by Glacier" title={copy.title} intro={copy.description} />
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter recommendations">
            {([['all', 'Everything'], ['movie', 'Movies'], ['series', 'Series']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={filter === value ? 'recommendation-filter is-active' : 'recommendation-filter'}>{label}</button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {visible.map((item, index) => (
            <motion.article key={item.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay: index * 0.045 }} className="group min-w-0">
              {item.poster_url ? <img src={item.poster_url} alt={'Poster for ' + item.title} className="aspect-[2/3] w-full rounded-xl border border-[var(--line)] object-cover shadow-lg" loading="lazy" /> : <div className={'catalogue-artwork home-artwork artwork-' + (index % 4)}><span className="rounded-full border border-white/25 bg-black/20 px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-white">{item.kind}</span></div>}
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
        {favoriteError && <p role="status" className="mt-4 text-xs text-[var(--muted)]">Favorites could not be updated. Please try again.</p>}
        {visible.length === 0 && <p className="mt-8 rounded-2xl border border-dashed border-[var(--line)] p-9 text-center text-sm text-[var(--muted)]">No titles in this category yet.</p>}
        <a href="/categories" className="mx-auto mt-10 flex w-fit rounded-full border border-[var(--line)] px-6 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">Browse all categories</a>
      </div>
    </section>
  )
}
