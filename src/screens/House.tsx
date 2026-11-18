import { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import HouseCanvas from '../components/HouseCanvas'
import { stages } from '../data/stages'
import { builtParts, currentStage, stageProgress, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Button, IconButton, Screen, toast, useBack } from '../components/ui'

export default function House() {
  const nav = useNavigate()
  const goBack = useBack()
  const done = useApp((s) => s.done)
  const parts = builtParts(done)
  const finished = parts.length === 7
  const next = currentStage(done)

  return (
    <Screen tabbed={false} className="!pb-0">
      <section className="hero-light grain grain-light relative h-[470px]">
        <div className="absolute left-4 top-3 z-10"><IconButton name="left" label="Back" tone="light" onClick={goBack} /></div>
        <Suspense fallback={null}><HouseCanvas parts={parts} ghost zoom={0.82} className="absolute inset-x-0 top-0 bottom-24" /></Suspense>
        <div className="absolute left-6 right-6 bottom-12 pointer-events-none">
          <p className="t-small text-muted flex items-center gap-1.5"><Icon name="rotate" size={14} /> Drag to turn</p>
          <h1 className="t-display mt-2">{finished ? 'Your home is built.' : `${parts.length} of 7 built`}</h1>
        </div>
      </section>

      <div className="relative -mt-6 rounded-t-[30px] bg-white pt-6 pb-10 z-10">
      <p className="px-6 t-body text-muted">{finished ? 'Time to collect the real keys.' : 'Finish a stage to add the next piece.'}</p>
      <ul className="px-6 mt-4">
        {stages.map((s) => {
          const p = stageProgress(done, s.id)
          return (
            <li key={s.id}>
              <button onClick={() => nav(`/journey/${s.id}`)} className="w-full flex items-center gap-4 py-3 text-left">
                <span className={`size-9 shrink-0 rounded-full grid place-items-center ${p.complete ? 'brass' : 'bg-stone-100 text-stone-400'}`}>
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
      <div className="mx-6 mt-6 rounded-[24px] bg-stone-100 grain grain-light p-6">
        <p className="t-small text-gold-600 font-semibold mb-1">The finishing touch</p>
        <h2 className="t-h2 mb-2">A 3D model of your home</h2>
        <p className="t-small text-muted mb-5">Premium: a small model of your home when you get the keys. Concierge: a personalised welcome box with a larger model, sent to your new address.</p>
        {finished ? (
          <Button variant="gold" onClick={() => toast('Ordered. We’ll post it to your new address')}>Order my shelf model</Button>
        ) : (
          <Button onClick={() => nav(`/journey/${next.id}`)}>Continue stage {next.n}</Button>
        )}
      </div>
      </div>
    </Screen>
  )
}
