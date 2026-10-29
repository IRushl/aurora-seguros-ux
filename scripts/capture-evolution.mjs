import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const root='outputs/qa/evolution';await fs.mkdir(root,{recursive:true});const browser=await chromium.launch({headless:true});const evidence=[];
for(const [format,width,height]of [['Desktop',1440,900],['Tablet',768,1024],['Mobile',390,844]]){
 const context=await browser.newContext({viewport:{width,height}});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');
 await page.getByLabel('Nombre',{exact:true}).fill('Valeria');await page.getByLabel('Correo electrónico',{exact:true}).fill('valeria@example.com');await page.getByLabel('Celular',{exact:true}).fill('3000000000');await page.getByRole('button',{name:'Cotizar',exact:true}).click();await page.getByLabel('Cantidad de personas').fill('3');
 const ages=['55','33','20'];for(let i=0;i<3;i++)await page.getByLabel(`Edad de la persona ${i+1}`).fill(ages[i]);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${root}/S02-55-33-20-${format}.png`,fullPage:true});
 const inputs=await page.locator('.age-fields input').evaluateAll(nodes=>nodes.map(n=>n.value));await page.getByRole('button',{name:'Ver planes disponibles',exact:true}).click();const comparison=await page.locator('.configuration-summary').innerText();
 await page.getByRole('button',{name:'Elegir Plus',exact:true}).click();await page.locator('.plan-card').nth(1).locator('summary').click();await page.screenshot({path:`${root}/S03-details-${format}.png`,fullPage:true});const detail=await page.locator('.plan-card').nth(1).locator('details').innerText();
 await page.getByRole('button',{name:'Ver resumen de mi elección'}).click();const result=await page.locator('.selection-result').innerText();await page.screenshot({path:`${root}/D01-55-33-20-${format}.png`,fullPage:true});
 if(JSON.stringify(inputs)!==JSON.stringify(ages)||!comparison.includes('55, 33 y 20')||!result.includes('55, 33 y 20')||!result.includes('$285.000 COP'))throw new Error('Regression mismatch');
 evidence.push({format,width,inputs,comparison,result,detail,verified:true});await context.close();
}
await browser.close();await fs.writeFile('work/evolution-v2/ages-evidence.json',JSON.stringify(evidence,null,2));console.log('Captured exact ages, dynamic totals and open details in three formats.');
