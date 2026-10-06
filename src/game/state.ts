import { ARENA, ECONOMY, HERO_PLACEMENT, NEXUS } from '../data/config';
import { HEROES, type HeroDef, type HeroId, type RaceBonus } from '../data/heroes';
import type { CreatureDef, CreatureId } from '../data/creatures';
import type { EnemyDef, EnemyId } from '../data/enemies';
import type { OfferedUpgrade } from '../data/upgrades';
import type { SkinPalette } from '../data/skins';
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
  /** Veneno: dano por segundo enquanto o tempo durar. */
  poisonTimer: number;
  poisonDps: number;
  /** Com medo: anda para longe do Nexus enquanto o tempo durar. */
  fearTimer: number;
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
  /** Bônus de velocidade de ataque recebido de auras neste quadro. */
  auraBonus: number;
  /** Dicas visuais: lado para onde olha (1 direita, -1 esquerda) e momento do último ataque. */
  facing: 1 | -1;
  lastAttackAt: number;
}

export interface Hero extends Point {
  def: HeroDef;
  /** Cores da skin escolhida (só visual). */
  palette: SkinPalette;
  target: Point;
  attackTimer: number;
  /** Dicas visuais, como nas criaturas. */
  facing: 1 | -1;
  lastAttackAt: number;
  moving: boolean;
}

/** Poça no chão que causa dano por segundo a quem estiver dentro. */
export interface Pool extends Point {
  radius: number;
  remaining: number;
  duration: number;
  dps: number;
  color: string;
}

/** Multiplicadores vindos das melhorias (permanentes e da run). */
export interface Modifiers {
  damage: number;
  range: number;
  attackSpeed: number;
  /** Bônus do herói para criaturas da raça dele. */
  raceBonus: { race: string; bonus: RaceBonus };
  /** Chance de crítico (dano ×2) de criaturas e herói. */
  critChance: number;
  /** Dano extra por raça (melhorias de sinergia), somado ao bônus do herói. */
  raceDamage: Record<string, number>;
  /** Inimigos comuns abaixo desta fração de vida morrem na hora (0 = inativo). */
  executeBelow: number;
}

export type Choice = { kind: 'upgrade'; upgrade: OfferedUpgrade };

export interface RunResult {
  victory: boolean;
  wave: number;
  kills: number;
  essence: number;
  hero: HeroId;
  /** Menor fração de vida do Nexus durante a run (conquistas). */
  lowestNexusRatio: number;
  /** Maior número de criaturas na forma evoluída ao mesmo tempo (conquistas). */
  ascendedPeak: number;
}

export type Phase = 'playing' | 'choosing' | 'ended';

/** O que vem de fora da run: progresso permanente do jogador. */
export interface RunSetup {
  /** Soma dos talentos comprados. */
  talents: TalentBonuses;
  /** Equipe da run: criaturas disponíveis, na ordem dos atalhos 1–6. */
  team: readonly CreatureId[];
  hero: HeroId;
  /** Cores da skin do herói (só visual). */
  heroPalette: SkinPalette;
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
  /** Poças de dano no chão (Caldeirão). */
  pools: Pool[];
  /** Égide rúnica: o próximo golpe no Nexus nesta onda é anulado. */
  wardReady: boolean;
  /** Estatísticas da run para conquistas. */
  lowestNexusRatio: number;
  ascendedPeak: number;
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
  /** Quantas vezes cada melhoria foi escolhida nesta run. */
  upgradePicks: Record<string, number>;
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
    hero: { ...heroStart, def: heroDef, palette: { ...setup.heroPalette }, target: { ...heroStart }, attackTimer: 0, facing: 1, lastAttackAt: -Infinity, moving: false },
    enemies: [],
    creatures: [],
    team: [...setup.team],
    unlocked: new Set(setup.team),
    modifiers: {
      damage: 1 + t.damage,
      range: 1 + t.range,
      attackSpeed: 1 + t.attackSpeed,
      raceBonus: { race: heroDef.race, bonus: heroDef.raceBonus },
      critChance: 0,
      raceDamage: {},
      executeBelow: 0,
    },
    pulse: {
      cooldown: heroDef.pulse.cooldown * Math.max(0.35, 1 - t.pulseCooldown),
      remaining: 0,
      radius: heroDef.pulse.radius * (1 + t.pulseRadius),
    },
    talents: { ...t },
    pools: [],
    wardReady: false,
    lowestNexusRatio: 1,
    ascendedPeak: 0,
    spawnQueue: [],
    spawnTimer: 0,
    incomeTimer: 0,
    choices: [],
    choiceReason: 'start',
    creatureLimit: ECONOMY.creatureLimit + t.creatureSlots,
    rerolls: 0,
    extraSlots: 0,
    upgradePicks: {},
    result: null,
    events: [],
  };
}

export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
