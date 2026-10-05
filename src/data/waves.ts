import type { EnemyId } from './enemies';

export interface WaveRules {
  total: number;
  /** Quantidade = base + perWave × onda. */
  enemyCount: { base: number; perWave: number };
  /** Intervalo entre spawns = max(min, base + perWave × onda), em segundos. */
  spawnInterval: { base: number; perWave: number; min: number };
  /** Vida do inimigo × (1 + hpGrowthPerWave × onda). */
  hpGrowthPerWave: number;
  /**
   * Sorteio de cada inimigo: percorre a lista em ordem e usa a primeira entrada
   * já liberada na onda cujo `rollBelow` seja maior que o número sorteado (0–1).
   */
  composition: { enemy: EnemyId; fromWave: number; rollBelow: number }[];
  fallbackEnemy: EnemyId;
  /** Inimigos extras adicionados ao fim da fila de uma onda. */
  bosses: { wave: number; enemy: EnemyId }[];
  /** Distância além da borda da tela em que os inimigos surgem. */
  spawnMargin: number;
}

export const WAVES: WaveRules = {
  total: 10,
  enemyCount: { base: 4, perWave: 3 },
  spawnInterval: { base: 1.2, perWave: -0.07, min: 0.35 },
  hpGrowthPerWave: 0.12,
  composition: [
    { enemy: 'ogre', fromWave: 4, rollBelow: 0.15 },
    { enemy: 'bat', fromWave: 2, rollBelow: 0.4 },
  ],
  fallbackEnemy: 'zombie',
  bosses: [{ wave: 10, enemy: 'ogreKing' }],
  spawnMargin: 24,
};
