import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { stages, type Task } from '../data/stages'
import { useApp } from '../store'
import { Icon } from './Icon'
import { openTerm } from './Terms'
import { tick } from './ui'

/** One step in a stage: tap the row to tick it, tap the action to get it done. */
export function TaskRow({ t, size = 'md', stageId }: { t: Task; size?: 'md' | 'sm'; stageId?: string }) {
  const nav = useNavigate()
  const on = useApp((s) => !!s.done[t.id])
  const toggle = useApp((s) => s.toggleTask)
  const a = t.action
  const go = () => {
    if (!a) return
    if (a.term) openTerm(a.term)
    else if (a.href) window.open(a.href, '_blank', 'noopener')
    else if (a.to) nav(stageId ? `${a.to}${a.to.includes('?') ? '&' : '?'}from=${stageId}` : a.to)
  }
  return (
    <li className="border-b border-stone-200 flex items-center gap-2">
      <button onClick={() => { if (!on) tick(); toggle(t.id) }} aria-pressed={on} className={`flex-1 min-w-0 text-left flex items-center gap-3.5 ${size === 'md' ? 'py-4 min-h-[60px]' : 'py-3.5 min-h-14'}`}>
        <span className={`${size === 'md' ? 'size-7' : 'size-6'} shrink-0 rounded-full grid place-items-center transition-colors ${on ? 'bg-teal-800 text-white' : 'ring-[1.5px] ring-stone-400/60'}`}>
          <AnimatePresence>{on && <motion.span initial={{ scale: 0.3 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Icon name="check" size={size === 'md' ? 16 : 14} stroke={2.6} /></motion.span>}</AnimatePresence>
        </span>
        <span className="flex-1 min-w-0">
          <span className={`block font-medium ${on ? 'text-stone-400 line-through' : ''}`}>{t.label}</span>
          {t.hint && !on && size === 'md' && <span className="t-small text-muted">{t.hint}</span>}
        </span>
      </button>
      {a && !on && (
        <button onClick={go} className="shrink-0 min-h-10 rounded-full bg-teal-50 text-teal-800 t-small font-semibold pl-3 pr-2.5 flex items-center gap-1 active:bg-teal-100">
          {a.label}<Icon name={a.href ? 'external' : 'right'} size={14} stroke={2.2} />
        </button>
      )}
    </li>
  )
}

/** Shown on a tool screen opened from a task, so the person can step straight back. */
export function ReturnPill({ className = '' }: { className?: string }) {
  const nav = useNavigate()
  const from = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('from')
  const st = from ? stages.find((x) => x.id === from) : null
  if (!st) return null
  return (
    <motion.button initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} onClick={() => nav(`/journey/${st.id}`)}
      className={`inline-flex items-center gap-1.5 min-h-10 rounded-full bg-teal-800 text-teal-50 t-small font-semibold pl-2.5 pr-4 lift ${className}`}>
      <Icon name="left" size={16} stroke={2.2} /> Back to stage {st.n}
    </motion.button>
  )
}
