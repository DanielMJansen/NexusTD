import { ARENA, ECONOMY, HERO_PLACEMENT, NEXUS } from '../data/config';
import { HEROES, type HeroDef, type HeroId, type RaceBonus } from '../data/heroes';
import type { CreatureDef, CreatureId } from '../data/creatures';
import type { EnemyDef, EnemyId } from '../data/enemies';
import type { RunUpgradeDef } from '../data/upgrades';
import type { TalentBonuses } from './talents';
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
  def: HeroDef;
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
  /** Bônus do herói para criaturas da raça dele. */
  raceBonus: { race: string; bonus: RaceBonus };
}

export type Choice = { kind: 'upgrade'; upgrade: RunUpgradeDef };

export interface RunResult {
  victory: boolean;
  wave: number;
  kills: number;
  essence: number;
}

export type Phase = 'playing' | 'choosing' | 'ended';

/** O que vem de fora da run: progresso permanente do jogador. */
export interface RunSetup {
  /** Soma dos talentos comprados. */
  talents: TalentBonuses;
  /** Equipe da run: criaturas disponíveis, na ordem dos atalhos 1–6. */
  team: readonly CreatureId[];
  hero: HeroId;
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
  /** Equipe da run, na ordem dos atalhos. */
  team: CreatureId[];
  unlocked: Set<CreatureId>;
  modifiers: Modifiers;
  pulse: { cooldown: number; remaining: number; radius: number };
  /** Bônus dos talentos que valem a run inteira. */
  talents: TalentBonuses;
  /** Égide rúnica: o próximo golpe no Nexus nesta onda é anulado. */
  wardReady: boolean;
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
  const t = setup.talents;
  const maxHp = NEXUS.baseHp + t.nexusMaxHp;
  const heroDef = HEROES[setup.hero];
  const heroStart = { x: ARENA.center.x, y: ARENA.center.y + HERO_PLACEMENT.startOffsetY };
  return {
    phase: 'playing',
    wave: 0,
    time: 0,
    nexus: { hp: maxHp, maxHp },
    gold: ECONOMY.startGold + t.startGold,
    kills: 0,
    hero: { ...heroStart, def: heroDef, target: { ...heroStart }, attackTimer: 0, facing: 1, lastAttackAt: -Infinity, moving: false },
    enemies: [],
    creatures: [],
    team: [...setup.team],
    unlocked: new Set(setup.team),
    modifiers: {
      damage: 1 + t.damage,
      range: 1 + t.range,
      attackSpeed: 1 + t.attackSpeed,
      raceBonus: { race: heroDef.race, bonus: heroDef.raceBonus },
    },
    pulse: {
      cooldown: heroDef.pulse.cooldown * (1 - t.pulseCooldown),
      remaining: 0,
      radius: heroDef.pulse.radius * (1 + t.pulseRadius),
    },
    talents: { ...t },
    wardReady: false,
    spawnQueue: [],
    spawnTimer: 0,
    incomeTimer: 0,
    choices: [],
    choiceReason: 'start',
    creatureLimit: ECONOMY.creatureLimit + t.creatureSlots,
    rerolls: 0,
    extraSlots: 0,
    result: null,
    events: [],
  };
}

export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
