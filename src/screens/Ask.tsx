import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { answers, fallback, type Answer } from '../data/answers'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Mark } from '../components/Logo'
import { TopBar } from '../components/ui'

interface Msg { from: 'me' | 'avenor'; text: string; next?: Answer['next']; typing?: boolean }

function match(q: string): Answer | null {
  const k = q.toLowerCase()
  return answers.find((a) => a.keys.some((w) => k.includes(w))) ?? null
}

export default function Ask() {
  const nav = useNavigate()
  const name = useApp((s) => s.profile?.name)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const [params] = useSearchParams()
  const asked0 = useRef(false)

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs])

  async function ask(q: string) {
    if (!q.trim() || busy) return
    setBusy(true)
    setText('')
    const a = match(q)
    const full = a?.a ?? fallback
    setMsgs((m) => [...m, { from: 'me', text: q }, { from: 'avenor', text: '', typing: true }])
    await new Promise((r) => setTimeout(r, 650))
    // stream the answer word by word
    const words = full.split(' ')
    for (let i = 1; i <= words.length; i++) {
      await new Promise((r) => setTimeout(r, 28))
      setMsgs((m) => [...m.slice(0, -1), { from: 'avenor', text: words.slice(0, i).join(' '), typing: i < words.length, next: i === words.length ? a?.next : undefined }])
    }
    setBusy(false)
  }

  // Opened from a task with a question already chosen: ask it straight away
  useEffect(() => {
    const q = params.get('q')
    if (q && !asked0.current) { asked0.current = true; ask(q) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const asked = new Set(msgs.filter((m) => m.from === 'me').map((m) => m.text))
  const suggestions = answers.filter((a) => !asked.has(a.q)).slice(0, 4)

  return (
    <div className="screen-push absolute inset-0 flex flex-col bg-white">
      <TopBar back title="Ask Avenor" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        {msgs.length === 0 && (
          <div className="pt-6 pb-4">
            <Mark size={44} />
            <h1 className="t-h1 mt-4">Hi {name}, what would you like to know?</h1>
            <p className="t-body text-muted mt-2">Plain-English answers, based on GOV.UK and MoneyHelper.</p>
          </div>
        )}
        <div className="space-y-3 pt-2">
          {msgs.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={m.from === 'me' ? 'flex justify-end' : 'flex gap-2.5 items-start'}>
              {m.from === 'avenor' && <span className="mt-1"><Mark size={26} /></span>}
              <div className={m.from === 'me' ? 'max-w-[80%] rounded-[20px] rounded-br-md bg-teal-800 text-white px-4 py-3' : 'max-w-[86%]'}>
                {m.from === 'avenor' && !m.text ? (
                  <span className="inline-flex gap-1 py-3">{[0, 1, 2].map((d) => <motion.span key={d} className="size-1.5 rounded-full bg-stone-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }} />)}</span>
                ) : (
                  <p className="t-body">{m.text}</p>
                )}
                {m.next && (
                  <button onClick={() => nav(m.next!.to)} className="mt-3 inline-flex items-center gap-1.5 rounded-full ring-1 ring-stone-200 px-4 min-h-10 t-small font-semibold text-teal-800">
                    {m.next.label} <Icon name="right" size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        <div ref={end} />
      </div>

      <div className="border-t border-stone-200 bg-white px-4 pt-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <AnimatePresence>
          {!busy && suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
              {suggestions.map((s) => (
                <button key={s.q} onClick={() => ask(s.q)} className="shrink-0 rounded-full bg-stone-100 px-4 min-h-10 t-small font-medium">{s.q}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={(e) => { e.preventDefault(); ask(text) }} className="flex items-center gap-2 rounded-full ring-1 ring-stone-200 pl-5 pr-1.5 min-h-[52px] focus-within:ring-2 focus-within:ring-teal-800">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about deposits, surveys…" className="flex-1 bg-transparent outline-none" aria-label="Your question" />
          <button type="submit" aria-label="Send" disabled={!text.trim() || busy} className="size-10 rounded-full bg-teal-800 text-white grid place-items-center disabled:bg-stone-200 disabled:text-stone-400">
            <Icon name="send" size={18} stroke={2.2} />
          </button>
        </form>
        <p className="t-micro font-normal text-muted text-center mt-2">Guidance, not financial advice.</p>
      </div>
    </div>
  )
}
