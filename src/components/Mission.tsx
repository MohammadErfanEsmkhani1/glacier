import { motion } from 'framer-motion'
import { useSectionCopy } from '../lib/siteStorage'
const principles = [
  { number: '01', title: 'Discover', copy: 'Find stories beyond the usual recommendations.', accent: '#78d8ce' },
  { number: '02', title: 'Explore', copy: 'Browse movies and series by the things you love.', accent: '#f18f80' },
  { number: '03', title: 'Remember', copy: 'Keep your discoveries together.', accent: '#f1bf79' },
]
export default function Mission() {
  const copy = useSectionCopy('about')
  return (
    <section id="mission" className="flex min-h-[100svh] items-center border-t border-[var(--line)] px-6 py-24 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">A little about Glacier</span>
          <h2 className="mt-6 text-balance font-serif text-3xl italic leading-snug text-[var(--text)] md:text-5xl">{copy.title}</h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy.description}</p>
        </motion.div>
        <div className="mt-16 grid gap-4 md:mt-20 md:grid-cols-3">
          {principles.map((item, index) => <motion.article key={item.number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: index * 0.08 }} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_16px_44px_rgba(0,0,0,.08)]">
            <span className="text-xs font-semibold tracking-[0.18em]" style={{ color: item.accent }}>{item.number}</span><div className="mt-7 h-1 w-10 rounded-full" style={{ backgroundColor: item.accent }} />
            <h3 className="mt-5 font-serif text-2xl text-[var(--text)]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.copy}</p>
          </motion.article>)}
        </div>
      </div>
    </section>
  )
}
