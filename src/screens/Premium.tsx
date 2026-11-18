import { useState } from 'react'
import { motion } from 'motion/react'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Mark } from '../components/Logo'
import { Button, IconButton, Screen, toast, useBack } from '../components/ui'

type Plan = 'free' | 'premium' | 'concierge'
const plans: { id: Plan; name: string; price: string; per: string; blurb: string; features: string[]; tag?: string }[] = [
  { id: 'free', name: 'Free', price: '£0', per: '', blurb: 'Everything you need to understand the journey.', features: ['All 7 stage guides and checklists', 'Full glossary', 'Core calculators', 'One free intro to a pro a month'] },
  { id: 'premium', name: 'Premium', price: '£7.49', per: 'a month', blurb: 'For when you’re actively buying.', features: ['Every five-minute lesson', 'Plain-English document explainers', 'Direct contact details for every pro', 'Personal saving plan', 'Ask Avenor, unlimited'] },
  { id: 'concierge', name: 'Concierge', price: '£18.99', per: 'a month', blurb: 'A person in your corner until completion.', features: ['Everything in Premium', 'Priority intros, replies within a day', 'A named buying coach', 'Offer and survey review calls'] },
]

export default function Premium() {
  const goBack = useBack()
  const { plan, setPlan } = useApp()
  const [pick, setPick] = useState<Plan>(plan === 'free' ? 'premium' : plan)
  const chosen = plans.find((p) => p.id === pick)!

  return (
    <Screen tabbed={false}>
      <div className="relative spruce grain px-6 pt-4 pb-12 overflow-hidden">
        <IconButton name="close" label="Close" tone="dark" onClick={goBack} />
        <div className="mt-6 flex items-center gap-3"><Mark size={40} tone="light" /><span className="t-h3">Avenor Premium</span></div>
        <h1 className="text-[2.75rem] leading-[0.98] font-semibold tracking-[-0.04em] mt-6">Buy with someone in your corner.</h1>
        <div className="mt-4">
          <p className="t-body text-teal-100/80">Contracts, surveys and offers, explained the same day.</p>
        </div>
      </div>

      <div className="relative z-10 -mt-7 rounded-t-[30px] bg-white pt-6 px-5 space-y-3" role="radiogroup" aria-label="Plans">
        {plans.map((p) => {
          const sel = pick === p.id
          return (
            <motion.button key={p.id} role="radio" aria-checked={sel} whileTap={{ scale: 0.99 }} onClick={() => setPick(p.id)} className={`relative w-full text-left rounded-[22px] p-5 transition-colors duration-300 ${sel ? 'spruce grain text-teal-50 shadow-float' : 'bg-white ring-1 ring-stone-200'}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="t-h3">{p.name}</span>
                <span><span className="text-[1.75rem] font-semibold tracking-[-0.03em] num">{p.price}</span>{p.per && <span className={`t-small ${sel ? 'text-teal-100/70' : 'text-muted'}`}> {p.per}</span>}</span>
              </div>
              <p className={`t-small mt-1 ${sel ? 'text-teal-100/75' : 'text-muted'}`}>{p.blurb}</p>
              {sel && (
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 t-small"><span className="text-gold-300 mt-0.5"><Icon name="check" size={16} stroke={2.4} /></span>{f}</li>
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
          goBack()
        }}>
          {pick === 'free' ? 'Stay on Free' : plan === pick ? `You’re on ${chosen.name}` : `Try ${chosen.name} free for 14 days`}
        </Button>
        <p className="t-micro font-normal text-muted text-center mt-3">Concept pricing. Cancel any time.</p>
      </div>
    </Screen>
  )
}
