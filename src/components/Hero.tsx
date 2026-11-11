import { motion } from 'framer-motion'
import LoopingVideo from './LoopingVideo'

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#0b1626]">
      <LoopingVideo src="/hero.mp4" />

      <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.28)_0%,transparent_24%,transparent_61%,rgba(0,0,0,.48)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.18)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.18)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-[14%] left-1/2 h-[720px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_30%,rgba(120,216,206,.10)_0%,transparent_68%)]" />

      <div className="relative z-10 flex min-h-[100svh] flex-1 flex-col items-center justify-center px-6 pb-28 pt-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="mb-7 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2 L20 9 L12 22 L4 9 Z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M4 9 H20 M12 2 V22 M8 9 L12 22 L16 9" stroke="#fff" strokeWidth="0.7" opacity="0.6" />
            </svg>
            <span className="pl-[0.28em] font-sans text-sm font-medium uppercase tracking-[0.3em] text-white">Glacier</span>
          </div>
          <span className="pl-[0.24em] text-[10px] font-medium uppercase tracking-[0.32em] text-white/75">Movies · Series · Discovery</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.24, ease: 'easeOut' }}
          className="max-w-5xl font-serif text-5xl font-normal uppercase leading-[1.02] tracking-[0.015em] text-white drop-shadow-[0_2px_32px_rgba(0,0,0,.45)] sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Find a story
          <span className="mt-2 block bg-gradient-to-r from-[#78d8ce] via-[#b6a5ff] to-[#f1bf79] bg-clip-text font-semibold text-transparent">
            worth staying for.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.42, ease: 'easeOut' }}
          className="mt-7 max-w-2xl font-serif text-base italic leading-relaxed text-white/90 drop-shadow-[0_1px_18px_rgba(0,0,0,.55)] md:text-lg"
        >
          Discover remarkable movies and series, find your next favourite, and keep the stories you love close.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.58, ease: 'easeOut' }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#exhibit"
            className="glacier-focus inline-flex items-center rounded-full bg-[#a28dff] px-6 py-3.5 text-sm font-semibold text-[#111628] shadow-[0_10px_35px_rgba(162,141,255,.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#b5a5ff]"
          >
            Explore recommendations
          </a>
          <a
            href="#visit"
            className="glacier-focus inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/[0.07] px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-[#78d8ce]/70 hover:bg-white/[0.13]"
          >
            My movies
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.82 }}
          className="mt-12 text-[10px] font-medium uppercase tracking-[0.22em] text-white/65"
        >
          A little less scrolling. A lot more discovering.
        </motion.p>
      </div>
    </section>
  )
}
