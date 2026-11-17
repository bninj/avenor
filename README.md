# Avenor

**Your first home, step by step.** A mobile web app that guides UK first-time buyers through every stage of buying a home, and introduces checked local professionals at each step. Built as a demo for The Linda Plant enterprise competition.

- **Live demo:** `https://<github-user>.github.io/avenor/#/demo`
- **Normal start:** `https://<github-user>.github.io/avenor/`

The `#/demo` link is the one for the QR code. It fills in the sign-up by itself and lands on the home screen in about 10 seconds, with stage 1 done and stage 2 half done. A judge can finish stage 2 and watch the 3D house build.

## What's in it

| Screen | What it shows |
|---|---|
| Welcome | Buying or selling. Selling is "coming soon" with a waitlist |
| Quick profile | First name, then four tap-to-answer questions. Every question can be skipped; skipped answers are filled in with realistic examples |
| Home | Progress, next step, your 3D home, word of the day, Birmingham areas, nearby pros |
| Journey | The 7 stages: budget, mortgage, search, offer, solicitor, survey, keys |
| Stage | Three short points, tappable glossary words, checklist, official links, find a pro, Premium extra |
| Learn | Five-minute lessons (most locked behind Premium) and a searchable glossary |
| Money | Upfront cash, Stamp Duty, monthly cost and saving plan calculators |
| Pros | Map of Birmingham with checked solicitors, mortgage advisers, surveyors and agents. Contact details locked behind Premium |
| Your home | A 3D house that gains a piece for each finished stage |
| Premium | Free, Premium £7.49 and Concierge £18.99 (concept pricing, no payment taken) |
| Ask Avenor | Scripted AI helper with suggested questions |

On a laptop the app shows inside a phone frame, with a QR code and "things to try" beside it.

## Run it yourself

```bash
npm install
npm run dev
```

Build for publishing: `npm run build` (output goes to `dist/`).

## How it's published

Every push to `main` builds the app and publishes it to GitHub Pages using `.github/workflows/deploy.yml`. In the repo settings, **Pages → Source** must be set to **GitHub Actions**.

## Where to change things

| To change | Edit |
|---|---|
| Stage text, checklists, links | `src/data/stages.ts` |
| Glossary words | `src/data/glossary.ts` |
| Professionals on the map | `src/data/pros.ts` |
| Stamp Duty rates and typical fees | `src/data/rates.ts` (re-check GOV.UK before each pitch) |
| Ask Avenor answers | `src/data/answers.ts` |
| Colours and type | `src/index.css` (design tokens at the top) |
| Logo | `src/components/Logo.tsx`, `public/favicon.svg` |

## Decisions made along the way

- **GitHub Pages, not Vercel**, as requested. Hash links (`/#/journey`) keep every page working on Pages.
- **No real accounts yet.** Profiles and progress are saved on the phone. Google sign-in is shown but not connected.
- **Ask Avenor is scripted** so it is free and can't fail during the pitch.
- **Professionals are invented** and labelled as demo profiles, so no real firm appears endorsed.
- **Guidance, not advice.** Every money screen links to MoneyHelper and GOV.UK.
- **Logo** is Gurpreet's pin-and-house design, refined. Ten other directions are in `brand/`.

See `CREDITS.md` for photos, fonts and data sources.
