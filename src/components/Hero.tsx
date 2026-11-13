import { motion } from 'framer-motion'
import DeferredHeroVideo from './DeferredHeroVideo'
import { useSectionCopy, useSectionCopyReady } from '../lib/siteStorage'
export default function Hero() {
  const copy = useSectionCopy('homeHero')
  const copyReady = useSectionCopyReady('homeHero')
  return (
    <section id="home" data-preloader-pending={copyReady ? undefined : 'true'} className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[var(--page)]">
      <DeferredHeroVideo />
      <div aria-hidden="true" className="hero-theme-overlay pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.28)_0%,transparent_24%,transparent_61%,rgba(0,0,0,.48)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.18)_0%,transparent_20%,transparent_80%,rgba(0,0,0,.18)_100%)]" />
      <div className="relative z-10 flex min-h-[100svh] flex-1 flex-col items-center justify-center px-6 pb-28 pt-32 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }} className="mb-7 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3"><span className="text-2xl text-white">◇</span><span className="pl-[0.28em] font-sans text-sm font-medium uppercase tracking-[0.3em] text-white">Glacier</span></div>
          <span className="pl-[0.24em] text-[10px] font-medium uppercase tracking-[0.32em] text-white/75">Movies · Series · Discovery</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.24, ease: 'easeOut' }} className="hero-title max-w-5xl font-serif text-5xl font-semibold uppercase leading-[1.06] tracking-[0.015em] drop-shadow-[0_2px_32px_rgba(0,0,0,.45)] sm:text-6xl md:text-7xl lg:text-8xl">
          {copy.title}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.42, ease: 'easeOut' }} className="mt-7 max-w-2xl font-serif text-base italic leading-relaxed text-white/90 drop-shadow-[0_1px_18px_rgba(0,0,0,.55)] md:text-lg">{copy.description}</motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.58, ease: 'easeOut' }} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href="/categories" className="hero-primary-cta glacier-focus inline-flex items-center rounded-full px-6 py-3.5 text-sm font-semibold text-[#111628] transition duration-200 hover:-translate-y-0.5">Explore categories</a>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.82 }} className="mt-12 text-[10px] font-medium uppercase tracking-[0.22em] text-white/65">A little less scrolling. A lot more discovering.</motion.p>
      </div>
    </section>
  )
}
