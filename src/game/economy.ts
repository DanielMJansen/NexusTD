import { raceEvolveDiscount } from '../data/races';
import { random } from './random';
import { ECONOMY, NEXUS } from '../data/config';
import { CREATURES, type CreatureId } from '../data/creatures';
import { ASCENDED_LEVEL, EVOLUTION_LEVELS, MAX_CREATURE_LEVEL, SUPREME_PER_RUN } from '../data/evolution';
import { creatureName, hasSupremeForm, isAscended } from './creatureStats';
import { distance, type Creature, type Point, type RunState } from './state';

/** Custo = base × crescimento^(cópias da mesma classe em campo). Vender reduz o custo da próxima. */
export function creatureCost(state: RunState, id: CreatureId): number {
  const copies = state.creatures.filter((c) => c.def.id === id).length;
  return Math.round(CREATURES[id].baseCost * Math.pow(ECONOMY.costGrowth, copies));
}

export function canPlaceCreature(state: RunState, id: CreatureId, at: Point): boolean {
  return (
    state.phase === 'playing' &&
    state.unlocked.has(id) &&
    state.creatures.length < state.creatureLimit &&
    state.gold >= creatureCost(state, id) &&
    distance(at, state.nexus) > NEXUS.placementClearance
  );
}

export function placeCreature(state: RunState, id: CreatureId, at: Point): boolean {
  if (!canPlaceCreature(state, id, at)) return false;
  const cost = creatureCost(state, id);
  state.gold -= cost;
  state.creatures.push({
    def: CREATURES[id],
    x: at.x,
    y: at.y,
    attackTimer: 0,
    hitCount: 0,
    frenzyTimer: 0,
    paid: cost,
    summonCost: cost,
    level: 1,
    branch: 0,
    auraBonus: 0,
    blessDamage: 0,
    blessRange: 0,
    blessCrit: 0,
    protected: false,
    killStacks: 0,
    facing: at.x > state.nexus.x ? -1 : 1,
    lastAttackAt: -Infinity,
    stunTimer: 0,
    sanctuary: state.sanctuary[id] ?? 0,
    awakened: (state.awakened ?? []).includes(id),
    variant: state.variants[id],
    webTimer: 0,
    webSlow: 0,
  });
  state.creaturesPlaced++;
  const race = CREATURES[id].race;
  state.racePlacements[race] = (state.racePlacements[race] ?? 0) + 1;
  state.events.push({ type: 'creaturePlaced', creature: id, x: at.x, y: at.y });
  return true;
}

/**
 * Custo para evoluir ao próximo nível; null se já está no máximo.
 * Proporcional ao que esta cópia custou para invocar (cópias mais caras evoluem mais caro).
 */
export function evolveCost(creature: Creature, discount = 0): number | null {
  const next = EVOLUTION_LEVELS[creature.level];
  // desconto dos talentos e da passiva da raça (Disciplina dos Humanos), multiplicados
  const race = raceEvolveDiscount(creature.def.race);
  return next ? Math.round(creature.summonCost * next.costMultiplier * (1 - discount) * (1 - race)) : null;
}

/**
 * O próximo nível está liberado? A ★5 (Forma Suprema) é só para criaturas despertadas cuja vertente tem forma
 * suprema, e no máximo SUPREME_PER_RUN por run; as outras param em ★4.
 */
export function nextLevelAllowed(state: RunState, creature: Creature): boolean {
  if (creature.level + 1 < MAX_CREATURE_LEVEL) return true;
  if (!creature.awakened || !hasSupremeForm(creature)) return false;
  return state.creatures.filter((c) => c.level >= MAX_CREATURE_LEVEL).length < SUPREME_PER_RUN;
}

export function canEvolve(state: RunState, creature: Creature): boolean {
  const cost = evolveCost(creature, state.talents.evolveDiscount);
  return state.phase === 'playing' && cost !== null && state.gold >= cost && nextLevelAllowed(state, creature);
}

/** O próximo nível é a forma evoluída (exige escolher a vertente)? */
export const needsBranchChoice = (creature: Creature): boolean => creature.level === ASCENDED_LEVEL - 1;

/** Evolui pagando ouro. Ao chegar no nível máximo, `branch` escolhe a vertente (0 ou 1). */
export function evolveCreature(state: RunState, creature: Creature, branch?: number): boolean {
  const cost = evolveCost(creature, state.talents.evolveDiscount);
  if (cost === null || !canEvolve(state, creature)) return false;
  if (needsBranchChoice(creature) && branch === undefined) return false;
  state.gold -= cost;
  creature.paid += cost;
  return promoteCreature(state, creature, branch);
}

/**
 * Sobe a criatura 1 nível sem cobrar (evolução paga ou melhoria Ascensão).
 * Sem vertente indicada ao chegar na forma evoluída, sorteia uma. `upTo`: nível máximo permitido
 * (a Ascensão para na forma evoluída; estrelas só pagando).
 */
export function promoteCreature(state: RunState, creature: Creature, branch?: number, upTo = EVOLUTION_LEVELS.length): boolean {
  if (creature.level >= Math.min(upTo, EVOLUTION_LEVELS.length)) return false;
  if (needsBranchChoice(creature)) creature.branch = branch ?? (random() < 0.5 ? 0 : 1);
  creature.level++;
  creature.hitCount = 0;
  state.ascendedPeak = Math.max(state.ascendedPeak, state.creatures.filter(isAscended).length);
  state.events.push({
    type: 'creatureEvolved',
    creature: creature.def.id,
    x: creature.x,
    y: creature.y,
    level: creature.level,
    ascended: isAscended(creature),
    name: creatureName(creature),
  });
  return true;
}

export const sellValue = (creature: Creature): number => Math.round(creature.paid * ECONOMY.sellRefund);

export function sellCreature(state: RunState, creature: Creature): void {
  const refund = sellValue(creature);
  state.gold += refund;
  state.creatures = state.creatures.filter((c) => c !== creature);
  state.events.push({ type: 'creatureSold', x: creature.x, y: creature.y, refund });
}
