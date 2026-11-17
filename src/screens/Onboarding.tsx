import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Button, Screen, toast } from '../components/ui'
import { demoProfile, randomProfile, useApp, type Profile } from '../store'
import { gbp } from '../data/rates'

const AREAS: [string, string][] = [
  ['Moseley', 'B13'], ['Harborne', 'B17'], ['Kings Heath', 'B14'], ['Bournville', 'B30'], ['Brindleyplace', 'B1'], ['Digbeth', 'B5'],
]
const WHEN = ['In the next 6 months', 'In 6 to 12 months', 'In the next year or two', 'Just exploring']
const STEPS = 5
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Onboarding({ demo = false }: { demo?: boolean }) {
  const nav = useNavigate()
  const { setProfile, startDemo, reset } = useApp()
  const [step, setStep] = useState(0)
  const [p, setP] = useState<Partial<Profile>>({})
  const [building, setBuilding] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null) // which control the demo is "touching"
  const cancelled = useRef(false)

  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }))
  const next = () => (step < STEPS - 1 ? setStep(step + 1) : finish())

  function finish(skipRest = false) {
    const filled = randomProfile(skipRest ? p : p)
    const answeredAll = ['name', 'firstTime', 'area', 'budget', 'when'].every((k) => k in p)
    const profile: Profile = { ...filled, ...p, randomised: !answeredAll } as Profile
    if (!demo) setProfile(profile)
    setBuilding(true)
  }

  // ── Self-playing demo: types and taps for you ──
  useEffect(() => {
    if (!demo) return
    cancelled.current = false
    reset()
    const run = async () => {
      await sleep(700)
      for (const ch of demoProfile.name) {
        if (cancelled.current) return
        setP((x) => ({ ...x, name: (x.name ?? '') + ch }))
        await sleep(110)
      }
      const tap = async (id: string, patch: Partial<Profile>, after = 650) => {
        if (cancelled.current) return
        await sleep(350); setCursor(id); await sleep(300)
        setP((x) => ({ ...x, ...patch })); await sleep(after); setCursor(null)
      }
      await tap('continue', {}, 250); setStep(1)
      await tap('first-yes', { firstTime: true }); setStep(2)
      await tap('area-Moseley', { area: 'Moseley', postcode: 'B13' }); setStep(3)
      await sleep(300); set({ budget: 190_000 }); await sleep(250); set({ budget: 210_000 }); await sleep(250)
      await tap('budget', { budget: demoProfile.budget, savings: demoProfile.savings }); setStep(4)
      await tap('when-0', { when: WHEN[0] }, 400)
      if (cancelled.current) return
      setBuilding(true)
    }
    run()
    return () => { cancelled.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo])

  const skipDemo = () => { cancelled.current = true; startDemo(demoProfile); nav('/home', { replace: true }) }

  if (building) return <Building name={p.name || 'there'} area={p.postcode || 'your area'} onDone={() => { if (demo) startDemo(demoProfile); nav('/home', { replace: true }) }} />

  const ring = (id: string) => (cursor === id ? 'ring-2 ring-gold-500 ring-offset-2' : '')

  return (
    <Screen tabbed={false} className="flex flex-col">
      <div className="px-4 pt-3 flex items-center gap-3 h-16">
        <button aria-label="Back" onClick={() => (step ? setStep(step - 1) : nav('/welcome'))} className="size-11 grid place-items-center rounded-full active:bg-stone-100">
          <Icon name="left" />
        </button>
        <div className="flex-1 flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS}`}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full bg-stone-200 overflow-hidden">
              <motion.div className="h-full bg-teal-800" initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
            </div>
          ))}
        </div>
        {demo ? (
          <button onClick={skipDemo} className="t-small font-semibold text-teal-700 min-h-11 px-2">Skip</button>
        ) : (
          <button onClick={() => (step === 0 ? finish(true) : next())} className="t-small font-semibold text-muted min-h-11 px-2">Skip</button>
        )}
      </div>

      {demo && (
        <div className="mx-6 mt-1 mb-2 self-start rounded-full bg-gold-100 text-gold-600 t-micro px-3 py-1.5 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-gold-500 animate-pulse" /> Demo is filling this in for you
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="flex-1 flex flex-col px-6 pt-4">
          {step === 0 && (
            <>
              <h1 className="t-h1 mb-2">Let’s make you a quick profile</h1>
              <p className="t-body text-muted mb-7">No password. It stays on this phone.</p>
              <label className="block rounded-2xl ring-1 ring-stone-200 focus-within:ring-2 focus-within:ring-teal-800 px-4 pt-2.5 pb-2">
                <span className="t-micro text-muted">First name</span>
                <input value={p.name ?? ''} onChange={(e) => set({ name: e.target.value })} readOnly={demo} placeholder="e.g. Amara" autoComplete="given-name" className="block w-full bg-transparent outline-none text-lg font-medium py-1" />
              </label>
              <div className="mt-auto pb-6 space-y-3">
                <div className={`rounded-2xl ${ring('continue')}`}><Button onClick={next} disabled={!p.name && !demo}>Continue</Button></div>
                <div className="flex items-center gap-3 text-muted t-micro font-normal py-1"><span className="h-px flex-1 bg-stone-200" />or<span className="h-px flex-1 bg-stone-200" /></div>
                <Button variant="ghost" onClick={() => toast('Google sign-in comes with the full app')}>
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
                  Continue with Google
                </Button>
                {!demo && <button onClick={() => finish(true)} className="w-full t-small font-semibold text-teal-700 min-h-11">Skip, fill it in for me</button>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="t-h1 mb-2">Is this your first home?</h1>
              <p className="t-body text-muted mb-7">First-time buyers pay less Stamp Duty.</p>
              <div className="space-y-3">
                {[{ v: true, t: 'Yes, my first home', d: 'I have never owned a home', id: 'first-yes' }, { v: false, t: 'No, I have owned before', d: 'I am buying again', id: 'first-no' }].map((o) => (
                  <Choice key={o.id} selected={p.firstTime === o.v} onClick={() => { set({ firstTime: o.v }); setTimeout(next, 220) }} className={ring(o.id)} title={o.t} desc={o.d} />
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="t-h1 mb-2">Where are you looking?</h1>
              <p className="t-body text-muted mb-6">We’ll show checked pros nearby.</p>
              <div className="flex flex-wrap gap-2.5">
                {AREAS.map(([a, pc]) => {
                  const sel = p.area === a
                  return (
                    <button key={a} onClick={() => set({ area: a, postcode: pc })} className={`min-h-12 rounded-full px-4 t-small font-medium transition-colors ${sel ? 'bg-teal-800 text-white' : 'bg-white ring-1 ring-inset ring-stone-200'} ${ring('area-' + a)}`}>
                      {a} <span className={sel ? 'text-white/60' : 'text-stone-400'}>{pc}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-auto pb-6"><Button onClick={next} disabled={!p.area}>Continue</Button></div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="t-h1 mb-2">Roughly what could you spend?</h1>
              <p className="t-body text-muted mb-8">A guess is fine.</p>
              <p className="t-display num text-center mb-1">{gbp(p.budget ?? 200_000)}</p>
              <p className="t-small text-muted text-center mb-6">home price</p>
              <input aria-label="Budget" type="range" min={100_000} max={450_000} step={5_000} value={p.budget ?? 200_000} onChange={(e) => set({ budget: +e.target.value })} className="w-full accent-teal-800 h-11" />
              <div className="flex justify-between t-micro text-muted"><span>£100k</span><span>£450k</span></div>
              <label className="mt-8 block rounded-2xl ring-1 ring-stone-200 px-4 pt-2.5 pb-2">
                <span className="t-micro text-muted">Savings so far (optional)</span>
                <input inputMode="numeric" value={p.savings ? p.savings.toLocaleString('en-GB') : ''} onChange={(e) => set({ savings: +e.target.value.replace(/\D/g, '') || undefined })} placeholder="£0" className="block w-full bg-transparent outline-none text-lg font-medium py-1 num" readOnly={demo} />
              </label>
              <div className={`mt-auto pb-6 rounded-2xl ${ring('budget')}`}><Button onClick={() => { if (!p.budget) set({ budget: 200_000 }); next() }}>Continue</Button></div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="t-h1 mb-2">When would you like to move?</h1>
              <p className="t-body text-muted mb-7">We’ll pace your plan.</p>
              <div className="space-y-3">
                {WHEN.map((w, i) => (
                  <Choice key={w} selected={p.when === w} onClick={() => { set({ when: w }); setTimeout(() => finish(), 250) }} className={ring('when-' + i)} title={w} />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Screen>
  )
}

function Choice({ title, desc, selected, onClick, className = '' }: { title: string; desc?: string; selected: boolean; onClick: () => void; className?: string }) {
  return (
    <motion.button whileTap={{ scale: 0.985 }} onClick={onClick} className={`w-full text-left rounded-2xl p-4 min-h-16 flex items-center gap-4 transition-colors ${selected ? 'ring-2 ring-teal-800 bg-teal-50' : 'ring-1 ring-stone-200'} ${className}`}>
      <span className="flex-1"><span className="block font-semibold">{title}</span>{desc && <span className="t-small text-muted">{desc}</span>}</span>
      <span className={`size-6 rounded-full grid place-items-center ${selected ? 'bg-teal-800 text-white' : 'ring-1 ring-stone-200'}`}>{selected && <Icon name="check" size={15} stroke={2.4} />}</span>
    </motion.button>
  )
}

// ── "Building your plan" moment ──
function Building({ name, area, onDone }: { name: string; area: string; onDone: () => void }) {
  const lines = ['Mapping your 7 stages', `Finding checked pros near ${area}`, 'Pouring your foundations']
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = [450, 1000, 1550].map((ms, i) => setTimeout(() => setN(i + 1), ms))
    const d = setTimeout(onDone, 2300)
    return () => { t.forEach(clearTimeout); clearTimeout(d) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Screen tabbed={false} className="flex flex-col justify-center px-8">
      <h1 className="t-h1 mb-8">Nice to meet you, {name}. Building your plan…</h1>
      <ul className="space-y-4">
        {lines.map((l, i) => (
          <li key={l} className="flex items-center gap-3 t-body">
            <span className={`size-7 rounded-full grid place-items-center transition-colors duration-300 ${n > i ? 'bg-teal-800 text-white' : 'bg-stone-100 text-transparent'}`}><Icon name="check" size={16} stroke={2.4} /></span>
            <span className={n > i ? '' : 'text-stone-400'}>{l}</span>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
