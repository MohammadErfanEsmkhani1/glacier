type Props = { path:string; onNavigate:(path:string)=>void; mode:'dark'|'light'; onToggleMode:()=>void }
export default function SiteNavigation({path,onNavigate,mode,onToggleMode}:Props) {
 const link=(href:string,label:string)=><button type="button" onClick={()=>onNavigate(href)} aria-current={path===href?'page':undefined} className={`rounded-full px-3 py-2 text-sm transition hover:bg-white/10 ${path===href?'bg-white/10 text-white':'text-white/70 hover:text-white'}`}>{label}</button>
 return <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4"><nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[#0b1626]/75 px-4 py-3 shadow-xl backdrop-blur-xl sm:px-6">
 <button type="button" onClick={()=>onNavigate('/')} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-white"><span aria-hidden="true" className="text-lg text-[#78d8ce]">◇</span> Glacier</button>
 <div className="flex items-center gap-1">{link('/','Home')}{link('/movies','Movies')}{link('/series','Series')}
 <button type="button" onClick={onToggleMode} aria-label={`Switch to ${mode==='dark'?'light':'dark'} mode`} className="ml-1 rounded-full border border-white/15 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10">{mode==='dark'?'Light':'Dark'}</button>
 {path==='/admin'?link('/admin','Admin'):link('/login','Sign in')}</div></nav></header>
}
