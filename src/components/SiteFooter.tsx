export default function SiteFooter() {
  return (
    <footer className="site-footer border-t border-[var(--line)] px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <a href="/" className="flex items-center gap-2.5"><span className="text-lg">◇</span><span className="pl-[0.28em] font-sans text-xs font-medium uppercase tracking-[0.28em]">Glacier</span></a>
        <nav aria-label="Footer" className="flex items-center gap-8">
          <a href="#privacy" className="footer-link">Privacy Policy</a><a href="#terms" className="footer-link">Terms of Service</a><a href="/" className="footer-link">Back to Top</a>
        </nav>
        <p className="footer-copyright font-sans text-[10.5px] uppercase tracking-[0.16em]">© 2026 Glacier</p>
      </div>
    </footer>
  )
}
