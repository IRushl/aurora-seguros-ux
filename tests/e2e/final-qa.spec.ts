import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { completeContact, toPlans, noHorizontalOverflow } from './helpers';

test('empty result and recoverable failure have different roles, explanations and recovery actions', async ({ page }) => {
  await toPlans(page, '/?scenario=catalog-empty');
  await expect(page.locator('.feedback[role=status]')).toContainText('No hay planes disponibles para mostrar');
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await expect(page.getByRole('button', { name:'Revisar personas', exact:true })).toBeVisible();
  await page.getByRole('button', { name:'Actualizar opciones', exact:true }).click(); await expect(page.getByRole('button', { name:'Elegir Plus', exact:true })).toBeVisible();
  await page.goto('/?scenario=catalog-failure'); await page.evaluate(()=>sessionStorage.clear()); await page.reload();
  await toPlans(page, '/?scenario=catalog-failure');
  await expect(page.getByRole('alert')).toContainText('Ocurrió un problema de carga');
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name:'Reintentar carga', exact:true }).click(); await expect(page.getByRole('button', { name:'Elegir Plus', exact:true })).toBeVisible();
});
test('quantity limits, add/remove and exact ages remain coherent through summary and reload', async ({ page }) => {
  await completeContact(page);const q=page.getByLabel('Cantidad de personas',{exact:true});
  for(const value of ['0','21','-1','1.5','abc','']){
    await q.fill(value); await page.getByRole('button',{name:'Ver planes disponibles',exact:true}).click();
    await expect(q).toHaveAttribute('aria-invalid','true'); await expect(page.getByRole('button',{name:'Agregar persona',exact:true})).toBeDisabled();
    expect(await page.locator('.age-fields input').count()).toBeLessThanOrEqual(20);await expect(page.locator('#page-title')).toHaveText('¿A quiénes quieres incluir?');
  }
  await q.fill('20');await expect(page.locator('.age-fields input')).toHaveCount(20);await expect(page.getByRole('button',{name:'Agregar persona',exact:true})).toBeDisabled();
  for(let i=0;i<20;i++)await page.getByLabel(`Edad de la persona ${i+1}`,{exact:true}).fill(i===0?'55':i===1?'33':i===2?'20':String(i));
  await page.getByRole('button',{name:'Ver planes disponibles',exact:true}).click();await page.getByRole('button',{name:'Elegir Premium',exact:true}).click();await page.getByRole('button',{name:'Ver resumen de mi elección',exact:true}).click();
  await expect(page.locator('.selection-result')).toContainText('20 personas');await expect(page.locator('.selection-result')).toContainText('$2.900.000 COP');
  await page.getByRole('button',{name:'Volver a comparar',exact:true}).click();await page.getByRole('button',{name:'Cambiar asegurados',exact:true}).click();
  await page.getByRole('button',{name:'Eliminar persona 10',exact:true}).click();await expect(q).toHaveValue('19');await expect(page.getByLabel('Edad de la persona 10',{exact:true})).toHaveValue('10');
  await q.fill('3');await expect(page.locator('.age-fields input')).toHaveCount(3);await expect(page.getByLabel('Edad de la persona 1',{exact:true})).toHaveValue('55');
  await page.getByRole('button',{name:'Agregar persona',exact:true}).click();await expect(q).toHaveValue('4');await expect(page.getByLabel('Edad de la persona 4',{exact:true})).toHaveValue('');
  await page.getByRole('button',{name:'Eliminar persona 4',exact:true}).click();await expect(q).toHaveValue('3');
  await page.getByRole('button',{name:'Ver planes disponibles',exact:true}).click();await page.getByRole('button',{name:'Elegir Plus',exact:true}).click();
  await page.getByRole('button',{name:'Ver resumen de mi elección',exact:true}).click();await expect(page.locator('.selection-result')).toContainText('55, 33 y 20 años');await expect(page.locator('.selection-result')).toContainText('$285.000 COP');
  await page.reload();await expect(page.locator('.selection-result')).toContainText('$285.000 COP');
});
test('one person and extreme ages are technical limits, not commercial eligibility', async ({ page }) => {
  await completeContact(page);await expect(page.getByRole('button',{name:'Eliminar persona 1',exact:true})).toHaveCount(0);
  const age=page.getByLabel('Edad de la persona 1',{exact:true});await age.fill('131');await page.getByRole('button',{name:'Ver planes disponibles',exact:true}).click();await expect(age).toHaveAttribute('aria-invalid','true');
  for(const value of ['0','130']){
    await age.fill(value);await page.getByRole('button',{name:'Ver planes disponibles',exact:true}).click();await page.getByRole('button',{name:'Elegir Premium',exact:true}).click();
    await page.getByRole('button',{name:'Ver resumen de mi elección',exact:true}).click();await expect(page.locator('.selection-result')).toContainText(`1 persona · ${value} años`);await expect(page.locator('.selection-result')).toContainText('$145.000 COP');
    await page.getByRole('button',{name:'Volver a comparar',exact:true}).click();await page.getByRole('button',{name:'Cambiar asegurados',exact:true}).click();
  }
});
for(const width of [320,390,768,1440]) test(`contact disclosure is discreet, accessible and edits without data loss ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});await completeContact(page);
  const region=page.locator('.contact-summary');await expect(region.getByText('valeria@example.com')).not.toBeVisible();
  const toggle=region.locator('summary');await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(region.getByText('valeria@example.com')).toBeVisible();
  const target=await toggle.getAttribute('aria-controls');expect(await page.locator(`[id="${target}"]`).count()).toBe(1);await noHorizontalOverflow(page);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await region.getByRole('button',{name:'Editar datos en Inicio'}).click();await expect(page.getByLabel('Correo electrónico',{exact:true})).toHaveValue('valeria@example.com');await expect(page.getByLabel('Nombre',{exact:true})).toHaveValue('Valeria');
});
for(const width of [320,390,768,1440]) test(`details toggle label, explicit aria and fixed-bar clearance ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});await toPlans(page);await page.getByRole('button',{name:'Elegir Premium',exact:true}).click();
  const card=page.locator('.plan-card').last(),toggle=card.locator('summary');await expect(toggle).toContainText('Ver detalles del plan');await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.focus();await page.keyboard.press('Enter');await expect(toggle).toContainText('Ocultar detalles del plan');await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(card.locator('details')).toHaveAttribute('data-state','open');
  const controlled=await toggle.getAttribute('aria-controls');expect(await page.locator(`[id="${controlled}"]`).count()).toBe(1);
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));const last=await page.getByRole('button',{name:'Volver a Asegurados',exact:true}).boundingBox(),bar=await page.locator('.selection-summary').boundingBox();expect(last!.y+last!.height).toBeLessThanOrEqual(bar!.y-8);
  await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(toggle).toContainText('Ver detalles del plan');await expect(card.locator('details')).toHaveAttribute('data-state','closed');
  await noHorizontalOverflow(page);await page.getByRole('button',{name:'Ver resumen de mi elección',exact:true}).click();await expect(page.locator('.selection-result')).toContainText('Premium');await expect(page.locator('.selection-result')).toContainText('$435.000 COP');
});
