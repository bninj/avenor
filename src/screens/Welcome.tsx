import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui'
import type { HousePart } from '../data/stages'

const HouseCanvas = lazy(() => import('../components/HouseCanvas'))
const ORDER: HousePart[] = ['foundation', 'walls', 'windows', 'door', 'roof', 'chimney', 'garden']

export default function Welcome() {
  const nav = useNavigate()
  const [n, setN] = useState(0)
  // The brand moment: the house assembles itself, piece by piece
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x < ORDER.length ? x + 1 : x)), 420)
    return () => clearInterval(t)
  }, [])

  return (
    <main className="screen-enter absolute inset-0 spruce grain flex flex-col overflow-hidden">
      <div className="px-6 pt-5 flex items-center justify-between">
        <Logo size={26} tone="light" />
        <button onClick={() => nav('/demo')} className="t-small font-medium text-teal-100/80 min-h-11 px-2">Watch demo</button>
      </div>

      <div className="relative flex-1 min-h-0">
        <Suspense fallback={null}>
          <HouseCanvas parts={ORDER.slice(0, n)} dark ghost zoom={1} className="absolute inset-0" />
        </Suspense>
      </div>

      <div className="px-6 pb-6">
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-[3rem] leading-[0.95] font-semibold tracking-[-0.04em]">
          From deposit<br />to doorstep.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="t-body text-teal-100/75 mt-3 mb-7">
          Seven clear steps to your first home.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-2">
          <Button variant="light" onClick={() => nav('/start')}>Get started</Button>
          <button onClick={() => nav('/selling')} className="w-full min-h-12 t-small font-medium text-teal-100/80">I’m selling a home</button>
        </motion.div>
      </div>
    </main>
  )
}
