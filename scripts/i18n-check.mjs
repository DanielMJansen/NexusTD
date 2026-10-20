// Lista os textos passados por t('...') no código que ainda não têm tradução em inglês ou espanhol.
// Uso: npm run i18n:check  (só olha chamadas com texto literal; os textos dos dados são conferidos à parte)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) files.push(p);
  }
};
walk('src');

const unescape = (s) => s.replace(/\\(['"\\])/g, '$1');
const keys = new Map();
const call = /\bt\(\s*'((?:[^'\\]|\\.)*)'/g;
for (const f of files) {
  if (f.includes('i18n')) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(call)) {
    const k = unescape(m[1]);
    if (!keys.has(k)) keys.set(k, f);
  }
}

const entry = /^\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"):/gm;
const table = (lang) => new Set([`src/i18n/${lang}.ts`, `src/i18n/${lang}-texts.ts`].flatMap((f) => [...readFileSync(f, 'utf8').matchAll(entry)].map((m) => unescape(m[1] ?? m[2]))));

let missing = 0;
for (const lang of ['en', 'es']) {
  const have = table(lang);
  const out = [...keys].filter(([k]) => !have.has(k));
  missing += out.length;
  console.log(`${lang}: ${keys.size - out.length}/${keys.size} traduzidos`);
  for (const [k, f] of out) console.log(`  faltando (${f}): ${k}`);
}
process.exitCode = missing ? 1 : 0;
