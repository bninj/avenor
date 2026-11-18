import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { stages } from '../data/stages'
import { builtParts, currentStage, stageProgress, useApp } from '../store'
import { Button, Sheet } from './ui'

const HouseCanvas = lazy(() => import('./HouseCanvas'))

/** Watches progress anywhere in the app. When a stage is finished, the house grows. */
export function Celebration() {
  const nav = useNavigate()
  const { done, celebrated, markCelebrated } = useApp()
  const complete = stages.filter((s) => stageProgress(done, s.id).complete).map((s) => s.id).join(',')
  const prev = useRef(complete)
  const [stageId, setStageId] = useState<string | null>(null)
  const { pathname } = useLocation()
  useEffect(() => { setStageId(null) }, [pathname])

  useEffect(() => {
    const before = new Set(prev.current.split(','))
    prev.current = complete
    const fresh = complete.split(',').find((id) => id && !before.has(id) && !celebrated[id])
    if (!fresh) return
    markCelebrated(fresh)
    if (navigator.vibrate) navigator.vibrate([12, 40, 18])
    const t = setTimeout(() => setStageId(fresh), 380)
    return () => clearTimeout(t)
  }, [complete]) // eslint-disable-line react-hooks/exhaustive-deps

  const s = stages.find((x) => x.id === stageId)
  const allDone = stages.every((x) => stageProgress(done, x.id).complete)
  const next = s && !allDone ? currentStage(done) : undefined
  const parts = builtParts(done)
  const close = () => setStageId(null)

  return (
    <Sheet open={!!s} onClose={close} label="Stage complete" tall dark>
      {s && (
        <div className="pb-8">
          <div className="hero-light grain grain-light h-[300px] relative overflow-hidden">
            <span className="prism-streak" aria-hidden="true" />
            <Suspense fallback={null}><HouseCanvas parts={parts} ghost zoom={1.0} className="absolute inset-0" /></Suspense>
          </div>
          <div className="px-6 pt-6">
            <p className="t-small text-gold-600 font-semibold">Stage {s.n} complete</p>
            <h2 className="t-display mt-1">{s.partLabel}.</h2>
            <p className="t-body text-muted mt-2">{!next ? 'All seven stages done. Congratulations, it’s yours.' : `${parts.length} of 7 built. Next: ${next.title.toLowerCase()}.`}</p>
            <div className="mt-6 space-y-1">
              {next ? (
                <Button onClick={() => { close(); nav(`/journey/${next.id}`) }}>Start stage {next.n}</Button>
              ) : (
                <Button variant="gold" onClick={() => { close(); nav('/house') }}>See your finished home</Button>
              )}
              <button onClick={() => { close(); nav('/house') }} className="w-full min-h-12 t-small font-semibold text-teal-700">Turn it around in 3D</button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  )
}
