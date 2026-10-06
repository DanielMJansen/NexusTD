import type { EnemyId } from './enemies';

/**
 * Inimigo no sorteio da onda: liberado a partir de `fromWave`, pesa
 * max(minWeight, weight + perWave × (onda − fromWave)).
 */
export interface WaveEntry {
  enemy: EnemyId;
  fromWave: number;
  weight: number;
  perWave: number;
  minWeight?: number;
  /** Entradas por onde este inimigo pode vir (padrão: qualquer uma). */
  entrances?: number[];
}

/** Chefe adicionado ao fim da fila da onda. */
export interface BossEntry {
  wave: number;
  enemy: EnemyId;
}

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
  /**
   * Modo Sem Fim: depois da última onda, um chefe a cada `bossEvery` ondas, em rodízio (chefes da fase),
   * e escalada extra por onda além da última: vida e dano × (1 + growth)^(ondas extras); elites mais comuns.
   */
  endless: { bossEvery: number; hpGrowth: number; damageGrowth: number; eliteChance: number };
  /** Distância além da borda da tela em que os inimigos surgem. */
  spawnMargin: number;
}

export const WAVES: WaveRules = {
  total: 20,
  enemyCount: { base: 4, perWave: 3 },
  spawnInterval: { base: 1.2, perWave: -0.05, min: 0.3 },
  scaling: {
    hp: { linear: 0.18, quadratic: 0.023 },
    speedPerWave: 0.02,
    maxSpeedBonus: 0.4,
    damagePerWave: 0.06,
  },
  elites: { fromWave: 8, chance: 0.05, chancePerWave: 0.01, maxChance: 0.25, hp: 2.5, damage: 1.5, reward: 2, scale: 1.15 },
  endless: { bossEvery: 5, hpGrowth: 0.08, damageGrowth: 0.05, eliteChance: 0.35 },
  spawnMargin: 24,
};
