import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icon'
import { Screen } from '../components/ui'

export default function Welcome() {
  const nav = useNavigate()
  return (
    <Screen tabbed={false} className="flex flex-col">
      <div className="px-6 pt-5 flex items-center justify-between">
        <Logo size={28} />
        <button onClick={() => nav('/demo')} className="t-small font-semibold text-teal-700 min-h-11 px-2">Watch demo</button>
      </div>

      {/* Signature moment: the photo framed as a doorway */}
      <div className="relative px-6 pt-6">
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0 round 200px 200px 24px 24px)' }}
          animate={{ clipPath: 'inset(0% 0 0 0 round 200px 200px 24px 24px)' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-[78%] aspect-[3/3.7] overflow-hidden arch"
          style={{ ['--arch-foot' as string]: '24px' }}
        >
          <img src="img/door-plymouth.webp" alt="Two front doors under stone arches" className="h-full w-full object-cover" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="absolute right-6 bottom-5 rounded-2xl bg-white shadow-float px-4 py-3 flex items-center gap-3"
        >
          <span className="size-9 rounded-full bg-gold-100 text-gold-600 grid place-items-center"><Icon name="key" size={18} /></span>
          <span className="t-small leading-tight"><b className="font-semibold">7 steps</b><br /><span className="text-muted">deposit to keys</span></span>
        </motion.div>
      </div>

      <div className="px-6 pt-7 flex-1 flex flex-col">
        <h1 className="t-display mb-3">Your first home, step by step.</h1>
        <p className="t-body text-muted mb-7">Plain-English guides and checked local pros.</p>

        <div className="mt-auto space-y-3 pb-4">
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => nav('/start')} className="w-full rounded-2xl bg-teal-800 text-white p-4 flex items-center gap-4 text-left min-h-[68px]">
            <span className="size-11 rounded-xl bg-white/10 grid place-items-center"><Icon name="home" /></span>
            <span className="flex-1"><span className="block font-semibold">I’m buying a home</span><span className="t-small text-white/70">Your seven-step plan</span></span>
            <Icon name="right" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => nav('/selling')} className="w-full rounded-2xl ring-1 ring-inset ring-stone-200 p-4 flex items-center gap-4 text-left min-h-[68px]">
            <span className="size-11 rounded-xl bg-stone-100 grid place-items-center text-teal-800"><Icon name="tag" /></span>
            <span className="flex-1"><span className="block font-semibold">I’m selling a home</span><span className="t-small text-muted">Coming soon</span></span>
            <Icon name="right" className="text-stone-400" />
          </motion.button>
          <p className="t-micro font-normal text-muted text-center pt-2">Guidance, not financial advice. Made in Birmingham.</p>
        </div>
      </div>
    </Screen>
  )
}
