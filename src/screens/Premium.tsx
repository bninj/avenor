import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Mark } from '../components/Logo'
import { Button, Screen, toast } from '../components/ui'

type Plan = 'free' | 'premium' | 'concierge'
const plans: { id: Plan; name: string; price: string; per: string; blurb: string; features: string[]; tag?: string }[] = [
  { id: 'free', name: 'Free', price: '£0', per: '', blurb: 'Everything you need to understand the journey.', features: ['All 7 stage guides and checklists', 'Full glossary', 'Core calculators', 'One free intro to a pro a month'] },
  { id: 'premium', name: 'Premium', price: '£7.49', per: 'a month', tag: 'Most popular', blurb: 'For when you’re actively buying.', features: ['Every five-minute lesson', 'Plain-English document explainers', 'Direct contact details for every pro', 'Personal saving plan', 'Ask Avenor, unlimited'] },
  { id: 'concierge', name: 'Concierge', price: '£18.99', per: 'a month', blurb: 'A person in your corner until completion.', features: ['Everything in Premium', 'Priority intros, replies within a day', 'A named buying coach', 'Offer and survey review calls'] },
]

export default function Premium() {
  const nav = useNavigate()
  const { plan, setPlan } = useApp()
  const [pick, setPick] = useState<Plan>(plan === 'free' ? 'premium' : plan)
  const chosen = plans.find((p) => p.id === pick)!

  return (
    <Screen tabbed={false}>
      <div className="relative bg-teal-800 text-white px-6 pt-5 pb-10 overflow-hidden">
        <button aria-label="Close" onClick={() => nav(-1)} className="size-11 -ml-2 grid place-items-center rounded-full active:bg-white/10"><Icon name="close" /></button>
        {/* faint arch, the brand's shape */}
        <svg className="absolute -right-10 -top-6 w-56 opacity-[0.08]" viewBox="0 0 64 64"><path d="M8 64V30a24 24 0 0 1 48 0v34h-9V30a15 15 0 0 0-30 0v34z" fill="#fff" /></svg>
        <div className="mt-6 flex items-center gap-3"><Mark size={40} tone="light" /><span className="font-serif text-xl">Avenor Premium</span></div>
        <h1 className="t-display mt-5">Buy with someone in your corner.</h1>
        <div className="mt-6 border-l-2 border-gold-500 pl-4">
          <p className="t-small text-white/85">Contracts, surveys and offers, explained the same day.</p>
        </div>
      </div>

      <div className="px-5 -mt-5 space-y-3" role="radiogroup" aria-label="Plans">
        {plans.map((p) => {
          const sel = pick === p.id
          return (
            <motion.button key={p.id} role="radio" aria-checked={sel} whileTap={{ scale: 0.99 }} onClick={() => setPick(p.id)} className={`relative w-full text-left rounded-[22px] bg-white p-5 transition-shadow ${sel ? 'ring-2 ring-teal-800 shadow-float' : 'ring-1 ring-stone-200'}`}>
              {p.tag && <span className="absolute -top-2.5 right-5 rounded-full bg-gold-500 text-teal-900 t-micro px-3 py-1">{p.tag}</span>}
              <div className="flex items-baseline justify-between gap-3">
                <span className="t-h3">{p.name}</span>
                <span><span className="font-serif text-2xl font-medium num">{p.price}</span>{p.per && <span className="t-small text-muted"> {p.per}</span>}</span>
              </div>
              <p className="t-small text-muted mt-1">{p.blurb}</p>
              {sel && (
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 t-small"><span className="text-teal-700 mt-0.5"><Icon name="check" size={16} stroke={2.4} /></span>{f}</li>
                  ))}
                </ul>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="px-5 mt-6">
        <Button variant={pick === 'free' ? 'ghost' : 'gold'} onClick={() => {
          setPlan(pick)
          toast(pick === 'free' ? 'You’re on the free plan' : `${chosen.name} unlocked. No payment taken in the demo`)
          nav(-1)
        }}>
          {pick === 'free' ? 'Stay on Free' : plan === pick ? `You’re on ${chosen.name}` : `Try ${chosen.name} free for 14 days`}
        </Button>
        <p className="t-micro font-normal text-muted text-center mt-3">Concept pricing. Cancel any time.</p>
      </div>
    </Screen>
  )
}
