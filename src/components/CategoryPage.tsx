import { useMemo,useState } from 'react'
import { starterTitles,type CatalogKind } from '../lib/catalog'
export default function CategoryPage({kind}:{kind:CatalogKind}) {
 const [query,setQuery]=useState('')
 const heading=kind==='movie'?'Movies':'Series'
 const filtered=useMemo(()=>starterTitles.filter(item=>{const term=query.trim().toLowerCase();return item.kind===kind&&(!term||`${item.title} ${item.genre} ${item.year}`.toLowerCase().includes(term))}),[kind,query])
 return <main className="min-h-screen px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-6xl">
 <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">Explore the collection</p><h1 className="mt-4 font-serif text-5xl text-[var(--text)] sm:text-6xl">{heading}</h1>
 <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">Browse the Glacier catalogue and search by title, genre, or year.</p>
 <label className="mt-9 flex max-w-lg items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5"><span aria-hidden="true" className="text-[var(--accent)]">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${heading.toLowerCase()}...`} aria-label={`Search ${heading.toLowerCase()}`} className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"/>{query&&<button type="button" onClick={()=>setQuery('')} className="text-xs text-[var(--muted)]">Clear</button>}</label>
 <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{filtered.map(item=><article key={item.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
 <div className="flex aspect-[4/5] items-end bg-[linear-gradient(145deg,var(--poster-a),var(--poster-b))] p-5"><span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-wider text-white">{item.kind}</span></div>
 <div className="p-4"><div className="flex items-start justify-between gap-2"><h2 className="font-serif text-xl text-[var(--text)]">{item.title}</h2><span className="text-xs text-[var(--muted)]">{item.year}</span></div><p className="mt-2 text-xs text-[var(--accent)]">{item.genre}</p><p className="mt-3 text-xs leading-5 text-[var(--muted)]">{item.description}</p></div></article>)}</div>
 {filtered.length===0&&<p className="mt-12 rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">No results. Try another search.</p>}</div></main>
}
