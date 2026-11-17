import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { useApp } from './store'
import { Logo } from './components/Logo'
import { Icon } from './components/Icon'
import { TabBar } from './components/TabBar'
import { Toaster } from './components/ui'
import { TermSheet } from './components/Terms'
import { Celebration } from './components/Celebration'
import Welcome from './screens/Welcome'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Journey from './screens/Journey'
import StageScreen from './screens/Stage'
import Learn from './screens/Learn'
import Money from './screens/Money'
import Premium from './screens/Premium'
import Ask from './screens/Ask'
import Selling from './screens/Selling'
import Me from './screens/Me'

const Pros = lazy(() => import('./screens/Pros'))
const House = lazy(() => import('./screens/House'))

const OPEN_ROUTES = ['/welcome', '/start', '/demo', '/selling']

function Guard({ children }: { children: React.ReactNode }) {
  const profile = useApp((s) => s.profile)
  const { pathname } = useLocation()
  if (!profile && !OPEN_ROUTES.includes(pathname)) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

function Loading() {
  return <div className="absolute inset-0 grid place-items-center text-muted t-small">Loading…</div>
}

function AppRoutes() {
  return (
    <Guard>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/start" element={<Onboarding />} />
          <Route path="/demo" element={<Onboarding demo />} />
          <Route path="/home" element={<Home />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/journey/:id" element={<StageScreen />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/money" element={<Money />} />
          <Route path="/pros" element={<Pros />} />
          <Route path="/house" element={<House />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/selling" element={<Selling />} />
          <Route path="/me" element={<Me />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      <TabBar />
      <TermSheet />
      <Celebration />
      <Toaster />
    </Guard>
  )
}

// ── Desktop presentation: phone frame + panel for judges ─────
function useDesktop() {
  const q = '(min-width: 900px) and (min-height: 700px)'
  const [d, setD] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setD(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return d
}

const DARK_TOP = (p: string) => ['/welcome', '/home', '/premium', '/house'].includes(p) || /^\/journey\/./.test(p)

function StatusBar() {
  const { pathname } = useLocation()
  const dark = DARK_TOP(pathname)
  return (
    <div className={`h-[50px] shrink-0 flex items-end justify-between px-8 pb-2 text-[15px] font-semibold relative z-30 transition-colors ${dark ? 'bg-[#164A45] text-teal-50' : 'bg-white text-teal-900'}`}>
      <span className="num">9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" /><path d="M23 4v4" stroke="currentColor" strokeWidth="1.5" opacity=".4" strokeLinecap="round" /></svg>
      </span>
    </div>
  )
}

function JudgePanel() {
  const [qr, setQr] = useState('')
  const reset = useApp((s) => s.reset)
  const demoUrl = `${location.origin}${location.pathname}#/demo`
  useEffect(() => {
    QRCode.toString(demoUrl, { type: 'svg', margin: 0, color: { dark: '#0B2B2A', light: '#00000000' }, errorCorrectionLevel: 'M' }).then(setQr)
  }, [demoUrl])
  return (
    <aside className="w-[360px] shrink-0 flex flex-col gap-8">
      <Logo size={34} />
      <div>
        <h1 className="text-[3.5rem] leading-[0.95] font-semibold tracking-[-0.04em] mb-4">From deposit<br />to doorstep.</h1>
        <p className="t-body text-muted">The first-time buyer’s guide, with checked local pros.</p>
      </div>
      <div className="flex items-center gap-5 rounded-[24px] bg-white p-5 shadow-float">
        <div className="size-[116px] shrink-0 p-2 rounded-xl bg-white ring-1 ring-stone-200" dangerouslySetInnerHTML={{ __html: qr }} />
        <div>
          <p className="t-h3 mb-1">Try it on your phone</p>
          <p className="t-small text-muted">Opens straight into the demo.</p>
        </div>
      </div>
      <div className="t-small text-muted">
        <p className="font-semibold text-teal-900 mb-2">Things to try</p>
        <ol className="space-y-1.5 list-decimal pl-5 marker:text-gold-600">
          <li>Finish stage 2 and watch your home build</li>
          <li>Tap any dotted word for a plain-English meaning</li>
          <li>Find a solicitor near Moseley on the map</li>
        </ol>
      </div>
      <button onClick={() => { reset(); location.hash = '#/demo' }} className="self-start inline-flex items-center gap-2 t-small font-semibold text-teal-700 min-h-11">
        <Icon name="refresh" size={18} /> Restart the demo
      </button>
    </aside>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  const desktop = useDesktop()
  if (!desktop) {
    return (
      <div className="fixed inset-0 bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div id="app-root" className="relative h-full w-full overflow-hidden" style={{ transform: 'translateZ(0)' }}>{children}</div>
      </div>
    )
  }
  return (
    <div className="min-h-full w-full bg-stone-100 grain grain-light flex items-center justify-center gap-24 px-12 py-10">
      <JudgePanel />
      <div className="relative shrink-0 rounded-[60px] bg-[#1b1f1e] p-[11px] shadow-[0_50px_100px_-30px_rgba(12,42,39,.5),0_0_0_1px_rgba(0,0,0,.9),inset_0_0_0_2px_#3a403e]">
        <div className="relative w-[390px] h-[844px] rounded-[49px] overflow-hidden bg-white flex flex-col">
          <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[122px] h-[35px] rounded-full bg-black z-40" />
          <StatusBar />
          <div id="app-root" className="relative flex-1 overflow-hidden" style={{ transform: 'translateZ(0)' }}>{children}</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-teal-900/80 z-[70] pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { document.querySelector('main')?.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollReset />
      <Frame>
        <AppRoutes />
      </Frame>
    </HashRouter>
  )
}
