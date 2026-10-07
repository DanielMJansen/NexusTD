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
}

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
  const themeId = BY_CREATURE[id]?.[tier] ?? BY_RACE[CREATURES[id].race]?.[TIER_INDEX[tier]] ?? (['jade', 'abyss', 'celestial'] as const)[TIER_INDEX[tier]];
  return VARIANT_THEMES[themeId];
}
