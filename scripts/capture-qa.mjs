import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { configurationSignature, initialJourney } from '../src/domain.ts';

const browser = await chromium.launch({ headless: true });
const out = path.resolve('work/qa/browser'); await fs.mkdir(out, { recursive: true });
const reports = [];
for (const [format, width, height] of [['Desktop', 1440, 900], ['Tablet', 768, 1024], ['Mobile', 390, 844], ['Mobile320', 320, 844]]) {
  for (const [screen, hash] of [['S01', 'inicio'], ['S02', 'asegurados'], ['S03', 'planes'], ['D01', 'resumen']]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const fixture = initialJourney(); fixture.contact = { name: 'Alex Ejemplo', email: 'alex@example.com', phone: '3000000000' };
    fixture.contactAccepted = true; fixture.insured = { quantity: '2', ages: screen === 'S02' ? ['', ''] : ['34', '58'] };
    if (screen === 'S03' || screen === 'D01') { fixture.confirmedConfig = configurationSignature(fixture.insured); fixture.catalog = 'ready'; }
    if (screen === 'D01') fixture.selectedPlan = 'B';
    if (screen !== 'S01') await context.addInitScript(data => sessionStorage.setItem('aurora.journey.v1', JSON.stringify(data)), fixture);
    const page = await context.newPage(); const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message)); page.on('request', request => requests.push(request.url()));
    await page.addInitScript(() => {
      window.__qaMetrics = { lcp: null, cls: 0 };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__qaMetrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaMetrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(`http://127.0.0.1:4173/#${hash}`); await page.locator('#page-title').waitFor(); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(out, `${screen}-${format}.png`), fullPage: screen !== 'S03' });
    const bounds = await page.evaluate(() => {
      const selectors = ['.brand', '.progress', '#page-title', '.orientation', '.contact-form', '.insured-form', '.configuration-summary', '.plan-grid', '.closure-grid'];
      return Object.fromEntries(selectors.map(selector => { const n = document.querySelector(selector); if (!n) return [selector, null]; const r = n.getBoundingClientRect(); return [selector, { x: r.x, y: r.y, w: r.width, h: r.height }]; }));
    });
    reports.push({ screen, format, viewport: { width, height }, bounds, errors, externalRequests: requests.filter(url => !url.startsWith('http://127.0.0.1:4173/')), metrics: await page.evaluate(() => ({ ...window.__qaMetrics, navigation: performance.getEntriesByType('navigation').map(e => ({ duration: e.duration, domContentLoaded: e.domContentLoadedEventEnd })), paints: performance.getEntriesByType('paint').map(e => ({ name: e.name, time: e.startTime })) })) });
    if (screen === 'S03') {
      await page.getByRole('button', { name: 'Elegir Plus', exact: true }).click(); await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(out, `S03-selected-${format}.png`) });
    }
    await context.close();
  }
}
await fs.writeFile(path.resolve('work/qa/browser-report.json'), JSON.stringify({ environment: { browser: await browser.version(), node: process.version, throttling: 'none; local production preview; one observation per view' }, reports }, null, 2));
await browser.close();
console.log(`Captured ${reports.length} main views and ${reports.length / 4} selected comparisons.`);
