import { motion } from 'framer-motion'
import SectionHeading from './SectionHeading'

export default function Visit() {
  return (
    <section id="visit" className="relative scroll-mt-0 overflow-hidden border-t border-white/[0.07] bg-[#0b1626] px-6 py-24 md:px-10 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-[#78d8ce]/[0.10] blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 h-[26rem] w-[26rem] rounded-full bg-[#f18f80]/[0.07] blur-[110px]" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading eyebrow="Your Glacier account" title="A home for your discoveries" intro="Create an account to get a more personal Glacier experience. You can explore the catalogue without signing in." />
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }}
          className="glacier-panel mx-auto mt-14 flex max-w-4xl flex-col items-start justify-between gap-8 rounded-3xl p-8 md:flex-row md:items-center md:p-12">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-[#78d8ce]/30 bg-[#78d8ce]/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c9f3ec]">Glacier account</span>
            <h3 className="mt-6 font-serif text-3xl leading-tight text-white md:text-4xl">Your next favourite story starts here.</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300/75">Sign up with your email and password. New accounts will confirm their email address before signing in.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3">
            <a href="/register" className="glacier-focus inline-flex justify-center rounded-full bg-[#a28dff] px-6 py-3.5 text-sm font-semibold text-[#101628] transition hover:-translate-y-0.5 hover:bg-[#b5a5ff]">Create account</a>
            <a href="/login" className="glacier-focus inline-flex justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-medium text-white transition hover:border-[#78d8ce]/60 hover:bg-white/[0.06]">Sign in</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
