import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { builtParts, currentStage, overallPercent, stageProgress, useApp } from '../store'
import { stages } from '../data/stages'
import { Icon, type IconName } from '../components/Icon'
import { Avatar, Disclaimer, RollingNumber, Screen } from '../components/ui'
import { openTerm } from '../components/Terms'
import { TaskRow } from '../components/TaskRow'
import { glossary } from '../data/glossary'
import { areas } from '../data/areas'
import { pros, proTypeLabel } from '../data/pros'

const HouseCanvas = lazy(() => import('../components/HouseCanvas'))

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Home() {
  const nav = useNavigate()
  const { profile, done, plan } = useApp()
  const stage = currentStage(done)
  const prog = stageProgress(done, stage.id)
  const parts = builtParts(done)
  const pct = overallPercent(done)
  const allDone = pct === 100
  const term = glossary[new Date().getDate() % glossary.length]
  const nearby = pros.filter((p) => !stage.pro || p.type === stage.pro.type).slice(0, 3)
  const left = prog.total - prog.n

  const actions: { label: string; icon: IconName; to: string; locked?: boolean }[] = [
    { label: 'Calculators', icon: 'calc', to: '/money' },
    { label: 'Find a pro', icon: 'pin', to: '/pros' },
    { label: 'Ask', icon: 'message', to: '/ask' },
    { label: 'Documents', icon: 'folder', to: plan === 'free' ? '/premium' : '/documents', locked: plan === 'free' },
  ]

  return (
    <Screen>
      {/* Greeting */}
      <header className="px-5 pt-4 flex items-center justify-between">
        <div>
          <p className="t-small text-muted">{greeting()}</p>
          <h1 className="t-h1">{profile?.name}</h1>
        </div>
        <button onClick={() => nav('/me')} aria-label="Your profile" className="size-11 grid place-items-center rounded-full">
          <Avatar name={profile?.name ?? 'A'} size={42} />
        </button>
      </header>

      {/* Your home: the model on its own, progress underneath */}
      <section className="px-5 mt-4">
        <button onClick={() => nav('/house')} aria-label="Open your 3D home" className="w-full text-left rounded-[28px] hero-light grain grain-light ring-1 ring-teal-800/[0.07] overflow-hidden relative">
          <span className="prism-streak" aria-hidden="true" />
          <div className="relative h-[232px]">
            <Suspense fallback={null}><HouseCanvas parts={parts} ghost interactive={false} zoom={1.08} className="absolute inset-0" /></Suspense>
            <span className="absolute right-4 top-4 rounded-full bg-white/85 backdrop-blur ring-1 ring-teal-900/[0.06] t-micro text-teal-800 px-3 py-1.5 flex items-center gap-1.5"><Icon name="rotate" size={13} /> View in 3D</span>
          </div>
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between gap-4">
              <p className="flex items-start leading-none">
                <span className="text-[3rem] font-bold tracking-[-0.04em] text-teal-800"><RollingNumber value={pct} from={0} /></span>
                <span className="text-[1.375rem] font-bold text-teal-800/60 mt-1 ml-0.5">%</span>
              </p>
              <p className="t-small text-muted text-right pb-1">{allDone ? 'Your home is built' : <>of your home built<br />Stage {stage.n} of 7</>}</p>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1" aria-hidden="true">
              {stages.map((s) => {
                const sp = stageProgress(done, s.id)
                return (
                  <span key={s.id} className="h-[6px] rounded-full bg-teal-800/10 overflow-hidden">
                    <motion.span className={`block h-full rounded-full ${sp.complete ? 'bg-gold-500' : 'bg-teal-700'}`} initial={false} animate={{ width: `${(sp.n / sp.total) * 100}%` }} transition={{ duration: 0.6 }} />
                  </span>
                )
              })}
            </div>
          </div>
        </button>
      </section>

      {/* Quick actions */}
      <nav className="px-5 mt-5 grid grid-cols-4 gap-2" aria-label="Quick actions">
        {actions.map((a) => (
          <button key={a.label} onClick={() => nav(a.to)} className="flex flex-col items-center gap-2 py-3 rounded-[18px] active:bg-stone-50">
            <span className="relative size-12 rounded-[16px] bg-teal-50 text-teal-800 grid place-items-center ring-1 ring-teal-800/[0.06]">
              <Icon name={a.icon} size={22} />
              {a.locked && <span className="absolute -right-1 -top-1 size-5 rounded-full bg-white ring-1 ring-stone-200 grid place-items-center text-teal-800"><Icon name="lock" size={11} stroke={2.2} /></span>}
            </span>
            <span className="t-micro text-teal-900">{a.label}</span>
          </button>
        ))}
      </nav>

      {/* Up next */}
      {!allDone && (
        <section className="px-5 mt-6">
          <div className="rounded-[24px] ring-1 ring-stone-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="t-small text-muted">Up next, stage {stage.n}</p>
                <h2 className="t-h2 mt-0.5">{stage.title}</h2>
                <p className="t-small text-muted mt-1">{left === 0 ? 'Stage done' : `${left} ${left === 1 ? 'step' : 'steps'} left. Finish them to add ${stage.reward}.`}</p>
              </div>
              <button onClick={() => nav(`/journey/${stage.id}`)} aria-label={`Open stage ${stage.n}`} className="size-11 shrink-0 rounded-full bg-teal-800 text-teal-50 grid place-items-center lift"><Icon name="right" size={20} /></button>
            </div>
            <ul className="mt-3 border-t border-stone-200 [&>li:last-child]:border-b-0">
              {stage.tasks.map((t) => <TaskRow key={t.id} t={t} size="sm" stageId={stage.id} />)}
            </ul>
          </div>
        </section>
      )}

      {/* Areas */}
      <section className="mt-9">
        <div className="px-5 flex items-end justify-between mb-3">
          <h2 className="t-h2">Explore Birmingham</h2>
          <button onClick={() => nav('/pros')} className="t-small font-semibold text-teal-700 min-h-11">See map</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory" tabIndex={0} role="region" aria-label="Birmingham areas">
          {areas.map((a) => (
            <div key={a.id} className="snap-start shrink-0 w-[200px]">
              <div className="relative h-[150px] rounded-[18px] overflow-hidden bg-stone-100">
                <img src={a.img} alt={a.name} loading="lazy" className="photo h-full w-full object-cover" />
                {a.name === profile?.area && <span className="absolute left-2.5 top-2.5 rounded-full bg-white t-micro text-teal-800 px-2.5 py-1">Your area</span>}
              </div>
              <p className="t-h3 mt-2.5">{a.name}</p>
              <p className="t-small text-muted num">Flats from {a.flat}, {a.toCentre} to town</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pros near you */}
      {stage.pro && (
        <section className="mt-9 px-5">
          <div className="flex items-end justify-between mb-1">
            <h2 className="t-h2">{proTypeLabel[stage.pro.type].many} near {profile?.postcode}</h2>
            <button onClick={() => nav(`/pros?type=${stage.pro!.type}`)} className="t-small font-semibold text-teal-700 min-h-11">See all</button>
          </div>
          <ul>
            {nearby.map((p) => (
              <li key={p.id} className="border-b border-stone-200 last:border-0">
                <button onClick={() => nav(`/pros?type=${p.type}&id=${p.id}`)} className="w-full text-left flex items-center gap-3.5 py-3.5">
                  <Avatar name={p.person} size={44} />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{p.firm}</span>
                    <span className="t-small text-muted flex items-center gap-1"><Icon name="shield" size={14} className="text-teal-700" />{p.register} registered</span>
                  </span>
                  <span className="t-small font-semibold num flex items-center gap-1"><Icon name="star" size={13} fill="currentColor" stroke={0} className="text-gold-500" />{p.rating}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Word of the day */}
      <section className="px-5 mt-8">
        <button onClick={() => openTerm(term.id)} className="w-full text-left rounded-[20px] bg-teal-50 ring-1 ring-teal-800/10 p-5">
          <span className="t-small text-muted">Word of the day</span>
          <span className="block t-h2 mt-1">{term.word}</span>
          <span className="block t-body text-teal-900/75 mt-1.5">{term.plain}</span>
        </button>
      </section>

      {plan === 'free' && (
        <section className="px-5 mt-4">
          <button onClick={() => nav('/premium')} className="w-full text-left rounded-[20px] bg-teal-800 text-teal-50 p-5 flex items-center gap-4 lift">
            <span className="flex-1">
              <span className="block t-h3 text-teal-50">Sovarna Premium</span>
              <span className="t-small text-teal-50/75">Compare homes, keep your documents in one place.</span>
            </span>
            <span className="rounded-full bg-white text-teal-900 t-small font-semibold px-4 py-2.5">Try free</span>
          </button>
        </section>
      )}

      <Disclaimer className="px-5 mt-8" />
    </Screen>
  )
}
