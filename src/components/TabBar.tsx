import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Icon, type IconName } from './Icon'

const tabs: { to: string; label: string; icon: IconName }[] = [
  { to: '/home', label: 'Home', icon: 'home' },
  { to: '/journey', label: 'Journey', icon: 'journey' },
  { to: '/learn', label: 'Learn', icon: 'learn' },
  { to: '/money', label: 'Money', icon: 'money' },
  { to: '/pros', label: 'Pros', icon: 'pin' },
]
const SHOW_ON = ['/home', '/journey', '/learn', '/money', '/pros']

export function TabBar() {
  const { pathname } = useLocation()
  if (!SHOW_ON.includes(pathname)) return null
  return (
    <nav className="absolute inset-x-3 z-40" style={{ bottom: 'max(env(safe-area-inset-bottom), 10px)' }} aria-label="Main">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-3 -bottom-4 h-[118px] bg-gradient-to-t from-white via-white/85 to-transparent" />
      <ul className="relative flex rounded-[26px] bg-white/80 backdrop-blur-xl backdrop-saturate-150 ring-1 ring-teal-900/[0.06] shadow-[0_12px_32px_-12px_rgba(12,42,39,.35),inset_0_1px_0_rgba(255,255,255,.9)] p-1.5">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink to={t.to} className={({ isActive }) => `relative flex flex-col items-center justify-center gap-0.5 h-[54px] rounded-[20px] t-micro transition-colors ${isActive ? 'text-teal-800' : 'text-stone-400 active:text-teal-700'}`}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="tab-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} className="absolute inset-0 rounded-[20px] bg-teal-50 ring-1 ring-teal-900/[0.04]" />}
                  <span className="relative"><Icon name={t.icon} size={23} stroke={isActive ? 2 : 1.7} /></span>
                  <span className={`relative ${isActive ? 'font-semibold' : 'font-medium'}`}>{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
