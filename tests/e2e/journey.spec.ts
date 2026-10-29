import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { completeContact, configure, enterContact, noHorizontalOverflow, toPlans } from './helpers';

test('first visit, empty attempt, error links, correction and focus', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cotizar', exact: true }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.locator('input[aria-invalid=true]')).toHaveCount(3);
  await page.getByRole('link', { name: /Correo electrónico:/ }).click(); await expect(page.getByLabel('Correo electrónico', { exact: true })).toBeFocused();
  await page.getByLabel('Nombre', { exact: true }).fill('123'); await page.getByLabel('Correo electrónico', { exact: true }).fill('v@');
  await page.getByLabel('Celular', { exact: true }).fill('12'); await expect(page.locator('input[aria-invalid=true]')).toHaveCount(3);
  await enterContact(page); await expect(page.locator('input[aria-invalid=true]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cotizar', exact: true }).click();
  await expect(page.locator('#page-title')).toHaveText('¿A quiénes quieres incluir?'); await expect(page.locator('#page-title')).toBeFocused();
});
test('blur does not report an untouched field and help is contextual', async ({ page }) => {
  await page.goto('/'); await page.getByLabel('Nombre', { exact: true }).focus(); await page.keyboard.press('Tab');
  await expect(page.getByRole('alert')).toHaveCount(0); await expect(page.locator('input[aria-invalid=true]')).toHaveCount(0);
  await page.getByRole('button', { name: '¿Necesitas ayuda?' }).click(); await expect(page.getByRole('region', { name: 'Ayuda sobre el proceso' })).toBeVisible();
  await expect(page.getByText(/solicitud telefónica|te llamaremos|DEMO/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Volver al formulario' }).click(); await expect(page.getByRole('button', { name: '¿Necesitas ayuda?' })).toBeFocused();
});
test('dynamic complete path, replacing selection, return and reload', async ({ page }) => {
  await toPlans(page); await page.getByRole('button', { name: 'Elegir Esencial', exact: true }).click();
  await expect(page).toHaveURL(/#planes$/); await page.getByRole('button', { name: 'Elegir Premium', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Premium, seleccionado' })).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => scrollTo(0, 0)); await expect(page.getByRole('button', { name: 'Ver resumen de mi elección' })).toBeInViewport();
  await page.getByRole('button', { name: 'Ver resumen de mi elección' }).click();
  await expect(page.getByRole('heading', { name: 'Tu selección está lista' })).toBeVisible();
  await expect(page.locator('.selection-result')).toContainText('Premium'); await expect(page.locator('.selection-result')).toContainText('3 personas · 7, 40 y 68 años');
  await page.reload(); await expect(page.locator('.selection-result')).toContainText('Premium');
  await page.getByRole('button', { name: 'Volver a comparar' }).click(); await expect(page.getByRole('button', { name: 'Premium, seleccionado' })).toBeVisible();
  await expect(page.locator('.configuration-summary')).toContainText('3 personas · 7, 40 y 68 años');
});
test('back preserves contact and an age change invalidates dependent selection', async ({ page }) => {
  await toPlans(page); await page.getByRole('button', { name: 'Elegir Plus', exact: true }).click();
  await page.getByRole('button', { name: 'Cambiar asegurados' }).click(); await expect(page.getByLabel('Edad de la persona 2')).toHaveValue('40');
  await page.getByLabel('Edad de la persona 2').fill('41'); await expect(page.getByText('Las personas cambiaron.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Ver planes disponibles', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Encuentra el plan que prefieras' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver resumen de mi elección' })).toHaveCount(0);
  await expect(page.locator('.configuration-summary')).toContainText('7, 41 y 68');
  await page.getByRole('button', { name: 'Volver a Asegurados' }).click(); await page.getByRole('button', { name: 'Volver a Inicio' }).click();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Valeria'); await expect(page.getByLabel('Correo electrónico', { exact: true })).toHaveValue('valeria@example.com');
});
test('empty/invalid ages correct without losing other fields; reducing quantity clears removed errors', async ({ page }) => {
  await completeContact(page); await page.getByLabel('Cantidad de personas').fill('2'); await page.getByRole('button', { name: 'Ver planes disponibles' }).click();
  await expect(page.getByRole('alert')).toBeFocused(); await page.getByRole('link', { name: /Edad de la persona 1:/ }).click();
  await expect(page.getByLabel('Edad de la persona 1')).toBeFocused(); await page.getByLabel('Edad de la persona 1').fill('34.5');
  await expect(page.getByText('Escribe una edad en años completos, entre 0 y 130.', { exact: true })).toBeVisible();
  await page.getByLabel('Edad de la persona 1').fill('34'); await page.getByLabel('Cantidad de personas').fill('1');
  await expect(page.getByRole('link', { name: /Edad de la persona 2:/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver planes disponibles' }).click(); await expect(page.locator('.configuration-summary')).toContainText('1 persona · 34 años');
});
test('recoverable contact failure retains values and retry completes', async ({ page }) => {
  await page.goto('/?scenario=contact-failure'); await enterContact(page); await page.getByRole('button', { name: 'Cotizar' }).click();
  await expect(page.getByText('No pudimos continuar', { exact: true })).toBeVisible(); await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Valeria'); await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.locator('#page-title')).toHaveText('¿A quiénes quieres incluir?');
});
test('duplicate submit starts only one pending request', async ({ page }) => {
  await page.goto('/?scenario=slow-contact'); await enterContact(page); await page.getByRole('button', { name: 'Cotizar' }).dblclick();
  await expect(page.getByRole('button', { name: 'Preparando el siguiente paso', exact: true })).toBeDisabled();
  await expect(page.locator('#page-title')).toHaveText('¿A quiénes quieres incluir?', { timeout: 7000 });
  expect(await page.evaluate(() => performance.getEntriesByName('aurora:contact:request').length)).toBe(1);
});
test('navigation cancels pending work and ignores a late response', async ({ page }) => {
  await page.goto('/?scenario=slow-contact'); await enterContact(page); await page.getByRole('button', { name: 'Cotizar' }).click();
  await page.evaluate(() => { location.hash = '#asegurados'; }); await expect(page.getByRole('button', { name: 'Cotizar' })).toBeEnabled();
  await page.waitForTimeout(2400); await expect(page.locator('#page-title')).toHaveText('Cotiza tu Seguro Salud Flex');
  await page.getByRole('button', { name: 'Cotizar' }).click(); await expect(page.locator('#page-title')).toHaveText('¿A quiénes quieres incluir?', { timeout: 7000 });
});
for (const scenario of ['catalog-failure', 'catalog-empty']) test(`${scenario} recovers without a fabricated selection`, async ({ page }) => {
  await toPlans(page, `/?scenario=${scenario}`); await expect(page.getByRole('button', { name: 'Elegir Esencial', exact: true })).toHaveCount(0);
  await expect(page.locator('.configuration-summary')).toContainText('3 personas'); await page.getByRole('button', { name: scenario === 'catalog-empty' ? 'Actualizar opciones' : 'Reintentar carga', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Elegir Esencial', exact: true })).toBeVisible();
});
test('reset removes state; reload and browser back cannot restore old selection', async ({ page }) => {
  await toPlans(page); await page.getByRole('button', { name: 'Elegir Premium', exact: true }).click(); await page.getByRole('button', { name: 'Ver resumen de mi elección' }).click();
  await page.getByRole('button', { name: 'Comenzar de nuevo' }).click(); await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('aurora.journey.v1'))).toBeNull(); await page.reload(); await expect(page.getByLabel('Correo electrónico', { exact: true })).toHaveValue('');
  await page.goBack(); await expect(page.locator('#page-title')).toHaveText('Cotiza tu Seguro Salud Flex'); await expect(page.getByRole('alert')).toHaveCount(0);
});
for (const hash of ['asegurados', 'planes', 'resumen']) test(`direct #${hash} is guarded without context`, async ({ page }) => {
  await page.goto(`/#${hash}`); await expect(page).toHaveURL(/#inicio$/); await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('');
});
test('browser back and forward retain coherent contact/configuration', async ({ page }) => {
  await toPlans(page); await page.goBack(); await expect(page.locator('#page-title')).toHaveText('¿A quiénes quieres incluir?');
  await expect(page.getByLabel('Edad de la persona 3')).toHaveValue('68'); await page.goForward(); await expect(page.locator('#page-title')).toHaveText('Encuentra el plan que prefieras');
});
test('keyboard can complete the journey; skip link does not change route', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#page-title')).toBeFocused(); await page.keyboard.press('Tab'); await expect(page.getByLabel('Nombre', { exact: true })).toBeFocused();
  await page.keyboard.type('Álex'); await page.keyboard.press('Tab'); await page.keyboard.type('alex@example.com'); await page.keyboard.press('Tab'); await page.keyboard.type('3000000000');
  await page.keyboard.press('Enter'); await expect(page.locator('#page-title')).toHaveText('¿A quiénes quieres incluir?');
  await page.getByLabel('Edad de la persona 1').focus(); await page.keyboard.type('29'); await page.keyboard.press('Enter');
  await expect(page.locator('#page-title')).toHaveText('Encuentra el plan que prefieras');
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Esencial, seleccionado' })).toHaveAttribute('aria-pressed', 'true');
  for (let i = 0; i < 12; i++) { if (await page.getByRole('button', { name: 'Ver resumen de mi elección' }).evaluate(el => el === document.activeElement)) break; await page.keyboard.press('Tab'); }
  await expect(page.getByRole('button', { name: 'Ver resumen de mi elección' })).toBeFocused(); await page.keyboard.press('Enter');
  await expect(page.locator('#page-title')).toHaveText('Tu selección está lista');
  await page.getByRole('link', { name: 'Saltar al contenido' }).focus(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(/#resumen$/); await expect(page.locator('main')).toBeFocused();
});
for (const width of [320, 390, 640, 768, 1024, 1199, 1200, 1440, 1920]) test(`responsive ${width}px across four views`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await completeContact(page); await noHorizontalOverflow(page); await configure(page); await noHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Elegir Premium', exact: true }).click(); await page.evaluate(() => scrollTo(0, 0));
  await expect(page.getByRole('button', { name: 'Ver resumen de mi elección' })).toBeInViewport(); await noHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Ver resumen de mi elección' }).click(); await noHorizontalOverflow(page);
});
for (const width of [390, 768, 1440]) test(`automated accessibility in main/error/selected/closure states ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/');
  const check = async () => expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await check(); await page.getByRole('button', { name: 'Cotizar' }).click(); await check(); await enterContact(page); await page.getByRole('button', { name: 'Cotizar' }).click();
  await expect(page.getByLabel('Cantidad de personas')).toBeVisible(); await check(); await configure(page); await page.getByRole('button', { name: 'Elegir Plus', exact: true }).click(); await check();
  await page.getByRole('button', { name: 'Ver resumen de mi elección' }).click(); await check();
});
test('text expansion does not cut content or cover final controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 }); await toPlans(page); await page.getByRole('button', { name: 'Elegir Premium', exact: true }).click();
  await page.evaluate(() => { for (const key of ['body', 'label', 'small', 'h1small', 'h2']) { for (const part of ['size', 'line']) { const name = `--aurora-type-${key}-${part}`; const old = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)); document.documentElement.style.setProperty(name, `${old * 2}px`); } } });
  await noHorizontalOverflow(page); await page.getByRole('button', { name: 'Volver a Asegurados' }).scrollIntoViewIfNeeded();
  const back = await page.getByRole('button', { name: 'Volver a Asegurados' }).boundingBox(); const bar = await page.locator('.selection-summary').boundingBox();
  expect(back!.y + back!.height).toBeLessThanOrEqual(bar!.y + 1);
});

test('keyboard focus is not hidden under the fixed selection summary', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await toPlans(page);
  await page.getByRole('button', { name: 'Elegir Plus', exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    await expect.poll(() => page.evaluate(() => {
      const active = document.activeElement as HTMLElement;
      const bar = document.querySelector('.selection-summary')!;
      if (bar.contains(active)) return true;
      const r = active.getBoundingClientRect(), b = bar.getBoundingClientRect();
      return r.bottom <= b.top + 1 || r.top >= b.bottom;
    })).toBe(true);
  }
});
