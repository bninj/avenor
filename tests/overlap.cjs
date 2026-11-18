// Overlap and broken-layout sweep: every screen, several phones, top and bottom of each screen.
// Checks: covered buttons, overlapping text, content hidden behind the tab bar, sideways overflow.
const { chromium, devices } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:4173/';
const OUT = process.argv[3] || '.';

const state = (extra = {}) => JSON.stringify({ state: { profile: { name: 'Gurpreet', goal: 'buy', firstTime: true, budget: 225000, savings: 24000, income: 42000, area: 'Moseley', postcode: 'B13', when: 'In the next 6 months', randomised: false }, done: { b1: true, b2: true, b3: true, b4: true, m1: true, m2: true }, celebrated: { budget: true }, saved: { lantern: true }, plan: 'free', demo: true, waitlist: false, intros: { okonjo: new Date().toISOString() }, ...extra }, version: 0 });

const SCREENS = [
  '/welcome', '/start', '/home', '/journey', '/journey/budget', '/journey/mortgage', '/journey/completion',
  '/learn', '/money?tab=upfront', '/money?tab=stamp', '/money?tab=monthly', '/money?tab=deposit',
  '/pros', '/pros?type=solicitor&id=okonjo', '/house', '/premium', '/premium?first=1', '/ask', '/me', '/help', '/selling', '/documents', '/compare', '/report', '/compare?preview=1',
];
const DEVICES = [['iPhone SE', {}], ['iPhone 13', {}], ['Pixel 7', {}], ['iPhone 13', { largeText: true }]];

async function sweep(p) {
  return p.evaluate(() => {
    const issues = [];
    const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.opacity !== '0' && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw; };
    const label = (el) => (el.getAttribute('aria-label') || el.innerText || el.tagName).trim().slice(0, 28).replace(/\s+/g, ' ');
    const nav = document.querySelector('nav[aria-label="Main"] ul');
    const navR = nav ? nav.getBoundingClientRect() : null;
    // 1. Covered buttons and links: whatever is on top at their centre must be them (or inside them)
    document.querySelectorAll('#app-root button, #app-root a, #app-root input').forEach((el) => {
      if (!visible(el) || el.closest('.leaflet-container') || el.closest('[aria-hidden="true"]')) return;
      const r = el.getBoundingClientRect();
      const x = Math.min(Math.max(r.left + r.width / 2, 1), vw - 1), y = Math.min(Math.max(r.top + r.height / 2, 1), vh - 1);
      const top = document.elementFromPoint(x, y);
      if (!top || el.contains(top) || top.contains(el)) return;
      // Behind the floating tab bar is fine only if the screen can scroll it into view
      if (navR && y > navR.top - 2 && top.closest('nav')) return;
      // Behind an open pop-up sheet is expected
      if (top.closest('[role="dialog"]') && !el.closest('[role="dialog"]')) return;
      // Scrolling under the sticky top bar is normal
      if (top.closest('header') && !el.closest('header')) return;
      issues.push(`covered: "${label(el)}" under "${label(top)}"`);
    });
    // 2. Overlapping text blocks
    const texts = [...document.querySelectorAll('#app-root p, #app-root h1, #app-root h2, #app-root h3, #app-root li > span, #app-root button > span')]
      .filter((el) => visible(el) && el.innerText.trim() && !el.closest('.leaflet-container') && !el.closest('[aria-hidden="true"]'));
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.contains(b) || b.contains(a)) continue;
      const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
      const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (ox > 4 && oy > 4) {
        // ignore one being inside a sheet and the other on the page behind it
        if (!!a.closest('[role="dialog"]') !== !!b.closest('[role="dialog"]')) continue;
        // content scrolling under the sticky top bar is normal
        if (!!a.closest('header') !== !!b.closest('header')) continue;
        issues.push(`text overlap: "${label(a)}" / "${label(b)}"`);
      }
    }
    // 3. Sideways overflow
    document.querySelectorAll('#app-root *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1 && !el.closest('.overflow-x-auto') && !el.closest('.leaflet-container') && !el.closest('canvas') && !el.classList.contains('prism-streak') && !el.closest('[aria-hidden="true"]') && getComputedStyle(el).position !== 'fixed') {
        const scroller = el.closest('main'); if (scroller && getComputedStyle(scroller).overflowX === 'hidden') return;
        issues.push(`off screen: "${label(el)}"`);
      }
    });
    return [...new Set(issues)].slice(0, 8);
  });
}

async function bottomCheck(p) {
  // Scroll each scroller to the end: the last button/text must sit above the tab bar
  return p.evaluate(async () => {
    const nav = document.querySelector('nav[aria-label="Main"] ul');
    const sc = [...document.querySelectorAll('#app-root main, #app-root .overflow-y-auto')].filter((el) => !el.closest('[role="dialog"]') && el.scrollHeight > el.clientHeight + 4 && getComputedStyle(el).overflowY !== 'hidden');
    const out = [];
    for (const el of sc) {
      el.scrollTop = el.scrollHeight; await new Promise((r) => setTimeout(r, 250));
      if (!nav) continue;
      const navTop = nav.getBoundingClientRect().top;
      const items = [...el.querySelectorAll('button, a, p, h2, li')].filter((x) => x.getBoundingClientRect().height > 0 && x.innerText && x.innerText.trim());
      const last = items[items.length - 1];
      if (last && last.getBoundingClientRect().bottom > navTop + 2) out.push(`hidden behind tab bar at the end: "${last.innerText.trim().slice(0, 28)}"`);
    }
    return out;
  });
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let total = 0, clean = 0;
  for (const [dev, opt] of DEVICES) {
    const ctx = await b.newContext({ ...devices[dev], deviceScaleFactor: 1 });
    await ctx.addInitScript(([s, big]) => {
      if (!sessionStorage.getItem('seeded')) { localStorage.setItem('avenor-v1', s); sessionStorage.setItem('seeded', '1') }
      if (big) document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.fontSize = '20px' })
    }, [state(), !!opt.largeText]);
    const p = await ctx.newPage();
    const name = dev + (opt.largeText ? ' large text' : '');
    for (const r of SCREENS) {
      await p.goto(BASE + '#' + r); await p.reload(); await p.waitForTimeout(1500);
      const top = await sweep(p);
      const bottom = await bottomCheck(p);
      await p.waitForTimeout(300);
      const after = await sweep(p);
      const all = [...new Set([...top, ...bottom, ...after])];
      total++;
      if (all.length) { console.log(`ISSUE  ${name.padEnd(22)} ${r}\n        ${all.join('\n        ')}`); await p.screenshot({ path: `${OUT}/ov-${name.replace(/\s/g, '')}-${r.replace(/[\/?=&]/g, '_')}.png` }); }
      else clean++;
    }
    await ctx.close();
  }
  // Desktop: the phone and panels must not collide
  for (const [w, h] of [[1440, 900], [1280, 720], [1024, 768]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(BASE + '#/welcome'); await p.evaluate((s) => localStorage.setItem('avenor-v1', s), state());
    await p.goto(BASE + '#/home'); await p.reload(); await p.waitForTimeout(2500);
    const res = await p.evaluate(() => {
      const boxes = [...document.querySelectorAll('.phone-shell, .glass')].map((el) => ({ n: el.className.includes('phone') ? 'phone' : (el.innerText || '').slice(0, 20).replace(/\s+/g, ' '), r: el.getBoundingClientRect() }));
      const out = [];
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i].r, B = boxes[j].r;
        if (Math.min(A.right, B.right) - Math.max(A.left, B.left) > 2 && Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top) > 2) out.push(`"${boxes[i].n}" overlaps "${boxes[j].n}"`);
      }
      boxes.forEach((b) => { if (b.r.top < -1 || b.r.bottom > innerHeight + 1 || b.r.left < -1 || b.r.right > innerWidth + 1) out.push(`"${b.n}" cut off by the screen edge`) });
      const h1 = document.querySelector('h1').getBoundingClientRect();
      boxes.forEach((b) => { if (b.n === 'phone' && Math.min(h1.right, b.r.right) - Math.max(h1.left, b.r.left) > 2 && Math.min(h1.bottom, b.r.bottom) - Math.max(h1.top, b.r.top) > 2) out.push('headline overlaps the phone') });
      return out;
    });
    total++;
    if (res.length) { console.log(`ISSUE  desktop ${w}x${h}\n        ${res.join('\n        ')}`); await p.screenshot({ path: `${OUT}/ov-desktop-${w}.png` }); } else clean++;
    await p.close();
  }
  await b.close();
  console.log(`\n${clean} of ${total} screen checks clean`);
})();
