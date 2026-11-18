import { useNavigate } from 'react-router-dom'
import { gbp } from '../data/rates'
import { pros } from '../data/pros'
import { overallPercent, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Avatar, Disclaimer, Screen, TopBar, toast } from '../components/ui'

export default function Me() {
  const nav = useNavigate()
  const { profile, plan, saved, done, reset, intros } = useApp()
  if (!profile) return null
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
  const install = async () => {
    const prompt = (window as unknown as { __installPrompt?: { prompt: () => Promise<void> } }).__installPrompt
    if (prompt) await prompt.prompt()
    else if (/iphone|ipad/i.test(navigator.userAgent)) toast('Tap Share, then “Add to Home Screen”')
    else toast('Open your browser menu, then “Install app”')
  }
  const savedPros = pros.filter((p) => saved[p.id])
  const rows: [string, string][] = [
    ['Looking in', `${profile.area}, ${profile.postcode}`],
    ['Budget', gbp(profile.budget)],
    ['Saved so far', gbp(profile.savings)],
    ['First home', profile.firstTime ? 'Yes' : 'No'],
    ['Moving', profile.when],
  ]
  return (
    <Screen tabbed={false}>
      <TopBar back />
      <div className="px-6 flex items-center gap-4">
        <Avatar name={profile.name} size={68} />
        <div>
          <h1 className="t-h1">{profile.name}</h1>
          <p className="t-small text-muted">{plan === 'free' ? 'Free plan' : plan === 'premium' ? 'Premium' : 'Concierge'}, {overallPercent(done)}% through your journey</p>
        </div>
      </div>
      {profile.randomised && (
        <p className="mx-6 mt-4 rounded-2xl bg-gold-100 p-4 t-small">You skipped some questions, so we filled in examples.</p>
      )}

      <section className="px-6 mt-7">
        <h2 className="t-h3 mb-2">Your plan</h2>
        <ul className="rounded-[22px] ring-1 ring-stone-200 divide-y divide-stone-200">
          {rows.map(([k, v]) => (
            <li key={k} className="flex justify-between gap-4 px-4 py-3.5"><span className="text-muted">{k}</span><span className="font-medium text-right num">{v}</span></li>
          ))}
        </ul>
      </section>

      <section className="px-6 mt-7">
        <h2 className="t-h3 mb-2">Saved professionals</h2>
        {savedPros.length ? (
          <ul className="space-y-2">
            {savedPros.map((p) => (
              <li key={p.id}><button onClick={() => nav(`/pros?type=${p.type}&id=${p.id}`)} className="w-full text-left flex items-center gap-3 rounded-2xl ring-1 ring-stone-200 p-3"><Avatar name={p.person} tone={p.tone} size={40} /><span className="flex-1 font-medium">{p.firm}</span><Icon name="right" size={18} className="text-muted" /></button></li>
            ))}
          </ul>
        ) : (
          <button onClick={() => nav('/pros')} className="w-full text-left rounded-2xl bg-stone-50 p-4 t-small text-muted">Tap the heart on a pro to save them.</button>
        )}
      </section>

      {Object.keys(intros).length > 0 && (
        <section className="px-6 mt-7">
          <h2 className="t-h3 mb-2">Introductions requested</h2>
          <ul className="rounded-[20px] ring-1 ring-stone-200 divide-y divide-stone-200">
            {pros.filter((p) => intros[p.id]).map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={p.person} tone={p.tone} size={36} />
                <span className="flex-1 min-w-0"><span className="block font-medium truncate">{p.person}</span><span className="t-small text-muted">{p.firm}</span></span>
                <span className="t-small text-muted num">{new Date(intros[p.id]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-6 mt-7 rounded-[20px] ring-1 ring-stone-200 divide-y divide-stone-200 overflow-hidden">
        <MenuRow icon="spark" label="Avenor Premium" onClick={() => nav('/premium')} />
        <MenuRow icon="tag" label="Selling a home" onClick={() => nav('/selling')} />
        {!standalone && <MenuRow icon="home" label="Add Avenor to your Home Screen" onClick={install} />}
        <MenuRow icon="message" label="Send feedback on the beta" onClick={() => toast('Thanks! Feedback goes to the Avenor team')} />
        <MenuRow icon="learn" label="Help, FAQ and privacy" onClick={() => nav('/help')} />
        <MenuRow icon="refresh" label="Reset demo and start again" onClick={() => { reset(); nav('/welcome', { replace: true }) }} />
      </section>

      <Disclaimer className="px-6 mt-8" />
      <p className="px-6 mt-3 t-micro font-normal text-stone-400">Photos from Wikimedia Commons, credited in the project’s CREDITS file. Professionals shown are demo profiles.</p>
    </Screen>
  )
}

function MenuRow({ icon, label, onClick }: { icon: 'spark' | 'tag' | 'message' | 'refresh' | 'home' | 'learn'; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 min-h-14 active:bg-stone-50">
      <Icon name={icon} size={20} className="text-teal-700" />
      <span className="flex-1 text-left font-medium">{label}</span>
      <Icon name="right" size={18} className="text-stone-400" />
    </button>
  )
}
