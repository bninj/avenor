import { create } from 'zustand'
import { useNavigate } from 'react-router-dom'
import { termById } from '../data/glossary'
import { stageById } from '../data/stages'
import { Sheet, Button } from './ui'

const useTermStore = create<{ id: string | null; open: (id: string) => void; close: () => void }>((set) => ({
  id: null,
  open: (id) => set({ id }),
  close: () => set({ id: null }),
}))
export const openTerm = (id: string) => useTermStore.getState().open(id)

/** Renders text, turning [[term-id|label]] into tappable glossary words. */
export function TermText({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g)
  return (
    <p className={className}>
      {parts.map((p, i) => {
        const m = p.match(/^\[\[([^|\]]+)\|?([^\]]*)\]\]$/)
        if (!m) return <span key={i}>{p}</span>
        const [, id, label] = m
        return (
          <button key={i} onClick={() => openTerm(id)} className="term inline text-left">
            {label || termById[id]?.word}
          </button>
        )
      })}
    </p>
  )
}

export function TermChip({ id }: { id: string }) {
  const t = termById[id]
  if (!t) return null
  return (
    <button onClick={() => openTerm(id)} className="min-h-11 rounded-full bg-white ring-1 ring-stone-200 px-4 t-small font-medium active:bg-stone-50">
      {t.word}
    </button>
  )
}

export function TermSheet() {
  const { id, close } = useTermStore()
  const nav = useNavigate()
  const t = id ? termById[id] : null
  const stage = t?.stage ? stageById[t.stage] : null
  return (
    <Sheet open={!!t} onClose={close} label={t?.word ?? 'Term'}>
      {t && (
        <div className="px-6 pb-8 pt-3">
          <p className="t-micro text-gold-600 mb-2">In plain English</p>
          <h2 className="t-h1 mb-3 pr-8">{t.word}</h2>
          <p className="t-body text-teal-900/85">{t.plain}</p>
          {t.example && <p className="mt-4 rounded-2xl bg-stone-50 p-4 t-small text-teal-900/80">{t.example}</p>}
          {stage && (
            <Button variant="ghost" className="mt-6" onClick={() => { close(); nav(`/journey/${stage.id}`) }}>
              Where this comes up: stage {stage.n}
            </Button>
          )}
        </div>
      )}
    </Sheet>
  )
}
