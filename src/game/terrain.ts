import { STAGES } from '../data/stages';
import type { Point, RunState } from './state';

/** O ponto está dentro de uma poça de lama da fase? */
export function inMud(state: RunState, p: Point): boolean {
  const terrain = STAGES[state.stage].terrain;
  if (terrain?.kind !== 'mud') return false;
  return terrain.pools.some((pool) => ((p.x - pool.x) / pool.rx) ** 2 + ((p.y - pool.y) / pool.ry) ** 2 <= 1);
}

/** Multiplicador da velocidade de ataque de uma criatura parada nesse ponto. */
export function terrainAttackFactor(state: RunState, p: Point): number {
  const terrain = STAGES[state.stage].terrain;
  return terrain?.kind === 'mud' && inMud(state, p) ? 1 - terrain.creatureAttackSlow : 1;
}

/** Multiplicador da velocidade do herói nesse ponto. */
export function terrainHeroFactor(state: RunState, p: Point): number {
  const terrain = STAGES[state.stage].terrain;
  return terrain?.kind === 'mud' && inMud(state, p) ? 1 - terrain.heroSlow : 1;
}
