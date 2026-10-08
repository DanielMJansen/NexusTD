// Ascensão: níveis de dificuldade por fase (liberada ao vencer a Cidadela). Vencer uma fase num nível libera o próximo.
import type { StageId } from './stages';

export interface AscensionLevel {
  /** Multiplicador da vida dos inimigos. */
  enemyHp: number;
  /** Multiplicador da velocidade dos inimigos. */
  enemySpeed: number;
  /** Multiplicador da chance de elite. */
  eliteChance: number;
  /** Multiplicador extra da vida dos chefes. */
  bossHp: number;
  /** Fração da vida máxima com que o Nexus começa. */
  nexusStart: number;
  /** Texto curto do que o nível acrescenta. */
  text: string;
}

export const ASCENSION = {
  /** Fase cuja vitória libera a Ascensão. */
  unlockStage: 'citadel' as StageId,
  /** Essência extra por nível (somada ao multiplicador da fase). */
  essencePerLevel: 0.25,
  /** Nível 0 = normal; os demais são cumulativos. */
  levels: [
    { enemyHp: 1, enemySpeed: 1, eliteChance: 1, bossHp: 1, nexusStart: 1, text: 'Normal.' },
    { enemyHp: 1.2, enemySpeed: 1, eliteChance: 1, bossHp: 1, nexusStart: 1, text: 'Inimigos com +20% de vida.' },
    { enemyHp: 1.2, enemySpeed: 1.1, eliteChance: 2, bossHp: 1, nexusStart: 1, text: '+ elites com o dobro da frequência e inimigos 10% mais rápidos.' },
    { enemyHp: 1.2, enemySpeed: 1.1, eliteChance: 2, bossHp: 1.3, nexusStart: 0.75, text: '+ chefes com +30% de vida e o Nexus começa com 75% da vida.' },
  ] as AscensionLevel[],
};

export const MAX_ASCENSION = ASCENSION.levels.length - 1;
