import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store'
import { Icon, type IconName } from '../components/Icon'
import { Mark } from '../components/Logo'
import { Button, IconButton, Screen, toast, useBack } from '../components/ui'

type Plan = 'free' | 'premium' | 'concierge'
type Feature = { t: string; icon: IconName; to?: string }

const plans: { id: Plan; name: string; price: string; per: string; blurb: string; features: Feature[] }[] = [
  { id: 'free', name: 'Free', price: '£0', per: '', blurb: 'Learn the process and plan your budget.', features: [
    { t: 'All 7 stage guides and checklists', icon: 'journey' },
    { t: 'Glossary and calculators', icon: 'calc' },
    { t: 'One free introduction a month', icon: 'message' },
  ] },
  { id: 'premium', name: 'Premium', price: '£7.49', per: 'a month', blurb: 'For when you are actively buying.', features: [
    { t: 'Compare homes side by side', icon: 'compare', to: '/compare' },
    { t: 'Document folder: keep everything in one place', icon: 'folder', to: '/documents' },
    { t: 'Every lesson and document explainer', icon: 'learn' },
    { t: 'Direct contact with every professional', icon: 'phone' },
    { t: 'A small 3D model of your new home', icon: 'home', to: '/house' },
  ] },
  { id: 'concierge', name: 'Concierge', price: '£18.99', per: 'a month', blurb: 'A person in your corner until you get the keys.', features: [
    { t: 'Everything in Premium', icon: 'check' },
    { t: 'Main structure report on the home you buy', icon: 'report', to: '/report' },
    { t: 'A named buying coach', icon: 'user' },
    { t: 'Priority introductions, replies within a day', icon: 'clock' },
    { t: 'Welcome box with a 3D model of your home', icon: 'gift', to: '/house' },
  ] },
]

export default function Premium() {
  const nav = useNavigate()
  const goBack = useBack()
  const [params] = useSearchParams()
  const first = params.get('first') === '1' // shown once, straight after sign up
  const demo = params.get('demo') === '1'
  const { plan, setPlan } = useApp()
  const [pick, setPick] = useState<Plan>(plan === 'free' ? 'premium' : plan)
  const chosen = plans.find((p) => p.id === pick)!
  const leave = () => (first ? nav('/home', { replace: true }) : goBack())

  // In the self-playing demo, show the plans briefly, then carry on with Free
  useEffect(() => {
    if (!demo) return
    const t = setTimeout(() => nav('/home', { replace: true }), 3200)
    return () => clearTimeout(t)
  }, [demo, nav])

  return (
    <Screen tabbed={false}>
      <div className="hero-light grain grain-light relative px-6 pt-4 pb-12 overflow-hidden">
        <span className="prism-streak" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <IconButton name="close" label={first ? 'Continue with Free' : 'Close'} onClick={leave} />
          {first && <button onClick={leave} className="t-small font-semibold text-teal-700 min-h-11 px-2">Not now</button>}
        </div>
        <div className="mt-6 flex items-center gap-2.5"><Mark size={34} /><span className="t-h3 text-teal-800">Avenor Premium</span></div>
        <h1 className="t-display mt-4">{first ? 'Buy with confidence, from day one.' : 'Buy with someone in your corner.'}</h1>
        <p className="t-body text-muted mt-3">Compare homes, keep your documents together, and get expert help when it matters.</p>
      </div>

      <div className="relative z-10 -mt-7 rounded-t-[30px] bg-white pt-6 px-5 space-y-3" role="radiogroup" aria-label="Plans">
        {plans.map((p) => {
          const sel = pick === p.id
          return (
            <motion.div key={p.id} layout className={`rounded-[22px] bg-white transition-shadow ${sel ? 'ring-2 ring-teal-800 shadow-float' : 'ring-1 ring-stone-200'}`}>
              <button role="radio" aria-checked={sel} onClick={() => setPick(p.id)} className="w-full text-left p-5 pb-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <span className={`size-5 rounded-full grid place-items-center ${sel ? 'bg-teal-800 text-white' : 'ring-[1.5px] ring-stone-400/60'}`}>{sel && <Icon name="check" size={12} stroke={3} />}</span>
                    <span className="t-h3 text-teal-800">{p.name}</span>
                  </span>
                  <span><span className="text-[1.6rem] font-bold tracking-[-0.03em] num text-teal-800">{p.price}</span>{p.per && <span className="t-small text-muted"> {p.per}</span>}</span>
                </div>
                <p className="t-small text-muted mt-1 pl-[30px]">{p.blurb}</p>
              </button>
              {sel && (
                <ul className="px-5 pb-5 space-y-1">
                  {p.features.map((f) => (
                    <li key={f.t}>
                      <button disabled={!f.to} onClick={() => f.to && nav(`${f.to}?preview=1`)} className="w-full flex items-center gap-3 rounded-[12px] py-2 text-left disabled:cursor-default enabled:active:bg-stone-50">
                        <span className="size-8 shrink-0 rounded-[10px] bg-teal-50 text-teal-800 grid place-items-center"><Icon name={f.icon} size={16} /></span>
                        <span className="flex-1 t-small text-teal-900">{f.t}</span>
                        {f.to && <span className="t-micro text-teal-700 flex items-center">Preview<Icon name="right" size={13} /></span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="px-5 mt-6">
        <Button onClick={() => {
          setPlan(pick)
          toast(pick === 'free' ? 'You’re on the Free plan' : `${chosen.name} is on. No payment taken in the demo`)
          leave()
        }}>
          {pick === 'free' ? 'Continue with Free' : plan === pick ? `Keep ${chosen.name}` : `Start 14-day free trial`}
        </Button>
        {pick !== 'free' && <button onClick={leave} className="w-full min-h-12 t-small font-semibold text-muted">Continue with Free</button>}
        <p className="t-micro font-normal text-muted text-center mt-2">Concept pricing. Cancel any time. Professionals never pay to rank higher.</p>
      </div>
    </Screen>
  )
}
