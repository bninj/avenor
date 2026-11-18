import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { glossary } from '../data/glossary'
import { stages } from '../data/stages'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Screen, SectionTitle, toast } from '../components/ui'
import { openTerm } from '../components/Terms'

const SHORT: Record<string, string> = { budget: 'Budget', mortgage: 'Mortgage', search: 'Searching', offer: 'Offer', solicitor: 'Legal', survey: 'Survey', completion: 'Keys' }

const lessons = [
  { id: 'l1', stage: 'budget', title: 'The real cost of buying', mins: 4, free: true },
  { id: 'l2', stage: 'mortgage', title: 'How a mortgage actually works', mins: 6, free: false },
  { id: 'l3', stage: 'offer', title: 'Offering without overpaying', mins: 5, free: false },
  { id: 'l4', stage: 'survey', title: 'Reading a survey report', mins: 5, free: false },
]

export default function Learn() {
  const nav = useNavigate()
  const plan = useApp((s) => s.plan)
  const [q, setQ] = useState('')
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
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x pb-1">
          {lessons.map((l, i) => {
            const locked = !l.free && plan === 'free'
            return (
              <button
                key={l.id}
                onClick={() => (locked ? nav('/premium') : toast('Lessons play in the full app'))}
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
            {q && <button onClick={() => setQ('')} aria-label="Clear" className="text-muted"><Icon name="close" size={18} /></button>}
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
    </Screen>
  )
}
