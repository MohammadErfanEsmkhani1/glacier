import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'

const details = [
  { label: 'Dates', value: 'January 14 — April 30', note: 'Opening night by invitation' },
  { label: 'Hours', value: 'Tue — Sun, 10:00 — 19:00', note: 'Late viewings every Friday until 22:00' },
  { label: 'Location', value: 'Hall of Northern Light', note: 'Gallery Wing, Level Two' },
  { label: 'Admission', value: 'Timed entry', note: 'Free for members and under 12s' },
]

export default function Visit() {
  return (
    <section id="visit" className="relative border-t border-white/10 bg-[#05080a] px-6 py-28 md:px-10 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(14,116,144,0.16),transparent_65%)]"
      />
      <div className="relative">
        <SectionHeading eyebrow="Plan Your Visit" title="Step Inside the Cold" />

        <dl className="mx-auto mt-16 max-w-4xl divide-y divide-white/10 border-y border-white/10 md:mt-20">
          {details.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
              className="flex flex-col gap-2 py-7 md:flex-row md:items-baseline md:gap-10"
            >
              <dt className="font-sans text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/50 md:w-40 md:shrink-0">
                {item.label}
              </dt>
              <dd className="flex flex-1 flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
                <span className="font-serif text-2xl text-white md:text-3xl">{item.value}</span>
                <span className="font-serif text-base italic text-white/55">{item.note}</span>
              </dd>
            </motion.div>
          ))}
        </dl>

        <div className="mt-16 flex justify-center">
          <motion.a
            href="#tickets"
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            whileTap={{ scale: 0.97 }}
            className="rounded-[50%] border border-white/60 px-[58px] py-5 font-sans text-xs font-medium uppercase tracking-[0.22em] text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0)' }}
          >
            Reserve Tickets
          </motion.a>
        </div>
      </div>
    </section>
  )
}
