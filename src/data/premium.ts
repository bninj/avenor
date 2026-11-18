// Premium content: documents checklist, homes to compare, and a sample structure report.
export const docTypes = [
  { id: 'id', name: 'Photo ID and proof of address', stage: 'Mortgage' },
  { id: 'payslips', name: 'Last three payslips', stage: 'Mortgage' },
  { id: 'statements', name: 'Three months of bank statements', stage: 'Mortgage' },
  { id: 'aip', name: 'Agreement in principle', stage: 'Mortgage' },
  { id: 'memo', name: 'Memorandum of sale', stage: 'Offer' },
  { id: 'offer', name: 'Mortgage offer', stage: 'Legal' },
  { id: 'searches', name: 'Searches summary', stage: 'Legal' },
  { id: 'survey', name: 'Survey report', stage: 'Survey' },
  { id: 'contract', name: 'Signed contract', stage: 'Keys' },
  { id: 'insurance', name: 'Buildings insurance', stage: 'Keys' },
]

// Example shortlist (illustrative homes for the demo)
export const shortlist = [
  { id: 'h1', name: 'Valentine Road', area: 'Moseley, B13', img: 'img/moseley-valentine.webp', price: 235_000, beds: 2, epc: 'C', tenure: 'Freehold', commute: 15, garden: true },
  { id: 'h2', name: 'College Road', area: 'Moseley, B13', img: 'img/moseley-college.webp', price: 249_950, beds: 3, epc: 'D', tenure: 'Freehold', commute: 18, garden: true },
  { id: 'h3', name: 'Brindley Wharf', area: 'Brindleyplace, B1', img: 'img/brindley-pan.webp', price: 215_000, beds: 2, epc: 'B', tenure: 'Leasehold', commute: 8, garden: false },
]

// Concierge: a plain-English summary of the main structure (sample)
export const reportSample = [
  { part: 'Roof and chimney', rating: 'amber', note: 'Some slipped slates at the back. Worth a roofer’s quote, around £400 to £800.' },
  { part: 'Walls and damp', rating: 'red', note: 'Rising damp in the front room wall. Ask the seller to treat it or reduce the price.' },
  { part: 'Foundations and movement', rating: 'green', note: 'No signs of cracking or subsidence.' },
  { part: 'Electrics', rating: 'amber', note: 'Older fuse box. An electrician’s check is recommended before you move in.' },
  { part: 'Windows and doors', rating: 'green', note: 'Double glazed and in good condition.' },
] as const
