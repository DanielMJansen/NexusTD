// Regras gerais e números soltos. Valores de referência: GDD seção 9.

export const GAME_TITLE = 'NEXUS';

export const ARENA = {
  width: 360,
  height: 480,
  center: { x: 180, y: 240 },
};

export const NEXUS = {
  baseHp: 100,
  healBetweenWaves: 10,
  /** Distância em que um inimigo atinge o Nexus. */
  contactRadius: 16,
  /** Distância mínima do Nexus para posicionar criaturas. */
  placementClearance: 28,
};

export const HERO = {
  speed: 115,
  damage: 10,
  range: 60,
  cooldown: 0.5,
  /** Posição inicial: abaixo do Nexus. */
  startOffsetY: 55,
  edgeMargin: 10,
};

export const PULSE = {
  damage: 35,
  radius: 95,
  cooldown: 12,
};

export const ECONOMY = {
  startGold: 30,
  passiveIncome: { amount: 1, interval: 2 },
  creatureLimit: 5,
  /** Custo = base × costGrowth^(cópias da classe em campo). */
  costGrowth: 1.5,
  sellRefund: 0.6,
};

export const BETWEEN_WAVES = {
  choices: 3,
};

/** Essência = 3 × onda + 1 a cada 5 abates + 30 se vencer. */
export const REWARDS = {
  essencePerWave: 3,
  killsPerEssence: 5,
  victoryBonus: 30,
};

export const SIMULATION = {
  /** Limite do passo de tempo, evita saltos ao voltar de outra aba. */
  maxFrameTime: 0.05,
};
