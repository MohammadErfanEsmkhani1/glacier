import { useMemo, useState } from 'react'
import { useCatalog, type CatalogKind } from '../lib/catalog'
import { useSectionCopy } from '../lib/siteStorage'

export default function CategoryPage() {
  const [kind, setKind] = useState<CatalogKind>('movie')
  const [query, setQuery] = useState('')
  const titles = useCatalog()
  const copy = useSectionCopy('categories')
  const heading = kind === 'movie' ? 'Movies' : 'Series'
  const filtered = useMemo(() => titles.filter((item) => {
    const term = query.trim().toLowerCase()
    return item.kind === kind && (!term || (item.title + ' ' + item.genre + ' ' + item.year).toLowerCase().includes(term))
  }), [titles, kind, query])

  return (
    <main className="min-h-screen px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Glacier catalogue</p>
        <h1 className="mt-4 font-serif text-5xl text-[var(--text)] sm:text-6xl">{copy.title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">{copy.description}</p>
        <div className="mt-9 flex flex-wrap items-center gap-2" role="tablist" aria-label="Catalogue categories">
          <button type="button" role="tab" aria-selected={kind === 'movie'} onClick={() => setKind('movie')} className={kind === 'movie' ? 'category-tab is-active' : 'category-tab'}>Movies</button>
          <button type="button" role="tab" aria-selected={kind === 'series'} onClick={() => setKind('series')} className={kind === 'series' ? 'category-tab is-active' : 'category-tab'}>Series</button>
        </div>
        <label className="mt-6 flex max-w-lg items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5">
          <span aria-hidden="true" className="text-lg text-[var(--accent)]">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={'Search ' + heading.toLowerCase() + ' by title or genre...'} aria-label={'Search ' + heading.toLowerCase()} className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]" />
          {query && <button type="button" onClick={() => setQuery('')} className="text-xs text-[var(--muted)] hover:text-[var(--text)]">Clear</button>}
        </label>
        <div className="mt-10 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[var(--text)]">{heading}</h2>
          <span className="text-xs text-[var(--muted)]">{filtered.length} {filtered.length === 1 ? 'title' : 'titles'}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, index) => <article key={item.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            {item.poster_url ? <img src={item.poster_url} alt={'Poster for ' + item.title} className="aspect-[4/5] w-full object-cover" loading="lazy" /> :
              <div className={'catalogue-artwork artwork-' + (index % 4)}><span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-wider text-white">{item.kind}</span></div>}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2"><h3 className="font-serif text-xl text-[var(--text)]">{item.title}</h3><span className="shrink-0 text-xs text-[var(--muted)]">{item.year}</span></div>
              <p className="mt-2 text-xs text-[var(--accent)]">{item.genre}</p>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{item.description}</p>
            </div>
          </article>)}
        </div>
        {filtered.length === 0 && <p className="mt-12 rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">No titles found. Try another search or choose the other category.</p>}
      </div>
    </main>
  )
}
