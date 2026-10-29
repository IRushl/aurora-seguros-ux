import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync(new URL('../src/design/figma-tokens.json', import.meta.url), 'utf8'));
const byId = new Map(data.variables.map(v => [v.id, v]));
const cssName = v => v.syntax.WEB.match(/^var\((.+)\)$/)[1];
function valueOf(v) {
  const value = Object.values(v.values)[0];
  if (value.type === 'VARIABLE_ALIAS') return `var(${cssName(byId.get(value.id))})`;
  if (v.type === 'COLOR') return '#' + [value.r, value.g, value.b].map(n => Math.round(n * 255).toString(16).padStart(2, '0')).join('');
  return `${value}px`;
}
fs.mkdirSync(new URL('../src/styles/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../src/styles/tokens.css', import.meta.url), '/* Generated from the approved Aurora Figma variables. Run node scripts/generate-tokens.mjs. */\n:root {\n' + data.variables.map(v => `  ${cssName(v)}: ${valueOf(v)};`).join('\n') + '\n}\n');
