import type { EnemyId } from './enemies';
import type { BossEntry, WaveEntry } from './waves';

export type StageId = 'graveyard';
/** Cenário desenhado na arena. */
export type Biome = 'graveyard';

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
  composition: WaveEntry[];
  bosses: BossEntry[];
  /** Chefes do Sem Fim, em rodízio. */
  endlessBosses: EnemyId[];
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
};

export const STAGE_IDS = Object.keys(STAGES) as StageId[];
export const FIRST_STAGE: StageId = 'graveyard';
