type Props = { path: string; mode: 'dark' | 'light'; onToggleMode: () => void }
export default function SiteHeader({ path, mode, onToggleMode }: Props) {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b1626]/80 px-4 py-3 shadow-[0_14px_44px_rgba(0,0,0,.28)] backdrop-blur-xl sm:px-6">
        <a href="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-white">
          <span aria-hidden="true" className="text-xl text-[#78d8ce]">◇</span> Glacier
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
          <a href="/" aria-current={path === '/' ? 'page' : undefined} className="site-nav-link">Home</a>
          <a href="/categories" aria-current={path === '/categories' ? 'page' : undefined} className="site-nav-link">Categories</a>
          <a href="/#mission" className="site-nav-link hidden sm:inline-flex">About</a>
          <a href="/login" aria-current={path === '/login' || path === '/register' ? 'page' : undefined} className="site-nav-link">Sign in</a>
        </nav>
        <button type="button" onClick={onToggleMode} aria-pressed={mode === 'light'} className="theme-control" aria-label={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'} title={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'}>
          <span className="theme-control-icon" aria-hidden="true">{mode === 'dark' ? '☼' : '☾'}</span>
          <span className="hidden text-xs font-medium sm:inline">{mode === 'dark' ? 'Light' : 'Dark'}</span>
          <span className={mode === 'light' ? 'theme-track is-on' : 'theme-track'} aria-hidden="true"><span /></span>
        </button>
      </div>
    </header>
  )
}
