// Textos dos dados (nomes, descrições, histórias...) traduzidos por caminho.
// Na abertura do jogo, `applyDataTranslations` escreve a tradução por cima do próprio objeto de dados
// (trocar de idioma recarrega a página), então as telas continuam lendo CREATURES[id].name etc.
// Campos que servem de chave (ex.: `race`, ids) nunca entram aqui: só os nomes de campo de TEXT_KEYS.
import { ACHIEVEMENTS } from '../data/achievements';
import { ASCENSION } from '../data/ascension';
import { CREATURE_CLASSES, CREATURES } from '../data/creatures';
import { ENEMIES } from '../data/enemies';
import { FEATURES } from '../data/features';
import { GIFTS } from '../data/gifts';
import { HERO_UPGRADES } from '../data/heroUpgrades';
import { HEROES } from '../data/heroes';
import { WORLD_PREMISE } from '../data/lore';
import { MUTATIONS } from '../data/mutations';
import { NEXUS_COLORS, NEXUS_MODELS } from '../data/nexusSkins';
import { LOOT, NEXUS_UPGRADES } from '../data/nexusUpgrades';
import { RACE_PASSIVES } from '../data/races';
import { RELICS } from '../data/relics';
import { SKINS } from '../data/skins';
import { STAGES } from '../data/stages';
import { TALENT_BRANCHES, TALENTS } from '../data/talents';
import { TUTORIAL_STEPS } from '../data/tutorial';
import { TIERS, UPGRADE_FAMILIES } from '../data/upgrades';
import { CREATURE_VARIANTS, VARIANT_THEMES } from '../data/variantThemes';
import { VARIANTS } from '../data/altar';

/** Conjuntos de dados com texto para o jogador (o nome é o do arquivo de tradução em src/i18n/data/). */
export const TEXT_SOURCES = {
  creatures: CREATURES,
  creatureClasses: CREATURE_CLASSES,
  heroes: HEROES,
  enemies: ENEMIES,
  relics: RELICS,
  talents: TALENTS,
  talentBranches: TALENT_BRANCHES,
  achievements: ACHIEVEMENTS,
  upgrades: UPGRADE_FAMILIES,
  upgradeTiers: TIERS,
  heroUpgrades: HERO_UPGRADES,
  nexusUpgrades: NEXUS_UPGRADES,
  loot: LOOT,
  stages: STAGES,
  variantThemes: VARIANT_THEMES,
  creatureVariants: CREATURE_VARIANTS,
  variants: VARIANTS,
  skins: SKINS,
  mutations: MUTATIONS,
  features: FEATURES,
  nexusModels: NEXUS_MODELS,
  nexusColors: NEXUS_COLORS,
  lore: { premise: WORLD_PREMISE },
  races: RACE_PASSIVES,
  ascension: ASCENSION,
  tutorial: TUTORIAL_STEPS,
  gifts: GIFTS,
} as const;

export type TextSource = keyof typeof TEXT_SOURCES;
/** Tradução de um conjunto: caminho ("archer.ascended.0.name") → texto. */
export type DataTranslation = Partial<Record<TextSource, Record<string, string>>>;

/** Nomes de campo que guardam texto para o jogador. */
const TEXT_KEYS = new Set([
  'name', 'description', 'lore', 'role', 'classDetail', 'text', 'title', 'subtitle', 'intro', 'lockedHint',
  'premise', 'hint', 'label', 'short', 'summary', 'tagline', 'flavor', 'story', 'banner', 'bossLine',
]);

const isText = (value: string) => /[A-Za-zÀ-ú]/.test(value);

/** Todos os textos de um conjunto, com o caminho de cada um. Strings soltas em listas (ex.: dicas) também entram. */
export function textLeaves(root: unknown): [string, string][] {
  const out: [string, string][] = [];
  const visit = (node: unknown, path: string[], key: string) => {
    if (typeof node === 'string') {
      const inList = /^\d+$/.test(key) && path.length > 1 && TEXT_KEYS.has(path[path.length - 2]!);
      if ((TEXT_KEYS.has(key) || inList || (path.length === 1 && root === TEXT_SOURCES.creatureClasses)) && isText(node)) out.push([path.join('.'), node]);
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) visit(v, [...path, k], k);
  };
  visit(root, [], '');
  return out;
}

/** Escreve as traduções por cima dos dados (antes de qualquer tela). Caminho inexistente é ignorado. */
export function applyDataTranslations(table: DataTranslation): void {
  for (const [source, entries] of Object.entries(table) as [TextSource, Record<string, string>][]) {
    const root = TEXT_SOURCES[source] as unknown as Record<string, unknown>;
    for (const [path, text] of Object.entries(entries)) {
      const parts = path.split('.');
      let node: unknown = root;
      for (const part of parts.slice(0, -1)) node = node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined;
      const last = parts.at(-1)!;
      if (node && typeof node === 'object' && typeof (node as Record<string, unknown>)[last] === 'string') (node as Record<string, unknown>)[last] = text;
    }
  }
}
