import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { stages } from '../data/stages'
import { currentStage, stageProgress, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Ring, Screen } from '../components/ui'
import { StageArt } from '../components/StageArt'

export default function Journey() {
  const nav = useNavigate()
  const done = useApp((s) => s.done)
  const current = currentStage(done)
  const finished = stages.filter((s) => stageProgress(done, s.id).complete).length

  return (
    <Screen>
      <div className="px-5 pt-4 pb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="t-display">Your journey</h1>
          <p className="t-body text-muted mt-2">Savings to front door, in seven stages.</p>
        </div>
        <Ring value={(finished / 7) * 100} size={64}>
          <span className="num font-semibold leading-none text-center">{finished}<span className="text-muted font-normal t-micro">/7</span></span>
        </Ring>
      </div>

      <ol className="px-5 relative">
        {stages.map((s, i) => {
          const p = stageProgress(done, s.id)
          const isCurrent = s.id === current.id && !p.complete
          const next = stages[i + 1]
          const nextDone = next && stageProgress(done, next.id).n > 0
          return (
            <li key={s.id} className="relative">
              {/* connector */}
              {next && (
                <span className={`absolute left-[39px] top-[92px] bottom-[-6px] w-[2px] ${p.complete && (nextDone || stageProgress(done, next.id).complete || next.id === current.id) ? 'bg-gold-500' : 'bg-[repeating-linear-gradient(to_bottom,var(--color-stone-200)_0_6px,transparent_6px_12px)]'}`} />
              )}
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => nav(`/journey/${s.id}`)}
                className={`relative w-full text-left flex gap-4 items-center rounded-[24px] p-3 mb-3 ${isCurrent ? 'bg-white shadow-float ring-1 ring-teal-800/10' : ''}`}
              >
                <div className="relative shrink-0 w-[56px]">
                  <StageArt id={s.id} done={p.complete} className="w-[56px]" />
                  {p.complete && (
                    <span className="absolute -right-1 -bottom-1 size-6 rounded-full bg-gold-500 text-white grid place-items-center ring-2 ring-white"><Icon name="check" size={14} stroke={2.6} /></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-micro text-muted mb-0.5">Stage {s.n}</p>
                  <p className={`t-h3 ${!p.complete && !isCurrent ? 'text-teal-900/70' : ''}`}>{s.title}</p>
                  <p className="t-small text-muted mt-0.5">
                    {p.complete ? 'Done' : isCurrent ? `${p.n} of ${p.total} tasks done` : s.weeks}
                  </p>
                  {isCurrent && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-800 text-white t-small font-semibold px-4 min-h-10">
                      {p.n ? 'Continue' : 'Start'} <Icon name="right" size={16} />
                    </span>
                  )}
                </div>
                {!isCurrent && <Icon name="right" size={18} className="text-stone-400" />}
              </motion.button>
            </li>
          )
        })}
      </ol>

      <div className="mx-5 mt-4 rounded-[22px] bg-stone-50 p-5 flex items-center gap-4">
        <span className="size-11 rounded-xl bg-white grid place-items-center text-teal-800 shadow-pill"><Icon name="door" /></span>
        <p className="t-small text-muted flex-1">Every stage you finish adds a piece to <button onClick={() => nav('/house')} className="font-semibold text-teal-800 underline underline-offset-4 decoration-gold-500">your 3D home</button>.</p>
      </div>
    </Screen>
  )
}
