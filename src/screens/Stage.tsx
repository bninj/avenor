import { motion, AnimatePresence } from 'motion/react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { stageById, stages } from '../data/stages'
import { proTypeLabel } from '../data/pros'
import { stageProgress, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Disclaimer, IconButton, Screen, tick } from '../components/ui'
import { TermChip, TermText } from '../components/Terms'

export default function StageScreen() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { done, toggleTask, profile, plan } = useApp()
  const s = stageById[id]
  if (!s) return <Navigate to="/journey" replace />
  const prog = stageProgress(done, s.id)
  const next = stages[s.n]
  const prev = stages[s.n - 2]

  return (
    <Screen tabbed={false} className="!pb-0">
      <header className="spruce grain px-5 pt-3 pb-9">
        <div className="flex items-center justify-between">
          <IconButton name="left" label="Back to journey" onClick={() => nav('/journey')} className="!bg-white/10 !text-teal-50 !shadow-none backdrop-blur" />
          <span className="t-small text-teal-100/70 num">{s.n} of 7</span>
        </div>
        <div className="mt-6 flex items-end gap-4">
          <span className="text-[6.5rem] leading-[0.78] font-semibold tracking-[-0.04em] text-gold-300 num">{s.n}</span>
          <h1 className="t-display pb-1 flex-1">{s.title}</h1>
        </div>
        <p className="t-body text-teal-100/80 mt-5">{s.short}</p>
        <div className="mt-5 flex gap-6 t-small">
          <span><span className="text-teal-100/60">Takes </span>{s.weeks}</span>
          <span><span className="text-teal-100/60">Costs </span>{s.cost}</span>
        </div>
      </header>

      <div className="relative -mt-5 rounded-t-[30px] bg-white pt-7 pb-12 z-10">
        {/* The short version */}
        <section className="px-6">
          <h2 className="t-h2 mb-4">The short version</h2>
          <ol className="space-y-4">
            {s.points.map((pt, i) => (
              <li key={pt} className="flex gap-4">
                <span className="t-small font-semibold text-gold-600 num pt-0.5 w-3">{i + 1}</span>
                <TermText text={pt} className="t-body flex-1" />
              </li>
            ))}
          </ol>
          <p className="mt-6 t-small text-teal-800 bg-teal-50 rounded-[14px] px-4 py-3">{s.watch}</p>
        </section>

        {/* Checklist */}
        <section className="px-6 mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="t-h2">Checklist</h2>
            <span className="t-small text-muted num">{prog.n} of {prog.total}</span>
          </div>
          <ul className="mt-2 border-t border-stone-200">
            {s.tasks.map((t) => {
              const on = !!done[t.id]
              return (
                <li key={t.id} className="border-b border-stone-200">
                  <button onClick={() => { if (!on) tick(); toggleTask(t.id) }} aria-pressed={on} className="w-full text-left flex items-center gap-4 py-4 min-h-[60px]">
                    <span className={`size-7 shrink-0 rounded-full grid place-items-center transition-colors ${on ? 'bg-teal-800 text-white' : 'ring-[1.5px] ring-stone-400/60'}`}>
                      <AnimatePresence>{on && <motion.span initial={{ scale: 0.3 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Icon name="check" size={16} stroke={2.6} /></motion.span>}</AnimatePresence>
                    </span>
                    <span className="flex-1">
                      <span className={`block font-medium ${on ? 'text-stone-400 line-through' : ''}`}>{t.label}</span>
                      {t.hint && !on && <span className="t-small text-muted">{t.hint}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 t-small text-muted">Finish to add <b className="font-semibold text-teal-900">{s.partLabel.toLowerCase()}</b> to your home.</p>
        </section>

        {s.pro && (
          <section className="px-6 mt-10">
            <button onClick={() => nav(`/pros?type=${s.pro!.type}`)} className="w-full text-left rounded-[20px] bg-stone-100 grain grain-light p-5 flex items-center gap-4">
              <span className="flex-1">
                <span className="block t-h3">{s.pro.cta}</span>
                <span className="t-small text-muted">{proTypeLabel[s.pro.type].register} checked, near {profile?.postcode ?? 'you'}</span>
              </span>
              <span className="size-11 rounded-full bg-teal-800 text-teal-50 grid place-items-center lift"><Icon name="right" size={20} /></span>
            </button>
          </section>
        )}

        <section className="px-6 mt-10">
          <h2 className="t-h2 mb-3">Words you’ll hear</h2>
          <div className="flex flex-wrap gap-2">{s.terms.map((t) => <TermChip key={t} id={t} />)}</div>
        </section>

        <section className="px-6 mt-10">
          <h2 className="t-h2 mb-1">Official sources</h2>
          <ul>
            {s.links.map((l) => (
              <li key={l.url} className="border-b border-stone-200 last:border-0">
                <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-4 min-h-14">
                  <span className="flex-1"><span className="block font-medium">{l.label}</span><span className="t-small text-muted">{l.site}</span></span>
                  <Icon name="external" size={18} className="text-muted" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-6 mt-8">
          <button onClick={() => nav('/premium')} className="w-full text-left rounded-[20px] spruce grain p-5 flex items-center gap-4">
            <span className="flex-1">
              <span className="t-small text-gold-300 block">{plan === 'free' ? 'With Premium' : 'In your plan'}</span>
              <span className="block t-h3 mt-0.5">{s.premiumTip}</span>
            </span>
            <Icon name={plan === 'free' ? 'lock' : 'right'} size={20} />
          </button>
        </section>

        <nav className="px-6 mt-10 flex justify-between">
          {prev ? <button onClick={() => nav(`/journey/${prev.id}`)} className="min-h-12 flex items-center gap-1.5 t-small font-semibold text-muted"><Icon name="left" size={18} />{prev.n}. {prev.title}</button> : <span />}
          {next && <button onClick={() => nav(`/journey/${next.id}`)} className="min-h-12 flex items-center gap-1.5 t-small font-semibold text-teal-800">{next.n}. Next<Icon name="right" size={18} /></button>}
        </nav>

        <Disclaimer className="px-6 mt-6" />
      </div>
    </Screen>
  )
}
