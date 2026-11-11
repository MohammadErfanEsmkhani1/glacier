import { motion } from 'framer-motion'
import { useSectionCopy } from '../lib/siteStorage'

const principles = [
  {
    number: '01',
    title: 'Every story starts somewhere',
    short: 'A feeling, a question, a world you haven’t visited yet.',
    detail: 'Sometimes you know exactly what you want to watch. Sometimes you just need a little spark. Glacier gives you room to follow either instinct.',
    accent: '#78d8ce',
    symbol: '✳',
  },
  {
    number: '02',
    title: 'There’s always more to discover',
    short: 'Find films and series that stay with you.',
    detail: 'Explore beyond the familiar, move between genres, and let one discovery lead to another. Your next favourite might be one you never expected.',
    accent: '#f18f80',
    symbol: '✦',
  },
  {
    number: '03',
    title: 'Keep the stories that matter',
    short: 'Build a collection that feels like your own.',
    detail: 'When a title catches your attention, save it. Your personal favorites shelf keeps the stories you want to return to close at hand.',
    accent: '#f1bf79',
    symbol: '♡',
  },
]

export default function Mission() {
  const copy = useSectionCopy('about')

  return (
    <section id="mission" className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-t border-[var(--line)] px-6 py-24 md:px-10 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(120,216,206,.12),transparent_48%),radial-gradient(ellipse_at_100%_80%,rgba(162,141,255,.12),transparent_42%),linear-gradient(160deg,var(--section),var(--page)_72%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/4 -z-10 h-80 w-80 rounded-full bg-[#f1bf79]/[0.10] blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-[#78d8ce]/[0.10] blur-[120px]" />

      <div className="mx-auto w-full max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.75 }} className="relative mx-auto max-w-4xl text-center">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[var(--accent)]/60" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">A little about Glacier</span>
            <span className="h-px w-10 bg-[var(--accent)]/60" />
          </div>
          <p className="mb-5 font-serif text-sm italic tracking-wide text-[var(--muted)]">Some stories find us at just the right moment.</p>
          <h2 className="text-balance font-serif text-4xl font-normal leading-[1.12] text-[var(--text)] md:text-6xl lg:text-7xl">{copy.title}</h2>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-[var(--muted)] md:text-base">{copy.description}</p>
          <p className="mt-7 font-serif text-lg italic text-[var(--accent)] md:text-xl">Stay curious. The next story is waiting.</p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-5xl md:mt-20">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">The Glacier feeling</span>
            <span className="text-[10px] text-[var(--muted)]">A few things we believe in</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {principles.map((item, index) => (
              <motion.article key={item.number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: index * 0.08 }} className="group relative min-h-[300px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]/65 p-6 text-left shadow-[0_18px_55px_rgba(0,0,0,.12)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/60 md:p-7">
                <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-8 font-serif text-8xl opacity-[0.07] transition-transform duration-500 group-hover:scale-110" style={{ color: item.accent }}>{item.symbol}</span>
                <div className="relative flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: item.accent }}>{item.number} / 03</span>
                  <span className="font-serif text-2xl" style={{ color: item.accent }}>{item.symbol}</span>
                </div>
                <div className="relative mt-7 h-px w-full bg-[var(--line)]"><div className="h-px w-12" style={{ backgroundColor: item.accent }} /></div>
                <h3 className="relative mt-6 font-serif text-2xl leading-tight text-[var(--text)]">{item.title}</h3>
                <p className="relative mt-3 text-xs leading-6 text-[var(--muted)]">{item.short}</p>
                <p className="relative mt-4 border-t border-[var(--line)] pt-4 text-xs leading-7 text-[var(--text)]/80">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, scaleX: 0.7 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="mx-auto mt-16 h-px max-w-5xl origin-center bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
      </div>
    </section>
  )
}
