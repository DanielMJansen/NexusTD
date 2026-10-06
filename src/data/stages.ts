import type { NexusModelId } from './nexusSkins';
import type { EnemyId } from './enemies';
import type { BossEntry, WaveEntry } from './waves';

export type StageId = 'graveyard' | 'swamp';
/** Cenário desenhado na arena. */
export type Biome = 'graveyard' | 'swamp';

/** Lama: criaturas invocadas nela atacam mais devagar; o herói anda mais devagar. */
export interface MudTerrain {
  kind: 'mud';
  pools: { x: number; y: number; rx: number; ry: number }[];
  /** Fração a menos na velocidade de ataque das criaturas na lama. */
  creatureAttackSlow: number;
  /** Fração a menos na velocidade do herói na lama. */
  heroSlow: number;
}

export type Terrain = MudTerrain;

/** Fase: bioma, inimigos e chefes próprios; as regras de onda (quantidade, escala, elites) são globais. */
export interface StageDef {
  id: StageId;
  number: number;
  name: string;
  description: string;
  biome: Biome;
  color: string;
  /** Multiplicadores de vida e dano dos inimigos em toda a fase (fases seguintes começam mais fortes). */
  power: { hp: number; damage: number };
  /** Multiplicador da Essência ganha na fase. */
  essenceMultiplier: number;
  /** A fase rende Fragmentos de raça (Santuário). */
  fragments: boolean;
  /** Modelo do Nexus "do mapa". */
  nexusModel: NexusModelId;
  composition: WaveEntry[];
  bosses: BossEntry[];
  /** Chefes do Sem Fim, em rodízio. */
  endlessBosses: EnemyId[];
  /** Regra de mapa (opcional). */
  terrain?: Terrain;
  /** Fase que precisa ser vencida para liberar esta (null = aberta desde o início). */
  requires: StageId | null;
}

export const STAGES: Record<StageId, StageDef> = {
  graveyard: {
    id: 'graveyard',
    number: 1,
    name: 'Cemitério',
    description: 'Mortos-vivos, aranhas e gárgulas cercam o Nexus entre lápides e velas.',
    biome: 'graveyard',
    color: '#9a7aff',
    power: { hp: 1, damage: 1 },
    essenceMultiplier: 1,
    fragments: false,
    nexusModel: 'crystal',
    composition: [
      { enemy: 'zombie', fromWave: 1, weight: 10, perWave: -0.3, minWeight: 3 },
      { enemy: 'bat', fromWave: 2, weight: 4, perWave: 0 },
      { enemy: 'skeletonArcher', fromWave: 3, weight: 3, perWave: 0.05 },
      { enemy: 'ogre', fromWave: 4, weight: 2, perWave: 0.04 },
      { enemy: 'slime', fromWave: 5, weight: 3, perWave: 0 },
      { enemy: 'spider', fromWave: 6, weight: 3, perWave: 0 },
      { enemy: 'gargoyle', fromWave: 8, weight: 2.5, perWave: 0 },
      { enemy: 'headless', fromWave: 9, weight: 2, perWave: 0.05 },
      { enemy: 'darkBanshee', fromWave: 11, weight: 1.2, perWave: 0 },
      { enemy: 'necromancer', fromWave: 12, weight: 1, perWave: 0.03 },
    ],
    bosses: [
      { wave: 7, enemy: 'ogreKing' },
      { wave: 14, enemy: 'spiderQueen' },
      { wave: 20, enemy: 'lich' },
    ],
    endlessBosses: ['ogreKing', 'spiderQueen', 'lich'],
    requires: null,
  },
  swamp: {
    id: 'swamp',
    number: 2,
    name: 'Pântano',
    description: 'Lama que prende os pés, sapos que saltam, sanguessugas e a Hidra que não morre fácil.',
    biome: 'swamp',
    color: '#7aba5a',
    power: { hp: 1.15, damage: 1.1 },
    essenceMultiplier: 1.25,
    fragments: true,
    nexusModel: 'lotus',
    composition: [
      { enemy: 'leech', fromWave: 1, weight: 9, perWave: -0.25, minWeight: 3 },
      { enemy: 'toad', fromWave: 1, weight: 6, perWave: -0.1, minWeight: 3 },
      { enemy: 'wisp', fromWave: 3, weight: 2.5, perWave: 0.03 },
      { enemy: 'bogHag', fromWave: 5, weight: 2.2, perWave: 0.02 },
      { enemy: 'crocodile', fromWave: 6, weight: 1.8, perWave: 0.05 },
      { enemy: 'slime', fromWave: 9, weight: 2, perWave: 0 },
    ],
    bosses: [
      { wave: 7, enemy: 'toadKing' },
      { wave: 14, enemy: 'elderCroc' },
      { wave: 20, enemy: 'hydra' },
    ],
    endlessBosses: ['toadKing', 'elderCroc', 'hydra'],
    terrain: {
      kind: 'mud',
      pools: [
        { x: 175, y: 105, rx: 52, ry: 28 },
        { x: 470, y: 100, rx: 50, ry: 27 },
        { x: 165, y: 268, rx: 56, ry: 30 },
        { x: 478, y: 262, rx: 54, ry: 29 },
      ],
      creatureAttackSlow: 0.25,
      heroSlow: 0.4,
    },
    requires: 'graveyard',
  },
};

export const STAGE_IDS = Object.keys(STAGES) as StageId[];
export const FIRST_STAGE: StageId = 'graveyard';
