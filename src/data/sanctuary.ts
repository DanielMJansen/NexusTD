// Santuário: nível permanente das criaturas, comprado com Fragmentos da raça (que caem a partir da Fase 2).

export const SANCTUARY = {
  maxLevel: 5,
  /** Custo em Fragmentos da raça para ir ao nível n (índice n − 1). */
  costs: [10, 20, 35, 55, 80],
  /** Bônus por nível. */
  damagePerLevel: 0.04,
  attackSpeedPerLevel: 0.02,
  /** Fragmentos de uma run: ondas vencidas + este valor por chefe derrotado (repartidos entre as raças usadas). */
  perBoss: 4,
} as const;

/** Custo do próximo nível (null no máximo). */
export const sanctuaryCost = (level: number): number | null => SANCTUARY.costs[level] ?? null;
