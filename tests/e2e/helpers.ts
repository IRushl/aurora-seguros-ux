import { expect, type Page } from '@playwright/test';
export async function enterContact(page: Page) {
  await page.getByLabel('Nombre', { exact: true }).fill('Valeria');
  await page.getByLabel('Correo electrónico', { exact: true }).fill('valeria@example.com');
  await page.getByLabel('Celular', { exact: true }).fill('+57 320 123 4567');
}
export async function completeContact(page: Page, url = '/') {
  await page.goto(url); await enterContact(page); await page.getByRole('button', { name: 'Cotizar', exact: true }).click();
  await expect(page.getByRole('heading', { name: '¿A quiénes quieres incluir?' })).toBeVisible();
}
export async function configure(page: Page, ages = ['7', '40', '68']) {
  await page.getByLabel('Cantidad de personas', { exact: true }).fill(String(ages.length));
  for (let i = 0; i < ages.length; i++) await page.getByLabel(`Edad de la persona ${i + 1}`, { exact: true }).fill(ages[i]);
  await page.getByRole('button', { name: 'Ver planes disponibles', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Encuentra el plan que prefieras' })).toBeVisible();
}
export async function toPlans(page: Page, url = '/') { await completeContact(page, url); await configure(page); }
export async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
