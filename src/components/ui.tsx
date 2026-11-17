import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { create } from 'zustand'
import { Icon, type IconName } from './Icon'

// ── Buttons ───────────────────────────────────
type Variant = 'primary' | 'gold' | 'ghost' | 'quiet'
const variants: Record<Variant, string> = {
  primary: 'bg-teal-800 text-white active:bg-teal-900',
  gold: 'bg-gold-500 text-teal-900 active:bg-gold-600',
  ghost: 'bg-white text-teal-900 ring-1 ring-inset ring-stone-200 active:bg-stone-50',
  quiet: 'bg-teal-50 text-teal-800 active:bg-teal-100',
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
      className={`min-h-[52px] w-full rounded-2xl px-5 font-semibold tracking-[-0.005em] transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {icon && <Icon name={icon} size={20} />}
      {children}
    </motion.button>
  )
}

export function IconButton({ name, onClick, label, className = '' }: { name: IconName; onClick?: () => void; label: string; className?: string }) {
  return (
    <button aria-label={label} onClick={onClick} className={`size-11 grid place-items-center rounded-full bg-white shadow-pill text-teal-900 active:scale-95 transition-transform ${className}`}>
      <Icon name={name} size={20} />
    </button>
  )
}

// ── Screen scaffolding ───────────────────────
export function Screen({ children, className = '', tabbed = true }: { children: React.ReactNode; className?: string; tabbed?: boolean }) {
  return (
    <main className={`screen-enter absolute inset-0 overflow-y-auto no-scrollbar ${tabbed ? 'pb-28' : 'pb-10'} ${className}`}>{children}</main>
  )
}

export function TopBar({ title, back = true, right, transparent }: { title?: string; back?: boolean | string; right?: React.ReactNode; transparent?: boolean }) {
  const nav = useNavigate()
  return (
    <header className={`sticky top-0 z-20 flex items-center gap-2 px-4 h-16 ${transparent ? '' : 'bg-white/90 backdrop-blur-md'}`}>
      {back && <IconButton name="left" label="Back" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))} className={transparent ? '' : 'shadow-none ring-1 ring-stone-200'} />}
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
export function Sheet({ open, onClose, children, label, tall }: { open: boolean; onClose: () => void; children: React.ReactNode; label: string; tall?: boolean }) {
  // Portal to the app frame so sheets sit over the visible screen, whatever the scroll position
  const root = typeof document !== 'undefined' ? document.getElementById('app-root') : null
  const node = (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className="absolute inset-0 bg-teal-900/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={`absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white shadow-sheet overflow-y-auto no-scrollbar ${tall ? 'max-h-[92%]' : 'max-h-[85%]'}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 600) onClose() }}
          >
            <div className="sticky top-0 bg-white pt-2.5 pb-1 z-10 flex justify-center">
              <div className="h-1.5 w-10 rounded-full bg-stone-200" />
            </div>
            <button aria-label="Close" onClick={onClose} className="absolute right-3 top-3 z-20 size-10 grid place-items-center rounded-full text-muted active:bg-stone-100">
              <Icon name="close" size={20} />
            </button>
            {children}
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
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className="rounded-full bg-teal-900 text-white t-small font-medium px-5 py-3 shadow-float">
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

export function Avatar({ name, tone = '#E9D9B4', size = 48 }: { name: string; tone?: string; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  return (
    <div className="grid place-items-center rounded-full font-serif text-teal-900 shrink-0" style={{ width: size, height: size, background: tone, fontSize: size * 0.38, fontWeight: 520 }}>
      {initials}
    </div>
  )
}
