import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { docTypes, reportSample, shortlist } from '../data/premium'
import { gbp, monthlyPayment, rates, stampDuty } from '../data/rates'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Button, Disclaimer, Screen, TopBar, toast } from '../components/ui'

type Tier = 'premium' | 'concierge'
const rank = { free: 0, premium: 1, concierge: 2 } as const

/** Shown over a feature the current plan doesn't include */
function Locked({ tier, title, children }: { tier: Tier; title: string; children: React.ReactNode }) {
  const nav = useNavigate()
  const plan = useApp((s) => s.plan)
  const preview = new URLSearchParams(window.location.hash.slice(window.location.hash.indexOf('?') + 1)).get('preview') === '1'
  if (rank[plan] >= rank[tier]) return <>{children}</>
  // Opened from the plans screen: show the real feature, with a slim banner
  if (preview) return (
    <>
      <div className="mx-5 mb-2 rounded-[16px] bg-teal-50 ring-1 ring-teal-800/10 px-4 py-3 flex items-center gap-3">
        <span className="flex-1 t-small text-teal-900">Preview. Included with {tier === 'premium' ? 'Premium' : 'Concierge'}.</span>
        <button onClick={() => nav(-1)} className="t-small font-semibold text-teal-800 min-h-10">See plans</button>
      </div>
      {children}
    </>
  )
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[3px] opacity-60" aria-hidden="true">{children}</div>
      <div className="absolute inset-x-5 top-16 rounded-[24px] bg-white ring-1 ring-stone-200 shadow-float p-6 text-center">
        <span className="mx-auto size-12 rounded-full bg-teal-50 text-teal-800 grid place-items-center"><Icon name="lock" size={20} /></span>
        <p className="t-h2 mt-3">{title}</p>
        <p className="t-small text-muted mt-1">Included with {tier === 'premium' ? 'Premium and Concierge' : 'Concierge'}.</p>
        <Button className="mt-5" onClick={() => nav('/premium')}>See plans</Button>
      </div>
    </div>
  )
}

// ── Document folder ─────────────────────────────
export function Documents() {
  const { docs, addDoc, removeDoc } = useApp()
  const input = useRef<HTMLInputElement>(null)
  const [target, setTarget] = useState<string | null>(null)
  const count = docTypes.filter((d) => docs[d.id]).length
  return (
    <Screen tabbed={false}>
      <TopBar back title="Documents" />
      <Locked tier="premium" title="Keep every document in one place">
        <div className="px-6 pt-2">
          <h1 className="t-display">Your documents</h1>
          <p className="t-body text-muted mt-2">Everything your lender and solicitor will ask for, in one place.</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-[6px] rounded-full bg-teal-800/10 overflow-hidden"><div className="h-full bg-teal-700 rounded-full" style={{ width: `${(count / docTypes.length) * 100}%` }} /></div>
            <span className="t-small text-muted num">{count} of {docTypes.length}</span>
          </div>
        </div>
        <ul className="mx-5 mt-5 rounded-[22px] ring-1 ring-stone-200 divide-y divide-stone-200 overflow-hidden">
          {docTypes.map((d) => {
            const has = docs[d.id]
            return (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3.5 min-h-[64px]">
                <span className={`size-10 shrink-0 rounded-[12px] grid place-items-center ${has ? 'bg-teal-800 text-teal-50' : 'bg-stone-100 text-muted'}`}><Icon name={has ? 'check' : 'folder'} size={18} stroke={has ? 2.4 : 1.7} /></span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium">{d.name}</span>
                  <span className="t-small text-muted truncate block">{has ? has.file : `Needed at: ${d.stage}`}</span>
                </span>
                {has ? (
                  <button onClick={() => { removeDoc(d.id); toast('Removed') }} className="min-h-10 px-3 rounded-full t-small font-semibold text-muted">Remove</button>
                ) : (
                  <button onClick={() => { setTarget(d.id); input.current?.click() }} className="min-h-10 px-4 rounded-full bg-teal-50 text-teal-800 t-small font-semibold">Add</button>
                )}
              </li>
            )
          })}
        </ul>
        <input ref={input} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && target) { addDoc(target, f.name); toast('Added to your documents') } e.target.value = '' }} />
        <p className="px-6 mt-4 t-small text-muted">Files stay on this phone. In the full app they are stored securely and shared only with people you choose.</p>
      </Locked>
    </Screen>
  )
}

// ── Compare homes ──────────────────────────────
export function Compare() {
  const profile = useApp((s) => s.profile)
  const ftb = profile?.firstTime ?? true
  const f = rates.typicalFees
  const rows = shortlist.map((h) => {
    const deposit = h.price * 0.1
    const sd = stampDuty(h.price, ftb)
    return { ...h, sd, monthly: monthlyPayment(h.price - deposit, rates.defaultRate, 30), upfront: deposit + sd + f.solicitor + f.searches + f.survey + f.mortgageFee + f.removals }
  })
  const best = (k: 'price' | 'monthly' | 'upfront' | 'commute') => Math.min(...rows.map((r) => r[k]))
  const lines: { label: string; get: (r: (typeof rows)[number]) => string; bestKey?: 'price' | 'monthly' | 'upfront' | 'commute' }[] = [
    { label: 'Price', get: (r) => gbp(r.price), bestKey: 'price' },
    { label: 'Bedrooms', get: (r) => String(r.beds) },
    { label: 'Energy rating', get: (r) => r.epc },
    { label: 'Tenure', get: (r) => r.tenure },
    { label: 'To town', get: (r) => `${r.commute} min`, bestKey: 'commute' },
    { label: 'Garden', get: (r) => (r.garden ? 'Yes' : 'No') },
    { label: 'Stamp Duty', get: (r) => gbp(r.sd) },
    { label: 'Monthly cost', get: (r) => gbp(r.monthly), bestKey: 'monthly' },
    { label: 'Cash on the day', get: (r) => gbp(r.upfront), bestKey: 'upfront' },
  ]
  return (
    <Screen tabbed={false}>
      <TopBar back title="Compare homes" />
      <Locked tier="premium" title="Compare homes side by side">
        <div className="px-6 pt-2">
          <h1 className="t-display">Your shortlist</h1>
          <p className="t-body text-muted mt-2">The real cost of each home, side by side. Best in each row is marked.</p>
        </div>
        <div className="mt-5 overflow-x-auto no-scrollbar" tabIndex={0} role="region" aria-label="Homes compared">
          <table className="min-w-[560px] mx-5 border-separate border-spacing-0 t-small">
            <thead>
              <tr>
                <th className="w-[112px]" />
                {rows.map((r) => (
                  <th key={r.id} className="px-2 pb-3 text-left align-bottom font-normal">
                    <img src={r.img} alt="" className="photo h-20 w-full object-cover rounded-[14px]" />
                    <span className="block font-semibold text-teal-900 mt-2">{r.name}</span>
                    <span className="block text-muted">{r.area}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.label}>
                  <td className="py-3 pr-2 text-muted border-t border-stone-200">{l.label}</td>
                  {rows.map((r) => {
                    const isBest = l.bestKey && r[l.bestKey] === best(l.bestKey)
                    return (
                      <td key={r.id} className="px-2 py-3 border-t border-stone-200 num">
                        <span className={isBest ? 'inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-800 font-semibold px-2 py-0.5' : 'text-teal-900'}>{isBest && <Icon name="check" size={12} stroke={2.6} />}{l.get(r)}</span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-6 mt-4 t-small text-muted">Example homes for the demo. Monthly cost assumes a 10% deposit over 30 years at {rates.defaultRate}%.</p>
        <Disclaimer className="px-6 mt-3" />
      </Locked>
    </Screen>
  )
}

// ── Concierge: main structure report ────────────
const tone = {
  red: { dot: 'bg-danger', label: 'Act now', text: 'text-danger' },
  amber: { dot: 'bg-gold-500', label: 'Get a quote', text: 'text-gold-600' },
  green: { dot: 'bg-teal-700', label: 'Good', text: 'text-teal-700' },
} as const

export function Report() {
  return (
    <Screen tabbed={false}>
      <TopBar back title="Structure report" />
      <Locked tier="concierge" title="Your home’s main structure, explained">
        <div className="px-6 pt-2">
          <h1 className="t-display">Valentine Road</h1>
          <p className="t-body text-muted mt-2">A plain-English summary of the survey, from your buying coach.</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {(['red', 'amber', 'green'] as const).map((k) => (
              <div key={k} className="rounded-[16px] bg-stone-100 py-3">
                <p className="t-h2 num">{reportSample.filter((r) => r.rating === k).length}</p>
                <p className={`t-micro ${tone[k].text}`}>{tone[k].label}</p>
              </div>
            ))}
          </div>
        </div>
        <ul className="mx-5 mt-5 rounded-[22px] ring-1 ring-stone-200 divide-y divide-stone-200 overflow-hidden">
          {reportSample.map((r) => (
            <li key={r.part} className="px-4 py-4 flex gap-3">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${tone[r.rating].dot}`} />
              <span className="flex-1">
                <span className="flex items-baseline justify-between gap-3"><span className="font-semibold">{r.part}</span><span className={`t-micro ${tone[r.rating].text}`}>{tone[r.rating].label}</span></span>
                <span className="t-small text-muted block mt-1">{r.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="px-6 mt-4 t-small text-muted">Sample report. Your coach writes yours from your RICS survey.</p>
      </Locked>
    </Screen>
  )
}
