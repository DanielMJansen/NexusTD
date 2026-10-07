import { STAGES } from '../data/stages';
import { distance, type Enemy, type Point, type RunState } from './state';

// Objetivos: o que os inimigos atacam (Nexus ou pontos extras) e a escolta (Nexus que muda de parada).

export type DefendTarget = { kind: 'nexus'; at: Point } | { kind: 'guard'; index: number; at: Point };

/** Alvo mais próximo a defender: o Nexus ou um ponto extra ainda de pé. */
export function defendTarget(state: RunState, from: Point, weakest = false): DefendTarget {
  let best: DefendTarget = { kind: 'nexus', at: state.nexus };
  if (weakest) {
    // Djinn: o ponto com a menor fração de vida
    let low = state.nexus.hp / state.nexus.maxHp;
    state.guards.forEach((g, index) => {
      if (g.hp <= 0 || g.hp / g.maxHp >= low) return;
      low = g.hp / g.maxHp;
      best = { kind: 'guard', index, at: g };
    });
    return best;
  }
  let bestDistance = distance(from, state.nexus);
  state.guards.forEach((g, index) => {
    if (g.hp <= 0) return;
    const d = distance(from, g);
    if (d < bestDistance) {
      bestDistance = d;
      best = { kind: 'guard', index, at: g };
    }
  });
  return best;
}

/** Golpe num ponto extra; ao cair, avisa (a derrota é checada no fim do quadro). */
export function damageGuard(state: RunState, index: number, amount: number): void {
  const g = state.guards[index];
  if (!g || g.hp <= 0) return;
  g.hp = Math.max(0, g.hp - amount);
  g.lastHitAt = state.time;
  state.events.push({ type: 'guardHit', x: g.x, y: g.y, damage: Math.round(amount) });
  if (g.hp <= 0) state.events.push({ type: 'guardDestroyed', name: g.name, x: g.x, y: g.y });
}

/**
 * Segundos Nexus (pontos gêmeos, Deserto) acompanham a vida do Nexus principal:
 * `grow` soma à vida máxima (e à atual); `heal` cura; `fill` enche.
 */
export function syncTwins(state: RunState, change: { grow?: number; heal?: number; fill?: boolean }): void {
  for (const g of state.guards) {
    if (!g.twin || g.hp <= 0) continue;
    if (change.grow) {
      g.maxHp += change.grow;
      g.hp += change.grow;
    }
    if (change.heal) g.hp = Math.min(g.maxHp, g.hp + change.heal);
    if (change.fill) g.hp = g.maxHp;
  }
}

/** Um ponto vital caiu? */
export const vitalGuardLost = (state: RunState): boolean => state.guards.some((g) => g.vital && g.hp <= 0);

/** Escolta: no começo da onda, se mudou de parada, o Nexus (com criaturas, herói e loot) avança. */
export function advanceEscort(state: RunState, enemyFree = true): void {
  const rule = STAGES[state.stage].escort;
  if (!rule || !enemyFree) return;
  const stop = Math.min(rule.stops.length - 1, Math.floor((state.wave - 1) / rule.wavesPerStop));
  if (stop === state.escortStop) return;
  const to = rule.stops[stop]!;
  const from = { x: state.nexus.x, y: state.nexus.y };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  state.nexus.x = to.x;
  state.nexus.y = to.y;
  for (const c of state.creatures) {
    c.x += dx;
    c.y += dy;
  }
  state.hero.x += dx;
  state.hero.y += dy;
  state.hero.target = { x: state.hero.x, y: state.hero.y };
  for (const item of state.loot) {
    item.x += dx;
    item.y += dy;
  }
  state.escortStop = stop;
  state.events.push({ type: 'caravanMoved', from, to });
}

/** Inimigo com alvo mais próximo que o Nexus (usado por quem já saiu da trilha). */
/** Djinn (teleporte): vai atrás do ponto mais ferido, não do mais perto. */
export const seeksWeakest = (enemy: Enemy): boolean => enemy.def.traits.some((t) => t.kind === 'blink');

export const enemyDefendPoint = (state: RunState, enemy: Enemy): Point => defendTarget(state, enemy, seeksWeakest(enemy)).at;
