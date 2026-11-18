import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { Icon } from '../components/Icon'
import { Button, Screen, TopBar } from '../components/ui'

const coming = ['Price your home with real sold data', 'Choose an agent with honest fee comparisons', 'A seller checklist, from photos to completion']

export default function Selling() {
  const nav = useNavigate()
  const { waitlist, joinWaitlist, profile } = useApp()
  return (
    <Screen tabbed={false} className="flex flex-col">
      <TopBar back />
      <div className="px-6 flex-1 flex flex-col">
        <div className="mt-2 h-[300px] rounded-[24px] overflow-hidden">
          <img src="img/moseley-college.webp" alt="Houses on College Road, Moseley" className="photo h-full w-full object-cover" />
        </div>
        <p className="t-small font-semibold text-teal-700 mt-7 mb-1">Coming next</p>
        <h1 className="t-h1 mb-3">Selling, made just as clear.</h1>
        <p className="t-body text-muted mb-6">Buyers first. Sellers next.</p>
        <ul className="space-y-3 mb-8">
          {coming.map((c) => (
            <li key={c} className="flex gap-3 t-body"><span className="text-teal-700 mt-1"><Icon name="check" size={18} stroke={2.2} /></span>{c}</li>
          ))}
        </ul>
        <div className="mt-auto pb-6 space-y-2">
          <Button onClick={joinWaitlist} disabled={waitlist}>{waitlist ? 'You’re on the list' : 'Tell me when it’s ready'}</Button>
          <Button variant="ghost" onClick={() => nav(profile ? '/home' : '/start')}>I’m buying instead</Button>
        </div>
      </div>
    </Screen>
  )
}
