// All money rules live here so they are easy to update when the government changes them.
// Source: GOV.UK, "Stamp Duty Land Tax: residential property rates" (England & Northern Ireland).
// Rates in force from 1 April 2025. Re-check before every pitch or release.

export const rates = {
  source: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
  checked: '17 November 2026',
  region: 'England & Northern Ireland',

  sdltStandard: [
    { upTo: 125_000, rate: 0 },
    { upTo: 250_000, rate: 0.02 },
    { upTo: 925_000, rate: 0.05 },
    { upTo: 1_500_000, rate: 0.1 },
    { upTo: Infinity, rate: 0.12 },
  ],
  // First-time buyer relief: only if the price is £500,000 or less
  sdltFirstTime: { maxPrice: 500_000, bands: [{ upTo: 300_000, rate: 0 }, { upTo: 500_000, rate: 0.05 }] },

  // Typical ranges used by the upfront cash estimator (illustrative, midpoints used)
  typicalFees: {
    solicitor: 1_500,
    searches: 350,
    survey: 650,
    mortgageFee: 999,
    brokerFee: 0,
    removals: 600,
  },
  defaultRate: 4.6, // % a year, illustrative only
  incomeMultiple: 4.5,
}

type Band = { upTo: number; rate: number }
const banded = (price: number, bands: Band[]) => {
  let tax = 0
  let floor = 0
  for (const b of bands) {
    if (price > floor) tax += (Math.min(price, b.upTo) - floor) * b.rate
    floor = b.upTo
  }
  return Math.round(tax)
}

export function stampDuty(price: number, firstTime: boolean) {
  if (firstTime && price <= rates.sdltFirstTime.maxPrice) return banded(price, rates.sdltFirstTime.bands)
  return banded(price, rates.sdltStandard)
}

export function monthlyPayment(loan: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12
  const n = years * 12
  if (r === 0) return loan / n
  return (loan * r) / (1 - Math.pow(1 + r, -n))
}

export const gbp = (n: number) =>
  '£' + Math.round(n).toLocaleString('en-GB')
