import { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import HouseCanvas from '../components/HouseCanvas'
import { stages } from '../data/stages'
import { builtParts, currentStage, stageProgress, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Button, Screen, TopBar, toast } from '../components/ui'

export default function House() {
  const nav = useNavigate()
  const done = useApp((s) => s.done)
  const parts = builtParts(done)
  const finished = parts.length === 7
  const next = currentStage(done)

  return (
    <Screen tabbed={false}>
      <TopBar back transparent title="Your home" />
      <div className="relative h-[380px] -mt-16 bg-[radial-gradient(ellipse_at_50%_60%,#F7EED6_0%,#FFFFFF_68%)]">
        <Suspense fallback={null}><HouseCanvas parts={parts} className="absolute inset-0 pt-10" /></Suspense>
        <p className="absolute bottom-3 inset-x-0 text-center t-micro text-muted flex items-center justify-center gap-1.5 pointer-events-none"><Icon name="rotate" size={14} /> Drag to turn</p>
      </div>

      <div className="px-6 pt-4">
        <h1 className="t-h1">{finished ? 'Your home is built.' : `${parts.length} of 7 built`}</h1>
        <p className="t-body text-muted mt-2">
          {finished ? 'Time to collect the real keys.' : 'Finish a stage, add a piece.'}
        </p>
      </div>

      <ul className="px-6 mt-6 space-y-1">
        {stages.map((s) => {
          const p = stageProgress(done, s.id)
          return (
            <li key={s.id}>
              <button onClick={() => nav(`/journey/${s.id}`)} className="w-full flex items-center gap-4 py-3 text-left">
                <span className={`size-9 shrink-0 rounded-full grid place-items-center ${p.complete ? 'bg-gold-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  {p.complete ? <Icon name="check" size={17} stroke={2.4} /> : <span className="t-micro num">{s.n}</span>}
                </span>
                <span className="flex-1">
                  <span className={`block font-semibold ${p.complete ? '' : 'text-teal-900/60'}`}>{s.partLabel}</span>
                  <span className="t-small text-muted">{p.complete ? `Earned in stage ${s.n}` : `Finish “${s.title.toLowerCase()}”`}</span>
                </span>
                <Icon name="right" size={18} className="text-stone-400" />
              </button>
            </li>
          )
        })}
      </ul>

      {/* The shelf model: the physical reward */}
      <div className="mx-6 mt-6 rounded-[24px] bg-teal-800 text-white p-6">
        <p className="t-micro text-gold-300 mb-2">The finishing touch</p>
        <h2 className="t-h2 mb-2">A model of your home, for your shelf</h2>
        <p className="t-small text-white/75 mb-5">Get your keys and we 3D print this house, posted to your new address.</p>
        {finished ? (
          <Button variant="gold" onClick={() => toast('Shelf model ordering arrives in the full app')}>Order my shelf model</Button>
        ) : (
          <Button variant="gold" onClick={() => nav(`/journey/${next.id}`)}>Continue stage {next.n}</Button>
        )}
      </div>
    </Screen>
  )
}
