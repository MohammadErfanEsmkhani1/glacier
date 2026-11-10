import { motion } from 'framer-motion'

const principles = [
  { number: '01', title: 'Discover', copy: 'Find stories beyond the usual recommendations.' },
  { number: '02', title: 'Explore', copy: 'Browse movies and series by the things you love.' },
  { number: '03', title: 'Remember', copy: 'Keep your favourites and recent discoveries together.' },
]

export default function Mission() {
  return (
    <section id="mission" className="border-t border-white/[0.07] bg-[#0e1527] px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#62d6e8]">A little about Glacier</span>
          <h2 className="mt-6 text-balance font-serif text-3xl italic leading-snug text-white md:text-5xl">
            Great stories deserve to be found, remembered, and shared.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
            Glacier is being built as a calm, considered home for movie and series discovery — focused on the stories, not the noise.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 md:mt-20 md:grid-cols-3">
          {principles.map((item, index) => (
            <motion.article
              key={item.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-white/[0.08] bg-[#151d31]/65 p-7"
            >
              <span className="text-xs font-semibold tracking-[0.18em] text-[#a995ff]">{item.number}</span>
              <h3 className="mt-8 font-serif text-2xl text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{item.copy}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
