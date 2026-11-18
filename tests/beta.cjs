// Avenor beta test: simulated people of different ages doing real tasks on different phones.
// Reports task success, crashes, layout overflow, small tap targets and accessibility issues.
const { chromium, devices } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://localhost:4173/';
const OUT = process.argv[3] || __dirname;
const AXE = require.resolve('axe-core/axe.min.js');

const results = [];
const log = (who, ok, what) => { results.push({ who, ok, what }); console.log(`${ok ? 'PASS' : 'FAIL'}  [${who}] ${what}`); };

async function checks(p, who, label) {
  // Horizontal overflow (text or elements spilling off screen)
  const over = await p.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll('main *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > w + 1 && !el.closest('.overflow-x-auto') && !el.closest('.leaflet-container') && !el.closest('canvas') && !el.classList.contains('prism-streak')) {
        const t = (el.innerText || el.getAttribute('aria-label') || el.tagName).slice(0, 30).replace(/\n/g, ' ');
        bad.push(t);
      }
    });
    return [...new Set(bad)].slice(0, 4);
  });
  log(who, over.length === 0, `${label}: nothing spills off the screen${over.length ? '  -> ' + over.join(' | ') : ''}`);
  // Tap targets under 40px
  const small = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('main button, main a, nav a, nav button').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || el.closest('p') || el.closest('.leaflet-control-attribution')) return; // inline text links are fine
      if (r.height < 40 && r.width < 40) out.push((el.getAttribute('aria-label') || el.innerText || el.tagName).slice(0, 24).replace(/\n/g, ' '));
    });
    return out.slice(0, 5);
  });
  log(who, small.length === 0, `${label}: tap targets big enough${small.length ? '  -> ' + small.join(' | ') : ''}`);
  // Accessibility scan (after animations settle)
  await p.waitForTimeout(900);
  await p.addScriptTag({ path: AXE });
  const ax = await p.evaluate(async () => {
    const r = await window.axe.run(document.querySelector('#app-root') || document, { runOnly: ['wcag2a', 'wcag2aa'], resultTypes: ['violations'] });
    return r.violations.map((v) => `${v.id}(${v.nodes.length}: ${v.nodes.slice(0,2).map((n) => (n.target[0]||'').toString().slice(-45) + (n.any[0] && n.any[0].data && n.any[0].data.fgColor ? ' ' + n.any[0].data.fgColor + '/' + n.any[0].data.bgColor : '')).join(' ; ')})`);
  });
  log(who, ax.length === 0, `${label}: accessibility scan${ax.length ? '  -> ' + ax.join(', ') : ''}`);
}

async function person(b, who, device, fn, opts = {}) {
  const ctx = await b.newContext({ ...devices[device], deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/GL Driver|tile\.openstreetmap|fontshare/.test(m.text())) errors.push(m.text().slice(0, 120)); });
  if (opts.largeText) await p.addInitScript(() => { document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = '20px'; }); });
  try { await fn(p); } catch (e) { log(who, false, 'Task crashed: ' + e.message.split('\n')[0]); await p.screenshot({ path: `${OUT}/fail-${who.split(',')[0]}.png` }).catch(() => {}); }
  log(who, errors.length === 0, `No errors in the app${errors.length ? '  -> ' + errors.slice(0, 2).join(' | ') : ''}`);
  await ctx.close();
}

const go = async (p, hash) => { await p.goto(BASE + '#' + hash); await p.waitForTimeout(1200); };
const see = async (p, text, t = 6000) => p.getByText(text, { exact: false }).first().waitFor({ timeout: t });

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

  // 1. Priya, 19, student, small iPhone SE, impatient: skips everything
  await person(b, 'Priya, 19', 'iPhone SE', async (p) => {
    await go(p, '/welcome');
    await checks(p, 'Priya, 19', 'Welcome on a small phone');
    await p.getByRole('button', { name: 'Get started' }).click();
    await p.getByRole('button', { name: 'Skip, fill it in for me' }).click();
    await see(p, 'here’s your plan'); log('Priya, 19', true, 'Skipping all questions still gives a plan');
    await p.getByRole('button', { name: 'Start building' }).click();
    await see(p, 'of your home built'); log('Priya, 19', true, 'Lands on Home with a random profile');
    await checks(p, 'Priya, 19', 'Home on a small phone');
    await p.getByRole('link', { name: 'Learn' }).click();
    await p.getByLabel('Search the glossary').fill('lease');
    await p.getByText('Leasehold').first().click();
    await see(p, 'set number of years'); log('Priya, 19', true, 'Finds what leasehold means in two taps');
    await checks(p, 'Priya, 19', 'Glossary sheet');
    await p.getByRole('button', { name: 'Close' }).click(); await p.waitForTimeout(400);
    await p.getByText('The real cost of buying').click();
    for (let k = 0; k < 4; k++) await p.getByRole('button', { name: 'Next' }).click();
    await see(p, 'upfront cash calculator'); log('Priya, 19', true, 'Reads a full lesson to the end');
    await checks(p, 'Priya, 19', 'Lesson');
    await p.getByRole('button', { name: 'Done' }).click();
  });

  // 2. Jordan, 26, nurse, Android: full onboarding, finishes stage 1, checks Stamp Duty
  await person(b, 'Jordan, 26', 'Pixel 7', async (p) => {
    await go(p, '/start');
    await p.getByLabel('First name').fill('Jordan');
    await p.getByRole('button', { name: 'Continue', exact: true }).click();
    await p.getByText('Yes, my first').click();
    await p.getByText('Harborne').first().click();
    await p.getByLabel('Budget').fill('300000');
    await see(p, '£300,000');
    log('Jordan, 26', true, 'Budget slider shows £300,000');
    await checks(p, 'Jordan, 26', 'Budget question');
    await p.getByRole('button', { name: 'Continue', exact: true }).click();
    await p.getByText('In 6 to 12 months').click();
    await see(p, 'Jordan, here’s your plan');
    await p.waitForTimeout(1800);
    const sd = await p.locator('dl').innerText();
    log('Jordan, 26', /Stamp Duty\s*£0/.test(sd), 'Plan shows £0 Stamp Duty for a £300k first home');
    await checks(p, 'Jordan, 26', 'Plan reveal');
    await p.getByRole('button', { name: 'Start building' }).click();
    for (const t of ['Add up your savings', 'Check your credit report for free', 'Work out your upfront cash', 'Set your price range']) await p.getByText(t).click();
    await see(p, 'Foundations laid', 4000); log('Jordan, 26', true, 'Finishing stage 1 shows the house celebration');
    await p.getByRole('button', { name: 'Start stage 2' }).click();
    await see(p, 'The short version'); log('Jordan, 26', true, 'Celebration leads to stage 2');
    await go(p, '/money?tab=stamp');
    await p.getByLabel('Home price').fill('320000');
    await p.waitForTimeout(900);
    const hero = await p.locator('main').innerText();
    log('Jordan, 26', hero.includes('£1,000'), 'Stamp Duty on £320k first home is £1,000');
    await checks(p, 'Jordan, 26', 'Stamp Duty calculator');
  });

  // 3. Amira, 33, iPhone: asks a question, finds and contacts a solicitor, saves them
  await person(b, 'Amira, 33', 'iPhone 13', async (p) => {
    await go(p, '/demo'); await p.getByRole('button', { name: 'Skip' }).click();
    await see(p, 'of your home built');
    await go(p, '/ask');
    await p.getByLabel('Your question').fill('how much deposit do I need');
    await p.getByRole('button', { name: 'Send' }).click();
    await see(p, 'at least 5%', 8000); log('Amira, 33', true, 'Ask Avenor answers a typed question');
    await checks(p, 'Amira, 33', 'Ask Avenor');
    await go(p, '/pros');
    await p.getByRole('button', { name: 'Solicitors', exact: true }).first().click();
    await p.getByRole('button', { name: 'Show the full list' }).click();
    await p.getByText('Sandhu Whitlock Solicitors').click();
    await see(p, 'Checked on the SRA register'); log('Amira, 33', true, 'Opens a solicitor profile with register check');
    await checks(p, 'Amira, 33', 'Solicitor profile');
    await p.getByRole('button', { name: 'Request a free intro' }).click();
    await see(p, 'Intro sent'); log('Amira, 33', true, 'Requests an intro');
    await p.getByRole('button', { name: 'Save', exact: true }).click();
    await go(p, '/me');
    await see(p, 'Sandhu Whitlock'); log('Amira, 33', true, 'Saved solicitor appears in her profile');
  });

  // 4. Dave, 47, owned before: Stamp Duty must use normal rates
  await person(b, 'Dave, 47', 'Pixel 7', async (p) => {
    await go(p, '/start');
    await p.getByLabel('First name').fill('Dave');
    await p.getByRole('button', { name: 'Continue', exact: true }).click();
    await p.getByText('I’ve owned before').click();
    await p.getByText('Bournville').first().click();
    await p.getByRole('button', { name: 'Continue', exact: true }).click();
    await p.getByText('Just exploring').click();
    await see(p, 'Dave, here’s your plan'); await p.waitForTimeout(1800);
    const sd = await p.locator('dl').innerText();
    log('Dave, 47', /Stamp Duty\s*£1,500/.test(sd), `Plan uses normal Stamp Duty for £200k (expect £1,500): ${sd.split('\n').slice(2, 4).join(' ')}`);
    await p.getByRole('button', { name: 'Start building' }).click();
    await go(p, '/money?tab=stamp');
    const sw = await p.getByRole('switch').getAttribute('aria-checked');
    log('Dave, 47', sw === 'false', 'Stamp Duty calculator knows he has owned before');
  });

  // 5. Joan, 64, helping her son, large text setting
  await person(b, 'Joan, 64', 'iPhone 13', async (p) => {
    await go(p, '/demo'); await p.getByRole('button', { name: 'Skip' }).click();
    await see(p, 'of your home built');
    await checks(p, 'Joan, 64', 'Home with large text');
    await go(p, '/journey/solicitor');
    await checks(p, 'Joan, 64', 'Stage with large text');
    await p.getByText('searches', { exact: true }).first().click();
    await see(p, 'planning, flooding'); log('Joan, 64', true, 'Taps a dotted word and reads its meaning');
    await go(p, '/money');
    await checks(p, 'Joan, 64', 'Money with large text');
    await go(p, '/premium');
    await checks(p, 'Joan, 64', 'Premium with large text');
  }, { largeText: true });

  // 6. Ken, 58, wants to sell
  await person(b, 'Ken, 58', 'iPhone 13', async (p) => {
    await go(p, '/welcome');
    await p.getByRole('button', { name: 'I’m selling a home' }).click();
    await p.getByRole('button', { name: 'Tell me when it’s ready' }).click();
    await see(p, 'You’re on the list'); log('Ken, 58', true, 'Joins the seller waitlist');
    await checks(p, 'Ken, 58', 'Selling');
  });

  // 7. A judge on a 1366x768 laptop, keyboard only
  {
    const who = 'Judge, laptop';
    const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(BASE + '#/demo'); await p.waitForFunction(() => location.hash.includes('home'), null, { timeout: 30000 }).catch(() => {});
    log(who, p.url().includes('/home'), 'Demo plays by itself and lands on Home');
    const phone = await p.evaluate(() => { const r = document.querySelector('.phone-shell').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: innerHeight } });
    log(who, phone.top >= 0 && phone.bottom <= phone.h, `Whole phone visible on a 768px screen (${phone.top} to ${phone.bottom})`);
    await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
    const focus = await p.evaluate(() => { const el = document.activeElement; return el ? getComputedStyle(el).outlineStyle : 'none' });
    log(who, focus !== 'none', 'Keyboard focus is visible');
    await p.getByRole('button', { name: /Make an offer/ }).click(); await p.waitForTimeout(800);
    log(who, p.url().includes('/journey/offer'), 'Clicking a stage on the side panel opens it on the phone');
    log(who, errors.length === 0, `No errors${errors.length ? ' -> ' + errors[0] : ''}`);
    await p.screenshot({ path: `${OUT}/judge.png` });
    await ctx.close();
  }

  await b.close();
  const fails = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fails.length} passed, ${fails.length} failed`);
})();
