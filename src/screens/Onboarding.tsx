import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, type Variants } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Button, RollingNumber, tick, toast } from '../components/ui'
import { demoProfile, randomProfile, useApp, type Profile } from '../store'
import { gbp, rates, stampDuty } from '../data/rates'
import { areas } from '../data/areas'
import type { HousePart } from '../data/stages'

const HouseCanvas = lazy(() => import('../components/HouseCanvas'))
const PARTS: HousePart[] = ['foundation', 'walls', 'windows', 'door', 'roof']
const WHEN = ['In the next 6 months', 'In 6 to 12 months', 'In a year or two', 'Just exploring']
const STEPS = 5
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const k = (n: number) => `£${Math.round(n / 1000)}k`

// Content rises in as one short cascade; the old step steps back quickly
const cascade: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } }, exit: { opacity: 0, transition: { duration: 0.14 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 34 } } }

export default function Onboarding({ demo = false }: { demo?: boolean }) {
  const nav = useNavigate()
  const { setProfile, startDemo, reset } = useApp()
  const [step, setStep] = useState(0)
  const [answered, setAnswered] = useState(0) // pieces of the preview house
  const [p, setP] = useState<Partial<Profile>>({})
  const [plan, setPlan] = useState<Profile | null>(null)
  const [touch, setTouch] = useState<string | null>(null) // what the demo is "pressing"
  const stop = useRef(false)

  const set = (patch: Partial<Profile>) => setP((x) => ({ ...x, ...patch }))
  const advance = () => {
    setAnswered((a) => Math.max(a, step + 1))
    if (step < STEPS - 1) setStep(step + 1)
    else finish()
  }
  function finish(current = p) {
    const answeredAll = ['name', 'firstTime', 'area', 'budget', 'when'].every((k) => k in current)
    const profile = { ...randomProfile(current), ...current, randomised: !answeredAll } as Profile
    setAnswered(STEPS)
    setPlan(profile)
  }
  const go = () => {
    if (!plan) return
    if (demo) startDemo(plan)
    else setProfile(plan)
    nav('/home', { replace: true })
  }

  // ── Self-playing demo ──
  useEffect(() => {
    if (!demo) return
    stop.current = false
    reset()
    const run = async () => {
      await sleep(600)
      for (const ch of demoProfile.name) {
        if (stop.current) return
        setP((x) => ({ ...x, name: (x.name ?? '') + ch }))
        await sleep(95)
      }
      const press = async (id: string, patch: Partial<Profile>, next: number) => {
        if (stop.current) return
        await sleep(380); setTouch(id); await sleep(260)
        setP((x) => ({ ...x, ...patch })); await sleep(380)
        setTouch(null); setAnswered(next); setStep(Math.min(next, STEPS - 1))
      }
      await press('continue', {}, 1)
      await press('first-yes', { firstTime: true }, 2)
      await press('area-moseley', { area: 'Moseley', postcode: 'B13' }, 3)
      for (const b of [180_000, 200_000, 215_000]) { if (stop.current) return; await sleep(170); set({ budget: b }) }
      await press('budget', { budget: demoProfile.budget, savings: demoProfile.savings }, 4)
      await press('when-0', { when: WHEN[0] }, 5)
      if (stop.current) return
      setAnswered(5); setPlan(demoProfile)
      await sleep(3600)
      if (!stop.current) { startDemo(demoProfile); nav('/home', { replace: true }) }
    }
    run()
    return () => { stop.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo])

  const skipDemo = () => { stop.current = true; startDemo(demoProfile); nav('/home', { replace: true }) }
  const hot = (id: string) => (touch === id ? 'scale-[0.98] ring-2 ring-gold-500' : '')

  const chips = [
    answered >= 1 && p.name ? { key: 'name', text: p.name } : null,
    answered >= 2 && p.firstTime !== undefined ? { key: 'first', text: p.firstTime ? 'Yes, my first' : 'I’ve owned before' } : null,
    answered >= 3 && p.area ? { key: 'area', text: p.area } : null,
    answered >= 4 && p.budget ? { key: 'budget', text: k(p.budget) } : null,
  ].filter(Boolean) as { key: string; text: string }[]

  return (
    <LayoutGroup>
      {plan ? <PlanReveal plan={plan} onGo={go} demo={demo} /> : (
    <main className="screen-enter absolute inset-0 flex flex-col bg-white overflow-y-auto no-scrollbar">
      {/* Header: progress + the preview house that grows with each answer */}
      <div className="px-4 pt-2 flex items-center gap-2 h-14 shrink-0">
        <button aria-label="Back" onClick={() => (step ? setStep(step - 1) : nav('/welcome'))} className="size-11 grid place-items-center rounded-full active:bg-stone-100"><Icon name="left" /></button>
        <div className="flex-1 flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1} aria-label={`Question ${step + 1} of ${STEPS}`}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className="h-[5px] flex-1 rounded-full bg-stone-200 overflow-hidden">
              <motion.div className="h-full bg-teal-800" initial={false} animate={{ width: i < answered || i === step ? '100%' : '0%' }} transition={{ duration: 0.45 }} />
            </div>
          ))}
        </div>
        <button onClick={demo ? skipDemo : () => (step === 0 ? finish() : advance())} className="t-small font-semibold text-muted min-h-11 px-3">Skip</button>
      </div>

      <motion.div layoutId="plan-shell" style={{ borderRadius: 24 }} className="mx-5 h-[176px] shrink-0 spruce grain overflow-hidden relative">
        <Suspense fallback={null}><HouseCanvas parts={PARTS.slice(0, answered)} dark ghost interactive={false} zoom={0.92} className="absolute inset-0" /></Suspense>
        {/* Your answers collect here as you go */}
        <div className="absolute left-3 right-3 bottom-3 z-10 flex flex-wrap gap-1.5">
          {answered === 0 && <span className="t-micro text-teal-100/70 px-1">Your answers build this home</span>}
          {chips.map((c) => (
            <motion.span key={c.key} layoutId={`ans-${c.key}`} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="prism-edge rounded-full bg-white/12 backdrop-blur-md text-teal-50 t-micro font-semibold px-2.5 py-1 whitespace-nowrap">
              {c.text}
            </motion.span>
          ))}
        </div>
        {demo && <span className="absolute right-3 top-3 z-10 rounded-full bg-black/25 backdrop-blur t-micro text-teal-50 px-2.5 py-1 flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-gold-300 animate-pulse" />Demo</span>}
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.section key={step} variants={cascade} initial="hidden" animate="show" exit="exit" className="flex-1 flex flex-col px-6 pt-7">
          {step === 0 && (
            <>
              <motion.h1 variants={rise} className="t-h1">What should we call you?</motion.h1>
              <motion.input variants={rise}
                value={p.name ?? ''} onChange={(e) => set({ name: e.target.value })} readOnly={demo} placeholder="First name" autoComplete="given-name" aria-label="First name"
                className="mt-6 w-full bg-transparent outline-none text-[2.25rem] font-semibold tracking-[-0.03em] border-b-2 border-stone-200 focus:border-teal-800 pb-2 placeholder:text-stone-200"
              />
              <motion.p variants={rise} className="t-small text-muted mt-3">No password. It stays on this phone.</motion.p>
              <motion.div variants={rise} className="mt-auto pb-6 pt-6 space-y-2.5">
                <div className={`rounded-full transition ${hot('continue')}`}><Button onClick={advance} disabled={!p.name && !demo}>Continue</Button></div>
                <Button variant="ghost" onClick={() => toast('Google sign-in is coming soon. Your name is enough for now')}>
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
                  Continue with Google
                </Button>
                {!demo && <button onClick={() => finish()} className="w-full min-h-11 t-small font-semibold text-teal-700">Skip, fill it in for me</button>}
              </motion.div>
            </>
          )}

          {step === 1 && (
            <>
              <motion.h1 variants={rise} className="t-h1">Is this your first home?</motion.h1>
              <motion.p variants={rise} className="t-body text-muted mt-2">First-time buyers pay less Stamp Duty.</motion.p>
              <div className="grid grid-cols-2 gap-3 mt-7">
                {[{ v: true, t: 'Yes, my first', icon: 'key' as const, id: 'first-yes' }, { v: false, t: 'I’ve owned before', icon: 'refresh' as const, id: 'first-no' }].map((o) => {
                  const sel = p.firstTime === o.v
                  return (
                    <motion.button key={o.id} variants={rise} whileTap={{ scale: 0.97 }} onClick={() => { tick(); set({ firstTime: o.v }); setTimeout(advance, 260) }}
                      className={`h-[150px] rounded-[20px] p-4 flex flex-col justify-between text-left transition-[background,opacity,color] duration-200 ${sel ? 'bg-teal-800 text-teal-50 lift' : 'bg-stone-100'} ${p.firstTime !== undefined && !sel ? 'opacity-40' : ''} ${hot(o.id)}`}>
                      <span className={`size-11 rounded-full grid place-items-center ${sel ? 'bg-white/10' : 'bg-white'}`}><Icon name={o.icon} /></span>
                      <motion.span layoutId={sel ? 'ans-first' : undefined} className="t-h3 self-start">{o.t}</motion.span>
                    </motion.button>
                  )
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <motion.h1 variants={rise} className="t-h1">Where would you like to live?</motion.h1>
              <motion.p variants={rise} className="t-body text-muted mt-2">We’ll find checked pros nearby.</motion.p>
              <ul className="mt-5 -mx-2">
                {areas.map((a) => {
                  const sel = p.area === a.name
                  return (
                    <motion.li key={a.id} variants={rise}>
                      <button onClick={() => { tick(); set({ area: a.name, postcode: a.district }); setTimeout(advance, 260) }} className={`w-full flex items-center gap-4 rounded-[18px] p-2 pr-4 text-left transition-[background,opacity] duration-200 ${sel ? 'bg-teal-50' : 'active:bg-stone-50'} ${p.area && !sel ? 'opacity-40' : ''} ${hot('area-' + a.id)}`}>
                        <img src={a.img} alt="" className="size-14 rounded-[14px] object-cover" />
                        <span className="flex-1">
                          <motion.span layoutId={sel ? 'ans-area' : undefined} className="block t-h3 w-fit">{a.name}</motion.span>
                          <span className="t-small text-muted">{a.district}, {a.goodFor.split(',')[0].toLowerCase()}</span>
                        </span>
                        <span className={`size-6 rounded-full grid place-items-center ${sel ? 'bg-teal-800 text-white' : 'ring-[1.5px] ring-stone-200'}`}>{sel && <Icon name="check" size={14} stroke={2.6} />}</span>
                      </button>
                    </motion.li>
                  )
                })}
              </ul>
            </>
          )}

          {step === 3 && <Budget p={p} set={set} onNext={advance} hot={hot('budget')} />}

          {step === 4 && (
            <>
              <motion.h1 variants={rise} className="t-h1">When would you like to move?</motion.h1>
              <div className="mt-6 border-t border-stone-200">
                {WHEN.map((w, i) => (
                  <motion.button variants={rise} key={w} onClick={() => { tick(); const next = { ...p, when: w }; set({ when: w }); setTimeout(() => finish(next), 260) }} className={`w-full flex items-center justify-between py-5 border-b border-stone-200 text-left t-h3 font-medium transition ${p.when === w ? 'text-teal-800' : ''} ${hot('when-' + i)}`}>
                    {w}
                    <span className={`size-9 rounded-full grid place-items-center ${p.when === w ? 'bg-teal-800 text-white' : 'bg-stone-100 text-teal-800'}`}><Icon name="right" size={18} /></span>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </motion.section>
      </AnimatePresence>
    </main>
      )}
    </LayoutGroup>
  )
}

function Budget({ p, set, onNext, hot }: { p: Partial<Profile>; set: (x: Partial<Profile>) => void; onNext: () => void; hot: string }) {
  const budget = p.budget ?? 200_000
  const sd = stampDuty(budget, p.firstTime ?? true)
  const fill = ((budget - 100_000) / 350_000) * 100
  return (
    <>
      <motion.h1 variants={rise} className="t-h1">Roughly what could you spend?</motion.h1>
      <motion.p variants={rise} className="mt-7"><motion.span layoutId="ans-budget" className="inline-block text-[3.5rem] leading-none font-semibold tracking-[-0.04em]"><RollingNumber value={budget} format={gbp} /></motion.span></motion.p>
      <motion.input variants={rise} aria-label="Budget" type="range" min={100_000} max={450_000} step={5_000} value={budget} onChange={(e) => set({ budget: +e.target.value })} className="range mt-4" style={{ ['--fill' as string]: `${fill}%` }} />
      <motion.div variants={rise} className="flex justify-between t-micro text-muted"><span>£100k</span><span>£450k</span></motion.div>
      <motion.div variants={rise} className="mt-6 rounded-[18px] bg-stone-100 px-4 py-3.5 flex items-center justify-between">
        <span className="t-small text-muted">Stamp Duty at this price</span>
        <span className="font-semibold"><RollingNumber value={sd} format={gbp} /></span>
      </motion.div>
      <motion.div variants={rise} className={`mt-auto pb-6 pt-6 rounded-full ${hot}`}><Button onClick={() => { tick(); if (!p.budget) set({ budget }); onNext() }}>Continue</Button></motion.div>
    </>
  )
}

// ── The payoff: a personal plan in four numbers ──
function PlanReveal({ plan, onGo, demo }: { plan: Profile; onGo: () => void; demo: boolean }) {
  // Place the house once the card has finished growing, so it renders at full size
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 480); return () => clearTimeout(t) }, [])
  const deposit = Math.round(plan.budget * 0.1)
  const sd = stampDuty(plan.budget, plan.firstTime)
  const f = rates.typicalFees
  const upfront = deposit + sd + f.solicitor + f.searches + f.survey + f.mortgageFee + f.removals
  const rows: [string, React.ReactNode][] = [
    ['Deposit to aim for', <RollingNumber key="d" value={deposit} from={0} format={gbp} />],
    ['Stamp Duty', <RollingNumber key="s" value={sd} from={0} format={gbp} />],
    ['Cash on the day', <RollingNumber key="u" value={upfront} from={0} format={gbp} />],
    ['Looking in', `${plan.area}, ${plan.postcode}`],
    ['Your first step', 'Know your budget'],
  ]
  return (
    <motion.main layoutId="plan-shell" style={{ borderRadius: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 32 }} className="absolute inset-0 spruce grain flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar">
      <span className="prism-streak" aria-hidden="true" />
      <div className="relative h-[290px] shrink-0">
        {ready && <Suspense fallback={null}><HouseCanvas parts={['foundation', 'walls', 'windows', 'door', 'roof', 'chimney', 'garden']} dark zoom={0.98} className="absolute inset-0" /></Suspense>}
      </div>
      <div className="px-6 flex-1 flex flex-col">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="t-display">{plan.name}, here’s your plan.</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="t-body text-teal-100/75 mt-2">Seven stages. Each one adds a piece of this home.</motion.p>
        <dl className="mt-6 border-t border-white/10">
          {rows.map(([k, v], i) => (
            <motion.div key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="flex justify-between items-baseline py-3.5 border-b border-white/10">
              <dt className="t-small text-teal-100/70">{k}</dt>
              <dd className="t-h3 num">{v}</dd>
            </motion.div>
          ))}
        </dl>
        <div className="mt-auto pt-7 pb-6">
          <Button variant="light" onClick={onGo}>{demo ? 'Opening your plan…' : 'Start step 1'}</Button>
        </div>
      </div>
    </motion.main>
  )
}
