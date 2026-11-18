// Scripted answers for the demo version of Ask Sovarna.
export interface Answer { q: string; keys: string[]; a: string; next?: { label: string; to: string } }

export const answers: Answer[] = [
  { q: 'How much deposit do I need?', keys: ['deposit', 'save', 'saving'],
    a: 'Usually at least 5% of the price: £11,000 on a £220,000 home. Save 10% and rates get cheaper. Add around £3,500 for fees.',
    next: { label: 'Open the upfront cash calculator', to: '/money?tab=upfront' } },
  { q: 'Do first-time buyers pay Stamp Duty?', keys: ['stamp', 'sdlt', 'tax'],
    a: 'Not on homes up to £300,000 in England. From £300,000 to £500,000 you pay 5% on the part above £300,000.',
    next: { label: 'Work out my Stamp Duty', to: '/money?tab=stamp' } },
  { q: 'What is an agreement in principle?', keys: ['principle', 'aip', 'dip', 'agreement'],
    a: 'A lender’s early “yes, probably”, with a rough amount. It takes about 15 minutes. Agents often ask for one before viewings.',
    next: { label: 'Go to stage 2: mortgage', to: '/journey/mortgage' } },
  { q: 'Level 2 or Level 3 survey?', keys: ['survey', 'level', 'surveyor'],
    a: 'Level 2 suits most homes in good shape. Level 3 suits older homes, or ones you plan to change. Many Birmingham terraces are Victorian.',
    next: { label: 'Find a RICS surveyor', to: '/pros?type=surveyor' } },
  { q: 'Leasehold or freehold?', keys: ['lease', 'freehold', 'leasehold', 'flat'],
    a: 'Freehold: you own the building and land. Leasehold: you own it for a set number of years, with yearly fees. Check the years left.' },
  { q: 'How long does buying take?', keys: ['long', 'time', 'weeks', 'months'],
    a: 'About 3 to 4 months from offer to keys. The legal work is slowest, so reply to your solicitor quickly.',
    next: { label: 'See my journey', to: '/journey' } },
]

export const fallback =
  'Good question. I can’t answer that one yet. Try one of the questions below, or tap Pros to ask a checked professional.'
