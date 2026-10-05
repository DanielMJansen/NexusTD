import { ARENA, ECONOMY, NEXUS } from '../data/config';
import { CREATURES, type CreatureId } from '../data/creatures';
import { EVOLUTION_LEVELS } from '../data/evolution';
import { isAscended } from './creatureStats';
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
    distance(at, ARENA.center) > NEXUS.placementClearance
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
    level: 1,
    facing: at.x > ARENA.center.x ? -1 : 1,
    lastAttackAt: -Infinity,
  });
  state.events.push({ type: 'creaturePlaced', creature: id, x: at.x, y: at.y });
  return true;
}

/** Custo para evoluir ao próximo nível; null se já está no máximo. */
export function evolveCost(creature: Creature, discount = 0): number | null {
  const next = EVOLUTION_LEVELS[creature.level];
  return next ? Math.round(creature.def.baseCost * next.costMultiplier * (1 - discount)) : null;
}

export function canEvolve(state: RunState, creature: Creature): boolean {
  const cost = evolveCost(creature, state.talents.evolveDiscount);
  return state.phase === 'playing' && cost !== null && state.gold >= cost;
}

export function evolveCreature(state: RunState, creature: Creature): boolean {
  const cost = evolveCost(creature, state.talents.evolveDiscount);
  if (cost === null || !canEvolve(state, creature)) return false;
  state.gold -= cost;
  creature.paid += cost;
  creature.level++;
  creature.hitCount = 0;
  state.events.push({
    type: 'creatureEvolved',
    creature: creature.def.id,
    x: creature.x,
    y: creature.y,
    level: creature.level,
    ascended: isAscended(creature),
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
