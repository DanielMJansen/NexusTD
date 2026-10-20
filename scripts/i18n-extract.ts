// Textos dos dados (src/data) que aparecem para o jogador, com o caminho de cada um, e a conferência das traduções.
// Uso: npm run i18n:extract -- [conjunto | --keys | --check]
//   sem argumentos: resumo por conjunto; com o nome de um conjunto: todos os textos dele (JSON);
//   --keys: nomes de campo encontrados (para ajustar o filtro);
//   --check: o que falta traduzir e os caminhos traduzidos que não existem mais nos dados (sai com erro se houver).
import { TEXT_SOURCES, textLeaves, type DataTranslation, type TextSource } from '../src/i18n/dataText';
import { DATA as EN } from '../src/i18n/data/en';
import { DATA as ES } from '../src/i18n/data/es';

const [only] = process.argv.slice(2);
if (only === '--keys') {
  const keys = new Map<string, number>();
  for (const source of Object.values(TEXT_SOURCES))
    for (const [path] of textLeaves(source)) {
      const key = path.split('.').filter((p) => !/^\d+$/.test(p)).at(-1)!;
      keys.set(key, (keys.get(key) ?? 0) + 1);
    }
  console.log([...keys].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join('\n'));
} else if (only === '--check') {
  let problems = 0;
  for (const [lang, table] of [['en', EN], ['es', ES]] as [string, DataTranslation][]) {
    let total = 0;
    let done = 0;
    for (const name of Object.keys(TEXT_SOURCES) as TextSource[]) {
      const leaves = new Map(textLeaves(TEXT_SOURCES[name]));
      const translated = table[name] ?? {};
      total += leaves.size;
      for (const path of leaves.keys()) {
        if (path in translated) done++;
        else {
          problems++;
          console.log(`  ${lang} faltando: ${name}.${path} = ${leaves.get(path)}`);
        }
      }
      for (const path of Object.keys(translated))
        if (!leaves.has(path)) {
          problems++;
          console.log(`  ${lang} caminho que não existe mais: ${name}.${path}`);
        }
    }
    console.log(`${lang}: ${done}/${total} textos dos dados traduzidos`);
  }
  process.exitCode = problems ? 1 : 0;
} else if (only) {
  const source = TEXT_SOURCES[only as TextSource];
  if (!source) throw new Error(`conjunto desconhecido: ${only}`);
  console.log(JSON.stringify(Object.fromEntries(textLeaves(source)), null, 1));
} else {
  let total = 0;
  for (const [name, source] of Object.entries(TEXT_SOURCES)) {
    const n = textLeaves(source).length;
    total += n;
    console.log(`${name.padEnd(16)} ${n}`);
  }
  console.log(`total            ${total}`);
}
