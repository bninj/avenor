import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { stages } from '../data/stages'
import { currentStage, overallPercent, stageProgress, useApp } from '../store'
import { Mark } from './Logo'
import { Icon } from './Icon'

const GlassLogo = lazy(() => import('./GlassLogo'))

/* Laptop / projector presentation. One idea: Gurpreet's logo as a glass prism,
   splitting light behind the phone, with frosted glass panels either side. */

const PHONE_W = 412
const PHONE_H = 866

function usePhoneScale() {
  const fit = () => Math.min(1, (window.innerHeight - 56) / PHONE_H)
  const [s, setS] = useState(fit)
  useEffect(() => {
    const on = () => setS(fit())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return s
}

function JourneyPanel() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { done, profile, reset } = useApp()
  const current = currentStage(done)
  const pct = overallPercent(done)
  return (
    <div className="glass grain rounded-[28px] p-6 w-[340px]">
      <div className="flex items-end justify-between">
        <p className="t-small text-teal-100/70">{profile ? `${profile.name}’s journey` : 'The journey'}</p>
        <p className="num text-[2rem] leading-none font-semibold tracking-[-0.04em]">{pct}<span className="text-gold-300 text-[1.1rem] align-top ml-0.5">%</span></p>
      </div>
      <div className="mt-3 h-[3px] rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full bg-gold-300" initial={false} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 24 }} />
      </div>
      <ol className="mt-4">
        {stages.map((s) => {
          const p = stageProgress(done, s.id)
          const isNow = !!profile && s.id === current.id && !p.complete
          const here = pathname === `/journey/${s.id}`
          return (
            <li key={s.id}>
              <button
                onClick={() => profile && nav(`/journey/${s.id}`)}
                disabled={!profile}
                className={`group w-full flex items-center gap-3 rounded-[14px] px-3 py-[min(9px,1.1vh)] text-left transition-colors disabled:cursor-default ${isNow ? 'bg-white/10 ring-1 ring-white/15' : 'hover:bg-white/5'}`}
              >
                <span className={`num w-4 t-small font-semibold ${p.complete ? 'text-gold-300' : isNow ? 'text-teal-50' : 'text-teal-100/35'}`}>{s.n}</span>
                <span className={`desk-row flex-1 font-semibold tracking-[-0.015em] ${isNow ? 'text-teal-50' : p.complete ? 'text-teal-100/80' : 'text-teal-100/45 group-hover:text-teal-100/75'}`}>{s.title}</span>
                {p.complete && <Icon name="check" size={15} stroke={2.4} className="text-gold-300" />}
                {isNow && <span className="t-micro num text-teal-100/80">{p.n}/{p.total}</span>}
                {here && !isNow && <span className="size-1.5 rounded-full bg-gold-300" />}
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <p className="t-micro font-normal text-teal-100/60 max-w-[22ch]">{profile ? 'Updates live as you tick tasks on the phone.' : 'Press Get started on the phone.'}</p>
        <button onClick={() => { reset(); location.hash = '#/demo' }} className="min-h-10 rounded-full px-3.5 inline-flex items-center gap-1.5 t-small font-semibold text-teal-50 bg-white/10 hover:bg-white/15 transition-colors">
          <Icon name="refresh" size={15} /> Restart
        </button>
      </div>
    </div>
  )
}

function ScanCard() {
  const [qr, setQr] = useState('')
  const demoUrl = `${location.origin}${location.pathname}#/demo`
  useEffect(() => {
    QRCode.toString(demoUrl, { type: 'svg', margin: 0, color: { dark: '#0C2A27', light: '#00000000' }, errorCorrectionLevel: 'M' }).then(setQr)
  }, [demoUrl])
  return (
    <div className="glass grain rounded-[26px] p-3 pr-6 inline-flex self-start items-center gap-5">
      <div className="rounded-[18px] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(12,42,39,.06)]">
        <div className="desk-qr" dangerouslySetInnerHTML={{ __html: qr }} />
      </div>
      <div>
        <p className="t-h3">Try it on your phone</p>
        <p className="t-small text-teal-100/65 mt-1">Point your camera here.<br />It opens straight into the demo.</p>
      </div>
    </div>
  )
}

export function DesktopStage({ children, statusBar }: { children: React.ReactNode; statusBar: React.ReactNode }) {
  const scale = usePhoneScale()
  return (
    <div className="desk-stage grain relative min-h-full w-full overflow-hidden text-teal-50">
      <div className="relative z-10 h-[100vh] px-[4vw] grid grid-cols-[minmax(300px,0.9fr)_minmax(320px,1fr)_auto] items-center gap-[3vw]">
        {/* Left: the story */}
        <section className="flex flex-col gap-[min(2.25rem,4vh)] max-w-[440px]">
          <div className="flex items-center gap-2">
            <Mark size={34} tone="light" />
            <span className="text-[1.375rem] font-semibold tracking-[-0.035em]">avenor</span>
          </div>
          <h1 className="text-[clamp(2.75rem,min(4.6vw,8.4vh),4.75rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
            From deposit<br />to doorstep.
          </h1>
          <p className="t-body text-teal-100/70 max-w-[32ch]">A first-time buyer’s guide to every step of buying a home, with checked local professionals.</p>
          <ScanCard />
        </section>

        {/* Centre: the glass logo, with the live journey frosted over its base */}
        <section className="relative h-full flex flex-col items-center justify-end pb-[6vh]">
          <Suspense fallback={null}>
            <GlassLogo className="absolute left-1/2 top-[2vh] -translate-x-1/2 w-[150%] h-[78vh]" />
          </Suspense>
          <div className="relative"><JourneyPanel /></div>
        </section>

        {/* Right: the phone, lit from below */}
        <section className="relative h-full flex justify-center items-center">
          <div aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 bottom-[4%] w-[420px] h-[110px] rounded-[50%] bg-gold-500/25 blur-[60px]" />
          <div style={{ width: PHONE_W * scale, height: PHONE_H * scale }} className="relative">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} className="absolute left-0 top-0">
              <div className="phone-shell relative rounded-[62px] p-[11px]">
                <span className="absolute -left-[3px] top-[150px] h-[34px] w-[3px] rounded-l bg-[#2a302e]" />
                <span className="absolute -left-[3px] top-[205px] h-[62px] w-[3px] rounded-l bg-[#2a302e]" />
                <span className="absolute -left-[3px] top-[280px] h-[62px] w-[3px] rounded-l bg-[#2a302e]" />
                <span className="absolute -right-[3px] top-[230px] h-[96px] w-[3px] rounded-r bg-[#2a302e]" />
                <div className="relative w-[390px] h-[844px] rounded-[51px] overflow-hidden bg-white text-teal-900 flex flex-col">
                  <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[122px] h-[35px] rounded-full bg-black z-40" />
                  {statusBar}
                  <div id="app-root" className="relative flex-1 overflow-hidden" style={{ transform: 'translateZ(0)' }}>{children}</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-teal-900/80 z-[70] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
