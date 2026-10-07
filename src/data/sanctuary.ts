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
  /** Despertar: depois do nível máximo, por Fragmentos da raça + Cristais Ancestrais. */
  awakenCost: 100,
  awakenCrystals: 8,
  /** Cristais Ancestrais: 1 por vitória numa fase com Fragmentos (Fase 2+) e 1 a cada N ondas do Sem Fim. */
  crystalsPerVictory: 1,
  crystalEveryEndlessWaves: 10,
  /** Bônus da criatura despertada em toda run (dano e velocidade de ataque). */
  awakenBonus: 0.1,
} as const;

/** Custo do próximo nível (null no máximo). */
export const sanctuaryCost = (level: number): number | null => SANCTUARY.costs[level] ?? null;
