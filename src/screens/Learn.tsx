import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { glossary } from '../data/glossary'
import { stages } from '../data/stages'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Screen, SectionTitle, toast } from '../components/ui'
import { openTerm } from '../components/Terms'
import { StageArt } from '../components/StageArt'

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
      <div className="px-5 pt-4 pb-2">
        <h1 className="t-display">Learn</h1>
        <p className="t-body text-muted mt-2">Short lessons. Every word, explained.</p>
      </div>

      <div className="mt-6">
        <SectionTitle>Five-minute lessons</SectionTitle>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x pb-1">
          {lessons.map((l) => {
            const locked = !l.free && plan === 'free'
            return (
              <button
                key={l.id}
                onClick={() => (locked ? nav('/premium') : toast('Lessons play in the full app'))}
                className="snap-start shrink-0 w-[168px] text-left"
              >
                <div className="relative rounded-[20px] bg-stone-100 h-[150px] grid place-items-end justify-center overflow-hidden">
                  <StageArt id={l.stage} className="w-[96px]" bg="#FFFFFF" />
                  <span className={`absolute left-2.5 top-2.5 rounded-full t-micro px-2.5 py-1 ${locked ? 'bg-teal-800 text-white' : 'bg-white text-teal-900'}`}>
                    {locked ? <span className="inline-flex items-center gap-1"><Icon name="lock" size={12} stroke={2.2} /> Premium</span> : 'Free'}
                  </span>
                </div>
                <p className="font-semibold mt-2.5 leading-snug">{l.title}</p>
                <p className="t-small text-muted">{l.mins} min</p>
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
                  <span className="block font-serif text-lg font-medium mb-0.5">{t.word}</span>
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
