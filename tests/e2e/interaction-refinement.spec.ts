import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { enterContact, completeContact, configure, toPlans, noHorizontalOverflow } from './helpers';

test('vector identity, favicon and concise product copy are present', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 }); await page.goto('/'); const logo = page.getByRole('img', { name: 'Aurora Seguros', exact: true });
  await expect(logo).toBeVisible(); expect(await logo.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const source = await (await page.request.get('/brand/aurora-horizontal.svg')).text(); expect(source).toContain('<svg'); expect(source).not.toContain('<image');
  expect((await page.request.get('/favicon.svg')).ok()).toBe(true); await expect(page.locator('link[rel=icon]')).toHaveAttribute('href','/favicon.svg');
  await expect(page.getByText('Conoce las opciones de Salud Flex, elige a quiénes quieres incluir y compara servicios antes de seleccionar un plan.')).toBeVisible();
  await page.evaluate(() => Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
  const cta=await page.getByRole('button',{name:'Cotizar',exact:true}).boundingBox(); expect(cta!.y+cta!.height).toBeLessThanOrEqual(844);
});
test('selected CTA remains anchored while comparison content enters', async ({ page }) => {
  await toPlans(page); await page.getByRole('button',{name:'Elegir Plus',exact:true}).click();
  await page.getByRole('button',{name:'Ver resumen de mi elección'}).click(); await page.getByRole('button',{name:'Volver a comparar'}).click();
  const checks=await page.evaluate(async()=>{
    const values=[];for(let i=0;i<14;i++){await new Promise(requestAnimationFrame);const r=document.querySelector('.selection-summary')!.getBoundingClientRect();values.push({top:r.top,bottom:r.bottom,left:r.left,right:r.right});}return values;
  });
  const viewport=page.viewportSize()!; expect(checks.every(r=>r.top>=0&&r.bottom<=viewport.height&&r.left>=0&&r.right<=viewport.width)).toBe(true);
});
test('normal local continuation uses no artificial timeout', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.setTimeout.bind(window); (window as any).__serviceTimers = [];
    window.setTimeout = ((fn: TimerHandler, delay?: number, ...args: unknown[]) => { if (delay === 350 || delay === 650 || delay === 2200) (window as any).__serviceTimers.push(delay); return original(fn, delay, ...args); }) as typeof window.setTimeout;
  });
  await completeContact(page); await configure(page); expect(await page.evaluate(() => (window as any).__serviceTimers)).toEqual([]);
});
test('slow catalogue exposes processing and prevents duplicate requests', async ({ page }) => {
  await completeContact(page, '/?scenario=slow-catalog'); await page.getByLabel('Edad de la persona 1').fill('55');
  await page.getByRole('button', { name: 'Ver planes disponibles', exact: true }).dblclick();
  await expect(page.getByRole('button', { name: 'Preparando las alternativas', exact: true })).toBeDisabled();
  await expect(page.getByText('Preparando las alternativas', { exact: true }).first()).toBeVisible();
  await expect(page.locator('#page-title')).toHaveText('Encuentra el plan que prefieras');
  expect(await page.evaluate(() => performance.getEntriesByName('aurora:catalog:request').length)).toBe(1);
});
for (const width of [390, 768, 1440]) test(`disclosures reverse rapidly, keep selection and keyboard focus ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await toPlans(page); await page.getByRole('button', { name: 'Elegir Plus', exact: true }).click();
  const detail=page.locator('.plan-card').nth(1).locator('details'), summary=detail.locator('summary');
  await summary.focus(); await page.keyboard.press('Enter'); await expect(detail).toHaveAttribute('data-state','open');
  await page.keyboard.press('Enter'); await page.keyboard.press('Enter'); await expect(detail).toHaveAttribute('data-state','open');
  await expect(summary).toBeFocused(); await expect(page.getByRole('button',{name:'Plus, seleccionado'})).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press('Space'); await expect(detail).toHaveAttribute('data-state','closed'); await expect(detail).not.toHaveAttribute('open','');
  await summary.click(); await expect(detail).toHaveAttribute('data-state','open'); await noHorizontalOverflow(page);
  await page.getByRole('button',{name:'Ver resumen de mi elección'}).click(); await expect(page.locator('#page-title')).toHaveText('Tu selección está lista');
  await expect(page.locator('.selection-result')).toContainText('7, 40 y 68 años');
});
test('reduced motion cancels active motion and preserves all actions', async ({ page }) => {
  await toPlans(page); const detail=page.locator('.plan-card').first().locator('details');
  await detail.locator('summary').click(); await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(detail).toHaveAttribute('data-state','open');
  await detail.locator('summary').click(); await expect(detail).toHaveAttribute('data-state','closed');
  await detail.locator('summary').click(); await expect(detail).toHaveAttribute('data-state','open');
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState==='running').length)).toBe(0);
  await page.getByRole('button',{name:'Elegir Esencial',exact:true}).click();
  const scale = await page.getByRole('button',{name:'Ver resumen de mi elección'}).evaluate(el => getComputedStyle(el).transitionDuration); expect(scale).toBe('0s');
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button',{name:'Ver resumen de mi elección'}).click(); await page.getByRole('button',{name:'Comenzar de nuevo'}).click();
  expect(await page.evaluate(() => sessionStorage.getItem('aurora.journey.v1'))).toBeNull();
});
test('FAQ opens and closes by keyboard without moving focus or changing contact', async ({ page }) => {
  await page.goto('/'); await enterContact(page); const first=page.locator('.faq details').first(), summary=first.locator('summary');
  await summary.focus(); await page.keyboard.press('Enter'); await expect(first).toHaveAttribute('data-state','open');
  await page.keyboard.press('Space'); await expect(first).toHaveAttribute('data-state','closed'); await expect(summary).toBeFocused();
  await expect(page.getByLabel('Nombre',{exact:true})).toHaveValue('Valeria');
});
