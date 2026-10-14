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
    legendary: { name: 'Arqueiro Centauro', colors: ['#ffe8a0', '#b8743a', '#2f7a6a'], strength: 0, accent: '#ffe8a0', art: true },
  },
  guard: {
    rare: { name: 'Guarda Real', colors: ['#7aa8ff', '#2a4ab0'], strength: 0, accent: '#ffd25a', art: true },
    epic: { name: 'Templário', colors: ['#ffb070', '#e03a2a', '#7a1010'], strength: 0, accent: '#ff5a3a', particles: 'ember', art: true },
    legendary: { name: 'Paladino do Sol', colors: ['#fff4b0', '#ffd23a', '#ff9a1a'], strength: 0, accent: '#ffe07a', particles: 'star', art: true },
  },
  duelist: {
    rare: { name: 'Duelista do Luar', colors: ['#e8f4ff', '#8ab8ff', '#2a3a8a'], strength: 0, accent: '#9ad0ff', art: true },
    epic: { name: 'Mascarado do Baile', colors: ['#ffe48a', '#e0a020', '#8a1040'], strength: 0, accent: '#f0c040', particles: 'star', art: true },
    legendary: { name: 'Nosferatu', colors: ['#fff0a0', '#ffe060', '#34322a'], strength: 0, accent: '#ffe060', particles: 'shadow', art: true },
  },
  sanguine: {
    rare: { name: 'Cultista de Ônix', colors: ['#ffd25a', '#8a1020', '#1a0a10'], strength: 0, accent: '#e0b030', art: true },
    epic: { name: 'Sacerdote da Lua de Sangue', colors: ['#ff8a8a', '#e0182c', '#5a0010'], strength: 0, accent: '#ff3a4a', particles: 'ember', art: true },
    legendary: { name: 'Senhora das Rosas', colors: ['#ff8a9a', '#d8183a', '#3a7a3a'], strength: 0, accent: '#ff4a62', art: true },
  },
  batSwarm: {
    rare: { name: 'Morcegos Albinos', colors: ['#ffffff', '#e8d8e0', '#c0182c'], strength: 0, accent: '#ff3a50', art: true },
    epic: { name: 'Enxame Espectral', colors: ['#c8fff0', '#4ae0c0', '#1a6a6a'], strength: 0, accent: '#6affe0', particles: 'wisp', art: true },
    legendary: { name: 'Rei Morcego', colors: ['#fff2b0', '#ffd25a', '#4a2a40'], strength: 0, accent: '#ffd25a', art: true },
  },
  fireDragon: {
    rare: { name: 'Dragão Dourado', colors: ['#fff0a0', '#f0c040', '#a0701a'], strength: 0, accent: '#ffd25a', art: true },
    epic: { name: 'Dragão Vulcânico', colors: ['#ffb040', '#ff5a1a', '#3a2a28'], strength: 0, accent: '#ff6a1a', particles: 'ember', art: true },
    legendary: { name: 'Dragão-Fênix', colors: ['#ffe07a', '#ff9a1a', '#ff4a1a'], strength: 0, accent: '#ffb040', particles: 'ember', art: true },
  },
  iceDragon: {
    rare: { name: 'Dragão de Quartzo Rosa', colors: ['#ffe0f0', '#f0a0c8', '#b0507a'], strength: 0, accent: '#ff9ad0', art: true },
    epic: { name: 'Dragão das Neves Eternas', colors: ['#ffffff', '#cfe4f8', '#8aa0c0'], strength: 0, accent: '#e8f4ff', particles: 'frost', art: true },
    legendary: { name: 'Leviatã', colors: ['#c8fff4', '#2a9aa8', '#ff8a7a'], strength: 0, accent: '#7ae8d8', art: true },
  },
  storm: {
    rare: { name: 'Dragão do Crepúsculo', colors: ['#ffd0a0', '#e88a4a', '#7a3a8a'], strength: 0, accent: '#ffb070', art: true },
    epic: { name: 'Dragão de Bronze', colors: ['#bff8ff', '#7af0ff', '#6a4a1a'], strength: 0, accent: '#7af0ff', art: true },
    legendary: { name: 'Lóng', colors: ['#fff4c8', '#e8b830', '#c83a2a'], strength: 0, accent: '#ffe07a', art: true },
  },
  hunter: {
    rare: { name: 'Lobo do Ártico', colors: ['#ffffff', '#c8d8ec', '#4ab8ff'], strength: 0, accent: '#8ad0ff', art: true },
    epic: { name: 'Caçador de Runas', colors: ['#bff4ff', '#5ad8ff', '#2a2a36'], strength: 0, accent: '#5ad8ff', art: true },
    legendary: { name: 'Lobo Ronin', colors: ['#ffffff', '#b8242e', '#2a2e4a'], strength: 0, accent: '#ff4a3a', art: true },
  },
  alpha: {
    rare: { name: 'Alfa de Prata', colors: ['#ffffff', '#dce0ec', '#2c2c34'], strength: 0, accent: '#dce0ec', art: true },
    epic: { name: 'Rei das Montanhas', colors: ['#d8d2ca', '#a8a29a', '#5a544e'], strength: 0, accent: '#ffb040', art: true },
    legendary: { name: 'Fenrir', colors: ['#bfeaff', '#5ac8ff', '#1c1c28'], strength: 0, accent: '#5ac8ff', art: true },
  },
  howler: {
    rare: { name: 'Lobo do Deserto', colors: ['#ffe8b8', '#dcb47c', '#8a6030'], strength: 0, accent: '#ffd23a', art: true },
    epic: { name: 'Lobo Xamã', colors: ['#d8ffe0', '#7affa0', '#2e241a'], strength: 0, accent: '#7affa0', art: true },
    legendary: { name: 'Orthros', colors: ['#ffe080', '#a8603a', '#4a2010'], strength: 0, accent: '#ffd040', art: true },
  },
  haunt: {
    rare: { name: 'Fantasma do Lampião', colors: ['#fff4c8', '#ffc040', '#c06a10'], strength: 0, accent: '#ffc040', art: true },
    epic: { name: 'Cavaleiro Fantasma', colors: ['#ffffff', '#8ab8ff', '#3a4a7a'], strength: 0, accent: '#8ab8ff', art: true },
    legendary: { name: 'Casa Assombrada', colors: ['#ffe8a0', '#ffd25a', '#3a2e4e'], strength: 0, accent: '#ffd25a', art: true },
  },
  banshee: {
    rare: { name: 'Banshee Carmesim', colors: ['#ffc0c8', '#ff6a8a', '#8a1a3e'], strength: 0, accent: '#ff6a8a', art: true },
    epic: { name: 'Noiva Cadáver', colors: ['#ffffff', '#c8fff0', '#6a8a8a'], strength: 0, accent: '#8affd8', art: true },
    legendary: { name: 'Organista Fantasma', colors: ['#ffe8b0', '#f0dca0', '#4a2a5a'], strength: 0, accent: '#ffd8a0', art: true },
  },
  possessor: {
    rare: { name: 'Sombra Esmeralda', colors: ['#c8ffe0', '#8affc0', '#1e6e4e'], strength: 0, accent: '#8affc0', art: true },
    epic: { name: 'Possessor Mascarado', colors: ['#fff4c0', '#ffd25a', '#3e2a52'], strength: 0, accent: '#ffd25a', art: true },
    legendary: { name: 'Boneca Possuída', colors: ['#fff8f4', '#8af0ff', '#6a1a3a'], strength: 0, accent: '#8af0ff', art: true },
  },
  sorceress: {
    rare: { name: 'Bruxa da Abóbora', colors: ['#ffd090', '#ff8a2a', '#7a2a08'], strength: 0, accent: '#ff9a2a', art: true },
    epic: { name: 'Bruxa do Mar', colors: ['#e0fffa', '#6af0e0', '#1e8a96'], strength: 0, accent: '#6af0e0', art: true },
    legendary: { name: 'Bruxa na Vassoura', colors: ['#f0c860', '#c8a0ff', '#3a2a5a'], strength: 0, accent: '#c8a0ff', art: true },
  },
  cauldron: {
    rare: { name: 'Caldeirão de Cobre', colors: ['#ffe4f2', '#ff8ac0', '#a85a2a'], strength: 0, accent: '#ff8ac0', art: true },
    epic: { name: 'Caldeirão de Abóbora', colors: ['#fff0a0', '#ffb040', '#a0400a'], strength: 0, accent: '#ffb040', art: true },
    legendary: { name: 'Caldeirão Mímico', colors: ['#ffe060', '#ff8aa8', '#3a2e3a'], strength: 0, accent: '#ff8aa8', art: true },
  },
  herbalist: {
    rare: { name: 'Druida do Outono', colors: ['#ffd090', '#ff9a2a', '#d83a1a'], strength: 0, accent: '#ff9a2a', art: true },
    epic: { name: 'Bruxa dos Cogumelos', colors: ['#e0fff4', '#7affd0', '#a8180e'], strength: 0, accent: '#7affd0', art: true },
    legendary: { name: 'Espírito da Floresta', colors: ['#ffe0f0', '#ffb0d8', '#4ec06e'], strength: 0, accent: '#ffb0d8', art: true },
  },
  enchantress: {
    rare: { name: 'Fada da Lavanda', colors: ['#f4e8ff', '#d8b8ff', '#6a3aa8'], strength: 0, accent: '#d8b8ff', art: true },
    epic: { name: 'Fada Borboleta', colors: ['#ffe0a0', '#ff9a2a', '#a04a0a'], strength: 0, accent: '#ff9a2a', art: true },
    legendary: { name: 'Fada de Cristal', colors: ['#ffffff', '#bfe8ff', '#ffc8f0'], strength: 0, accent: '#bfe8ff', particles: 'star', art: true },
  },
  trickster: {
    rare: { name: 'Fada do Bosque Noturno', colors: ['#e0e4ff', '#a8b8ff', '#5a6ad8'], strength: 0, accent: '#a8b8ff', art: true },
    epic: { name: 'Fada Arlequim', colors: ['#fff0a0', '#ffd25a', '#e0303e'], strength: 0, accent: '#ffd25a', art: true },
    legendary: { name: 'Fada Sombra', colors: ['#f0e0ff', '#d8a8ff', '#3a2e4a'], strength: 0, accent: '#d8a8ff', art: true },
  },
  lumina: {
    rare: { name: 'Fada do Luar', colors: ['#ffffff', '#cfe0ff', '#7a8ab8'], strength: 0, accent: '#cfe0ff', art: true },
    epic: { name: 'Fada Vaga-lume', colors: ['#f4ffb0', '#d8ff6a', '#3e6e2e'], strength: 0, accent: '#d8ff6a', art: true },
    legendary: { name: 'Fada Solar', colors: ['#fff4c0', '#ffd040', '#e07a10'], strength: 0, accent: '#ffd040', particles: 'ember', art: true },
  },
  stoneWall: {
    rare: { name: 'Golem de Arenito', colors: ['#fff0c8', '#e0c48a', '#5ac8ff'], strength: 0, accent: '#5ac8ff', art: true },
    epic: { name: 'Golem de Musgo', colors: ['#e0ffb0', '#8ad85a', '#4a5a3a'], strength: 0, accent: '#8ad85a', art: true },
    legendary: { name: 'Golem de Mármore Divino', colors: ['#ffffff', '#ffe08a', '#e0b030'], strength: 0, accent: '#ffd25a', particles: 'star', art: true },
  },
  crystalGolem: {
    rare: { name: 'Golem de Topázio', colors: ['#fff0b0', '#ffc040', '#d07a10'], strength: 0, accent: '#ffc040', art: true },
    epic: { name: 'Golem de Esmeralda', colors: ['#d0ffe8', '#4affa0', '#0e8a4a'], strength: 0, accent: '#4affa0', art: true },
    legendary: { name: 'Golem de Diamante Arco-Íris', colors: ['#ff7a9a', '#ffe66a', '#7ac8ff'], strength: 0, accent: '#ffffff', particles: 'star', art: true },
  },
  magmaGolem: {
    rare: { name: 'Golem de Lava Azul', colors: ['#d0f0ff', '#4ab8ff', '#1a4a8a'], strength: 0, accent: '#4ab8ff', art: true },
    epic: { name: 'Golem de Obsidiana', colors: ['#f0d8ff', '#c86aff', '#2a2236'], strength: 0, accent: '#c86aff', art: true },
    legendary: { name: 'Golem do Sol', colors: ['#ffffff', '#ffd040', '#ff8a10'], strength: 0, accent: '#ffd040', particles: 'ember', art: true },
  },
  skeletonWarrior: {
    rare: { name: 'Esqueleto de Ônix', colors: ['#c8ffd0', '#7aff8a', '#3a3640'], strength: 0, accent: '#7aff8a', art: true },
    epic: { name: 'Esqueleto Pirata', colors: ['#fff0a0', '#ffd25a', '#2a1e1a'], strength: 0, accent: '#ffd25a', art: true },
    legendary: { name: 'Rei dos Ossos', colors: ['#fff4b0', '#ffd040', '#a01a3a'], strength: 0, accent: '#ffd040', particles: 'star', art: true },
  },
  reaper: {
    rare: { name: 'Ceifador Pálido', colors: ['#ffffff', '#c8d8f0', '#5ac8ff'], strength: 0, accent: '#8ad0ff', art: true },
    epic: { name: 'Ceifador do Dia dos Mortos', colors: ['#ffd040', '#ff9a1a', '#ff5a8a'], strength: 0, accent: '#ff9a1a', art: true },
    legendary: { name: 'Ceifador Cósmico', colors: ['#ffffff', '#ff6ad8', '#8a4ae0'], strength: 0, accent: '#c8a0ff', art: true },
  },
  drainer: {
    rare: { name: 'Sanguessuga Pálida', colors: ['#e0f0ff', '#8ad0ff', '#5a6a80'], strength: 0, accent: '#8ad0ff', art: true },
    epic: { name: 'Sanguessuga Pestilenta', colors: ['#f0ffc8', '#c8ff6a', '#2a2620'], strength: 0, accent: '#c8ff6a', art: true },
    legendary: { name: 'Sanguessuga Abissal', colors: ['#f0d8ff', '#c86aff', '#140e24'], strength: 0, accent: '#c86aff', art: true },
  },
  serpentArcher: {
    rare: { name: 'Górgona do Deserto', colors: ['#fff0c8', '#e0b060', '#7a5a2a'], strength: 0, accent: '#e0b060', art: true },
    epic: { name: 'Górgona Coral', colors: ['#ffe040', '#e0303a', '#14141a'], strength: 0, accent: '#e0303a', art: true },
    legendary: { name: 'Górgona de Jade', colors: ['#e0fff0', '#2ae890', '#0e5a3e'], strength: 0, accent: '#2ae890', particles: 'star', art: true },
  },
  medusa: {
    rare: { name: 'Medusa de Mármore', colors: ['#ffffff', '#c8c8d0', '#6a6a74'], strength: 0, accent: '#ffd25a', art: true },
    epic: { name: 'Medusa Rainha do Nilo', colors: ['#fff0a0', '#ffd25a', '#3a6ad8'], strength: 0, accent: '#5ad8ff', art: true },
    legendary: { name: 'Medusa Estelar', colors: ['#ffffff', '#8ad8ff', '#4a3aa8'], strength: 0, accent: '#8ad8ff', particles: 'star', art: true },
  },
  basilisk: {
    rare: { name: 'Basilisco Albino', colors: ['#ffffff', '#ffb0b8', '#e05a6a'], strength: 0, accent: '#ff3a3a', art: true },
    epic: { name: 'Basilisco de Lava', colors: ['#ffe07a', '#ff6a1a', '#4a3a36'], strength: 0, accent: '#ff6a1a', particles: 'ember', art: true },
    legendary: { name: 'Basilisco Dourado Imperial', colors: ['#fff4c8', '#f0c040', '#3ad8ff'], strength: 0, accent: '#3ad8ff', particles: 'star', art: true },
  },
  imp: {
    rare: { name: 'Diabrete Azul', colors: ['#cfe4ff', '#5a8aff', '#10246a'], strength: 0, accent: '#5a8aff', art: true },
    epic: { name: 'Diabrete Mecânico', colors: ['#fff0b0', '#e0b860', '#5a3a14'], strength: 0, accent: '#7af0ff', art: true },
    legendary: { name: 'Cavaleiro do Cão Infernal', colors: ['#ffe07a', '#ff6a1a', '#3a2a3a'], strength: 0, accent: '#ff6a1a', art: true },
  },
  infernal: {
    rare: { name: 'Infernal de Cinzas', colors: ['#ffd090', '#ff8a2a', '#5a5450'], strength: 0, accent: '#ff8a2a', art: true },
    epic: { name: 'Infernal Gladiador', colors: ['#ffffff', '#d8dce4', '#d02a2a'], strength: 0, accent: '#d8dce4', art: true },
    legendary: { name: 'Arquiduque Infernal', colors: ['#f0e0ff', '#a84aff', '#2a1a2e'], strength: 0, accent: '#a84aff', art: true },
  },
  succubus: {
    rare: { name: 'Sedutora Esmeralda', colors: ['#d0ffe4', '#7affb0', '#14502e'], strength: 0, accent: '#7affb0', art: true },
    epic: { name: 'Sedutora das Cartas', colors: ['#fff0a0', '#ffd25a', '#8a0a1e'], strength: 0, accent: '#ffd25a', art: true },
    legendary: { name: 'Anjo Caído', colors: ['#fff4c8', '#ffd25a', '#14101e'], strength: 0, accent: '#ffd25a', art: true },
  },
  cherub: {
    rare: { name: 'Querubim Rosado', colors: ['#ffe0f0', '#ffb8d8', '#d84a8a'], strength: 0, accent: '#ffb8d8', art: true },
    epic: { name: 'Cupido', colors: ['#ffd0dc', '#ff4a6a', '#a01a3a'], strength: 0, accent: '#ff4a6a', art: true },
    legendary: { name: 'Querubim de Vitral', colors: ['#ff6a8a', '#ffd040', '#6ab8ff'], strength: 0, accent: '#ffd040', art: true },
  },
  valkyrie: {
    rare: { name: 'Valquíria Rubra', colors: ['#ffd0d0', '#e05a5a', '#7a1414'], strength: 0, accent: '#e05a5a', art: true },
    epic: { name: 'Valquíria Nórdica', colors: ['#ffe0b0', '#d8602a', '#3a4050'], strength: 0, accent: '#d8602a', art: true },
    legendary: { name: 'Valquíria do Corcel Alado', colors: ['#ffffff', '#e8eeff', '#c8a040'], strength: 0, accent: '#ffffff', art: true },
  },
  guardianAngel: {
    rare: { name: 'Guardião de Bronze', colors: ['#ffe0b0', '#e8b070', '#8a5a2a'], strength: 0, accent: '#e8b070', art: true },
    epic: { name: 'Anjo de Pedra', colors: ['#e8e4dc', '#c8c4bc', '#5a9a4a'], strength: 0, accent: '#c8c4bc', art: true },
    legendary: { name: 'Ofanim', colors: ['#fff8e0', '#ffe08a', '#e0a830'], strength: 0, accent: '#ffe08a', art: true },
  },
  starFoal: {
    rare: { name: 'Potro Noturno', colors: ['#c8d0ff', '#4a4a80', '#22224a'], strength: 0, accent: '#c8d0ff', art: true },
    epic: { name: 'Potro de Algodão-Doce', colors: ['#ffeef8', '#ffb0d8', '#b0e0ff'], strength: 0, accent: '#ffb0d8', art: true },
    legendary: { name: 'Cavalo de Carrossel', colors: ['#fffaf0', '#e0243a', '#ffd25a'], strength: 0, accent: '#ffd25a', art: true },
  },
  guardianUnicorn: {
    rare: { name: 'Unicórnio Lunar', colors: ['#eef4ff', '#a8c0ff', '#3a4a8a'], strength: 0, accent: '#a8c0ff', art: true },
    epic: { name: 'Unicórnio Silvestre', colors: ['#ece4cc', '#8ac860', '#5a4a3a'], strength: 0, accent: '#8ac860', art: true },
    legendary: { name: 'Qilin', colors: ['#f4d878', '#40d8a0', '#d8243a'], strength: 0, accent: '#40d8a0', art: true },
  },
  warPegasus: {
    rare: { name: 'Pégaso Ruão', colors: ['#ecc8b8', '#a85a3a', '#4a2016'], strength: 0, accent: '#a85a3a', art: true },
    epic: { name: 'Pégaso Morcego', colors: ['#c8a0e0', '#4e3e60', '#ffd040'], strength: 0, accent: '#9a6ab8', art: true },
    legendary: { name: 'Hipogrifo', colors: ['#fbf8f0', '#b8844e', '#e8b040'], strength: 0, accent: '#e8b040', art: true },
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
