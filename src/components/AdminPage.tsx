import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { type CatalogKind, type CatalogTitle } from '../lib/catalog'
import { applyPalette, defaultCopy, defaultSeo, getPalette, type PageSeo, type Palette, type SiteCopy } from '../lib/siteStorage'

type AdminTab = 'catalogue' | 'content' | 'seo' | 'appearance'
type Draft = Omit<CatalogTitle, 'id'> & { id?: string }
const emptyDraft: Draft = { title: '', kind: 'movie', year: new Date().getFullYear(), genre: '', description: '', poster_url: null, featured: false }
const pageLabels: Record<string, string> = { home: 'Home', categories: 'Categories', login: 'Sign in', register: 'Registration', admin: 'Admin panel' }
const sectionLabels: Record<string, string> = { homeHero: 'Home hero', recommendations: 'Recommended titles', account: 'Account section', about: 'About Glacier', categories: 'Categories page' }

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('catalogue')
  const [titles, setTitles] = useState<CatalogTitle[]>([])
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copy, setCopy] = useState<Record<string, SiteCopy>>(defaultCopy)
  const [seo, setSeo] = useState<Record<string, PageSeo>>(defaultSeo)
  const [palette, setPalette] = useState<Palette>(getPalette())
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const sortedTitles = useMemo(() => [...titles].sort((a, b) => a.title.localeCompare(b.title)), [titles])
  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const loadData = async () => {
    if (!supabase) return
    const [catalogResult, sectionResult, pageResult, settingsResult] = await Promise.all([
      supabase.from('titles').select('id,title,kind,release_year,genre,description,poster_url,featured').order('sort_order').order('title'),
      supabase.from('site_sections').select('section_key,title,description'),
      supabase.from('site_pages').select('slug,seo_title,seo_description'),
      supabase.from('site_settings').select('palette').eq('id', true).maybeSingle(),
    ])
    const failure = catalogResult.error || sectionResult.error || pageResult.error || settingsResult.error
    if (failure) { setNotice('Could not load saved settings: ' + failure.message); return }
    setTitles((catalogResult.data ?? []).map((item) => ({ id: item.id, title: item.title, kind: item.kind, year: item.release_year ?? 0, genre: item.genre, description: item.description, poster_url: item.poster_url, featured: item.featured })))
    const nextCopy = { ...defaultCopy }
    for (const item of sectionResult.data ?? []) nextCopy[item.section_key] = { title: item.title, description: item.description }
    setCopy(nextCopy)
    const nextSeo = { ...defaultSeo }
    for (const item of pageResult.data ?? []) nextSeo[item.slug] = { title: item.seo_title, description: item.seo_description }
    setSeo(nextSeo)
    if (settingsResult.data?.palette) setPalette(settingsResult.data.palette as Palette)
  }

  useEffect(() => { void loadData() }, [])

  const saveTitle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true); setNotice('')
    const payload = { title: draft.title.trim(), kind: draft.kind, release_year: draft.year, genre: draft.genre, description: draft.description, poster_url: draft.poster_url, featured: draft.featured }
    const result = editingId
      ? await supabase.from('titles').update(payload).eq('id', editingId)
      : await supabase.from('titles').insert(payload)
    setBusy(false)
    if (result.error) { setNotice('Could not save title: ' + result.error.message); return }
    setDraft(emptyDraft); setEditingId(null); setNotice('Title saved to the Glacier database.'); await loadData()
    window.dispatchEvent(new Event('glacier:catalogue-updated'))
  }

  const deleteTitle = async (id: string) => {
    if (!supabase || !window.confirm('Delete this title from the shared Glacier catalogue?')) return
    const { error } = await supabase.from('titles').delete().eq('id', id)
    if (error) { setNotice('Could not delete title: ' + error.message); return }
    setNotice('Title deleted from the Glacier database.'); await loadData()
    window.dispatchEvent(new Event('glacier:catalogue-updated'))
  }

  const saveCopy = async () => {
    if (!supabase) return
    setBusy(true)
    const rows = Object.entries(copy).map(([section_key, value], sort_order) => ({
      page_slug: section_key === 'categories' ? 'categories' : 'home',
      section_key, title: value.title, description: value.description, sort_order,
    }))
    const { error } = await supabase.from('site_sections').upsert(rows, { onConflict: 'page_slug,section_key' })
    setBusy(false)
    setNotice(error ? 'Could not save section content: ' + error.message : 'Section content saved to the Glacier database.')
    if (!error) window.dispatchEvent(new Event('glacier:site-copy-updated'))
  }

  const saveSeo = async () => {
    if (!supabase) return
    setBusy(true)
    const rows = Object.entries(seo).map(([slug, value]) => ({ slug, seo_title: value.title, seo_description: value.description }))
    const { error } = await supabase.from('site_pages').upsert(rows, { onConflict: 'slug' })
    setBusy(false)
    setNotice(error ? 'Could not save SEO settings: ' + error.message : 'SEO settings saved to the Glacier database.')
    if (!error) window.dispatchEvent(new Event('glacier:seo-updated'))
  }

  const selectPalette = async (value: Palette) => {
    if (!supabase) return
    setPalette(value); applyPalette(value)
    const { error } = await supabase.from('site_settings').update({ palette: value }).eq('id', true)
    setNotice(error ? 'Could not save palette: ' + error.message : 'Palette saved to the Glacier database.')
  }

  const tabButton = (key: AdminTab, label: string) => (
    <button type="button" onClick={() => { setTab(key); setNotice('') }} className={tab === key ? 'admin-tab is-active' : 'admin-tab'}>{label}</button>
  )

  return (
    <main className="min-h-screen px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Glacier control room</p>
        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="font-serif text-5xl text-[var(--text)]">Admin panel</h1><p className="mt-3 text-sm text-[var(--muted)]">Manage your shared Glacier catalogue and website content.</p></div>
          <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-[var(--text)]">Supabase connected</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
          {tabButton('catalogue', 'Catalogue')}{tabButton('content', 'Section content')}{tabButton('seo', 'Page SEO')}{tabButton('appearance', 'Appearance')}
        </div>
        {notice && <p role="status" className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">{notice}</p>}
        {tab === 'catalogue' && <section className="mt-7 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={saveTitle} className="admin-panel h-fit self-start space-y-4">
            <div><h2 className="font-serif text-2xl text-[var(--text)]">{editingId ? 'Edit title' : 'Add a title'}</h2><p className="mt-2 text-sm text-[var(--muted)]">Changes are shared with every Glacier visitor.</p></div>
            <label className="admin-label">Title<input required value={draft.title} onChange={(e) => updateDraft('title', e.target.value)} className="admin-field" placeholder="e.g. Arrival" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="admin-label">Category<select value={draft.kind} onChange={(e) => updateDraft('kind', e.target.value as CatalogKind)} className="admin-field"><option value="movie">Movie</option><option value="series">Series</option></select></label>
              <label className="admin-label">Release year<input required type="number" min="1888" max="2200" value={draft.year} onChange={(e) => updateDraft('year', Number(e.target.value))} className="admin-field" /></label>
            </div>
            <label className="admin-label">Genre<input value={draft.genre} onChange={(e) => updateDraft('genre', e.target.value)} className="admin-field" placeholder="Drama · Sci-fi" /></label>
            <label className="admin-label">Poster image URL<input type="url" value={draft.poster_url ?? ''} onChange={(e) => updateDraft('poster_url', e.target.value || null)} className="admin-field" placeholder="https://..." /></label>
            <label className="admin-label">Description<textarea rows={3} value={draft.description} onChange={(e) => updateDraft('description', e.target.value)} className="admin-field" placeholder="A short description" /></label>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]"><input type="checkbox" checked={draft.featured} onChange={(e) => updateDraft('featured', e.target.checked)} /> Feature on the home page</label>
            <div className="flex flex-wrap gap-2"><button disabled={busy} type="submit" className="admin-primary">{busy ? 'Saving…' : editingId ? 'Save changes' : 'Add to catalogue'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft) }} className="admin-secondary">Cancel</button>}</div>
          </form>
          <div className="admin-panel"><div className="flex items-end justify-between gap-3"><div><h2 className="font-serif text-2xl text-[var(--text)]">Your titles</h2><p className="mt-2 text-sm text-[var(--muted)]">{titles.length} entries</p></div></div>
            <div className="mt-5 space-y-3">{sortedTitles.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-medium text-[var(--text)]">{item.title} <span className="ml-2 text-xs text-[var(--muted)]">{item.year}</span></p><p className="mt-1 text-xs text-[var(--muted)]">{item.kind === 'movie' ? 'Movie' : 'Series'} · {item.genre || 'No genre set'}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setEditingId(item.id); setDraft({ title:item.title,kind:item.kind,year:item.year,genre:item.genre,description:item.description,poster_url:item.poster_url,featured:item.featured }) }} className="admin-secondary">Edit</button><button type="button" onClick={() => void deleteTitle(item.id)} className="admin-danger">Delete</button></div></article>)}
            {titles.length === 0 && <p className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">Your catalogue is empty. Add a title to begin.</p>}</div>
          </div>
        </section>}
        {tab === 'content' && <section className="admin-panel mt-7"><h2 className="font-serif text-2xl text-[var(--text)]">Edit section titles and descriptions</h2><p className="mt-2 text-sm text-[var(--muted)]">Changes are saved to the shared database.</p><div className="mt-6 grid gap-5 md:grid-cols-2">{Object.entries(sectionLabels).map(([key,label]) => <div key={key} className="rounded-xl border border-[var(--line)] p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">{label}</p><label className="admin-label">Title<input value={copy[key]?.title ?? ''} onChange={(e) => setCopy((c) => ({...c,[key]:{...(c[key] ?? {title:'',description:''}),title:e.target.value}}))} className="admin-field" /></label><label className="admin-label mt-3">Description<textarea rows={3} value={copy[key]?.description ?? ''} onChange={(e) => setCopy((c) => ({...c,[key]:{...(c[key] ?? {title:'',description:''}),description:e.target.value}}))} className="admin-field" /></label></div>)}</div><button disabled={busy} type="button" onClick={() => void saveCopy()} className="admin-primary mt-6">{busy ? 'Saving…' : 'Save section content'}</button></section>}
        {tab === 'seo' && <section className="admin-panel mt-7"><h2 className="font-serif text-2xl text-[var(--text)]">Search engine settings</h2><p className="mt-2 text-sm text-[var(--muted)]">Set the browser title and search description for every page.</p><div className="mt-6 space-y-4">{Object.entries(pageLabels).map(([key,label]) => <div key={key} className="grid gap-3 rounded-xl border border-[var(--line)] p-4 md:grid-cols-[140px_1fr]"><p className="pt-2 text-sm font-medium text-[var(--text)]">{label}</p><div className="space-y-3"><label className="admin-label">SEO title<input value={seo[key]?.title ?? ''} onChange={(e) => setSeo((c) => ({...c,[key]:{...(c[key] ?? {title:'',description:''}),title:e.target.value}}))} className="admin-field" /></label><label className="admin-label">SEO description<textarea rows={2} value={seo[key]?.description ?? ''} onChange={(e) => setSeo((c) => ({...c,[key]:{...(c[key] ?? {title:'',description:''}),description:e.target.value}}))} className="admin-field" /></label></div></div>)}</div><button disabled={busy} type="button" onClick={() => void saveSeo()} className="admin-primary mt-6">{busy ? 'Saving…' : 'Save SEO settings'}</button></section>}
        {tab === 'appearance' && <section className="admin-panel mt-7"><h2 className="font-serif text-2xl text-[var(--text)]">Website colour palette</h2><p className="mt-2 text-sm text-[var(--muted)]">Choose one of three palettes. The header switch separately controls light and dark appearance.</p><div className="mt-6 grid gap-4 md:grid-cols-3">{([{id:'glacier',name:'Glacier',base:'#0b1626',surface:'#142b3b',accent:'#a28dff',description:'Midnight navy and violet'},{id:'aurora',name:'Aurora',base:'#101d2a',surface:'#1b3b43',accent:'#78d8ce',description:'Deep teal and icy mint'},{id:'ember',name:'Ember',base:'#211923',surface:'#3b2936',accent:'#f1bf79',description:'Plum and warm gold'}] as const).map((item) => <button key={item.id} type="button" onClick={() => void selectPalette(item.id)} aria-pressed={palette === item.id} className={palette === item.id ? 'palette-card is-selected' : 'palette-card'}><div className="flex gap-2"><span className="h-9 flex-1 rounded-lg" style={{background:item.base}}/><span className="h-9 flex-1 rounded-lg" style={{background:item.surface}}/><span className="h-9 w-9 rounded-lg" style={{background:item.accent}}/></div><p className="mt-4 font-semibold text-[var(--text)]">{item.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.description}</p>{palette === item.id && <p className="mt-3 text-xs font-semibold text-[var(--accent)]">Currently selected</p>}</button>)}</div></section>}
      </div>
    </main>
  )
}
