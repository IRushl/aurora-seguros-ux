import { test, expect } from '@playwright/test';
import { completeContact } from './helpers';

for (const width of [390, 768, 1440]) for (const input of ['paste', 'rapid typing']) {
  test(`55, 33, 20 remain exact in S02, S03 and D01: ${input}, ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); await completeContact(page);
    await page.getByLabel('Cantidad de personas', { exact: true }).fill('3');
    for (const [i, age] of ['55', '33', '20'].entries()) {
      const field = page.getByLabel(`Edad de la persona ${i + 1}`, { exact: true });
      if (input === 'paste') await field.fill(age);
      else { await field.fill(''); await field.pressSequentially(age, { delay: 0 }); }
      await expect(field).toHaveValue(age);
    }
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('aurora.journey.v1')!).insured.ages)).toEqual(['55', '33', '20']);
    await page.getByRole('button', { name: 'Ver planes disponibles', exact: true }).click();
    await expect(page.locator('.configuration-summary')).toContainText('3 personas · 55, 33 y 20 años');
    await page.reload(); await expect(page.locator('.configuration-summary')).toContainText('3 personas · 55, 33 y 20 años');
    await page.locator('.plan-card button[aria-pressed]').first().click();
    await page.getByRole('button', { name: 'Ver resumen de mi elección' }).click();
    await expect(page.locator('.selection-result')).toContainText('3 personas · 55, 33 y 20 años');
    await page.reload(); await expect(page.locator('.selection-result')).toContainText('3 personas · 55, 33 y 20 años');
  });
}
