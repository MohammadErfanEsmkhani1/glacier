import { motion } from 'framer-motion'

export default function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="mx-auto flex max-w-2xl flex-col items-center text-center"
    >
      <span className="font-sans text-[10.5px] font-medium uppercase tracking-[0.34em] text-white/55">{eyebrow}</span>
      <h2 className="mt-5 font-serif text-4xl font-normal uppercase leading-[1.05] tracking-[0.02em] text-balance text-white md:text-6xl">
        {title}
      </h2>
      {intro && (
        <p className="mt-6 max-w-xl font-serif text-lg italic leading-relaxed text-pretty text-white/70">{intro}</p>
      )}
    </motion.header>
  )
}
