// Regras gerais e nÃºmeros soltos. Valores de referÃªncia: GDD seÃ§Ã£o 9.
import type { CreatureId } from './creatures';

export const GAME_TITLE = 'NEXUS TD';
/** VersÃ£o mostrada no menu e em ConfiguraÃ§Ãµes â†’ Sobre (1.0 = lanÃ§amento). */
export const GAME_VERSION = '1.0.1';

/** Mundo do jogo em unidades lÃ³gicas (16:9); o canvas escala para a tela. */
export const ARENA = {
  width: 640,
  height: 360,
  center: { x: 320, y: 180 },
};

/**
 * Primeiro companheiro (grÃ¡tis, escolha Ãºnica): uma criatura mÃ­stica por papel â€” alvo Ãºnico, Ã¡rea e
 * suporte. Bot no CemitÃ©rio sem talentos, com o Arqueiro (que todos jÃ¡ tÃªm) + a escolhida: Alfa 27/30,
 * Fogo 26/30, Duelista 20/30; sÃ³ o Arqueiro: 12/30 (13/10/2026).
 */
export const STARTER_CHOICES = ['duelist', 'fireDragon', 'alpha'] as const satisfies readonly CreatureId[];

export const NEXUS = {
  baseHp: 100,
  healBetweenWaves: 10,
  /** DistÃ¢ncia em que um inimigo atinge o Nexus. */
  contactRadius: 16,
  /** Inimigos colados no Nexus golpeiam a cada N segundos atÃ© morrer (chefes mais devagar). */
  enemyAttackInterval: 2,
  bossAttackInterval: 2.5,
  /** DistÃ¢ncia mÃ­nima do Nexus para posicionar criaturas. */
  placementClearance: 28,
};

/** Onde o herÃ³i comeÃ§a e quanto pode chegar perto da borda. Atributos de cada herÃ³i: data/heroes.ts. */
export const HERO_PLACEMENT = {
  /** PosiÃ§Ã£o inicial: abaixo do Nexus. */
  startOffsetY: 55,
  edgeMargin: 10,
};

export const ECONOMY = {
  startGold: 30,
  passiveIncome: { amount: 1, interval: 2 },
  creatureLimit: 5,
  /** Custo = base Ã— costGrowth^(cÃ³pias da classe em campo). */
  costGrowth: 1.5,
  sellRefund: 0.6,
};

/** Escolha de 1 entre N melhorias ao fim de cada onda. */
export const CHOICES = {
  count: 3,
};

/** Loja entre ondas (na tela de escolha apÃ³s cada onda vencida). */
export const SHOP = {
  /** Sortear de novo as opÃ§Ãµes: custo = baseCost + costStep Ã— vezes jÃ¡ sorteadas na run. */
  reroll: { baseCost: 10, costStep: 10 },
  /** +1 vaga de criatura: custo = baseCost Ã— costGrowth^(vagas jÃ¡ compradas). */
  extraSlot: { baseCost: 60, costGrowth: 2, max: 3 },
};

/** EssÃªncia = 3 Ã— onda + 1 a cada 5 abates + 30 se vencer. */
/** Objetos do mapa: distÃ¢ncia para o herÃ³i ativar e tempo parado perto para ativar. */
export const INTERACT = {
  reach: 24,
  time: 2,
};

/** Equipes salvas: grÃ¡tis, mÃ¡ximo e preÃ§o de cada vaga extra (EssÃªncia). */
export const LOADOUTS = {
  free: 3,
  max: 5,
  slotCost: 300,
  nameLength: 24,
};

export const REWARDS = {
  essencePerWave: 3,
  killsPerEssence: 5,
  victoryBonus: 30,
};

export const SIMULATION = {
  /** Limite do passo de tempo, evita saltos ao voltar de outra aba. */
  maxFrameTime: 0.05,
};
