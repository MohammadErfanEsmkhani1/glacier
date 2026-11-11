import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'

type TitleKind = 'movie' | 'series'
type FilterKind = 'all' | TitleKind

const titles: {
  id: number
  name: string
  kind: TitleKind
  year: string
  genre: string
  rating: string
  description: string
  href: string
  artwork: string
  accent: string
}[] = [
  {
    id: 1,
    name: 'Dune: Part Two',
    kind: 'movie',
    year: '2024',
    genre: 'Sci-fi · Adventure',
    rating: '8.5',
    description: 'A sweeping journey across a distant desert world.',
    href: 'https://www.themoviedb.org/movie/693134',
    artwork: 'radial-gradient(ellipse at 65% 24%, rgba(245,190,118,.72), transparent 28%), linear-gradient(155deg, #8c604b 0%, #34364f 48%, #10182a 100%)',
    accent: '#f1bf79',
  },
  {
    id: 2,
    name: 'Interstellar',
    kind: 'movie',
    year: '2014',
    genre: 'Sci-fi · Drama',
    rating: '8.7',
    description: 'An emotional voyage through space and time.',
    href: 'https://www.themoviedb.org/movie/157336',
    artwork: 'radial-gradient(ellipse at 48% 25%, rgba(130,205,222,.68), transparent 26%), linear-gradient(155deg, #314d66 0%, #26304b 50%, #101626 100%)',
    accent: '#78d8ce',
  },
  {
    id: 3,
    name: 'The Batman',
    kind: 'movie',
    year: '2022',
    genre: 'Crime · Thriller',
    rating: '7.8',
    description: 'A dark mystery unfolds in a rain-soaked city.',
    href: 'https://www.themoviedb.org/movie/414906',
    artwork: 'radial-gradient(ellipse at 52% 22%, rgba(206,89,73,.55), transparent 30%), linear-gradient(155deg, #543b49 0%, #24263b 52%, #0d1322 100%)',
    accent: '#f18f80',
  },
  {
    id: 4,
    name: 'Arcane',
    kind: 'series',
    year: '2021',
    genre: 'Animation · Fantasy',
    rating: '9.0',
    description: 'Two sisters find themselves on opposite sides of a city.',
    href: 'https://www.themoviedb.org/tv/94605',
    artwork: 'radial-gradient(ellipse at 48% 28%, rgba(158,116,255,.72), transparent 28%), linear-gradient(155deg, #544d83 0%, #292b50 52%, #101629 100%)',
    accent: '#a28dff',
  },
  {
    id: 5,
    name: 'Severance',
    kind: 'series',
    year: '2022',
    genre: 'Mystery · Sci-fi',
    rating: '8.7',
    description: 'A strange workplace raises even stranger questions.',
    href: 'https://www.themoviedb.org/tv/95396',
    artwork: 'radial-gradient(ellipse at 50% 24%, rgba(105,211,202,.62), transparent 28%), linear-gradient(155deg, #315c64 0%, #26374b 52%, #101626 100%)',
    accent: '#78d8ce',
  },
  {
    id: 6,
    name: 'The Bear',
    kind: 'series',
    year: '2022',
    genre: 'Drama · Comedy',
    rating: '8.5',
    description: 'A young chef returns home to transform a family restaurant.',
    href: 'https://www.themoviedb.org/tv/136315',
    artwork: 'radial-gradient(ellipse at 58% 24%, rgba(242,189,114,.66), transparent 28%), linear-gradient(155deg, #79533c 0%, #393347 52%, #111625 100%)',
    accent: '#f1bf79',
  },
]

export default function Exhibit() {
  const [filter, setFilter] = useState<FilterKind>('all')
  const [query, setQuery] = useState('')

  const visibleTitles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return titles.filter((item) => {
      const matchesType = filter === 'all' || item.kind === filter
      const matchesQuery = !normalizedQuery || `${item.name} ${item.genre} ${item.year}`.toLowerCase().includes(normalizedQuery)
      return matchesType && matchesQuery
    })
  }, [filter, query])

  return (
    <section id="exhibit" className="scroll-mt-0 bg-[#122b39] px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Handpicked for your next night in"
          title="Recommended movies & series"
          intro="A starting collection of memorable stories. Explore by format or search for a title or genre."
        />

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter recommendations">
            {([
              ['all', 'Everything'],
              ['movie', 'Movies'],
              ['series', 'Series'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`glacier-focus rounded-full px-4 py-2 text-xs font-semibold transition ${filter === value ? 'bg-[#a28dff] text-[#101628] shadow-[0_6px_24px_rgba(162,141,255,.2)]' : 'border border-[#78d8ce]/20 bg-[#0b1626]/35 text-slate-200 hover:border-[#78d8ce]/55 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex w-full items-center gap-3 rounded-full border border-[#78d8ce]/20 bg-[#173647] px-4 py-3 sm:max-w-[290px]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#78d8ce]" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles or genres"
              className="glacier-focus w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {visibleTitles.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: index * 0.045 }}
              className="group min-w-0"
            >
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Explore ${item.name} on The Movie Database`}
                className="glacier-focus relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/10 shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-white/25 group-hover:shadow-[0_18px_42px_rgba(0,0,0,.32)]"
                style={{ background: item.artwork }}
              >
                <div className="absolute inset-0 opacity-70 transition duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(160deg, transparent 20%, rgba(5,10,22,.18) 52%, rgba(5,10,22,.94) 100%)' }} />
                <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/20 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                  {item.kind}
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/35 px-2 py-1 text-[10px] font-semibold text-[#f1bf79] backdrop-blur-sm">
                  ★ {item.rating}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <div className="mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: item.accent }} />
                  <p className="font-serif text-xl leading-tight text-white sm:text-2xl">{item.name}</p>
                  <p className="mt-2 text-[10px] leading-relaxed text-white/65">{item.year} · {item.genre}</p>
                </div>
              </a>
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-300/75">{item.description}</p>
            </motion.article>
          ))}
        </div>

        {visibleTitles.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#78d8ce]/25 px-6 py-12 text-center">
            <p className="text-sm font-medium text-white">No titles found</p>
            <p className="mt-2 text-sm text-slate-300/70">Try another title or switch the category filter.</p>
            <button type="button" onClick={() => { setQuery(''); setFilter('all') }} className="glacier-focus mt-5 text-sm font-semibold text-[#78d8ce] hover:text-white">
              Clear filters
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] leading-6 text-slate-300/60">
          Select a title to view its information on The Movie Database. Recommendations are a starter collection and can be connected to a live catalogue later.
        </p>
      </div>
    </section>
  )
}
