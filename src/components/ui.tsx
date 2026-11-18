import { AnimatePresence, motion, useDragControls, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { create } from 'zustand'
import { Icon, type IconName } from './Icon'

/** Go back inside the app; if the page was opened straight from a link, go to a sensible parent. */
export function useBack(fallback = '/home') {
  const nav = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) nav(-1)
    else nav(fallback, { replace: true })
  }
}

// ── Buttons ───────────────────────────────────
type Variant = 'primary' | 'gold' | 'ghost' | 'quiet' | 'light'
const variants: Record<Variant, string> = {
  primary: 'bg-teal-800 text-teal-50 lift active:bg-teal-900',
  gold: 'brass lift-brass active:brightness-95',
  ghost: 'bg-white text-teal-900 ring-1 ring-inset ring-stone-200 active:bg-stone-50',
  quiet: 'bg-stone-100 text-teal-800 active:bg-stone-200',
  light: 'bg-teal-50 text-teal-900 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_10px_24px_-10px_rgba(0,0,0,.5)] active:bg-white',
}

export function Button({
  children, onClick, variant = 'primary', className = '', icon, disabled, type = 'button',
}: { children: React.ReactNode; onClick?: () => void; variant?: Variant; className?: string; icon?: IconName; disabled?: boolean; type?: 'button' | 'submit' }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.975 }}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-[56px] w-full rounded-full px-6 text-[1.0625rem] font-semibold tracking-[-0.01em] transition-[background,filter] disabled:opacity-40 inline-flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={20} />}
      {children}
    </motion.button>
  )
}

export function IconButton({ name, onClick, label, className = '', tone = 'light' }: { name: IconName; onClick?: () => void; label: string; className?: string; tone?: 'light' | 'dark' }) {
  const look = tone === 'dark'
    ? 'bg-white/12 text-teal-50 ring-1 ring-white/15'
    : 'bg-white/90 text-teal-900 ring-1 ring-teal-900/[0.07] shadow-pill'
  return (
    <button aria-label={label} onClick={onClick} className={`size-11 grid place-items-center rounded-full backdrop-blur-md active:scale-95 transition-transform ${look} ${className}`}>
      <Icon name={name} size={20} />
    </button>
  )
}

// ── Screen scaffolding ───────────────────────
export function Screen({ children, className = '', tabbed = true }: { children: React.ReactNode; className?: string; tabbed?: boolean }) {
  return (
    <main className={`${tabbed ? 'screen-tab pb-28' : 'screen-push pb-10'} absolute inset-0 overflow-y-auto overscroll-contain no-scrollbar ${className}`}>{children}</main>
  )
}

export function TopBar({ title, back = true, right, transparent }: { title?: string; back?: boolean | string; right?: React.ReactNode; transparent?: boolean }) {
  const nav = useNavigate()
  const goBack = useBack()
  return (
    <header className={`sticky top-0 z-20 flex items-center gap-2 px-4 h-16 ${transparent ? '' : 'bg-white/90 backdrop-blur-md'}`}>
      {back && <IconButton name="left" label="Back" onClick={() => (typeof back === 'string' ? nav(back) : goBack())} />}
      {title && <h1 className="t-h3 flex-1 text-center pr-11 truncate">{title}</h1>}
      {!title && <div className="flex-1" />}
      {right}
    </header>
  )
}

export function SectionTitle({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-end justify-between px-5 mb-3">
      <h2 className="t-h2">{children}</h2>
      {action && (
        <button onClick={onAction} className="t-small font-semibold text-teal-700 underline underline-offset-4 decoration-stone-200 min-h-11 px-1">
          {action}
        </button>
      )}
    </div>
  )
}

// ── Bottom sheet ─────────────────────────────
export function Sheet({ open, onClose, children, label, tall, dark }: { open: boolean; onClose: () => void; children: React.ReactNode; label: string; tall?: boolean; dark?: boolean }) {
  // Portal to the app frame so sheets sit over the visible screen, whatever the scroll position
  const root = typeof document !== 'undefined' ? document.getElementById('app-root') : null
  const controls = useDragControls()
  const node = (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className="absolute inset-0 bg-teal-950/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={`absolute inset-x-0 bottom-0 rounded-t-[30px] bg-white shadow-sheet overflow-hidden flex flex-col ${tall ? 'max-h-[92%]' : 'max-h-[85%]'}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 360 }}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 600) onClose() }}
          >
            {/* Only the handle drags the sheet, so the content scrolls normally */}
            <div onPointerDown={(e) => controls.start(e)} className={`absolute inset-x-0 top-0 h-9 z-20 flex justify-center pt-2.5 touch-none cursor-grab ${dark ? '' : 'bg-gradient-to-b from-white via-white/90 to-transparent'}`} aria-hidden="true">
              <div className={`h-1.5 w-10 rounded-full ${dark ? 'bg-white/30' : 'bg-stone-200'}`} />
            </div>
            <button aria-label="Close" onClick={onClose} className={`absolute right-3 top-3 z-30 size-10 grid place-items-center rounded-full ${dark ? 'text-teal-50/80 active:bg-white/10' : 'text-muted active:bg-stone-100'}`}>
              <Icon name="close" size={20} />
            </button>
            <div className={`overflow-y-auto overscroll-contain no-scrollbar ${dark ? '' : 'pt-6'}`}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
  return root ? createPortal(node, root) : node
}

// ── Toast ────────────────────────────────────
const useToastStore = create<{ msg: string | null; show: (m: string) => void }>((set) => ({
  msg: null,
  show: (m) => {
    set({ msg: m })
    window.clearTimeout((window as unknown as { __t?: number }).__t)
    ;(window as unknown as { __t?: number }).__t = window.setTimeout(() => set({ msg: null }), 2600)
  },
}))
export const toast = (m: string) => useToastStore.getState().show(m)

export function Toaster() {
  const msg = useToastStore((s) => s.msg)
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[1100] flex justify-center px-6" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className="rounded-full bg-teal-800 text-teal-50 t-small font-medium pl-4 pr-5 py-3 shadow-float lift flex items-center gap-2.5"><span className="size-1.5 rounded-full bg-gold-300 shrink-0" />
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Small bits ───────────────────────────────
export function Ring({ value, size = 56, stroke = 5, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-stone-200)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-gold-500)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`t-micro font-normal text-muted ${className}`}>
      Avenor gives guidance, not financial advice. For free, impartial help visit{' '}
      <a className="underline underline-offset-2" href="https://www.moneyhelper.org.uk" target="_blank" rel="noreferrer">MoneyHelper</a> or{' '}
      <a className="underline underline-offset-2" href="https://www.gov.uk/buy-sell-your-home" target="_blank" rel="noreferrer">GOV.UK</a>.
    </p>
  )
}

export function Avatar({ name, size = 48, light = false }: { name: string; tone?: string; size?: number; light?: boolean }) {
  const initials = name.trim().split(/\s+/).map((w) => Array.from(w)[0] ?? '').slice(0, 2).join('').toUpperCase() || 'A'
  return (
    <div className={`grid place-items-center rounded-full shrink-0 ${light ? 'bg-teal-50 text-teal-900' : 'text-teal-50 shadow-[inset_0_1px_0_rgba(255,255,255,.15)]'}`} style={{ width: size, height: size, background: light ? undefined : 'radial-gradient(120% 120% at 30% 15%, #2A6E66 0%, #123F3B 60%)', fontSize: size * 0.36, fontWeight: 600, letterSpacing: '-0.02em' }}>
      {initials}
    </div>
  )
}

// ── Rolling number: figures count to their new value instead of jumping ──
export function RollingNumber({ value, format = (n: number) => Math.round(n).toLocaleString('en-GB'), from }: { value: number; format?: (n: number) => string; from?: number }) {
  const mv = useMotionValue(from ?? value)
  const spring = useSpring(mv, { stiffness: 140, damping: 24, mass: 0.6 })
  const text = useTransform(spring, (v) => format(v))
  useEffect(() => { mv.set(value) }, [value, mv])
  return <motion.span className="num">{text}</motion.span>
}

/** A tiny haptic tick on supporting phones (Android). iOS ignores it. */
export const tick = (ms = 8) => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms) }
