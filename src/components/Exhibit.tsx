import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'

const chapters = [
  {
    numeral: 'I',
    title: 'The Silence',
    image: '/images/silence.webp',
    alt: 'A vast glacier ice field with deep blue crevasses under a pale overcast sky',
    copy: 'Endless fields of ancient ice, where the only sound is the wind and the slow groan of a river frozen mid-motion.',
  },
  {
    numeral: 'II',
    title: 'The Light',
    image: '/images/light.webp',
    alt: 'The translucent turquoise walls of a glacial ice cave glowing with filtered light',
    copy: 'Beneath the surface, sunlight is filtered through millennia of compressed snow into a blue found nowhere else.',
  },
  {
    numeral: 'III',
    title: 'The Melt',
    image: '/images/melt.webp',
    alt: 'A lone iceberg floating in dark, still water at dusk',
    copy: 'Every fragment that breaks away carries a record of the past, released into a sea that is warming around it.',
  },
]

export default function Exhibit() {
  return (
    <section id="exhibit" className="relative scroll-mt-0 bg-black px-6 pb-28 pt-32 md:px-10 md:pb-36 md:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent"
      />
      <SectionHeading
        eyebrow="The Exhibit"
        title="Three Chapters of Ice"
        intro="A collection of large-format photographs tracing a glacier from its quiet beginnings to its final, luminous retreat."
      />

      <ol className="mx-auto mt-20 grid max-w-6xl gap-10 md:mt-24 md:grid-cols-3 md:gap-8">
        {chapters.map((chapter, index) => (
          <motion.li
            key={chapter.numeral}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: index * 0.12, ease: 'easeOut' }}
            className="group flex flex-col"
          >
            <figure className="relative aspect-[3/4] overflow-hidden rounded-sm border border-white/10">
              <img
                src={chapter.image}
                alt={chapter.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 font-serif text-sm italic text-white/80">Chapter {chapter.numeral}</span>
            </figure>
            <h3 className="mt-6 font-serif text-2xl uppercase tracking-[0.04em] text-white">{chapter.title}</h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-white/60">{chapter.copy}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
