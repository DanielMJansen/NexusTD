// Idiomas do jogo. O português é a fonte: os textos ficam em português no código e passam por `t()`,
// que devolve a tradução do idioma ativo (ou o próprio português, se ainda não houver tradução).
import { EN } from './en';
import { ES } from './es';

export type Lang = 'pt' | 'en' | 'es';
export const LANGS: readonly Lang[] = ['pt', 'en', 'es'];
/** Nome de cada idioma no próprio idioma (seletor nas Configurações). */
export const LANG_NAMES: Record<Lang, string> = { pt: 'Português', en: 'English', es: 'Español' };

const TABLES: Record<Exclude<Lang, 'pt'>, Record<string, string>> = { en: EN, es: ES };

let current: Lang = 'pt';

/** Enquanto false, o padrão de quem não escolheu idioma é português (os dados ainda não estão todos traduzidos). */
export const TRANSLATION_COMPLETE = false;

/** Idioma do navegador: português, espanhol ou, para qualquer outro, inglês. */
export function detectLang(): Lang {
  const tag = (typeof navigator !== 'undefined' ? navigator.language : 'pt').toLowerCase();
  if (tag.startsWith('pt')) return 'pt';
  if (tag.startsWith('es')) return 'es';
  return 'en';
}

export function setLang(lang: Lang): void {
  current = lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
}

export const getLang = (): Lang => current;

/**
 * Texto no idioma ativo. `pt` é o texto em português (também a chave da tradução);
 * `{nome}` é trocado pelo valor em `vars` (ex.: t('Onda {n}', { n: 3 })).
 */
export function t(pt: string, vars?: Record<string, string | number>): string {
  const text = current === 'pt' ? pt : (TABLES[current][pt] ?? pt);
  return vars ? text.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m)) : text;
}

/**
 * Traduz os textos fixos do HTML (rótulos do HUD etc.) uma vez ao abrir o jogo:
 * cada nó de texto e cada `title` cujo conteúdo (sem espaços nas pontas) tenha tradução.
 */
export function translateStatic(root: ParentNode): void {
  if (current === 'pt') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const raw = node.nodeValue ?? '';
    const key = raw.trim();
    if (!key) continue;
    const translated = t(key);
    if (translated !== key) node.nodeValue = raw.replace(key, translated);
  }
  for (const el of root.querySelectorAll<HTMLElement>('[title], [aria-label], [placeholder]')) {
    for (const attr of ['title', 'aria-label', 'placeholder']) {
      const value = el.getAttribute(attr);
      if (value) el.setAttribute(attr, t(value));
    }
  }
}
