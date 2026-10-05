// Regras gerais e números soltos. Valores de referência: GDD seção 9.

export const GAME_TITLE = 'NEXUS';

/** Mundo do jogo em unidades lógicas (16:9); o canvas escala para a tela. */
export const ARENA = {
  width: 640,
  height: 360,
  center: { x: 320, y: 180 },
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

/** Escolhas de 1 entre N (ovos e melhorias). */
export const CHOICES = {
  count: 3,
  /** A run começa com a escolha de um ovo de criatura mística. */
  startingEgg: true,
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
