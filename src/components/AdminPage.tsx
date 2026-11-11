import { useMemo, useState } from 'react'
import { readCatalog, saveCatalog, type CatalogKind, type CatalogTitle, starterTitles } from '../lib/catalog'
import { applyPalette, defaultCopy, defaultSeo, getPalette, readAllCopy, readAllSeo, saveAllCopy, saveAllSeo, type PageSeo, type Palette, type SiteCopy } from '../lib/siteStorage'

type AdminTab = 'catalogue' | 'content' | 'seo' | 'appearance'
type Draft = Omit<CatalogTitle, 'id'> & { id?: string }
const emptyDraft: Draft = { title: '', kind: 'movie', year: new Date().getFullYear(), genre: '', description: '', poster_url: null, featured: false }
const pageLabels: Record<string, string> = { home: 'Home', categories: 'Categories', login: 'Sign in', register: 'Registration', admin: 'Admin panel' }
const sectionLabels: Record<string, string> = { homeHero: 'Home hero', recommendations: 'Recommended titles', account: 'Account section', about: 'About Glacier', categories: 'Categories page' }

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('catalogue')
  const [titles, setTitles] = useState<CatalogTitle[]>(() => readCatalog())
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copy, setCopy] = useState<Record<string, SiteCopy>>(() => readAllCopy())
  const [seo, setSeo] = useState<Record<string, PageSeo>>(() => readAllSeo())
  const [palette, setPalette] = useState<Palette>(() => getPalette())
  const [notice, setNotice] = useState('')

  const sortedTitles = useMemo(() => [...titles].sort((a, b) => a.title.localeCompare(b.title)), [titles])
  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const saveTitle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const newId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now())
    const nextTitle: CatalogTitle = { ...draft, id: editingId ?? newId }
    const next = editingId ? titles.map((item) => item.id === editingId ? nextTitle : item) : [...titles, nextTitle]
    setTitles(next)
    saveCatalog(next)
    setDraft(emptyDraft)
    setEditingId(null)
    setNotice(editingId ? 'Title updated in this browser.' : 'Title added to this browser catalogue.')
  }

  const editTitle = (item: CatalogTitle) => {
    setEditingId(item.id)
    setDraft({ title: item.title, kind: item.kind, year: item.year, genre: item.genre, description: item.description, poster_url: item.poster_url, featured: item.featured })
    setNotice('')
  }

  const deleteTitle = (id: string) => {
    const next = titles.filter((item) => item.id !== id)
    setTitles(next)
    saveCatalog(next)
    if (editingId === id) { setEditingId(null); setDraft(emptyDraft) }
    setNotice('Title removed from this browser catalogue.')
  }

  const saveCopy = () => { saveAllCopy(copy); setNotice('Section text saved in this browser.') }
  const saveSeo = () => { saveAllSeo(seo); setNotice('SEO settings saved in this browser.') }
  const selectPalette = (value: Palette) => { setPalette(value); applyPalette(value); setNotice('Palette preview updated and saved in this browser.') }

  const tabButton = (key: AdminTab, label: string) => (
    <button type="button" onClick={() => { setTab(key); setNotice('') }} className={tab === key ? 'admin-tab is-active' : 'admin-tab'}>{label}</button>
  )

  return (
    <main className="min-h-screen px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Glacier control room</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-5xl text-[var(--text)]">Admin panel</h1>
            <p className="mt-3 text-sm text-[var(--muted)]">Manage your catalogue and website content.</p>
          </div>
          <span className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-[var(--text)]">Local preview mode</span>
        </div>

        <div className="mt-7 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-5">
          <p className="font-semibold text-[var(--text)]">Supabase is not connected yet</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Every editor below works for preview. Changes are stored only in this browser and are not published to other visitors. Once Supabase is connected, we will secure this panel for your single administrator and save changes to the shared database.</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
          {tabButton('catalogue', 'Catalogue')}
          {tabButton('content', 'Section content')}
          {tabButton('seo', 'Page SEO')}
          {tabButton('appearance', 'Appearance')}
        </div>

        {notice && <p role="status" className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">{notice}</p>}

        {tab === 'catalogue' && (
          <section className="mt-7 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={saveTitle} className="admin-panel space-y-4">
              <div>
                <h2 className="font-serif text-2xl text-[var(--text)]">{editingId ? 'Edit title' : 'Add a title'}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">Add movies and series manually to the catalogue.</p>
              </div>
              <label className="admin-label">Title
                <input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className="admin-field" placeholder="e.g. Arrival" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="admin-label">Category
                  <select value={draft.kind} onChange={(event) => updateDraft('kind', event.target.value as CatalogKind)} className="admin-field"><option value="movie">Movie</option><option value="series">Series</option></select>
                </label>
                <label className="admin-label">Release year
                  <input required type="number" min="1888" max="2200" value={draft.year} onChange={(event) => updateDraft('year', Number(event.target.value))} className="admin-field" />
                </label>
              </div>
              <label className="admin-label">Genre
                <input value={draft.genre} onChange={(event) => updateDraft('genre', event.target.value)} className="admin-field" placeholder="Drama · Sci-fi" />
              </label>
              <label className="admin-label">Poster image URL
                <input type="url" value={draft.poster_url ?? ''} onChange={(event) => updateDraft('poster_url', event.target.value || null)} className="admin-field" placeholder="https://..." />
              </label>
              <label className="admin-label">Description
                <textarea rows={3} value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} className="admin-field" placeholder="A short description" />
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--muted)]"><input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft('featured', event.target.checked)} /> Feature on the home page</label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="admin-primary">{editingId ? 'Save changes' : 'Add to catalogue'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft) }} className="admin-secondary">Cancel</button>}
              </div>
            </form>

            <div className="admin-panel">
              <div className="flex items-end justify-between gap-3">
                <div><h2 className="font-serif text-2xl text-[var(--text)]">Your titles</h2><p className="mt-2 text-sm text-[var(--muted)]">{titles.length} entries</p></div>
                <button type="button" onClick={() => { setTitles(starterTitles); saveCatalog(starterTitles); setNotice('Starter catalogue restored.') }} className="text-xs text-[var(--accent)] hover:underline">Restore samples</button>
              </div>
              <div className="mt-5 space-y-3">
                {sortedTitles.map((item) => (
                  <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><p className="font-medium text-[var(--text)]">{item.title} <span className="ml-2 text-xs text-[var(--muted)]">{item.year}</span></p><p className="mt-1 text-xs text-[var(--muted)]">{item.kind === 'movie' ? 'Movie' : 'Series'} · {item.genre || 'No genre set'}</p></div>
                    <div className="flex shrink-0 gap-2"><button type="button" onClick={() => editTitle(item)} className="admin-secondary">Edit</button><button type="button" onClick={() => deleteTitle(item.id)} className="admin-danger">Delete</button></div>
                  </article>
                ))}
                {titles.length === 0 && <p className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">Your catalogue is empty. Add a title to begin.</p>}
              </div>
            </div>
          </section>
        )}

        {tab === 'content' && (
          <section className="admin-panel mt-7">
            <h2 className="font-serif text-2xl text-[var(--text)]">Edit section titles and descriptions</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">These fields update the matching sections on the homepage and Categories page.</p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {Object.entries(sectionLabels).map(([key, label]) => (
                <div key={key} className="rounded-xl border border-[var(--line)] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">{label}</p>
                  <label className="admin-label">Title
                    <input value={copy[key]?.title ?? defaultCopy[key].title} onChange={(event) => setCopy((current) => ({ ...current, [key]: { ...(current[key] ?? defaultCopy[key]), title: event.target.value } }))} className="admin-field" />
                  </label>
                  <label className="admin-label mt-3">Description
                    <textarea rows={3} value={copy[key]?.description ?? defaultCopy[key].description} onChange={(event) => setCopy((current) => ({ ...current, [key]: { ...(current[key] ?? defaultCopy[key]), description: event.target.value } }))} className="admin-field" />
                  </label>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveCopy} className="admin-primary mt-6">Save section content</button>
          </section>
        )}

        {tab === 'seo' && (
          <section className="admin-panel mt-7">
            <h2 className="font-serif text-2xl text-[var(--text)]">Search engine settings</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Set the browser title and search description for every page.</p>
            <div className="mt-6 space-y-4">
              {Object.entries(pageLabels).map(([key, label]) => (
                <div key={key} className="grid gap-3 rounded-xl border border-[var(--line)] p-4 md:grid-cols-[140px_1fr]">
                  <p className="pt-2 text-sm font-medium text-[var(--text)]">{label}</p>
                  <div className="space-y-3">
                    <label className="admin-label">SEO title
                      <input value={seo[key]?.title ?? defaultSeo[key].title} onChange={(event) => setSeo((current) => ({ ...current, [key]: { ...(current[key] ?? defaultSeo[key]), title: event.target.value } }))} className="admin-field" />
                    </label>
                    <label className="admin-label">SEO description
                      <textarea rows={2} value={seo[key]?.description ?? defaultSeo[key].description} onChange={(event) => setSeo((current) => ({ ...current, [key]: { ...(current[key] ?? defaultSeo[key]), description: event.target.value } }))} className="admin-field" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveSeo} className="admin-primary mt-6">Save SEO settings</button>
          </section>
        )}

        {tab === 'appearance' && (
          <section className="admin-panel mt-7">
            <h2 className="font-serif text-2xl text-[var(--text)]">Website colour palette</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Choose one of three palettes. The header switch separately controls light and dark appearance.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {([
                { id: 'glacier', name: 'Glacier', base: '#0b1626', surface: '#142b3b', accent: '#a28dff', description: 'Midnight navy and violet' },
                { id: 'aurora', name: 'Aurora', base: '#101d2a', surface: '#1b3b43', accent: '#78d8ce', description: 'Deep teal and icy mint' },
                { id: 'ember', name: 'Ember', base: '#211923', surface: '#3b2936', accent: '#f1bf79', description: 'Plum and warm gold' },
              ] as const).map((item) => (
                <button key={item.id} type="button" onClick={() => selectPalette(item.id)} aria-pressed={palette === item.id} className={palette === item.id ? 'palette-card is-selected' : 'palette-card'}>
                  <div className="flex gap-2"><span className="h-9 flex-1 rounded-lg" style={{ background: item.base }} /><span className="h-9 flex-1 rounded-lg" style={{ background: item.surface }} /><span className="h-9 w-9 rounded-lg" style={{ background: item.accent }} /></div>
                  <p className="mt-4 font-semibold text-[var(--text)]">{item.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.description}</p>
                  {palette === item.id && <p className="mt-3 text-xs font-semibold text-[var(--accent)]">Currently selected</p>}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
