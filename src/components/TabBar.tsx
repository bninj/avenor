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
    <nav className="absolute inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 14px)' }} aria-label="Main">
      <ul className="flex">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink to={t.to} className={({ isActive }) => `relative flex flex-col items-center gap-1 pt-2.5 pb-1 min-h-14 t-micro ${isActive ? 'text-teal-800' : 'text-stone-400'}`}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="tab-dot" className="absolute top-0 h-[3px] w-7 rounded-b-full bg-gold-500" />}
                  <Icon name={t.icon} size={24} stroke={isActive ? 2 : 1.7} />
                  <span className={isActive ? 'font-semibold' : 'font-medium'}>{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
