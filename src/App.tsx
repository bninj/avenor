import { Component, lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './store'
import { DesktopStage } from './components/DesktopStage'
import { Mark } from './components/Logo'
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
import Help from './screens/Help'

const Pros = lazy(() => import('./screens/Pros'))
const House = lazy(() => import('./screens/House'))

const OPEN_ROUTES = ['/welcome', '/start', '/demo', '/selling', '/help']

function Guard({ children }: { children: React.ReactNode }) {
  const profile = useApp((s) => s.profile)
  const { pathname } = useLocation()
  if (!profile && !OPEN_ROUTES.includes(pathname)) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

// Remount the demo each time it is opened, so Restart always plays it from the start
function DemoRoute() {
  const loc = useLocation()
  return <Onboarding demo key={loc.key} />
}

/** If anything ever crashes, show a calm way home instead of a blank screen */
class SafeArea extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="absolute inset-0 spruce grain flex flex-col items-center justify-center text-center px-8 gap-4">
        <Mark size={44} tone="light" />
        <h1 className="t-h1">Something went wrong.</h1>
        <p className="t-body text-teal-100/75">It’s not you. Your progress is safe.</p>
        <button onClick={() => { this.setState({ failed: false }); location.hash = '#/home' }} className="mt-2 min-h-[52px] rounded-full bg-teal-50 text-teal-900 font-semibold px-7">Back to home</button>
      </div>
    )
  }
}

function Loading() {
  return <div className="absolute inset-0 grid place-items-center" role="status" aria-label="Loading"><span className="animate-pulse"><Mark size={34} /></span></div>
}

function AppRoutes() {
  return (
    <Guard>
      <SafeArea>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/start" element={<Onboarding />} />
          <Route path="/demo" element={<DemoRoute />} />
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
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
      </SafeArea>
      <TabBar />
      <TermSheet />
      <Celebration />
      <Toaster />
    </Guard>
  )
}

// ── Desktop presentation: phone frame + panel for judges ─────
function useDesktop() {
  const q = '(min-width: 900px) and (min-height: 480px)'
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

function Frame({ children }: { children: React.ReactNode }) {
  const desktop = useDesktop()
  if (!desktop) {
    return (
      <div className="fixed inset-0 bg-white" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div id="app-root" className="relative h-full w-full overflow-hidden" style={{ transform: 'translateZ(0)' }}>{children}</div>
      </div>
    )
  }
  return <DesktopStage statusBar={<StatusBar />}>{children}</DesktopStage>
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
