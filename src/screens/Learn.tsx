import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { glossary } from '../data/glossary'
import { stages } from '../data/stages'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Button, Screen, SectionTitle, Sheet, tick } from '../components/ui'
import { lessons, type Lesson } from '../data/lessons'
import { AnimatePresence, motion } from 'motion/react'
import { openTerm } from '../components/Terms'

const SHORT: Record<string, string> = { budget: 'Budget', mortgage: 'Mortgage', search: 'Searching', offer: 'Offer', solicitor: 'Legal', survey: 'Survey', completion: 'Keys' }

export default function Learn() {
  const nav = useNavigate()
  const plan = useApp((s) => s.plan)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Lesson | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const list = useMemo(() => {
    const k = q.trim().toLowerCase()
    return glossary
      .filter((t) => filter === 'all' || t.stage === filter)
      .filter((t) => !k || t.word.toLowerCase().includes(k) || t.plain.toLowerCase().includes(k))
      .sort((a, b) => a.word.localeCompare(b.word))
  }, [q, filter])

  return (
    <Screen>
      <div className="px-5 pt-6 pb-2">
        <h1 className="t-display">Learn</h1>
        <p className="t-body text-muted mt-2">Short lessons. Every word, explained.</p>
      </div>

      <div className="mt-7">
        <SectionTitle>Five-minute lessons</SectionTitle>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x pb-1" tabIndex={0} role="region" aria-label="Lessons">
          {lessons.map((l, i) => {
            const locked = !l.free && plan === 'free'
            return (
              <button
                key={l.id}
                onClick={() => (locked ? nav('/premium') : setOpen(l))}
                className={`snap-start shrink-0 w-[200px] h-[236px] rounded-[22px] p-5 flex flex-col text-left ${i === 0 ? 'spruce grain' : 'bg-stone-100 grain grain-light'}`}
              >
                <span className={`text-[3.25rem] leading-none font-semibold tracking-[-0.04em] num ${i === 0 ? 'text-gold-300' : 'text-stone-400/70'}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className="t-h2 mt-auto">{l.title}</span>
                <span className={`t-small mt-2 flex items-center gap-1.5 ${i === 0 ? 'text-teal-100/75' : 'text-muted'}`}>
                  {locked && <Icon name="lock" size={14} />}{l.mins} min{locked ? ', Premium' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-9">
        <SectionTitle>Glossary</SectionTitle>
        <div className="px-5">
          <label className="flex items-center gap-3 rounded-full bg-stone-100 px-4 min-h-12 focus-within:ring-2 focus-within:ring-teal-800">
            <Icon name="search" size={20} className="text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a word, e.g. leasehold" className="flex-1 bg-transparent outline-none" aria-label="Search the glossary" />
            {q && <button onClick={() => setQ('')} aria-label="Clear search" className="size-11 -mr-3 grid place-items-center text-muted"><Icon name="close" size={18} /></button>}
          </label>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-4">
          {[{ id: 'all', title: 'All' }, ...stages.map((s) => ({ id: s.id, title: SHORT[s.id] }))].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`shrink-0 min-h-10 rounded-full px-4 t-small font-medium ${filter === f.id ? 'bg-teal-800 text-white' : 'ring-1 ring-inset ring-stone-200'}`}>
              {f.title}
            </button>
          ))}
        </div>
        <ul className="px-5">
          {list.map((t) => (
            <li key={t.id} className="border-b border-stone-200 last:border-0">
              <button onClick={() => openTerm(t.id)} className="w-full text-left py-4 flex gap-3 items-start">
                <span className="flex-1">
                  <span className="block t-h3 mb-0.5">{t.word}</span>
                  <span className="t-small text-muted line-clamp-2">{t.plain}</span>
                </span>
                <Icon name="right" size={18} className="text-stone-400 mt-1.5" />
              </button>
            </li>
          ))}
          {!list.length && <li className="py-10 text-center text-muted t-small">No words match “{q}”. Try “deposit” or “survey”.</li>}
        </ul>
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} label={open?.title ?? 'Lesson'} tall>
        {open && <LessonPlayer lesson={open} onDone={() => setOpen(null)} />}
      </Sheet>
    </Screen>
  )
}

function LessonPlayer({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const [i, setI] = useState(0)
  const last = i === lesson.cards.length - 1
  const card = lesson.cards[i]
  return (
    <div className="px-6 pb-7">
      <p className="t-small text-muted pr-10">{lesson.title}</p>
      <div className="flex gap-1 mt-3" role="progressbar" aria-valuemin={1} aria-valuemax={lesson.cards.length} aria-valuenow={i + 1} aria-label={`Card ${i + 1} of ${lesson.cards.length}`}>
        {lesson.cards.map((_, k) => <span key={k} className={`h-1 flex-1 rounded-full transition-colors ${k <= i ? 'bg-teal-800' : 'bg-stone-200'}`} />)}
      </div>
      <div className="relative min-h-[260px] mt-8">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}>
            <p className="num text-[3rem] leading-none font-semibold tracking-[-0.04em] text-gold-600">{i + 1}</p>
            <h2 className="t-h1 mt-4">{card.head}</h2>
            <p className="t-body text-teal-900/80 mt-3">{card.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex gap-3">
        {i > 0 && <Button variant="quiet" className="!w-auto px-6" onClick={() => setI(i - 1)}>Back</Button>}
        <Button onClick={() => { if (last) { tick(12); onDone() } else setI(i + 1) }}>{last ? 'Done' : 'Next'}</Button>
      </div>
    </div>
  )
}
