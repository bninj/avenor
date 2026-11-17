import type { ProType } from './stages'

// Demo profiles. These firms and people are invented for the prototype.
export interface Pro {
  id: string
  type: ProType
  firm: string
  person: string
  role: string
  area: string
  district: string
  lat: number
  lng: number
  rating: number
  reviews: number
  replies: string
  fee: string
  ftb: boolean
  languages: string[]
  register: string
  registerNo: string
  since: number
  about: string
  review: { text: string; by: string }
  tone: string
}

export const proTypeLabel: Record<ProType, { one: string; many: string; register: string }> = {
  adviser: { one: 'Mortgage adviser', many: 'Mortgage advisers', register: 'FCA' },
  solicitor: { one: 'Conveyancing solicitor', many: 'Solicitors', register: 'SRA' },
  surveyor: { one: 'Chartered surveyor', many: 'Surveyors', register: 'RICS' },
  agent: { one: 'Estate agent', many: 'Estate agents', register: 'Propertymark' },
}

export const pros: Pro[] = [
  {
    id: 'lantern', type: 'adviser', firm: 'Lantern Mortgage Studio', person: 'Imran Qureshi', role: 'Mortgage adviser',
    area: 'Moseley', district: 'B13', lat: 52.4452, lng: -1.8889, rating: 4.9, reviews: 212, replies: 'Usually replies in 1 hour',
    fee: 'No fee to you. Paid by the lender', ftb: true, languages: ['English', 'Urdu', 'Punjabi'], register: 'FCA', registerNo: 'FRN 9•••42', since: 2014,
    about: 'Imran has helped over 600 first-time buyers in south Birmingham. He explains every option on one page and never pushes a product.',
    review: { text: 'He drew our whole mortgage on a napkin and suddenly it made sense.', by: 'Leah and Sam, bought in Kings Heath' }, tone: '#E9D9B4',
  },
  {
    id: 'northlight', type: 'adviser', firm: 'Northlight Home Finance', person: 'Bethany Cole', role: 'Mortgage adviser',
    area: 'Sutton Coldfield', district: 'B72', lat: 52.5631, lng: -1.8232, rating: 4.8, reviews: 147, replies: 'Usually replies in 3 hours',
    fee: '£295 on completion', ftb: true, languages: ['English'], register: 'FCA', registerNo: 'FRN 8•••10', since: 2017,
    about: 'Bethany specialises in low-deposit and Lifetime ISA buyers, with evening appointments for people who work shifts.',
    review: { text: 'Answered my questions at 9pm on a Sunday. Honestly a lifesaver.', by: 'Kyle, bought in Erdington' }, tone: '#CFE2DD',
  },
  {
    id: 'caskkey', type: 'adviser', firm: 'Cask & Key Mortgages', person: 'Marcus Oyelaran', role: 'Mortgage adviser',
    area: 'Digbeth', district: 'B5', lat: 52.4747, lng: -1.8829, rating: 4.7, reviews: 96, replies: 'Usually replies same day',
    fee: 'No fee to you', ftb: true, languages: ['English', 'Yoruba'], register: 'FCA', registerNo: 'FRN 9•••77', since: 2019,
    about: 'Self-employed or on a contract? Marcus works with lenders who understand creative and freelance income.',
    review: { text: 'Three banks said no. Marcus found the one that said yes.', by: 'Jade, bought in Digbeth' }, tone: '#F1D8CB',
  },
  {
    id: 'okonjo', type: 'solicitor', firm: 'Okonjo Hartley Conveyancing', person: 'Adaeze Okonjo', role: 'Conveyancing solicitor',
    area: 'Jewellery Quarter', district: 'B3', lat: 52.4887, lng: -1.9108, rating: 4.9, reviews: 318, replies: 'Usually replies in 2 hours',
    fee: 'Fixed fee from £1,150 + VAT', ftb: true, languages: ['English', 'Igbo'], register: 'SRA', registerNo: 'SRA 6•••31', since: 2011,
    about: 'A fixed fee, one named lawyer, and a weekly update every Friday, even when there is no news.',
    review: { text: 'The Friday update emails kept me sane. I always knew where we were.', by: 'Priya, bought in Harborne' }, tone: '#D9E4D2',
  },
  {
    id: 'ravel', type: 'solicitor', firm: 'Ravel & Finch Property Law', person: 'Tom Ravel', role: 'Licensed conveyancer',
    area: 'Harborne', district: 'B17', lat: 52.4597, lng: -1.9531, rating: 4.8, reviews: 189, replies: 'Usually replies in 4 hours',
    fee: 'Fixed fee from £995 + VAT', ftb: true, languages: ['English', 'Polish'], register: 'CLC', registerNo: 'CLC 4•••08', since: 2016,
    about: 'Leasehold flats are Tom’s speciality. He reads the lease so you don’t have to, and flags anything unusual.',
    review: { text: 'Spotted a ground rent clause that would have doubled every ten years.', by: 'Owen, bought in Edgbaston' }, tone: '#E5DDF0',
  },
  {
    id: 'sandhu', type: 'solicitor', firm: 'Sandhu Whitlock Solicitors', person: 'Harleen Sandhu', role: 'Conveyancing solicitor',
    area: 'Handsworth', district: 'B21', lat: 52.5043, lng: -1.9289, rating: 4.9, reviews: 241, replies: 'Usually replies in 1 hour',
    fee: 'Fixed fee from £1,050 + VAT', ftb: true, languages: ['English', 'Punjabi', 'Hindi'], register: 'SRA', registerNo: 'SRA 5•••64', since: 2009,
    about: 'Family-run for 15 years. Harleen explains every document in English or Punjabi, and parents are welcome at meetings.',
    review: { text: 'My mum came to every meeting and understood everything. That meant a lot.', by: 'Arjun, bought in Great Barr' }, tone: '#F3E3B8',
  },
  {
    id: 'gable', type: 'surveyor', firm: 'Gable & Line Surveyors', person: 'Priya Raman', role: 'Chartered surveyor MRICS',
    area: 'Kings Heath', district: 'B14', lat: 52.4336, lng: -1.8932, rating: 5.0, reviews: 133, replies: 'Usually replies in 2 hours',
    fee: 'Level 2 from £495, Level 3 from £795', ftb: true, languages: ['English', 'Tamil'], register: 'RICS', registerNo: 'RICS 1•••92', since: 2013,
    about: 'Victorian and Edwardian terraces are most of Priya’s work. She calls you after every survey to talk it through.',
    review: { text: 'Found damp the seller didn’t mention. We got £4,000 off.', by: 'Tom and Aisha, bought in Moseley' }, tone: '#D6E6EA',
  },
  {
    id: 'fernhill', type: 'surveyor', firm: 'Fernhill Chartered Surveyors', person: 'Owen Pryce', role: 'Chartered surveyor FRICS',
    area: 'Edgbaston', district: 'B15', lat: 52.4627, lng: -1.9221, rating: 4.8, reviews: 88, replies: 'Usually replies same day',
    fee: 'Level 2 from £550', ftb: false, languages: ['English', 'Welsh'], register: 'RICS', registerNo: 'RICS 0•••45', since: 2002,
    about: 'Owen surveys period homes and conversions across the city, with clear photos of every issue in his reports.',
    review: { text: 'The report had photos of everything. Easy to show the seller.', by: 'Rachel, bought in Selly Oak' }, tone: '#E7E1D3',
  },
  {
    id: 'wren', type: 'agent', firm: 'Wren Lane Homes', person: 'Sophie Atwal', role: 'Sales manager',
    area: 'Bournville', district: 'B30', lat: 52.4283, lng: -1.9327, rating: 4.7, reviews: 164, replies: 'Usually replies in 1 hour',
    fee: 'Free for buyers', ftb: true, languages: ['English', 'Punjabi'], register: 'Propertymark', registerNo: 'PM 2•••19', since: 2015,
    about: 'Independent agent for Bournville and Stirchley. Sophie runs Saturday viewings just for first-time buyers.',
    review: { text: 'She told us honestly which house would need work. Rare for an agent.', by: 'Megan, bought in Stirchley' }, tone: '#F0DCCB',
  },
  {
    id: 'tallow', type: 'agent', firm: 'Tallow Estates', person: 'Danny Kowalski', role: 'Branch director',
    area: 'Stirchley', district: 'B30', lat: 52.4302, lng: -1.9183, rating: 4.6, reviews: 102, replies: 'Usually replies in 2 hours',
    fee: 'Free for buyers', ftb: true, languages: ['English', 'Polish'], register: 'Propertymark', registerNo: 'PM 3•••56', since: 2018,
    about: 'Small team, lots of flats and two-bed terraces under £230k. Good for a first rung on the ladder.',
    review: { text: 'Called us before the house went online. We were first through the door.', by: 'Chris, bought in Cotteridge' }, tone: '#DCE7D6',
  },
  {
    id: 'mews', type: 'agent', firm: 'Mews & Mortar', person: 'Grace Adeyemi', role: 'Senior negotiator',
    area: 'Jewellery Quarter', district: 'B1', lat: 52.4841, lng: -1.9087, rating: 4.8, reviews: 77, replies: 'Usually replies in 3 hours',
    fee: 'Free for buyers', ftb: true, languages: ['English', 'French'], register: 'Propertymark', registerNo: 'PM 4•••21', since: 2020,
    about: 'City-centre apartments and canal-side conversions. Grace explains every leasehold cost before you view.',
    review: { text: 'Gave us the service charge history for five years without us asking.', by: 'Dev, bought in the JQ' }, tone: '#E1E3EE',
  },
]

export const prosByType = (t?: ProType) => (t ? pros.filter((p) => p.type === t) : pros)
