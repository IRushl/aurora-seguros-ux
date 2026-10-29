import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { completeContact, toPlans, noHorizontalOverflow } from './helpers';

test('removal moves touched errors with the person before any submit', async ({ page }) => {
  await completeContact(page); await page.getByLabel('Cantidad de personas').fill('21');
  await expect(page.locator('input[aria-invalid=true]')).toHaveCount(0); await page.getByLabel('Edad de la persona 1').focus();
  await expect(page.getByLabel('Cantidad de personas')).toHaveAttribute('aria-invalid', 'true'); await page.getByLabel('Cantidad de personas').fill('3');
  await page.getByLabel('Edad de la persona 1').fill('55'); await page.getByLabel('Edad de la persona 2').fill('abc');
  await page.getByLabel('Edad de la persona 3').fill('20'); await expect(page.locator('input[aria-invalid=true]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Eliminar persona 2' }).click(); await expect(page.locator('input[aria-invalid=true]')).toHaveCount(0);
  await expect(page.getByLabel('Edad de la persona 2')).toHaveValue('20');
  await page.getByLabel('Edad de la persona 2').fill('abc'); await page.getByLabel('Edad de la persona 1').focus();
  await page.getByRole('button', { name: 'Eliminar persona 1' }).click(); await expect(page.getByLabel('Edad de la persona 1')).toHaveValue('abc');
  await expect(page.getByLabel('Edad de la persona 1')).toHaveAttribute('aria-invalid', 'true'); await page.getByLabel('Edad de la persona 1').fill('20');
  await expect(page.locator('input[aria-invalid=true]')).toHaveCount(0);
});

test('adding and removing the middle person preserves exact remaining ages and contact', async ({ page }) => {
  await completeContact(page);
  await page.getByLabel('Edad de la persona 1').fill('55');
  await page.getByRole('button', { name: 'Agregar persona' }).click(); await expect(page.getByLabel('Edad de la persona 2')).toBeFocused();
  await page.getByLabel('Edad de la persona 2').fill('33'); await page.getByRole('button', { name: 'Agregar persona' }).click();
  await page.getByLabel('Edad de la persona 3').fill('20'); await page.getByRole('button', { name: 'Eliminar persona 2' }).click();
  await expect(page.getByLabel('Cantidad de personas')).toHaveValue('2'); await expect(page.getByLabel('Edad de la persona 1')).toHaveValue('55'); await expect(page.getByLabel('Edad de la persona 2')).toHaveValue('20');
  await page.getByRole('button', { name: 'Ver planes disponibles', exact: true }).click(); await expect(page.locator('.configuration-summary')).toContainText('2 personas · 55 y 20 años');
  await page.getByRole('button', { name: 'Elegir Plus', exact: true }).click(); await page.getByRole('button', { name: 'Ver resumen de mi elección' }).click();
  await expect(page.locator('.selection-result')).toContainText('$190.000 COP'); await page.getByRole('button', { name: 'Volver a comparar' }).click();
  await page.getByRole('button', { name: 'Cambiar asegurados' }).click(); await page.locator('.contact-summary summary').click(); await expect(page.getByText('valeria@example.com')).toBeVisible();
});
for (const width of [390, 768, 1440]) test(`details expand/close, preserve selection and totals ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await toPlans(page);
  await page.getByRole('button', { name: 'Elegir Plus', exact: true }).click();
  const card = page.locator('.plan-card').nth(1), toggle = card.locator('summary');
  await toggle.click(); await expect(card.locator('details')).toHaveAttribute('open', '');
  await expect(card.getByText(/Este ejercicio no los simula/)).toBeVisible(); await expect(card.getByText(/\$95.000 COP por persona × 3 = \$285.000 COP/)).toBeVisible();
  await noHorizontalOverflow(page); expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await toggle.focus(); await page.keyboard.press('Enter'); await expect(card.locator('details')).not.toHaveAttribute('open', '');
  await expect(card.getByRole('button', { name: 'Plus, seleccionado' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Ver resumen de mi elección' }).click(); await expect(page.locator('.selection-result')).toContainText('$285.000 COP');
  await expect(page.locator('.selection-result')).toContainText('4 por persona / mes');
});
