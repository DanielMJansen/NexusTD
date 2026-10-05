import { ARENA, ECONOMY, HERO, NEXUS, PULSE } from '../data/config';
import type { CreatureDef, CreatureId } from '../data/creatures';
import type { EnemyDef, EnemyId } from '../data/enemies';
import { META_UPGRADES, type MetaUpgradeId, type RunUpgradeDef } from '../data/upgrades';
import type { GameEvent } from './events';

export interface Point {
  x: number;
  y: number;
}

export interface Enemy extends Point {
  def: EnemyDef;
  hp: number;
  maxHp: number;
  slowTimer: number;
  slowMultiplier: number;
  /** Defasagem aleatória da animação e do zigue-zague. */
  animationOffset: number;
  /** Momento (state.time) do último golpe sofrido; só para o visual. */
  lastHitAt: number;
  /** Segurado por um Guarda neste quadro (não anda). */
  held: boolean;
  dead: boolean;
}

export interface Creature extends Point {
  def: CreatureDef;
  attackTimer: number;
  /** Golpes acumulados para o frenesi. */
  hitCount: number;
  frenzyTimer: number;
  /** Ouro pago (invocação + evoluções), base do valor de venda. */
  paid: number;
  /** Nível de evolução, de 1 até MAX_CREATURE_LEVEL. */
  level: number;
  /** Dicas visuais: lado para onde olha (1 direita, -1 esquerda) e momento do último ataque. */
  facing: 1 | -1;
  lastAttackAt: number;
}

export interface Hero extends Point {
  target: Point;
  attackTimer: number;
  /** Dicas visuais, como nas criaturas. */
  facing: 1 | -1;
  lastAttackAt: number;
  moving: boolean;
}

/** Multiplicadores vindos das melhorias (permanentes e da run). */
export interface Modifiers {
  damage: number;
  range: number;
  attackSpeed: number;
}

export type Choice = { kind: 'upgrade'; upgrade: RunUpgradeDef } | { kind: 'egg'; creature: CreatureId };

export interface RunResult {
  victory: boolean;
  wave: number;
  kills: number;
  essence: number;
}

export type Phase = 'playing' | 'choosing' | 'ended';

/** O que vem de fora da run: progresso permanente do jogador. */
export interface RunSetup {
  metaLevels: Record<MetaUpgradeId, number>;
  unlockedCreatures: readonly CreatureId[];
}

export interface RunState {
  phase: Phase;
  wave: number;
  /** Tempo de jogo em segundos (para durante a pausa). */
  time: number;
  nexus: { hp: number; maxHp: number };
  gold: number;
  kills: number;
  hero: Hero;
  enemies: Enemy[];
  creatures: Creature[];
  unlocked: Set<CreatureId>;
  modifiers: Modifiers;
  pulse: { cooldown: number; remaining: number };
  spawnQueue: EnemyId[];
  spawnTimer: number;
  incomeTimer: number;
  choices: Choice[];
  /** Por que as opções foram oferecidas (a loja só abre após uma onda). */
  choiceReason: 'start' | 'waveCleared';
  /** Limite de criaturas em campo (aumenta com vagas compradas na loja). */
  creatureLimit: number;
  /** Compras na loja nesta run (encarecem a próxima). */
  rerolls: number;
  extraSlots: number;
  result: RunResult | null;
  /** Fila de eventos do quadro; quem consome esvazia. */
  events: GameEvent[];
}

export function createRun(setup: RunSetup): RunState {
  const levels = setup.metaLevels;
  const maxHp = NEXUS.baseHp + META_UPGRADES.nexusHp.perLevel * levels.nexusHp;
  const heroStart = { x: ARENA.center.x, y: ARENA.center.y + HERO.startOffsetY };
  return {
    phase: 'playing',
    wave: 0,
    time: 0,
    nexus: { hp: maxHp, maxHp },
    gold: ECONOMY.startGold + META_UPGRADES.startGold.perLevel * levels.startGold,
    kills: 0,
    hero: { ...heroStart, target: { ...heroStart }, attackTimer: 0, facing: 1, lastAttackAt: -Infinity, moving: false },
    enemies: [],
    creatures: [],
    unlocked: new Set(setup.unlockedCreatures),
    modifiers: { damage: 1 + META_UPGRADES.damage.perLevel * levels.damage, range: 1, attackSpeed: 1 },
    pulse: { cooldown: PULSE.cooldown, remaining: 0 },
    spawnQueue: [],
    spawnTimer: 0,
    incomeTimer: 0,
    choices: [],
    choiceReason: 'start',
    creatureLimit: ECONOMY.creatureLimit,
    rerolls: 0,
    extraSlots: 0,
    result: null,
    events: [],
  };
}

export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
