// Five-minute lessons: a few short cards each, in plain English.
export interface Lesson { id: string; title: string; mins: number; free: boolean; cards: { head: string; body: string }[] }

export const lessons: Lesson[] = [
  {
    id: 'l1', title: 'The real cost of buying', mins: 4, free: true,
    cards: [
      { head: 'The deposit is only part of it', body: 'Most people save for the deposit and forget the rest. Plan for a few thousand pounds more.' },
      { head: 'Stamp Duty', body: 'First-time buyers in England pay nothing on homes up to £300,000. Above that, you pay 5% on the part over £300,000.' },
      { head: 'Legal and survey fees', body: 'A solicitor costs about £1,000 to £2,000. A survey costs about £400 to £1,500. Searches add a few hundred more.' },
      { head: 'Moving day', body: 'Removals, a deep clean and the first bills add up. Keep £500 to £1,000 spare.' },
      { head: 'Your next step', body: 'Use the upfront cash calculator in Money to see your real total.' },
    ],
  },
  {
    id: 'l2', title: 'How a mortgage actually works', mins: 6, free: false,
    cards: [
      { head: 'You borrow, then repay monthly', body: 'The bank lends you most of the price. You pay it back each month, with interest, over many years.' },
      { head: 'Fixed or tracker', body: 'A fixed rate stays the same for a set time, so payments are predictable. A tracker moves with the Bank of England rate.' },
      { head: 'The term', body: 'A longer term means smaller payments but more interest overall. Many people choose 25 to 35 years.' },
      { head: 'Fees matter', body: 'A low rate with a big fee can cost more than a slightly higher rate with no fee. Compare the total.' },
      { head: 'Your next step', body: 'Get an agreement in principle so sellers know you are serious.' },
    ],
  },
  {
    id: 'l3', title: 'Offering without overpaying', mins: 5, free: false,
    cards: [
      { head: 'Know the street', body: 'Check what similar homes nearby really sold for, not what they were listed at.' },
      { head: 'Start below, set a limit', body: 'Decide your opening offer and the most you will pay before you call the agent.' },
      { head: 'Show you are strong', body: 'Mention your agreement in principle and that you are not in a chain. Sellers like certainty.' },
      { head: 'Get it in writing', body: 'Once accepted, ask for the memorandum of sale and for the home to come off the market.' },
    ],
  },
  {
    id: 'l4', title: 'Reading a survey report', mins: 5, free: false,
    cards: [
      { head: 'Look for the colours', body: 'Most reports rate each part of the home green, amber or red. Start with the reds.' },
      { head: 'Red means act now', body: 'Red items need urgent repair or more checks. Get a quote before you exchange.' },
      { head: 'Use it to renegotiate', body: 'If repairs are costly, you can ask the seller to fix them or lower the price.' },
      { head: 'Ask the surveyor', body: 'A good surveyor will happily talk you through the report on the phone.' },
    ],
  },
]
