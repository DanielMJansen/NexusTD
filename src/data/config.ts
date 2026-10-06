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
  /** Inimigos colados no Nexus golpeiam a cada N segundos até morrer (chefes mais devagar). */
  enemyAttackInterval: 2,
  bossAttackInterval: 2.5,
  /** Distância mínima do Nexus para posicionar criaturas. */
  placementClearance: 28,
};

/** Onde o herói começa e quanto pode chegar perto da borda. Atributos de cada herói: data/heroes.ts. */
export const HERO_PLACEMENT = {
  /** Posição inicial: abaixo do Nexus. */
  startOffsetY: 55,
  edgeMargin: 10,
};

export const ECONOMY = {
  startGold: 30,
  passiveIncome: { amount: 1, interval: 2 },
  creatureLimit: 5,
  /** Custo = base × costGrowth^(cópias da classe em campo). */
  costGrowth: 1.5,
  sellRefund: 0.6,
};

/** Escolha de 1 entre N melhorias ao fim de cada onda. */
export const CHOICES = {
  count: 3,
};

/** Loja entre ondas (na tela de escolha após cada onda vencida). */
export const SHOP = {
  /** Sortear de novo as opções: custo = baseCost + costStep × vezes já sorteadas na run. */
  reroll: { baseCost: 10, costStep: 10 },
  /** +1 vaga de criatura: custo = baseCost × costGrowth^(vagas já compradas). */
  extraSlot: { baseCost: 60, costGrowth: 2, max: 3 },
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
