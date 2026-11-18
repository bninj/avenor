import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { faq, privacy } from '../data/faq'
import { rates } from '../data/rates'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Mark } from '../components/Logo'
import { Button, Disclaimer, Screen, Sheet, TopBar } from '../components/ui'

export default function Help() {
  const nav = useNavigate()
  const reset = useApp((s) => s.reset)
  const [open, setOpen] = useState<number | null>(0)
  const [confirm, setConfirm] = useState(false)

  return (
    <Screen tabbed={false}>
      <TopBar back title="Help" />
      <div className="px-6 pt-2">
        <h1 className="t-display">Questions, answered.</h1>
        <p className="t-body text-muted mt-2">Short answers to what people ask most.</p>
      </div>

      {/* FAQ: one open at a time */}
      <ul className="px-4 mt-6" aria-label="Frequently asked questions">
        {faq.map((f, i) => {
          const on = open === i
          return (
            <li key={f.q} className={`rounded-[20px] transition-colors ${on ? 'bg-teal-50' : ''}`}>
              <button onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="w-full flex items-center gap-4 px-3 py-4 text-left min-h-14">
                <span className={`num t-small font-semibold w-5 ${on ? 'text-gold-600' : 'text-stone-400'}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 t-h3 font-semibold">{f.q}</span>
                <motion.span animate={{ rotate: on ? 45 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }} className={`size-8 shrink-0 rounded-full grid place-items-center ${on ? 'bg-teal-800 text-teal-50' : 'bg-stone-100 text-teal-800'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M7 2v10M2 7h10" /></svg>
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }} className="overflow-hidden">
                    <p className="t-body text-teal-900/80 pl-12 pr-5 pb-5">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>

      {/* Privacy */}
      <section className="px-6 mt-10">
        <h2 className="t-h2">Your privacy</h2>
        <ul className="mt-3 space-y-3">
          {privacy.map((p) => (
            <li key={p} className="flex gap-3 t-body"><span className="text-teal-700 mt-1"><Icon name="shield" size={18} /></span>{p}</li>
          ))}
        </ul>
        <button onClick={() => setConfirm(true)} className="mt-5 min-h-12 rounded-full px-5 ring-1 ring-inset ring-danger/30 text-danger t-small font-semibold">Delete my data</button>
      </section>

      {/* About */}
      <section className="mx-6 mt-10 rounded-[24px] hero-light grain grain-light p-6 overflow-hidden">
        <span className="prism-streak" aria-hidden="true" />
        <Mark size={36} />
        <h2 className="t-h2 mt-3">About Sovarna</h2>
        <p className="t-body text-muted mt-2">A plain-English guide to buying your first home, step by step, with checked local professionals when you need one. Made in Birmingham.</p>
        <p className="t-small text-muted mt-4">Stamp Duty rates from <a className="underline underline-offset-2" href={rates.source} target="_blank" rel="noreferrer">GOV.UK</a>, checked {rates.checked}. Photos from Wikimedia Commons.</p>
      </section>

      <div className="px-6 mt-6 space-y-2">
        <Button variant="quiet" icon="message" onClick={() => nav('/ask')}>Still stuck? Ask Sovarna</Button>
      </div>
      <Disclaimer className="px-6 mt-6" />

      <Sheet open={confirm} onClose={() => setConfirm(false)} label="Delete my data">
        <div className="px-6 pb-8 pt-2">
          <h2 className="t-h1 pr-8">Delete everything?</h2>
          <p className="t-body text-muted mt-2">Your name, answers, progress and saved professionals will be removed from this phone. This cannot be undone.</p>
          <div className="mt-6 space-y-2">
            <button onClick={() => { reset(); setConfirm(false); nav('/welcome', { replace: true }) }} className="w-full min-h-[56px] rounded-full bg-danger text-white font-semibold">Delete my data</button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Keep it</Button>
          </div>
        </div>
      </Sheet>
    </Screen>
  )
}
