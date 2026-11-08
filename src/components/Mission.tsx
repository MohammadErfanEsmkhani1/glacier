import { motion } from 'framer-motion'

const figures = [
  { value: '48', label: 'Large-format prints' },
  { value: '9', label: 'Glaciers documented' },
  { value: '6', label: 'Years in the field' },
]

export default function Mission() {
  return (
    <section id="mission" className="relative border-t border-white/10 bg-black px-6 py-28 md:px-10 md:py-40">
      <motion.figure
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <span className="font-sans text-[10.5px] font-medium uppercase tracking-[0.34em] text-white/55">Our Mission</span>
        <blockquote className="mt-8 font-serif text-3xl italic leading-snug text-balance text-white md:text-5xl">
          {'"We cannot hold back the thaw, but we can make sure no one forgets what the ice looked like."'}
        </blockquote>
        <figcaption className="mt-8 font-sans text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/50">
          The Glacier Curatorial Team
        </figcaption>
      </motion.figure>

      <ul className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-3 md:mt-28">
        {figures.map((figure, index) => (
          <motion.li
            key={figure.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            <span className="font-serif text-6xl font-bold text-white md:text-7xl">{figure.value}</span>
            <span className="mt-3 font-sans text-[10.5px] font-medium uppercase tracking-[0.22em] text-white/55">{figure.label}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
