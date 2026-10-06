import { STAGES } from '../data/stages';
import { distance, type Enemy, type Point, type RunState } from './state';

/** Distância para considerar um ponto da trilha alcançado. */
const REACHED = 8;

/** Entradas da fase atual (vazio = bordas em 360°). */
export const entrances = (state: RunState) => STAGES[state.stage].entrances ?? [];

/**
 * Para onde o inimigo anda agora: o próximo ponto da trilha (terrestres) ou o Nexus.
 * Avança o ponto quando ele é alcançado.
 */
export function enemyGoal(state: RunState, enemy: Enemy): Point {
  if (enemy.path === undefined || enemy.def.flying) return state.nexus;
  const path = entrances(state)[enemy.path]?.path;
  if (!path) return state.nexus;
  let i = enemy.waypoint ?? 1;
  while (i < path.length && distance(enemy, path[i]!) < REACHED) i++;
  enemy.waypoint = i;
  return i < path.length ? path[i]! : state.nexus;
}

/** Coloca na trilha mais próxima de um ponto (invocados, divisões, quem foi empurrado para longe). */
export function joinNearestPath(state: RunState, enemy: Enemy): void {
  let best = Infinity;
  entrances(state).forEach((entrance, p) => {
    entrance.path.forEach((point, i) => {
      const d = distance(point, enemy);
      if (d < best) {
        best = d;
        enemy.path = p;
        // segue para o ponto seguinte ao mais próximo
        enemy.waypoint = Math.min(i + 1, entrance.path.length);
      }
    });
  });
}
