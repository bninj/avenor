# Avenor

**Your first home, step by step.** A mobile web app that guides UK first-time buyers through every stage of buying a home, and introduces checked local professionals at each step. Built as a demo for The Linda Plant enterprise competition.

- **Live demo:** https://bninj.github.io/avenor/#/demo
- **Normal start:** https://bninj.github.io/avenor/

The `#/demo` link is the one for the QR code (`brand/qr-demo.png` and `.svg`, ready to print). It fills in the sign-up by itself and lands on the home screen in about 10 seconds, with stage 1 done and stage 2 half done. A judge can finish stage 2 and watch the 3D house build.

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

## Testing on real phones (no local server needed)

Everything below uses the public link, so it works the same in a pitch room as at home.

| Way to test | How | Cost |
|---|---|---|
| **Any phone, in the browser** | Scan the QR or open the link in Safari (iPhone) or Chrome (Android) | Free |
| **As an installed app** | iPhone: Safari, Share, *Add to Home Screen*. Android: Chrome menu, *Install app* (or *Add Avenor to your Home Screen* inside the app's profile screen). Opens full-screen with its own icon | Free |
| **Offline** | Open the link once on Wi-Fi. After that the app, fonts and 3D house work with no connection (map tiles only show areas already viewed) | Free |
| **Real iPhones and Androids in the cloud** | BrowserStack Live or LambdaTest Real Device: paste the live link and pick a device (free trial minutes) | Free trial |
| **Android app file for beta testers** | pwabuilder.com: paste the live link, download the Android package (APK) and share it | Free |
| **App Store / TestFlight** | PWABuilder can also make an iOS project, but TestFlight needs an Apple Developer account | £79/year |

Pitch-day checklist: open the demo link once on the presenting phone before you go on (this saves it for offline), keep `backup/avenor-key-screens.pdf` on the laptop, and have the QR on a slide.

## Beta test (simulated people)

`tests/beta.cjs` plays ten people of different ages through real tasks on different phones and checks for errors, text running off screen, small tap targets and accessibility (axe). Run it against the live site:

```bash
node tests/beta.cjs https://bninj.github.io/avenor/
```

| Tester | Phone | What they do |
|---|---|---|
| Priya, 19 | iPhone SE | Skips every question, looks up a word, reads a lesson |
| Jordan, 26 | Pixel 7 | Full sign up, finishes stage 1, checks Stamp Duty on £320k |
| Amira, 33 | iPhone 13 | Asks a question, finds a solicitor, asks for an intro, saves them |
| Dave, 47 | Pixel 7 | Has owned before, so normal Stamp Duty must apply |
| Joan, 64 | iPhone 13, large text | Reads stages, money and Premium with big text |
| Ken, 58 | iPhone 13 | Wants to sell, joins the waitlist |
| Sam, 29 | iPhone 13 | Follows task buttons out to the map, calculator and Ask, then back to the stage |
| Lee, 35 | iPhone 13 | Opens broken links, uses Back from pages opened straight from a link |
| Maya, 23 | iPhone 13 | Sees the plans after sign up, previews features, upgrades to Concierge |
| A judge | 1366 by 768 laptop | Watches the demo, uses the keyboard, clicks stages on the side panel |

## Overlap sweep

`tests/overlap.cjs` checks every screen on four phone setups and three laptop sizes for covered buttons, overlapping text, content hidden behind the tab bar and anything running off the screen.

```bash
node tests/overlap.cjs https://bninj.github.io/avenor/
```

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
| Colours, type, grain texture | `src/index.css` (design tokens at the top) |
| Logo | `src/components/Logo.tsx`, `public/favicon.svg` |

## Decisions made along the way

- **GitHub Pages, not Vercel**, as requested. Hash links (`/#/journey`) keep every page working on Pages.
- **No real accounts yet.** Profiles and progress are saved on the phone. Google sign-in is shown but not connected.
- **Ask Avenor is scripted** so it is free and can't fail during the pitch.
- **Professionals are invented** and labelled as demo profiles, so no real firm appears endorsed.
- **Guidance, not advice.** Every money screen links to MoneyHelper and GOV.UK.
- **Logo** merges Gurpreet's pin-and-house idea into one shape with a brass door. Earlier directions are in `brand/`.
- **Identity**: one typeface (Switzer) at extreme sizes, spruce colour blocks with film grain, brass only for earned moments, and a Birmingham red-brick house as the signature object. Unbuilt parts show as a faint ghost of the finished home.

See `CREDITS.md` for photos, fonts and data sources.
