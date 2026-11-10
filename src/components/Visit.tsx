import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'

export default function Visit() {
  const [showNotice, setShowNotice] = useState(false)

  return (
    <section id="visit" className="relative scroll-mt-20 overflow-hidden border-t border-white/[0.07] bg-[#0b1020] px-6 py-24 md:px-10 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-violet-500/[0.08] blur-[110px]" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Your personal space"
          title="My movies"
          intro="Keep the stories you love close. Your favourites and recently viewed titles will live here when you create an account."
        />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
          className="glacier-panel mx-auto mt-14 grid max-w-5xl overflow-hidden rounded-3xl md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#29234c] via-[#202744] to-[#132b3c] p-8 md:p-10">
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div aria-hidden="true" className="absolute -right-5 -top-5 h-44 w-44 rounded-full border border-white/10" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-100">
                Glacier account
              </span>
              <h3 className="mt-8 max-w-xs font-serif text-4xl leading-tight text-white">
                Your watchlist, all in one place.
              </h3>
            </div>
            <p className="relative mt-8 max-w-xs text-sm leading-6 text-slate-200/75">
              Save films for later and pick up where your discovery journey left off.
            </p>
          </div>

          <div className="flex flex-col justify-center p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-400/10 text-[#b5a2ff]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M20.8 8.7c0 5.1-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.7A4.2 4.2 0 0111 6.2l1 1 1-1a4.2 4.2 0 017.8 2.5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Favourite movies & series</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">Build a personal collection of stories you want to remember.</p>
              </div>
            </div>

            <div className="my-7 h-px bg-white/10" />

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-[#62d6e8]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7v5l3.2 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Recently viewed</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">Find the titles you explored recently without searching again.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNotice(true)}
              className="glacier-focus mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#9270ff] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#a087ff]"
            >
              Sign in / Create account
              <span aria-hidden="true">↗</span>
            </button>
            {showNotice && (
              <p role="status" className="mt-4 text-xs leading-5 text-[#9ddfea]">
                Account sign-in is not connected yet. This is the next feature to build for Glacier.
              </p>
            )}
            <p className="mt-5 text-xs leading-5 text-slate-500">
              You can still explore recommendations without an account.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
