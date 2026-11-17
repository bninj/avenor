import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { builtParts, currentStage, overallPercent, stageProgress, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Mark } from '../components/Logo'
import { Avatar, Disclaimer, Screen, SectionTitle } from '../components/ui'
import { StageArt } from '../components/StageArt'
import { openTerm } from '../components/Terms'
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
  const term = glossary[new Date().getDate() % glossary.length]
  const nearby = pros.filter((p) => !stage.pro || p.type === stage.pro.type).slice(0, 3)

  return (
    <Screen>
      {/* Header */}
      <div className="px-5 pt-4 flex items-start justify-between">
        <div>
          <p className="t-small text-muted">{greeting()}, {profile?.name}</p>
          <h1 className="t-h1 mt-0.5">{pct}% of the way home</h1>
        </div>
        <button onClick={() => nav('/me')} aria-label="Your profile" className="shrink-0 ml-3 rounded-full ring-2 ring-white shadow-pill">
          <Avatar name={profile?.name ?? 'A'} size={44} tone="#F3E3B8" />
        </button>
      </div>

      {/* Ask pill: the one entry point, like a search bar */}
      <div className="px-5 mt-5">
        <button onClick={() => nav('/ask')} className="w-full min-h-14 rounded-full bg-white shadow-pill ring-1 ring-stone-200/70 flex items-center gap-3 px-5 text-left">
          <span className="text-gold-500"><Icon name="spark" size={20} /></span>
          <span className="flex-1 font-medium">Ask Avenor anything</span>
          
        </button>
      </div>

      {/* Next step */}
      <div className="px-5 mt-6">
        <motion.button whileTap={{ scale: 0.99 }} onClick={() => nav(`/journey/${stage.id}`)} className="w-full text-left rounded-[26px] bg-teal-800 text-white p-5 pr-3 flex gap-4 overflow-hidden relative">
          <div className="flex-1 min-w-0 flex flex-col">
            <p className="t-micro text-gold-300 mb-2">Next step, {stage.n} of 7</p>
            <h2 className="t-h2 mb-2">{stage.title}</h2>
            <p className="t-small text-white/75 mb-4">{stage.short}</p>
            <div className="mt-auto flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden">
                <motion.div className="h-full bg-gold-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${(prog.n / prog.total) * 100}%` }} transition={{ duration: 0.9, delay: 0.2 }} />
              </div>
              <span className="t-micro num text-white/80">{prog.n}/{prog.total}</span>
            </div>
          </div>
          <StageArt id={stage.id} className="w-[104px] shrink-0 self-end -mb-5" bg="#F6F0E3" />
        </motion.button>
      </div>

      {/* Your home */}
      <div className="px-5 mt-4">
        <button onClick={() => nav('/house')} className="w-full text-left rounded-[26px] bg-stone-50 ring-1 ring-stone-200 overflow-hidden flex items-stretch">
          <div className="p-5 flex-1 flex flex-col">
            <p className="t-h3 mb-1">Your home</p>
            <p className="t-small text-muted mb-3">Grows with every stage you finish.</p>
            <p className="t-small font-semibold text-teal-700 mt-auto inline-flex items-center gap-1">{parts.length} of 7 built <Icon name="right" size={16} /></p>
          </div>
          <div className="w-[150px] h-[150px] shrink-0">
            <Suspense fallback={null}><HouseCanvas parts={parts} className="h-full w-full" interactive={false} /></Suspense>
          </div>
        </button>
      </div>

      {/* Word of the day */}
      <div className="px-5 mt-4">
        <button onClick={() => openTerm(term.id)} className="w-full text-left rounded-[22px] ring-1 ring-stone-200 p-5 flex gap-4 items-start">
          <span className="size-10 shrink-0 rounded-xl bg-gold-100 text-gold-600 grid place-items-center"><Icon name="learn" size={20} /></span>
          <span className="flex-1">
            <span className="t-micro text-muted block mb-1">Word of the day</span>
            <span className="font-serif text-xl font-medium block mb-1">{term.word}</span>
            <span className="t-small text-muted line-clamp-2">{term.plain}</span>
          </span>
        </button>
      </div>

      {/* Areas */}
      <div className="mt-9">
        <SectionTitle action="Map" onAction={() => nav('/pros')}>Explore Birmingham</SectionTitle>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-5 snap-x snap-mandatory pb-1">
          {areas.map((a) => (
            <div key={a.id} className="snap-start shrink-0 w-[236px]">
              <div className="relative h-[176px] rounded-[20px] overflow-hidden bg-stone-100">
                <img src={a.img} alt={a.name} loading="lazy" className="h-full w-full object-cover" />
                {a.name === profile?.area && <span className="absolute left-3 top-3 rounded-full bg-white/95 t-micro px-3 py-1.5 shadow-pill">Your area</span>}
              </div>
              <div className="pt-2.5 flex justify-between gap-2">
                <p className="font-semibold">{a.name}, {a.district}</p>
                <p className="t-small num">{a.typical}</p>
              </div>
              <p className="t-small text-muted">{a.toCentre} to the centre</p>
            </div>
          ))}
        </div>
        <p className="px-5 mt-2 t-micro font-normal text-stone-400">Example prices for the demo.</p>
      </div>

      {/* Pros for this step */}
      {stage.pro && (
        <div className="mt-9">
          <SectionTitle action="See all" onAction={() => nav(`/pros?type=${stage.pro!.type}`)}>{proTypeLabel[stage.pro.type].many} near you</SectionTitle>
          <div className="px-5 space-y-2.5">
            {nearby.map((p) => (
              <button key={p.id} onClick={() => nav(`/pros?type=${p.type}&id=${p.id}`)} className="w-full text-left flex items-center gap-3.5 rounded-2xl p-3 ring-1 ring-stone-200 active:bg-stone-50">
                <Avatar name={p.person} tone={p.tone} size={48} />
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold truncate">{p.firm}</span>
                  <span className="t-small text-muted flex items-center gap-1.5"><Icon name="shield" size={15} className="text-teal-700" /> {p.register} checked, {p.area}</span>
                </span>
                <span className="t-small font-semibold num flex items-center gap-1"><Icon name="star" size={14} fill="currentColor" stroke={0} className="text-gold-500" />{p.rating}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Premium nudge, only for free users */}
      {plan === 'free' && (
        <div className="px-5 mt-9">
          <button onClick={() => nav('/premium')} className="w-full text-left rounded-[24px] bg-gold-100 p-5 flex items-center gap-4">
            <Mark size={40} />
            <span className="flex-1">
              <span className="block t-h3">Avenor Premium</span>
              <span className="t-small text-teal-900/75">Lessons, explainers and direct contact.</span>
            </span>
            <Icon name="right" />
          </button>
        </div>
      )}

      <Disclaimer className="px-5 mt-8" />
    </Screen>
  )
}
