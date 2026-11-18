import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gbp, monthlyPayment, rates, stampDuty } from '../data/rates'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Disclaimer, Screen } from '../components/ui'
import { openTerm } from '../components/Terms'
import { ReturnPill } from '../components/TaskRow'

type Tab = 'upfront' | 'stamp' | 'monthly' | 'deposit'
const TABS: { id: Tab; label: string }[] = [
  { id: 'upfront', label: 'Upfront cash' },
  { id: 'stamp', label: 'Stamp Duty' },
  { id: 'monthly', label: 'Monthly cost' },
  { id: 'deposit', label: 'Saving plan' },
]
// Validated chart colours (colour-blind safe pair, 3:1 on white)
const CHART = { equity: '#11917F', cost: '#B3862A' }

export default function Money() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const tab: Tab = TABS.some((t) => t.id === raw) ? (raw as Tab) : 'upfront'
  const profile = useApp((s) => s.profile)
  const [price, setPrice] = useState(profile?.budget ?? 225_000)
  const [depPct, setDepPct] = useState(10)
  const [firstTime, setFirstTime] = useState(profile?.firstTime ?? true)

  return (
    <Screen>
      <div className="px-5 pt-6">
        <ReturnPill className="mb-4" />
        <h1 className="t-display">Money</h1>
        <p className="t-body text-muted mt-2">Real numbers, before anyone sells you anything.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pt-5 pb-6" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setParams((prev) => { const n = new URLSearchParams(prev); n.set('tab', t.id); return n }, { replace: true })} className={`shrink-0 min-h-11 rounded-full px-4 t-small font-semibold transition-colors ${tab === t.id ? 'bg-teal-800 text-teal-50' : 'bg-stone-100 text-teal-900/75'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Shared price input */}
      <div className="px-5">
        <div className="flex items-baseline justify-between">
          <span className="t-small text-muted">Home price</span>
          <span className="t-h1 num">{gbp(price)}</span>
        </div>
        <input aria-label="Home price" type="range" min={80_000} max={600_000} step={5_000} value={price} onChange={(e) => setPrice(+e.target.value)} className="range mt-1" style={{ ['--fill' as string]: `${((price - 80_000) / 520_000) * 100}%` }} />
        {tab !== 'stamp' && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <span className="t-small text-muted">Deposit</span>
            <div className="flex-1 min-w-[220px] max-w-[260px] grid grid-cols-4 gap-1 rounded-full bg-stone-100 p-1" role="radiogroup" aria-label="Deposit size">
              {[5, 10, 15, 20].map((d) => (
                <button key={d} role="radio" aria-checked={depPct === d} onClick={() => setDepPct(d)} className={`min-h-10 rounded-full t-small font-semibold num transition ${depPct === d ? 'bg-white shadow-pill text-teal-900' : 'text-muted'}`}>{d}%</button>
              ))}
            </div>
          </div>
        )}
        {tab === 'stamp' && (
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-stone-100 p-1" role="radiogroup" aria-label="Buyer type">
            {[{ v: true, t: 'First home' }, { v: false, t: 'Owned before' }].map((o) => (
              <button key={o.t} role="radio" aria-checked={firstTime === o.v} onClick={() => setFirstTime(o.v)} className={`min-h-11 rounded-full t-small font-semibold transition ${firstTime === o.v ? 'bg-white shadow-pill text-teal-900' : 'text-muted'}`}>{o.t}</button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 mt-7">
        {tab === 'upfront' && <Upfront price={price} depPct={depPct} firstTime={firstTime} />}
        {tab === 'stamp' && <Stamp price={price} firstTime={firstTime} />}
        {tab === 'monthly' && <Monthly price={price} depPct={depPct} />}
        {tab === 'deposit' && <Saving price={price} depPct={depPct} saved={profile?.savings ?? 0} firstTime={firstTime} />}
      </div>

      <p className="px-5 mt-6 t-micro font-normal text-muted">
        Stamp Duty: {rates.region} rates from <a className="underline" href={rates.source} target="_blank" rel="noreferrer">GOV.UK</a>, checked {rates.checked}. Fees are typical, not quotes.
      </p>
      <Disclaimer className="px-5 mt-3" />
    </Screen>
  )
}

function Hero({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="hero-light grain grain-light rounded-[24px] px-5 pt-5 pb-6 mb-6">
      <p className="t-small text-muted">{label}</p>
      <motion.p key={value} initial={{ opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} className="num text-[3.75rem] leading-none font-semibold tracking-[-0.04em] mt-3">{value}</motion.p>
      {sub && <p className="t-small text-muted mt-3">{sub}</p>}
    </div>
  )
}

function Rows({ rows }: { rows: { label: string; value: number; term?: string; dot?: string }[] }) {
  return (
    <ul className="divide-y divide-stone-200">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center justify-between py-3.5 gap-3">
          <span className="flex items-center gap-2.5">
            {r.dot && <span className="size-2.5 rounded-full" style={{ background: r.dot }} />}
            {r.term ? <button onClick={() => openTerm(r.term!)} className="term">{r.label}</button> : <span>{r.label}</span>}
          </span>
          <span className="num font-medium">{gbp(r.value)}</span>
        </li>
      ))}
    </ul>
  )
}

function Upfront({ price, depPct, firstTime }: { price: number; depPct: number; firstTime: boolean }) {
  const f = rates.typicalFees
  const deposit = (price * depPct) / 100
  const sdlt = stampDuty(price, firstTime)
  const fees = sdlt + f.solicitor + f.searches + f.survey + f.mortgageFee + f.removals
  const total = deposit + fees
  const [hover, setHover] = useState<null | 'equity' | 'cost'>(null)
  return (
    <>
      <Hero label="Cash you need on the day" value={gbp(total)} sub={<>{gbp(fees)} on top of your deposit.</>} />
      {/* Two-part bar: what stays yours vs what is spent */}
      <div className="relative">
        <div className="flex h-4 gap-[2px]" role="group" aria-label={`Deposit ${gbp(deposit)}, fees and tax ${gbp(fees)}`}>
          <button onMouseEnter={() => setHover('equity')} onMouseLeave={() => setHover(null)} onClick={() => setHover(hover === 'equity' ? null : 'equity')} className="h-full rounded-l-[4px]" style={{ width: `${(deposit / total) * 100}%`, background: CHART.equity }} aria-label="Deposit" />
          <button onMouseEnter={() => setHover('cost')} onMouseLeave={() => setHover(null)} onClick={() => setHover(hover === 'cost' ? null : 'cost')} className="h-full rounded-r-[4px]" style={{ width: `${(fees / total) * 100}%`, background: CHART.cost }} aria-label="Fees and tax" />
        </div>
        {hover && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-xl bg-teal-900 text-white t-small px-3 py-2 whitespace-nowrap shadow-float">
            {hover === 'equity' ? `Deposit ${gbp(deposit)} (${Math.round((deposit / total) * 100)}%)` : `Fees and tax ${gbp(fees)} (${Math.round((fees / total) * 100)}%)`}
          </div>
        )}
        <div className="flex justify-between mt-2.5 t-small">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: CHART.equity }} />Deposit, stays yours</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: CHART.cost }} />Fees and tax, spent</span>
        </div>
      </div>
      <div className="mt-5">
        <Rows rows={[
          { label: `Deposit (${depPct}%)`, value: deposit, term: 'deposit', dot: CHART.equity },
          { label: 'Stamp Duty', value: sdlt, term: 'sdlt', dot: CHART.cost },
          { label: 'Solicitor', value: f.solicitor, term: 'conveyancing', dot: CHART.cost },
          { label: 'Searches', value: f.searches, term: 'searches', dot: CHART.cost },
          { label: 'Survey', value: f.survey, term: 'survey', dot: CHART.cost },
          { label: 'Mortgage fee', value: f.mortgageFee, term: 'arrangement-fee', dot: CHART.cost },
          { label: 'Removals', value: f.removals, dot: CHART.cost },
        ]} />
      </div>
    </>
  )
}

function Stamp({ price, firstTime }: { price: number; firstTime: boolean }) {
  const tax = stampDuty(price, firstTime)
  const standard = stampDuty(price, false)
  const saving = standard - tax
  return (
    <>
      <Hero label="Stamp Duty to pay" value={gbp(tax)} sub={tax === 0 ? 'Nothing to pay at this price.' : `${((tax / price) * 100).toFixed(1)}% of the price.`} />
      {firstTime && saving > 0 && (
        <div className="rounded-2xl bg-teal-50 p-4 flex gap-3 items-start mb-5">
          <span className="text-teal-700 mt-0.5"><Icon name="check" size={18} stroke={2.4} /></span>
          <p className="t-small">First-time buyer relief saves you <b className="font-semibold num">{gbp(saving)}</b>.</p>
        </div>
      )}
      {firstTime && price > rates.sdltFirstTime.maxPrice && (
        <div className="rounded-2xl bg-gold-100 p-4 t-small mb-5">Over {gbp(rates.sdltFirstTime.maxPrice)}, normal rates apply.</div>
      )}
      <h3 className="t-h3 mb-1">How it’s worked out</h3>
      <p className="t-small text-muted mb-2">Each rate applies only to its slice.</p>
      <ul className="divide-y divide-stone-200">
        {(firstTime && price <= rates.sdltFirstTime.maxPrice ? rates.sdltFirstTime.bands : rates.sdltStandard).map((b, i, arr) => {
          const from = i ? arr[i - 1].upTo : 0
          if (from >= price) return null
          const slice = Math.min(price, b.upTo) - from
          return (
            <li key={i} className="flex justify-between py-3 t-small">
              <span>{gbp(from)} to {b.upTo === Infinity ? 'above' : gbp(Math.min(b.upTo, price))} at {b.rate * 100}%</span>
              <span className="num font-medium">{gbp(slice * b.rate)}</span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function Monthly({ price, depPct }: { price: number; depPct: number }) {
  const [rate, setRate] = useState(rates.defaultRate)
  const [years, setYears] = useState(30)
  const loan = price * (1 - depPct / 100)
  const m = useMemo(() => monthlyPayment(loan, rate, years), [loan, rate, years])
  return (
    <>
      <Hero label="Monthly repayment" value={gbp(m)} sub={<>On a <button className="term" onClick={() => openTerm('repayment')}>repayment mortgage</button> of {gbp(loan)}.</>} />
      <Slider label="Interest rate" value={`${rate.toFixed(1)}%`} min={1} max={8} step={0.1} v={rate} set={setRate} />
      <Slider label="Mortgage term" value={`${years} years`} min={10} max={40} step={1} v={years} set={setYears} />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-stone-50 p-4"><p className="t-micro text-muted mb-1">Total repaid</p><p className="font-semibold num">{gbp(m * years * 12)}</p></div>
        <div className="rounded-2xl bg-stone-50 p-4"><p className="t-micro text-muted mb-1">Of which interest</p><p className="font-semibold num">{gbp(m * years * 12 - loan)}</p></div>
      </div>
      <p className="mt-4 t-small text-muted">A 1% rise adds <b className="font-semibold text-teal-900 num">{gbp(monthlyPayment(loan, rate + 1, years) - m)}</b> a month. Worth knowing before you <button className="term" onClick={() => openTerm('fixed')}>fix</button>.</p>
    </>
  )
}

function Saving({ price, depPct, saved, firstTime }: { price: number; depPct: number; saved: number; firstTime: boolean }) {
  const nav = useNavigate()
  const [monthly, setMonthly] = useState(500)
  const f = rates.typicalFees
  const target = (price * depPct) / 100 + stampDuty(price, firstTime) + f.solicitor + f.searches + f.survey + f.mortgageFee + f.removals
  const left = Math.max(0, target - saved)
  const months = monthly > 0 ? Math.ceil(left / monthly) : Infinity
  const now = new Date(); const date = new Date(now.getFullYear(), now.getMonth() + months, 1)
  return (
    <>
      <Hero label="You could be ready by" value={left === 0 ? 'Now' : date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} sub={`Target ${gbp(target)}: deposit, Stamp Duty and fees.`} />
      <div className="h-2.5 rounded-full bg-stone-200 overflow-hidden mb-2">
        <motion.div className="h-full rounded-full" style={{ background: CHART.equity }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (saved / target) * 100)}%` }} />
      </div>
      <p className="t-small text-muted mb-6 num">{gbp(saved)} saved of {gbp(target)}</p>
      <Slider label="I can save each month" value={gbp(monthly)} min={50} max={2000} step={50} v={monthly} set={setMonthly} />
      <button onClick={() => openTerm('lisa')} className="mt-4 w-full text-left rounded-2xl ring-1 ring-stone-200 p-4 flex items-center gap-3">
        <span className="text-gold-600"><Icon name="spark" size={20} /></span>
        <span className="flex-1 t-small">A <b className="font-semibold">Lifetime ISA</b> adds a government bonus.</span>
        <Icon name="right" size={18} className="text-muted" />
      </button>
      <button onClick={() => nav('/premium')} className="mt-3 w-full t-small font-semibold text-teal-700 min-h-11">Monthly saving plan with Premium</button>
    </>
  )
}

function Slider({ label, value, min, max, step, v, set }: { label: string; value: string; min: number; max: number; step: number; v: number; set: (n: number) => void }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between t-small"><span className="text-muted">{label}</span><span className="font-semibold num">{value}</span></div>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} className="range" style={{ ['--fill' as string]: `${((v - min) / (max - min)) * 100}%` }} />
    </div>
  )
}
