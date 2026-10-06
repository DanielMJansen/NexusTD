import type { EnemyId } from './enemies';

export interface WaveRules {
  total: number;
  /** Quantidade = base + perWave × onda. */
  enemyCount: { base: number; perWave: number };
  /** Intervalo entre spawns = max(min, base + perWave × onda), em segundos. */
  spawnInterval: { base: number; perWave: number; min: number };
  /** Força dos inimigos por onda `o` (a partir de 0 na onda 1). */
  scaling: {
    /** Vida × (1 + linear·o + quadratic·o²). */
    hp: { linear: number; quadratic: number };
    /** Velocidade × (1 + speedPerWave·o), até maxSpeedBonus. */
    speedPerWave: number;
    maxSpeedBonus: number;
    /** Dano ao Nexus e ao herói × (1 + damagePerWave·o). */
    damagePerWave: number;
  };
  /**
   * Sorteio ponderado: cada entrada liberada na onda pesa
   * max(minWeight, weight + perWave × (onda − fromWave)).
   */
  composition: { enemy: EnemyId; fromWave: number; weight: number; perWave: number; minWeight?: number }[];
  /** Chefes adicionados ao fim da fila da onda. */
  bosses: { wave: number; enemy: EnemyId }[];
  /** Elites: chance = min(maxChance, chance + chancePerWave × (onda − fromWave)). */
  elites: {
    fromWave: number;
    chance: number;
    chancePerWave: number;
    maxChance: number;
    hp: number;
    damage: number;
    /** Multiplicador de ouro e XP. */
    reward: number;
    scale: number;
  };
  /** Modo Sem Fim: depois da última onda, um chefe a cada `bossEvery` ondas, em rodízio. */
  endless: { bossEvery: number; bosses: EnemyId[] };
  /** Distância além da borda da tela em que os inimigos surgem. */
  spawnMargin: number;
}

export const WAVES: WaveRules = {
  total: 20,
  enemyCount: { base: 4, perWave: 2.5 },
  spawnInterval: { base: 1.2, perWave: -0.05, min: 0.3 },
  scaling: {
    hp: { linear: 0.15, quadratic: 0.013 },
    speedPerWave: 0.02,
    maxSpeedBonus: 0.4,
    damagePerWave: 0.05,
  },
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
  elites: { fromWave: 8, chance: 0.05, chancePerWave: 0.01, maxChance: 0.2, hp: 2.5, damage: 1.5, reward: 2, scale: 1.15 },
  endless: { bossEvery: 5, bosses: ['ogreKing', 'spiderQueen', 'lich'] },
  spawnMargin: 24,
};
