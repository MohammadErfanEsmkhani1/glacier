export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2 L20 9 L12 22 L4 9 Z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M4 9 H20 M12 2 V22 M8 9 L12 22 L16 9" stroke="#fff" strokeWidth="0.7" opacity="0.55" />
          </svg>
          <span className="pl-[0.28em] font-sans text-xs font-medium uppercase tracking-[0.28em] text-white">Glacier</span>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-8">
          <a href="#privacy" className="font-sans text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white">
            Privacy Policy
          </a>
          <a href="#terms" className="font-sans text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white">
            Terms of Service
          </a>
          <a href="#home" className="font-sans text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white">
            Back to Top
          </a>
        </nav>
        <p className="font-sans text-[10.5px] uppercase tracking-[0.16em] text-white/40">{'© 2026 Glacier'}</p>
      </div>
    </footer>
  )
}
