import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { builtParts, currentStage, overallPercent, stageProgress, useApp } from '../store'
import { stages } from '../data/stages'
import { Icon } from '../components/Icon'
import { Mark } from '../components/Logo'
import { Avatar, Disclaimer, Screen, tick } from '../components/ui'
import { openTerm } from '../components/Terms'
import { glossary } from '../data/glossary'
import { areas } from '../data/areas'
import { pros, proTypeLabel } from '../data/pros'

const HouseCanvas = lazy(() => import('../components/HouseCanvas'))

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening'
}

export default function Home() {
  const nav = useNavigate()
  const { profile, done, toggleTask, plan } = useApp()
  const stage = currentStage(done)
  const prog = stageProgress(done, stage.id)
  const parts = builtParts(done)
  const pct = overallPercent(done)
  const term = glossary[new Date().getDate() % glossary.length]
  const nearby = pros.filter((p) => !stage.pro || p.type === stage.pro.type).slice(0, 3)

  return (
    <Screen className="!pb-0">
      {/* Hero: the house is the brand */}
      <section className="spruce grain relative h-[452px]">
        <div className="px-5 pt-4 flex items-center justify-between">
          <span className="t-small text-teal-100/75">{greeting()}, {profile?.name}</span>
          <button onClick={() => nav('/me')} aria-label="Your profile" className="rounded-full ring-1 ring-white/20">
            <Avatar name={profile?.name ?? 'A'} size={38} tone="#E2C48A" />
          </button>
        </div>
        <div className="px-5 mt-4">
          <p className="t-hero">{pct}<span className="text-[2.5rem] tracking-[-0.02em] align-top ml-1 text-teal-100/70">%</span></p>
          <p className="t-h3 font-medium text-teal-100/80 mt-2">of your home built</p>
        </div>
        <button onClick={() => nav('/house')} aria-label="Open your 3D home" className="absolute right-[-28px] bottom-[34px] w-[300px] h-[300px]">
          <Suspense fallback={null}><HouseCanvas parts={parts} dark ghost interactive={false} zoom={1.05} className="h-full w-full" /></Suspense>
        </button>
        <div className="absolute left-5 bottom-[52px] flex flex-col gap-2">
          <span className="t-micro text-teal-100/70">Stage {stage.n} of 7</span>
          <div className="flex gap-1">
            {stages.map((s) => (
              <span key={s.id} className={`h-[5px] w-4 rounded-full ${stageProgress(done, s.id).complete ? 'bg-gold-500' : s.id === stage.id ? 'bg-teal-100/70' : 'bg-white/15'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Sheet */}
      <section className="relative -mt-7 rounded-t-[30px] bg-white pt-6 pb-28 z-10">
        <div className="px-5">
          <p className="t-small text-muted">Up next</p>
          <button onClick={() => nav(`/journey/${stage.id}`)} className="w-full flex items-center gap-4 text-left mt-1">
            <h2 className="t-h1 flex-1">{stage.title}</h2>
            <span className="size-[52px] shrink-0 rounded-full bg-teal-800 text-teal-50 grid place-items-center lift"><Icon name="right" /></span>
          </button>

          <ul className="mt-4 border-t border-stone-200">
            {stage.tasks.map((t) => {
              const on = !!done[t.id]
              return (
                <li key={t.id} className="border-b border-stone-200">
                  <button onClick={() => { if (!on) tick(); toggleTask(t.id) }} aria-pressed={on} className="w-full flex items-center gap-3.5 py-3.5 text-left min-h-14">
                    <span className={`size-6 shrink-0 rounded-full grid place-items-center transition-colors ${on ? 'bg-teal-800 text-white' : 'ring-[1.5px] ring-stone-400/60'}`}>
                      {on && <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }}><Icon name="check" size={14} stroke={2.8} /></motion.span>}
                    </span>
                    <span className={`flex-1 font-medium ${on ? 'text-stone-400 line-through' : ''}`}>{t.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {prog.complete && (
            <button onClick={() => nav(`/journey/${stage.id}`)} className="mt-3 t-small font-semibold text-teal-700">Stage done. See what you’ve built</button>
          )}
        </div>

        {/* Ask */}
        <div className="px-5 mt-7">
          <button onClick={() => nav('/ask')} className="w-full min-h-14 rounded-full bg-stone-100 flex items-center gap-3 px-5 text-left">
            <Mark size={22} />
            <span className="flex-1 font-medium text-teal-900/80">Ask anything about buying</span>
            <Icon name="send" size={18} className="text-muted rotate-90" />
          </button>
        </div>

        {/* Areas */}
        <div className="mt-10">
          <div className="px-5 flex items-end justify-between mb-3">
            <h2 className="t-h2">Explore Birmingham</h2>
            <button onClick={() => nav('/pros')} className="t-small font-semibold text-teal-700 min-h-11">Map</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory">
            {areas.map((a) => (
              <div key={a.id} className="snap-start shrink-0 w-[220px]">
                <div className="relative h-[260px] rounded-[20px] overflow-hidden bg-stone-100">
                  <img src={a.img} alt={a.name} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
                  {a.name === profile?.area && <span className="absolute left-3 top-3 rounded-full bg-white t-micro px-2.5 py-1">Your area</span>}
                  <div className="absolute left-4 bottom-3.5 right-4 text-white">
                    <p className="t-h3">{a.name}</p>
                    <p className="t-small text-white/80 num">From {a.flat}, {a.toCentre} to town</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pros */}
        {stage.pro && (
          <div className="mt-10 px-5">
            <div className="flex items-end justify-between mb-1">
              <h2 className="t-h2">{proTypeLabel[stage.pro.type].many} near {profile?.postcode}</h2>
              <button onClick={() => nav(`/pros?type=${stage.pro!.type}`)} className="t-small font-semibold text-teal-700 min-h-11">All</button>
            </div>
            <ul>
              {nearby.map((p) => (
                <li key={p.id} className="border-b border-stone-200 last:border-0">
                  <button onClick={() => nav(`/pros?type=${p.type}&id=${p.id}`)} className="w-full text-left flex items-center gap-3.5 py-3.5">
                    <Avatar name={p.person} tone={p.tone} size={46} />
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold truncate">{p.firm}</span>
                      <span className="t-small text-muted flex items-center gap-1"><Icon name="shield" size={14} className="text-teal-700" />{p.register} checked</span>
                    </span>
                    <span className="t-small font-semibold num flex items-center gap-1"><Icon name="star" size={13} fill="currentColor" stroke={0} className="text-gold-500" />{p.rating}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Word of the day */}
        <div className="px-5 mt-10">
          <button onClick={() => openTerm(term.id)} className="w-full text-left rounded-[20px] bg-stone-100 p-5">
            <span className="t-small text-muted">Word of the day</span>
            <span className="block t-h1 mt-1.5">{term.word}</span>
            <span className="block t-body text-teal-900/75 mt-2">{term.plain}</span>
          </button>
        </div>

        {plan === 'free' && (
          <div className="px-5 mt-4">
            <button onClick={() => nav('/premium')} className="w-full text-left rounded-[20px] spruce grain p-5 flex items-center gap-4">
              <span className="flex-1">
                <span className="block t-h3">Avenor Premium</span>
                <span className="t-small text-teal-100/75">Every lesson, every contact.</span>
              </span>
              <span className="rounded-full brass lift-brass t-small font-semibold px-4 py-2.5">Try free</span>
            </button>
          </div>
        )}

        <Disclaimer className="px-5 mt-8" />
      </section>
    </Screen>
  )
}
