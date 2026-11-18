import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { stages } from '../data/stages'
import { currentStage, stageProgress, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Screen } from '../components/ui'

export default function Journey() {
  const nav = useNavigate()
  const done = useApp((s) => s.done)
  const current = currentStage(done)
  const finished = stages.filter((s) => stageProgress(done, s.id).complete).length

  return (
    <Screen>
      <div className="px-5 pt-6 pb-5">
        <h1 className="t-display">Your journey</h1>
        <p className="t-body text-muted mt-2">{finished} of 7 stages done. About 6 to 12 months in all.</p>
      </div>

      <ol className="px-3">
        {stages.map((s) => {
          const p = stageProgress(done, s.id)
          const isCurrent = s.id === current.id && !p.complete
          if (isCurrent) {
            return (
              <li key={s.id} className="my-2">
                <motion.button whileTap={{ scale: 0.99 }} onClick={() => nav(`/journey/${s.id}`)} className="w-full text-left spruce grain rounded-[24px] p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-[3.5rem] leading-[0.8] font-semibold tracking-[-0.04em] text-gold-300 num w-11">{s.n}</span>
                    <span className="flex-1">
                      <span className="t-small text-teal-100/70">Now</span>
                      <span className="block t-h2 mt-0.5">{s.title}</span>
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-[5px] flex-1 rounded-full bg-white/15 overflow-hidden">
                      <motion.div className="h-full bg-gold-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${(p.n / p.total) * 100}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <span className="t-small num text-teal-100/80">{p.n}/{p.total}</span>
                    <span className="size-10 rounded-full bg-teal-50 text-teal-900 grid place-items-center"><Icon name="right" size={18} /></span>
                  </div>
                </motion.button>
              </li>
            )
          }
          return (
            <li key={s.id}>
              <button onClick={() => nav(`/journey/${s.id}`)} className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-[18px] active:bg-stone-50">
                <span className={`text-[2rem] leading-none font-semibold tracking-[-0.04em] num w-11 ${p.complete ? 'text-gold-500' : 'text-stone-400/55'}`}>{s.n}</span>
                <span className="flex-1">
                  <span className={`block t-h3 ${p.complete ? '' : 'text-teal-900/75'}`}>{s.title}</span>
                  <span className="t-small text-muted">{p.complete ? s.partLabel : s.weeks}</span>
                </span>
                {p.complete ? (
                  <span className="size-7 rounded-full brass grid place-items-center"><Icon name="check" size={15} stroke={2.6} /></span>
                ) : (
                  <Icon name="right" size={18} className="text-stone-400" />
                )}
              </button>
            </li>
          )
        })}
      </ol>

      <button onClick={() => nav('/house')} className="mx-5 mt-6 w-[calc(100%-2.5rem)] min-h-14 rounded-full bg-stone-100 flex items-center justify-center gap-2 t-small font-semibold text-teal-800">
        <Icon name="rotate" size={18} /> See your home in 3D
      </button>
    </Screen>
  )
}
