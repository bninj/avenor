// The seven stages of buying a first home in England & Wales.
// Text in [[term|label]] becomes a tappable glossary word.

export type ProType = 'adviser' | 'solicitor' | 'surveyor' | 'agent'
export type HousePart = 'foundation' | 'walls' | 'windows' | 'door' | 'roof' | 'chimney' | 'garden'

export interface Task { id: string; label: string; hint?: string }
export interface Link { label: string; site: string; url: string }

export interface Stage {
  id: string
  n: number
  title: string
  short: string
  weeks: string
  cost: string
  points: string[]
  watch: string
  tasks: Task[]
  terms: string[]
  links: Link[]
  pro?: { type: ProType; cta: string }
  part: HousePart
  partLabel: string
  premiumTip: string
}

export const stages: Stage[] = [
  {
    id: 'budget',
    n: 1,
    title: 'Know your budget',
    short: 'Know your number before you fall in love.',
    weeks: '1–2 weeks',
    cost: 'Free',
    points: ['Lenders usually lend about 4.5 times your yearly income.', 'Your [[deposit|deposit]] is at least 5% of the price.', 'Budget for [[sdlt|Stamp Duty]], solicitor and survey too.'],
    watch: 'Keep three months of tidy bank statements.',
    tasks: [
      { id: 'b1', label: 'Add up your savings', hint: 'Include ISAs and gifts' },
      { id: 'b2', label: 'Check your credit report for free', hint: 'Join the electoral roll' },
      { id: 'b3', label: 'Work out your upfront cash', hint: 'The real total, not just the deposit' },
      { id: 'b4', label: 'Set your price range' },
    ],
    terms: ['deposit', 'ltv', 'credit-score', 'lisa', 'sdlt'],
    links: [
      { label: 'How much can I afford?', site: 'MoneyHelper', url: 'https://www.moneyhelper.org.uk/en/homes/buying-a-home' },
      { label: 'Lifetime ISA rules', site: 'GOV.UK', url: 'https://www.gov.uk/lifetime-isa' },
    ],
    part: 'foundation',
    partLabel: 'Foundations laid',
    premiumTip: 'A savings plan that names your ready-to-buy month.',
  },
  {
    id: 'mortgage',
    n: 2,
    title: 'Get a mortgage in principle',
    short: 'A lender’s early yes. Sellers take you seriously.',
    weeks: '1–7 days',
    cost: 'Usually free',
    points: ['An [[aip|agreement in principle]] is a lender’s early yes.', 'It takes minutes, and agents ask for it.', 'A [[broker|broker]] compares lenders for you.'],
    watch: 'Ask for a “soft search”. Other lenders won’t see it.',
    tasks: [
      { id: 'm1', label: 'Gather payslips and ID' },
      { id: 'm2', label: 'Speak to a mortgage broker', hint: 'Many are free to you' },
      { id: 'm3', label: 'Get your agreement in principle' },
      { id: 'm4', label: 'Save the certificate in your documents' },
    ],
    terms: ['aip', 'broker', 'fixed', 'tracker', 'ltv', 'arrangement-fee'],
    links: [
      { label: 'Choosing a mortgage', site: 'MoneyHelper', url: 'https://www.moneyhelper.org.uk/en/homes/buying-a-home/how-to-choose-the-right-mortgage' },
      { label: 'Check an adviser is FCA registered', site: 'FCA Register', url: 'https://register.fca.org.uk/' },
    ],
    pro: { type: 'adviser', cta: 'Find a mortgage adviser' },
    part: 'walls',
    partLabel: 'Walls up',
    premiumTip: 'Compare three brokers side by side.',
  },
  {
    id: 'search',
    n: 3,
    title: 'Find the right home',
    short: 'View with a checklist, not just your heart.',
    weeks: '1–6 months',
    cost: 'Free',
    points: ['Check the [[epc|EPC rating]] for heating costs.', 'Know if it’s [[freehold|freehold]] or [[leasehold|leasehold]].', 'Ask if the seller is in a [[chain|chain]].'],
    watch: 'Visit at night and at rush hour.',
    tasks: [
      { id: 's1', label: 'Pick two or three areas to focus on' },
      { id: 's2', label: 'Check sold prices on the street' },
      { id: 's3', label: 'Book viewings' },
      { id: 's4', label: 'Shortlist your favourite' },
    ],
    terms: ['epc', 'freehold', 'leasehold', 'chain', 'service-charge'],
    links: [
      { label: 'Find an energy certificate', site: 'GOV.UK', url: 'https://www.gov.uk/find-energy-certificate' },
      { label: 'House price data', site: 'HM Land Registry', url: 'https://www.gov.uk/search-house-prices' },
    ],
    pro: { type: 'agent', cta: 'Find a local estate agent' },
    part: 'windows',
    partLabel: 'Windows in',
    premiumTip: 'Area reports: sold prices, schools, commute.',
  },
  {
    id: 'offer',
    n: 4,
    title: 'Make an offer',
    short: 'Offer with confidence. Get it in writing.',
    weeks: '1–2 weeks',
    cost: 'Free',
    points: ['Offer through the agent, often below asking.', 'Get a [[memorandum|memorandum of sale]] once accepted.', 'Nothing is binding until [[exchange|exchange]].'],
    watch: 'Ask for the home to come off the market.',
    tasks: [
      { id: 'o1', label: 'Check what similar homes sold for' },
      { id: 'o2', label: 'Decide your opening offer and your limit' },
      { id: 'o3', label: 'Make the offer in writing' },
      { id: 'o4', label: 'Get the memorandum of sale' },
    ],
    terms: ['memorandum', 'gazumping', 'gazundering', 'exchange', 'chain-free'],
    links: [{ label: 'Making an offer', site: 'MoneyHelper', url: 'https://www.moneyhelper.org.uk/en/homes/buying-a-home' }],
    pro: { type: 'agent', cta: 'Talk to an estate agent' },
    part: 'door',
    partLabel: 'Front door fitted',
    premiumTip: 'Offer scripts that sound like a pro.',
  },
  {
    id: 'solicitor',
    n: 5,
    title: 'Instruct a solicitor',
    short: 'The legal side, made understandable.',
    weeks: '8–12 weeks',
    cost: '£1,000–£2,000',
    points: ['A solicitor handles the legal side: [[conveyancing|conveyancing]].', 'They run [[searches|searches]] and check the [[title|title deeds]].', 'Reply fast. This is often the slowest stage.'],
    watch: 'Pick one on your lender’s panel.',
    tasks: [
      { id: 'l1', label: 'Get two fixed-fee quotes' },
      { id: 'l2', label: 'Instruct your solicitor and send ID' },
      { id: 'l3', label: 'Apply for your full mortgage offer' },
      { id: 'l4', label: 'Read the searches summary' },
    ],
    terms: ['conveyancing', 'conveyancer', 'searches', 'title', 'mortgage-offer'],
    links: [
      { label: 'Check a solicitor', site: 'SRA', url: 'https://www.sra.org.uk/consumers/register/' },
      { label: 'Conveyancing explained', site: 'GOV.UK', url: 'https://www.gov.uk/buy-sell-your-home/conveyancing' },
    ],
    pro: { type: 'solicitor', cta: 'Find a conveyancing solicitor' },
    part: 'roof',
    partLabel: 'Roof on',
    premiumTip: 'Upload legal letters, get the key points.',
  },
  {
    id: 'survey',
    n: 6,
    title: 'Get a survey',
    short: 'Find problems before they’re yours.',
    weeks: '1–2 weeks',
    cost: '£400–£1,500',
    points: ['The lender’s [[valuation|valuation]] protects the lender, not you.', 'A [[survey|RICS survey]] checks the home itself.', 'Found a problem? Renegotiate the price.'],
    watch: 'Victorian terrace? Choose a Level 3.',
    tasks: [
      { id: 'v1', label: 'Choose a survey level' },
      { id: 'v2', label: 'Book a RICS surveyor' },
      { id: 'v3', label: 'Read the report' },
      { id: 'v4', label: 'Renegotiate or move forward' },
    ],
    terms: ['survey', 'valuation', 'gazundering', 'buildings-insurance'],
    links: [
      { label: 'Survey levels explained', site: 'RICS', url: 'https://www.ricsfirms.com/' },
      { label: 'Types of survey', site: 'MoneyHelper', url: 'https://www.moneyhelper.org.uk/en/homes/buying-a-home' },
    ],
    pro: { type: 'surveyor', cta: 'Find a RICS surveyor' },
    part: 'chimney',
    partLabel: 'Checked and sound',
    premiumTip: 'A traffic-light summary of your survey.',
  },
  {
    id: 'completion',
    n: 7,
    title: 'Exchange and get the keys',
    short: 'Sign, pay, pick up your keys.',
    weeks: '1–4 weeks',
    cost: 'Removals and your deposit',
    points: ['At [[exchange|exchange]], the deal becomes binding.', 'You need [[buildings-insurance|buildings insurance]] from that day.', 'On [[completion|completion]], you collect your keys.'],
    watch: 'Photograph the meters on moving day.',
    tasks: [
      { id: 'c1', label: 'Arrange buildings insurance' },
      { id: 'c2', label: 'Sign your contract and transfer the deposit' },
      { id: 'c3', label: 'Book removals for completion day' },
      { id: 'c4', label: 'Collect your keys' },
    ],
    terms: ['exchange', 'completion', 'buildings-insurance', 'sdlt'],
    links: [{ label: 'Stamp Duty: pay and file', site: 'GOV.UK', url: 'https://www.gov.uk/stamp-duty-land-tax' }],
    pro: { type: 'solicitor', cta: 'Ask a solicitor' },
    part: 'garden',
    partLabel: 'Home, finished',
    premiumTip: 'A moving-day checklist, timed to your date.',
  },
]

export const stageById = Object.fromEntries(stages.map((s) => [s.id, s])) as Record<string, Stage>
export const allTaskCount = stages.reduce((n, s) => n + s.tasks.length, 0)
