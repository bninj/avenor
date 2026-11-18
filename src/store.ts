import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { stages, type HousePart } from './data/stages'

export interface Profile {
  name: string
  goal: 'buy' | 'sell'
  firstTime: boolean
  budget: number
  savings: number
  income: number
  area: string // e.g. "Moseley"
  postcode: string // district, e.g. "B13"
  when: string
  randomised: boolean
}

type Plan = 'free' | 'premium' | 'concierge'

interface State {
  profile: Profile | null
  done: Record<string, true> // task id -> done
  celebrated: Record<string, true> // stage id -> celebration shown
  saved: Record<string, true> // pro ids
  plan: Plan
  demo: boolean
  waitlist: boolean
  intros: Record<string, string>
  docs: Record<string, { file: string; date: string }>
  setProfile: (p: Profile) => void
  toggleTask: (id: string) => void
  markCelebrated: (stageId: string) => void
  toggleSaved: (id: string) => void
  setPlan: (p: Plan) => void
  joinWaitlist: () => void
  requestIntro: (id: string) => void
  addDoc: (id: string, file: string) => void
  removeDoc: (id: string) => void
  startDemo: (p: Profile) => void
  reset: () => void
}

const initial = { profile: null, done: {}, celebrated: {}, saved: {}, plan: 'free' as Plan, demo: false, waitlist: false, intros: {} as Record<string, string>, docs: {} as Record<string, { file: string; date: string }> }

export const useApp = create<State>()(
  persist(
    (set) => ({
      ...initial,
      setProfile: (profile) => set({ profile }),
      toggleTask: (id) =>
        set((s) => {
          const done = { ...s.done }
          if (done[id]) delete done[id]
          else done[id] = true
          return { done }
        }),
      markCelebrated: (stageId) => set((s) => ({ celebrated: { ...s.celebrated, [stageId]: true } })),
      toggleSaved: (id) =>
        set((s) => {
          const saved = { ...s.saved }
          if (saved[id]) delete saved[id]
          else saved[id] = true
          return { saved }
        }),
      setPlan: (plan) => set({ plan }),
      joinWaitlist: () => set({ waitlist: true }),
      addDoc: (id, file) => set((s) => ({ docs: { ...s.docs, [id]: { file, date: new Date().toISOString() } } })),
      removeDoc: (id) => set((s) => { const docs = { ...s.docs }; delete docs[id]; return { docs } }),
      requestIntro: (id) => set((s) => ({ intros: { ...s.intros, [id]: new Date().toISOString() } })),
      // Demo: stage 1 finished, stage 2 half done, so a judge can finish it and watch the walls go up
      startDemo: (profile) =>
        set({
          ...initial,
          profile,
          demo: true,
          done: { b1: true, b2: true, b3: true, b4: true, m1: true, m2: true },
          celebrated: { budget: true },
          saved: { lantern: true },
          docs: { id: { file: 'passport.jpg', date: new Date().toISOString() }, payslips: { file: 'payslips-aug-oct.pdf', date: new Date().toISOString() } },
        }),
      reset: () => set({ ...initial }),
    }),
    { name: 'avenor-v1' },
  ),
)

// ── Derived helpers ───────────────────────────
export const stageProgress = (done: Record<string, true>, stageId: string) => {
  const s = stages.find((x) => x.id === stageId)!
  const n = s.tasks.filter((t) => done[t.id]).length
  return { n, total: s.tasks.length, complete: n === s.tasks.length }
}

export const builtParts = (done: Record<string, true>): HousePart[] =>
  stages.filter((s) => stageProgress(done, s.id).complete).map((s) => s.part)

export const currentStage = (done: Record<string, true>) =>
  stages.find((s) => !stageProgress(done, s.id).complete) ?? stages[stages.length - 1]

export const overallPercent = (done: Record<string, true>) => {
  const total = stages.reduce((n, s) => n + s.tasks.length, 0)
  const n = stages.reduce((k, s) => k + s.tasks.filter((t) => done[t.id]).length, 0)
  return Math.round((n / total) * 100)
}

// ── Random profile for people who skip questions ──
const names = ['Amara', 'Josh', 'Priya', 'Callum', 'Zainab', 'Leah', 'Kiran', 'Ellie', 'Tomasz', 'Nia']
const places: [string, string][] = [
  ['Moseley', 'B13'], ['Harborne', 'B17'], ['Bournville', 'B30'], ['Kings Heath', 'B14'], ['Brindleyplace', 'B1'], ['Digbeth', 'B5'], ['Stirchley', 'B30'],
]
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
const roundTo = (n: number, step: number) => Math.round(n / step) * step

export function randomProfile(partial: Partial<Profile> = {}): Profile {
  const [area, postcode] = pick(places)
  const budget = roundTo(180_000 + Math.random() * 110_000, 5_000)
  return {
    name: pick(names),
    goal: 'buy',
    firstTime: true,
    budget,
    savings: roundTo(budget * (0.07 + Math.random() * 0.08), 500),
    income: roundTo(38_000 + Math.random() * 22_000, 1_000),
    area,
    postcode,
    when: pick(['In the next 6 months', 'In 6 to 12 months', 'In the next year or two']),
    randomised: true,
    ...partial,
  }
}

export const demoProfile: Profile = {
  name: 'Gurpreet',
  goal: 'buy',
  firstTime: true,
  budget: 225_000,
  savings: 24_000,
  income: 42_000,
  area: 'Moseley',
  postcode: 'B13',
  when: 'In the next 6 months',
  randomised: false,
}

/** Free plan: one introduction per calendar month */
export const freeIntroUsed = (intros: Record<string, string>) => {
  const now = new Date()
  return Object.values(intros).some((d) => { const t = new Date(d); return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth() })
}
