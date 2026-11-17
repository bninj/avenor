import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { stageById, stages } from '../data/stages'
import { proTypeLabel } from '../data/pros'
import { builtParts, stageProgress, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Button, Disclaimer, Screen, Sheet, TopBar } from '../components/ui'
import { StageArt } from '../components/StageArt'
import { TermChip, TermText } from '../components/Terms'

const HouseCanvas = lazy(() => import('../components/HouseCanvas'))

export default function StageScreen() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { done, toggleTask, celebrated, markCelebrated, profile, plan } = useApp()
  const s = stageById[id]
  const [celebrate, setCelebrate] = useState(false)
  const prog = s ? stageProgress(done, s.id) : null
  const complete = prog?.complete ?? false
  const prevRef = useRef({ id, complete })

  // Celebrate only when this stage flips from not-complete to complete while you watch
  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = { id, complete }
    if (prev.id !== id) { setCelebrate(false); return }
    if (!prev.complete && complete && !celebrated[id]) {
      markCelebrated(id)
      const t = setTimeout(() => setCelebrate(true), 450)
      return () => clearTimeout(t)
    }
  }, [id, complete]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!s || !prog) return <Navigate to="/journey" replace />
  const next = stages[s.n] // n is 1-based
  const prev = stages[s.n - 2]
  const parts = builtParts(done)

  return (
    <Screen tabbed={false}>
      <TopBar back="/journey" transparent right={<span className="t-small text-muted num pr-2">{s.n} / 7</span>} />

      {/* Header */}
      <div className="px-6 pt-1 flex gap-4 items-end">
        <div className="flex-1">
          <p className="t-micro text-gold-600 mb-2">Stage {s.n}</p>
          <h1 className="t-h1 mb-2">{s.title}</h1>
          <p className="t-body text-muted">{s.short}</p>
        </div>
        <StageArt id={s.id} done={prog.complete} className="w-[92px] shrink-0" />
      </div>

      <div className="px-6 mt-5 grid grid-cols-2 gap-2.5">
        <Fact icon="clock" label="Usually takes" value={s.weeks} />
        <Fact icon="money" label="Typical cost" value={s.cost} />
      </div>

      {/* Plain English */}
      <section className="px-6 mt-8">
        <h2 className="t-h2 mb-4">The short version</h2>
        <ul className="space-y-3.5">
          {s.points.map((pt) => (
            <li key={pt} className="flex gap-3.5 items-baseline">
              <span className="size-1.5 shrink-0 rounded-full bg-gold-500 translate-y-[-3px]" />
              <TermText text={pt} className="t-body" />
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-2xl bg-gold-100/70 px-4 py-3.5 t-small flex gap-2.5 items-center">
          <span className="text-gold-600"><Icon name="spark" size={17} /></span>{s.watch}
        </p>
      </section>

      {/* Checklist */}
      <section className="px-6 mt-9">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="t-h2">Your checklist</h2>
          <span className="t-small text-muted num">{prog.n} of {prog.total}</span>
        </div>
        <ul className="rounded-[22px] ring-1 ring-stone-200 divide-y divide-stone-200 overflow-hidden">
          {s.tasks.map((t) => {
            const on = !!done[t.id]
            return (
              <li key={t.id}>
                <button onClick={() => toggleTask(t.id)} className="w-full text-left flex items-center gap-4 px-4 py-3.5 min-h-[64px] active:bg-stone-50" aria-pressed={on}>
                  <span className={`size-7 shrink-0 rounded-full grid place-items-center transition-colors duration-200 ${on ? 'bg-teal-800 text-white' : 'ring-[1.5px] ring-stone-400/70'}`}>
                    <AnimatePresence>{on && <motion.span initial={{ scale: 0.3 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Icon name="check" size={16} stroke={2.6} /></motion.span>}</AnimatePresence>
                  </span>
                  <span className="flex-1">
                    <span className={`block font-medium transition-colors ${on ? 'text-muted line-through decoration-stone-400' : ''}`}>{t.label}</span>
                    {t.hint && <span className="t-small text-muted">{t.hint}</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 t-small text-muted flex items-center gap-2"><Icon name="door" size={16} /> Unlocks: <b className="font-semibold text-teal-900">{s.partLabel.toLowerCase()}</b></p>
      </section>

      {/* Professional */}
      {s.pro && (
        <section className="px-6 mt-9">
          <button onClick={() => nav(`/pros?type=${s.pro!.type}`)} className="w-full text-left rounded-[22px] bg-teal-800 text-white p-5 flex items-center gap-4">
            <span className="size-12 rounded-2xl bg-white/10 grid place-items-center"><Icon name="pin" /></span>
            <span className="flex-1">
              <span className="block font-semibold">{s.pro.cta}</span>
              <span className="t-small text-white/70">{proTypeLabel[s.pro.type].register} checked, near {profile?.postcode ?? 'you'}</span>
            </span>
            <Icon name="right" />
          </button>
        </section>
      )}

      {/* Words */}
      <section className="px-6 mt-9">
        <h2 className="t-h2 mb-3">Words you’ll hear</h2>
        <div className="flex flex-wrap gap-2">{s.terms.map((t) => <TermChip key={t} id={t} />)}</div>
      </section>

      {/* Trusted links */}
      <section className="px-6 mt-9">
        <h2 className="t-h2 mb-3">Official sources</h2>
        <ul className="space-y-2">
          {s.links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl ring-1 ring-stone-200 p-4 min-h-14 active:bg-stone-50">
                <span className="flex-1"><span className="block font-medium">{l.label}</span><span className="t-small text-muted">{l.site}</span></span>
                <Icon name="external" size={18} className="text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Premium extra */}
      <section className="px-6 mt-9">
        <button onClick={() => nav('/premium')} className="w-full text-left rounded-[22px] ring-1 ring-gold-300 bg-gold-100/40 p-5 flex gap-4 items-start">
          <span className={`size-10 shrink-0 rounded-xl grid place-items-center ${plan === 'free' ? 'bg-gold-500 text-white' : 'bg-teal-800 text-white'}`}><Icon name={plan === 'free' ? 'lock' : 'spark'} size={18} /></span>
          <span className="flex-1">
            <span className="t-micro text-gold-600 block mb-1">{plan === 'free' ? 'Premium' : 'Included in your plan'}</span>
            <span className="block font-medium">{s.premiumTip}</span>
          </span>
        </button>
      </section>

      {/* Prev / next */}
      <nav className="px-6 mt-9 grid grid-cols-2 gap-3">
        {prev ? <Button variant="ghost" onClick={() => nav(`/journey/${prev.id}`)}>Stage {prev.n}</Button> : <span />}
        {next && <Button variant="quiet" onClick={() => nav(`/journey/${next.id}`)}>Stage {next.n}</Button>}
      </nav>

      <Disclaimer className="px-6 mt-8" />

      {/* Celebration: the house grows */}
      <Sheet open={celebrate} onClose={() => setCelebrate(false)} label="Stage complete" tall>
        <div className="px-6 pb-8 text-center">
          <div className="h-[260px] -mx-6 bg-[radial-gradient(ellipse_at_center,var(--color-gold-100),white_70%)]">
            <Suspense fallback={null}><HouseCanvas parts={parts} className="h-full w-full" /></Suspense>
          </div>
          <p className="t-micro text-gold-600 mt-2 mb-2">Stage {s.n} complete</p>
          <h2 className="t-h1 mb-2">{s.partLabel}</h2>
          <p className="t-body text-muted mb-6">
            {s.n === 7 ? 'Congratulations. It’s yours.' : `${parts.length} of 7 built. Next: ${next?.title.toLowerCase()}.`}
          </p>
          {next ? (
            <Button onClick={() => { setCelebrate(false); nav(`/journey/${next.id}`) }}>Start stage {next.n}</Button>
          ) : (
            <Button variant="gold" onClick={() => { setCelebrate(false); nav('/house') }}>See your finished home</Button>
          )}
          <button onClick={() => { setCelebrate(false); nav('/house') }} className="mt-2 w-full min-h-12 t-small font-semibold text-teal-700">View your home in 3D</button>
        </div>
      </Sheet>
    </Screen>
  )
}

function Fact({ icon, label, value }: { icon: 'clock' | 'money'; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3.5">
      <p className="t-micro text-muted flex items-center gap-1.5 mb-1"><Icon name={icon} size={14} /> {label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
