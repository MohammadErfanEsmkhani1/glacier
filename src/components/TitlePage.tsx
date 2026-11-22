import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFavorites } from '../lib/favorites'
import { supabase } from '../lib/supabase'
import { getTitleUrl, type CatalogKind, type CatalogTitle } from '../lib/catalog'
import { getPosterImageSrcSet, getPosterImageUrl } from '../lib/imagekit'
import { readPersonalIds, writePersonalIds } from '../lib/personalCache'

type TitlePageProps = { titleId?: string; titleSlug?: string }
type DownloadQuality = '360p' | '480p' | '720p' | '1080p'

const downloadQualities: {
  value: DownloadQuality
  name: string
  description: string
  level: number
  recommended?: boolean
}[] = [
  { value: '360p', name: 'Low', description: 'Lighter on data', level: 1 },
  { value: '480p', name: 'SD', description: 'Everyday viewing', level: 2 },
  { value: '720p', name: 'HD', description: 'Sharp HD picture', level: 3, recommended: true },
  { value: '1080p', name: 'Full HD', description: 'Extra crisp detail', level: 4 },
]

function getSafeReturnPath() {
  const fallback = '/categories'
  try {
    if (!document.referrer) return fallback
    const previousPage = new URL(document.referrer)
    if (previousPage.origin !== window.location.origin || previousPage.pathname.startsWith('/title/')) return fallback
    return previousPage.pathname + previousPage.search + previousPage.hash
  } catch {
    return fallback
  }
}

export default function TitlePage({ titleId, titleSlug }: TitlePageProps) {
  const { userId, favoriteIds, toggleFavorite, loading: favoritesLoading } = useFavorites()
  const [title, setTitle] = useState<CatalogTitle | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedQuality, setSelectedQuality] = useState<DownloadQuality>('720p')
  const [downloadNotice, setDownloadNotice] = useState(false)

  useEffect(() => {
    let active = true
    const loadTitle = async () => {
      if (!supabase) {
        if (active) { setLoadError('The Glacier catalogue is not connected.'); setLoading(false) }
        return
      }
      const titleQuery = supabase.from('titles')
        .select('id,slug,title,kind,release_year,genre,description,poster_url,featured')
      const { data, error } = titleId
        ? await titleQuery.eq('id', titleId).maybeSingle()
        : await titleQuery.eq('slug', titleSlug ?? '').maybeSingle()

      if (!active) return
      if (error || !data) {
        setLoadError(error ? 'We could not load this title. Please try again.' : 'This title could not be found.')
        setLoading(false)
        return
      }
      const item: CatalogTitle = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        kind: data.kind as CatalogKind,
        year: data.release_year ?? 0,
        genre: data.genre,
        description: data.description,
        poster_url: data.poster_url,
        featured: data.featured,
      }
      setTitle(item)
      setLoading(false)

      const canonicalUrl = getTitleUrl(item)
      if (window.location.pathname + window.location.search !== canonicalUrl) {
        window.history.replaceState(window.history.state, '', canonicalUrl)
      }
      document.title = item.title + ' — Glacier'
      const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (descriptionMeta) descriptionMeta.content = item.description || 'Discover ' + item.title + ' on Glacier.'

      const { data: authData } = await supabase.auth.getUser()
      const viewerId = authData.user?.id
      if (viewerId) {
        const { error: historyError } = await supabase.from('user_recently_watched').upsert(
          { user_id: viewerId, title_id: item.id, watched_at: new Date().toISOString() },
          { onConflict: 'user_id,title_id' },
        )
        if (historyError) console.error('Could not update recently watched history:', historyError.message)
        else {
          const recentIds = readPersonalIds('recent', viewerId).filter((id) => id !== item.id)
          writePersonalIds('recent', viewerId, [item.id, ...recentIds].slice(0, 50))
          window.dispatchEvent(new Event('glacier:recently-watched-updated'))
        }
      }
    }
    void loadTitle()
    return () => { active = false }
  }, [titleId, titleSlug])

  const isFavorite = Boolean(title && favoriteIds.includes(title.id))
  const returnTo = getSafeReturnPath()

  return (
    <main data-preloader-pending={loading || favoritesLoading ? 'true' : undefined} className="min-h-screen px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <a href={returnTo} className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--text)]">← Back</a>
        {loading ? (
          <div className="py-28 text-center text-sm text-[var(--muted)]">Loading title…</div>
        ) : loadError || !title ? (
          <div className="mx-auto max-w-xl py-24 text-center"><h1 className="font-serif text-4xl text-[var(--text)]">Title unavailable</h1><p className="mt-4 text-sm leading-7 text-[var(--muted)]">{loadError}</p><a href={returnTo} className="mt-7 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#101628]">Go back</a></div>
        ) : (
          <>
            <motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mt-10 grid items-start gap-10 md:grid-cols-[minmax(184px,0.55fr)_1.45fr] md:gap-16">
              <div className="mx-auto w-full max-w-[184px]">
                {title.poster_url ? <img src={getPosterImageUrl(title.poster_url, 360)} srcSet={getPosterImageSrcSet(title.poster_url)} sizes="184px" alt={'Poster for ' + title.title} className="aspect-[2/3] w-full rounded-xl border border-[var(--line)] object-cover shadow-2xl" /> : <div className="catalogue-artwork home-artwork artwork-0 aspect-[2/3] w-full rounded-xl"><span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white">{title.kind}</span></div>}
              </div>
              <div className="flex flex-col justify-center py-1 md:min-h-[276px]">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">{title.kind === 'movie' ? 'Movie' : 'Series'} · Glacier catalogue</p>
                <h1 className="mt-5 font-serif text-4xl leading-tight text-[var(--text)] sm:text-5xl">{title.title}</h1>
                <p className="mt-5 text-sm text-[var(--muted)]">{title.year}{title.genre ? ' · ' + title.genre : ''}</p>
                <div className="mt-8 h-px w-20 bg-[var(--accent)]/60" />
                <h2 className="mt-8 font-serif text-2xl text-[var(--text)]">About this title</h2>
                <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-8 text-[var(--muted)]">{title.description || 'More details about this title will be added soon.'}</p>
                {userId ? (
                  <button type="button" disabled={favoritesLoading} aria-pressed={isFavorite} onClick={() => void toggleFavorite(title.id)} className="mt-9 rounded-full border border-[var(--line)] px-6 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)] disabled:opacity-50">{isFavorite ? '♥ Saved to favorites' : '♡ Add to favorites'}</button>
                ) : (
                  <a href="/register" className="mt-9 inline-flex rounded-full border border-[var(--line)] px-6 py-3 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]">Sign in to save</a>
                )}
              </div>
            </motion.article>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              aria-labelledby="download-heading"
              className="download-panel mt-16"
            >
              <div className="download-panel-glow" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="download-eyebrow">Your viewing experience</p>
                    <h2 id="download-heading" className="mt-3 font-serif text-3xl text-[var(--text)] sm:text-4xl">Download</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">Choose the picture quality that works best for you. You can change your selection at any time.</p>
                  </div>
                  <div className="download-format-chip">
                    <span className="download-format-dot" aria-hidden="true" />
                    <span>VIDEO QUALITY</span>
                    <span className="download-format-divider" />
                    <span>4 OPTIONS</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Choose download quality">
                  {downloadQualities.map((quality) => {
                    const isSelected = selectedQuality === quality.value
                    return (
                      <button
                        key={quality.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => { setSelectedQuality(quality.value); setDownloadNotice(false) }}
                        className={'download-quality-card' + (isSelected ? ' is-selected' : '')}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="download-quality-resolution">{quality.value}</span>
                          {isSelected ? (
                            <span className="download-quality-check" aria-label="Selected">✓</span>
                          ) : (
                            <span className="download-quality-radio" aria-hidden="true" />
                          )}
                        </span>
                        <span className="download-quality-name">{quality.name}</span>
                        <span className="download-quality-description">{quality.description}</span>
                        <span className="download-quality-meter" aria-label={`Quality level ${quality.level} of 4`}>
                          {Array.from({ length: 4 }, (_, index) => (
                            <span key={index} className={index < quality.level ? 'is-filled' : ''} />
                          ))}
                        </span>
                        {quality.recommended && <span className="download-recommended">RECOMMENDED</span>}
                      </button>
                    )
                  })}
                </div>

                <div className="download-action-row">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Selected quality</p>
                    <p className="mt-1 font-serif text-xl text-[var(--text)]">{selectedQuality}</p>
                  </div>
                  <button type="button" className="download-action-button" onClick={() => setDownloadNotice(true)}>
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2.75v9.5m0 0 3.5-3.5M10 12.25l-3.5-3.5M3.25 13.5v2.25c0 .55.45 1 1 1h11.5c.55 0 1-.45 1-1V13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download
                  </button>
                </div>
                {downloadNotice && (
                  <p role="status" className="download-preview-notice">
                    Your {selectedQuality} option is selected. Download links will be connected in the next step.
                  </p>
                )}
                <p className="mt-5 text-xs leading-6 text-[var(--muted)]">Download availability and file links will appear here once the download service is connected.</p>
              </div>
            </motion.section>
          </>
        )}
      </div>
    </main>
  )
}
