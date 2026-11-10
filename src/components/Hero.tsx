import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[92svh] scroll-mt-0 items-center overflow-hidden bg-[#0b1020] px-6 pb-24 pt-32 md:px-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-36 h-[34rem] w-[34rem] rounded-full bg-violet-500/15 blur-[110px]" />
        <div className="absolute -bottom-64 left-[-8rem] h-[34rem] w-[34rem] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(11,16,32,0.98)_8%,rgba(11,16,32,0.82)_55%,rgba(11,16,32,0.48)_100%)]" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.7) .6px, transparent .6px)', backgroundSize: '18px 18px' }} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#62d6e8]" />
            Movies · Series · Discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="max-w-[760px] text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl"
          >
            Find a story
            <span className="block bg-gradient-to-r from-[#b5a2ff] via-[#9b8bff] to-[#62d6e8] bg-clip-text text-transparent">
              worth staying for.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mt-7 max-w-xl text-base leading-8 text-slate-300/80 md:text-lg"
          >
            A thoughtful place to discover remarkable movies and series, find your next favourite, and keep track of what you love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#exhibit"
              className="glacier-focus inline-flex items-center gap-3 rounded-full bg-[#9270ff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(146,112,255,0.22)] transition hover:-translate-y-0.5 hover:bg-[#a087ff]"
            >
              Explore recommendations
              <span aria-hidden="true">↗</span>
            </a>
            <a href="#visit" className="glacier-focus rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:border-[#62d6e8]/50 hover:text-white">
              My movies
            </a>
          </motion.div>

          <p className="mt-12 text-xs tracking-wide text-slate-500">
            Curated discoveries. Personal watchlists. Stories for every mood.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, x: 18 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.18 }}
          className="relative mx-auto hidden h-[430px] w-full max-w-[470px] lg:block"
          aria-label="Abstract artwork representing movie and series discovery"
        >
          <div className="absolute left-[7%] top-[12%] h-[310px] w-[205px] rotate-[-10deg] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#283c61] via-[#62558d] to-[#10182c] shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,rgba(122,220,235,.65),transparent_35%),linear-gradient(155deg,transparent_35%,rgba(7,12,27,.85))]" />
            <div className="absolute bottom-7 left-5 right-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/70">A world beyond</p>
              <p className="mt-2 font-serif text-3xl text-white">Cinema</p>
            </div>
          </div>
          <div className="absolute right-[7%] top-[2%] h-[350px] w-[220px] rotate-[8deg] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#573e75] via-[#282e58] to-[#11182a] shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_22%,rgba(242,189,114,.58),transparent_32%),linear-gradient(160deg,transparent_30%,rgba(7,12,27,.9))]" />
            <div className="absolute bottom-7 left-5 right-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/70">New perspectives</p>
              <p className="mt-2 font-serif text-3xl text-white">Stories</p>
            </div>
          </div>
          <div className="absolute bottom-[1%] left-[30%] rounded-2xl border border-white/15 bg-[#17213a]/90 px-5 py-4 shadow-xl backdrop-blur-xl">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#62d6e8]">Your next watch</p>
            <p className="mt-1 text-sm font-medium text-white">Starts with a discovery.</p>
          </div>
          <div className="absolute right-[2%] top-[48%] h-3 w-3 rounded-full bg-[#9270ff] shadow-[0_0_28px_8px_rgba(146,112,255,.3)]" />
        </motion.div>
      </div>
    </section>
  )
}
