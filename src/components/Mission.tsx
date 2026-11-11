import { motion } from 'framer-motion'
import { useSectionCopy } from '../lib/siteStorage'

const principles = [
  { number: '01', title: 'Follow a feeling', copy: 'Start with a mood, a genre, or a passing curiosity. The next great watch can come from anywhere.', accent: '#78d8ce', symbol: '✳' },
  { number: '02', title: 'Find your next favourite', copy: 'Wander through films and series picked to make discovering something new feel effortless.', accent: '#f18f80', symbol: '✦' },
  { number: '03', title: 'Keep it close', copy: 'Save the stories that stay with you, and build a little collection that feels like yours.', accent: '#f1bf79', symbol: '♡' },
]

export default function Mission() {
  const copy = useSectionCopy('about')
  return (
    <section id="mission" className="relative flex min-h-[100svh] items-center overflow-hidden border-t border-[var(--line)] px-6 py-24 md:px-10 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-[#f1bf79]/[0.09] blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#78d8ce]/[0.09] blur-[110px]" />
      <div className="relative mx-auto w-full max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]"><span aria-hidden="true">✦</span> A little about Glacier</span>
          <h2 className="mt-7 text-balance font-serif text-3xl italic leading-snug text-[var(--text)] md:text-5xl">{copy.title}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[var(--muted)] md:text-base">{copy.description}</p>
          <p className="mt-5 font-serif text-lg italic text-[var(--accent)]">Because the best part is finding the story you didn’t know you needed.</p>
        </motion.div>
        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          {principles.map((item, index) => <motion.article key={item.number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: index * 0.08 }} className="group rounded-2xl border border-[var(--line)] bg-[var(--surface)]/80 p-7 shadow-[0_16px_44px_rgba(0,0,0,.08)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] md:p-8">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.18em]" style={{ color: item.accent }}>{item.number}</span><span aria-hidden="true" className="font-serif text-2xl" style={{ color: item.accent }}>{item.symbol}</span></div>
            <div className="mt-7 h-px w-full bg-[var(--line)]"><div className="h-px w-12" style={{ backgroundColor: item.accent }} /></div>
            <h3 className="mt-6 font-serif text-2xl text-[var(--text)]">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.copy}</p>
          </motion.article>)}
        </div>
      </div>
    </section>
  )
}
