// Temas das variantes do Altar: cada criatura recebe, por raridade, um tema com nome, cores e efeitos.
// Rara = recolorido; Épica = recolorido + aura e partículas + ataques no tema; Lendária = tudo isso,
// degradê de várias cores e um brilho que corre pelo corpo.
import type { CreatureId } from './creatures';
import { CREATURES } from './creatures';
import type { VariantTier } from './altar';

export type VariantThemeId =
  | 'jade'
  | 'frost'
  | 'ruby'
  | 'emerald'
  | 'solar'
  | 'infernal'
  | 'abyss'
  | 'spectral'
  | 'storm'
  | 'celestial'
  | 'void'
  | 'aurora';

/** Partículas em volta da criatura (Épica e Lendária). */
export type ThemeParticle = 'ember' | 'frost' | 'shadow' | 'wisp' | 'spark' | 'star' | 'ribbon';

export interface VariantTheme {
  name: string;
  /** Degradê no modo "cor" (do alto para baixo): só matiz e saturação contam, então use cores vivas. */
  colors: string[];
  /** Quanto o recolorido cobre o original (0–1). */
  strength: number;
  /** Clarear ou escurecer depois do recolorido (0–1), para temas de luz ou de sombra. */
  light?: number;
  dark?: number;
  /** Cor principal (aura, rótulos, partículas dos ataques). */
  accent: string;
  particles?: ThemeParticle;
  /** O próprio sprite desenha a variante (cores e forma próprias): sem recolorido por cima. */
  art?: boolean;
}

/**
 * Variantes com arte própria (12/10/2026): cada criatura ganha temas únicos por raridade. A Rara muda
 * cores; a Épica e a Lendária também mudam a forma (acessórios), em todas as formas da criatura. `colors`
 * e `accent` pintam ataques, aura e partículas; o desenho em si fica no sprite (`pose.variant`).
 */
const CREATURE_VARIANTS: Partial<Record<CreatureId, Record<VariantTier, VariantTheme>>> = {
  archer: {
    rare: { name: 'Patrulheiro do Outono', colors: ['#ffb04a', '#c0601a'], strength: 0, accent: '#ff9a3a', art: true },
    epic: { name: 'Caçador de Bestas', colors: ['#ffc860', '#c07a20', '#6a3a10'], strength: 0, accent: '#ffb030', art: true },
    legendary: { name: 'Arqueiro Estelar', colors: ['#e8f4ff', '#8ab8ff', '#3a4ac8'], strength: 0, accent: '#bfe0ff', particles: 'star', art: true },
  },
  guard: {
    rare: { name: 'Guarda Real', colors: ['#7aa8ff', '#2a4ab0'], strength: 0, accent: '#ffd25a', art: true },
    epic: { name: 'Templário', colors: ['#ffb070', '#e03a2a', '#7a1010'], strength: 0, accent: '#ff5a3a', particles: 'ember', art: true },
    legendary: { name: 'Paladino do Sol', colors: ['#fff4b0', '#ffd23a', '#ff9a1a'], strength: 0, accent: '#ffe07a', particles: 'star', art: true },
  },
  duelist: {
    rare: { name: 'Duelista do Luar', colors: ['#e8f4ff', '#8ab8ff', '#2a3a8a'], strength: 0, accent: '#9ad0ff', art: true },
    epic: { name: 'Mascarado do Baile', colors: ['#ffe48a', '#e0a020', '#8a1040'], strength: 0, accent: '#f0c040', particles: 'star', art: true },
    legendary: { name: 'Senhor do Eclipse', colors: ['#ff6a7a', '#ff2a40', '#3a0010'], strength: 0, accent: '#ff2a40', art: true },
  },
  sanguine: {
    rare: { name: 'Cultista de Ônix', colors: ['#ffd25a', '#8a1020', '#1a0a10'], strength: 0, accent: '#e0b030', art: true },
    epic: { name: 'Sacerdote da Lua de Sangue', colors: ['#ff8a8a', '#e0182c', '#5a0010'], strength: 0, accent: '#ff3a4a', particles: 'ember', art: true },
    legendary: { name: 'Avatar Escarlate', colors: ['#ffb0b8', '#ff2a40', '#6a0010'], strength: 0, accent: '#ff4a5a', art: true },
  },
  batSwarm: {
    rare: { name: 'Morcegos Albinos', colors: ['#ffffff', '#e8d8e0', '#c0182c'], strength: 0, accent: '#ff3a50', art: true },
    epic: { name: 'Enxame Espectral', colors: ['#c8fff0', '#4ae0c0', '#1a6a6a'], strength: 0, accent: '#6affe0', particles: 'wisp', art: true },
    legendary: { name: 'Enxame Infernal', colors: ['#ffe07a', '#ff7a1a', '#a01a0a'], strength: 0, accent: '#ff7a1a', particles: 'ember', art: true },
  },
  fireDragon: {
    rare: { name: 'Dragão Dourado', colors: ['#fff0a0', '#f0c040', '#a0701a'], strength: 0, accent: '#ffd25a', art: true },
    epic: { name: 'Dragão Vulcânico', colors: ['#ffb040', '#ff5a1a', '#3a2a28'], strength: 0, accent: '#ff6a1a', particles: 'ember', art: true },
    legendary: { name: 'Dragão-Fênix', colors: ['#ffe07a', '#ff9a1a', '#ff4a1a'], strength: 0, accent: '#ffb040', particles: 'ember', art: true },
  },
  iceDragon: {
    rare: { name: 'Dragão de Quartzo Rosa', colors: ['#ffe0f0', '#f0a0c8', '#b0507a'], strength: 0, accent: '#ff9ad0', art: true },
    epic: { name: 'Dragão das Neves Eternas', colors: ['#ffffff', '#cfe4f8', '#8aa0c0'], strength: 0, accent: '#e8f4ff', particles: 'frost', art: true },
    legendary: { name: 'Dragão Boreal', colors: ['#2affc8', '#4a7aff', '#ff4ad8'], strength: 0, accent: '#9af0ff', particles: 'star', art: true },
  },
  storm: {
    rare: { name: 'Dragão do Crepúsculo', colors: ['#ffd0a0', '#e88a4a', '#7a3a8a'], strength: 0, accent: '#ffb070', art: true },
    epic: { name: 'Dragão de Bronze', colors: ['#bff8ff', '#7af0ff', '#6a4a1a'], strength: 0, accent: '#7af0ff', art: true },
    legendary: { name: 'Serpente Celeste', colors: ['#fff8e0', '#ffe8a0', '#c89020'], strength: 0, accent: '#ffe07a', particles: 'star', art: true },
  },
  cleric: {
    rare: { name: 'Irmã do Lírio', colors: ['#f0d8ff', '#a87ae0'], strength: 0, accent: '#c8a0ff', art: true },
    epic: { name: 'Oráculo', colors: ['#fff0a0', '#e0b030', '#8a6010'], strength: 0, accent: '#ffd25a', particles: 'star', art: true },
    legendary: { name: 'Santa da Aurora', colors: ['#2affc8', '#4a7aff', '#ff4ad8'], strength: 0, accent: '#9af0ff', particles: 'ribbon', art: true },
  },
};

export const VARIANT_THEMES: Record<VariantThemeId, VariantTheme> = {
  jade: { name: 'Jade', colors: ['#3aff9a', '#0a8a5a'], strength: 0.85, accent: '#5affa0' },
  frost: { name: 'Geada', colors: ['#5ad0ff', '#1a5ad8'], strength: 0.85, light: 0.12, accent: '#8ad8ff', particles: 'frost' },
  ruby: { name: 'Rubi', colors: ['#ff3a5a', '#a00a2a'], strength: 0.85, accent: '#ff4a6a' },
  emerald: { name: 'Esmeralda', colors: ['#9aff3a', '#0a9a3a'], strength: 0.85, accent: '#8aff5a' },
  solar: { name: 'Solar', colors: ['#ffd23a', '#ff6a0a'], strength: 0.9, light: 0.1, accent: '#ffc040', particles: 'ember' },
  infernal: { name: 'Infernal', colors: ['#ffcc1a', '#ff3a0a', '#8a0a0a'], strength: 0.92, accent: '#ff5a1a', particles: 'ember' },
  abyss: { name: 'Abissal', colors: ['#b45aff', '#5a1ad8', '#2a0a6a'], strength: 0.92, dark: 0.1, accent: '#a86aff', particles: 'shadow' },
  spectral: { name: 'Espectral', colors: ['#3affd8', '#1ab8c8', '#0a5a7a'], strength: 0.92, light: 0.12, accent: '#5affe0', particles: 'wisp' },
  storm: { name: 'Tempestade', colors: ['#6aa8ff', '#3a4aff', '#2a1a9a'], strength: 0.92, light: 0.1, accent: '#8ab8ff', particles: 'spark' },
  celestial: { name: 'Celestial', colors: ['#ffe03a', '#ffc01a', '#ff9a0a'], strength: 0.95, light: 0.28, accent: '#ffe07a', particles: 'star' },
  void: { name: 'Vazio', colors: ['#ff4aff', '#8a2aff', '#2a0a6a'], strength: 0.95, dark: 0.15, accent: '#c87aff', particles: 'star' },
  aurora: { name: 'Aurora', colors: ['#2affc8', '#4a7aff', '#ff4ad8'], strength: 0.95, light: 0.1, accent: '#9af0ff', particles: 'ribbon' },
};

/** Temas por raça (contrastando com as cores da raça): rara, épica, lendária. */
const BY_RACE: Record<string, [VariantThemeId, VariantThemeId, VariantThemeId]> = {
  Humano: ['ruby', 'infernal', 'celestial'],
  Vampiro: ['frost', 'abyss', 'void'],
  Dragão: ['emerald', 'storm', 'aurora'],
  Lobisomem: ['frost', 'infernal', 'celestial'],
  Fantasma: ['ruby', 'abyss', 'aurora'],
  Bruxa: ['solar', 'spectral', 'void'],
  Fada: ['emerald', 'storm', 'aurora'],
  Golem: ['jade', 'infernal', 'celestial'],
  Necromante: ['ruby', 'abyss', 'void'],
  Anjo: ['ruby', 'abyss', 'void'],
  Demônio: ['frost', 'spectral', 'celestial'],
  Górgona: ['ruby', 'solar', 'aurora'],
  Unicórnio: ['emerald', 'abyss', 'aurora'],
};

/** Exceções por criatura (quando o tema da raça fica parecido com as cores originais dela). */
const BY_CREATURE: Partial<Record<CreatureId, Partial<Record<VariantTier, VariantThemeId>>>> = {
  fireDragon: { epic: 'frost' },
  iceDragon: { rare: 'ruby', epic: 'infernal' },
  magmaGolem: { epic: 'storm' },
  cauldron: { rare: 'ruby' },
};

const TIER_INDEX: Record<VariantTier, number> = { rare: 0, epic: 1, legendary: 2 };

/** Tema da variante de uma criatura. */
export function variantTheme(id: CreatureId, tier: VariantTier): VariantTheme {
  const own = CREATURE_VARIANTS[id]?.[tier];
  if (own) return own;
  const themeId = BY_CREATURE[id]?.[tier] ?? BY_RACE[CREATURES[id].race]?.[TIER_INDEX[tier]] ?? (['jade', 'abyss', 'celestial'] as const)[TIER_INDEX[tier]];
  return VARIANT_THEMES[themeId];
}
