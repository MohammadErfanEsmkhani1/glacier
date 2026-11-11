import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
  const [active, setActive] = useState<number | null>(0)

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
            <span className="text-[10px] text-[var(--muted)]">Choose a chapter to explore</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {principles.map((item, index) => {
              const selected = active === index
              return (
                <motion.button
                  key={item.number}
                  type="button"
                  aria-expanded={selected}
                  onClick={() => setActive(selected ? null : index)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className={'group relative min-h-[190px] overflow-hidden rounded-2xl border p-6 text-left transition-colors duration-300 md:p-7 ' + (selected ? 'border-[var(--accent)] bg-[var(--surface)] shadow-[0_18px_55px_rgba(0,0,0,.16)]' : 'border-[var(--line)] bg-[var(--surface)]/55 hover:border-[var(--accent)]/60')}
                >
                  <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-8 font-serif text-8xl opacity-[0.07] transition-transform duration-500 group-hover:scale-110" style={{ color: item.accent }}>{item.symbol}</span>
                  <div className="relative flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: item.accent }}>{item.number} / 03</span>
                    <span className="font-serif text-2xl" style={{ color: item.accent }}>{item.symbol}</span>
                  </div>
                  <h3 className="relative mt-8 max-w-[15rem] font-serif text-2xl leading-tight text-[var(--text)]">{item.title}</h3>
                  <p className="relative mt-3 text-xs leading-6 text-[var(--muted)]">{item.short}</p>
                  <div className="relative mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: item.accent }}>
                    {selected ? 'Close chapter' : 'Discover more'}
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">{selected ? '−' : '↗'}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
          <AnimatePresence mode="wait">
            {active !== null && (
              <motion.div key={active} initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/75 p-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-7">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 font-serif text-2xl" style={{ color: principles[active].accent }}>{principles[active].symbol}</span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">A closer look · {principles[active].number}</p>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text)]">{principles[active].detail}</p>
                    </div>
                  </div>
                  {active === 1 && <a href="/categories" className="glacier-focus inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--page)]">Explore the collection ↗</a>}
                  {active === 2 && <a href="#exhibit" className="glacier-focus inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--page)]">Find something to save ↗</a>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.div initial={{ opacity: 0, scaleX: 0.7 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="mx-auto mt-16 h-px max-w-5xl origin-center bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
      </div>
    </section>
  )
}
