import { INTERACT } from '../data/config';
import { STAGES } from '../data/stages';
import { distance, type Creature, type RunState } from './state';

// Mapa vivo: clima periódico (com aviso) e objetos que o herói ativa ficando perto.

/** Liga o clima (nevasca apaga as fogueiras). forced: dura até o fim da onda. */
export function startWeather(state: RunState, forced: boolean): void {
  const rule = STAGES[state.stage].weather;
  if (!rule) return;
  state.weather = { active: true, timer: rule.duration, warned: false, forced };
  if (rule.kind === 'blizzard') for (const o of state.interactables) if (o.kind === 'brazier') o.lit = false;
  state.events.push({ type: 'weatherStarted', kind: rule.kind, forced });
}

export function endWeather(state: RunState): void {
  const rule = STAGES[state.stage].weather;
  if (!rule || !state.weather.active) return;
  state.weather = { active: false, timer: rule.every, warned: false, forced: false };
  state.events.push({ type: 'weatherEnded', kind: rule.kind });
}

/** Ponto ao longo da trilha (0 = começo, 1 = fim). */
function pointOnPath(path: { x: number; y: number }[], t: number): { x: number; y: number } {
  const lengths = path.slice(1).map((p, i) => Math.hypot(p.x - path[i]!.x, p.y - path[i]!.y));
  let d = lengths.reduce((a, b) => a + b, 0) * Math.max(0, Math.min(1, t));
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i]!) {
      const f = d / (lengths[i]! || 1);
      return { x: path[i]!.x + (path[i + 1]!.x - path[i]!.x) * f, y: path[i]!.y + (path[i + 1]!.y - path[i]!.y) * f };
    }
    d -= lengths[i]!;
  }
  return path[path.length - 1]!;
}

/** Posição atual da avalanche (null antes de descer ou sem avalanche). */
export function avalanchePosition(state: RunState): { x: number; y: number } | null {
  const a = state.avalanche;
  if (!a || a.t < a.delay) return null;
  const path = STAGES[state.stage].entrances?.[a.entrance]?.path;
  return path ? pointOnPath(path, (a.t - a.delay) / a.duration) : null;
}

/** Avalanche: desce pela trilha esmagando inimigos comuns e congelando criaturas no caminho. */
function updateAvalanche(state: RunState, dt: number, crush: (index: number) => void): void {
  const a = state.avalanche;
  if (!a) return;
  a.t += dt;
  const at = avalanchePosition(state);
  if (at) {
    state.enemies.forEach((e, i) => {
      if (!e.dead && e.allyTimer <= 0 && !e.def.isBoss && !e.def.flying && distance(e, at) <= a.width) crush(i);
    });
    for (const c of state.creatures) {
      if (distance(c, at) <= a.width) {
        c.stunTimer = Math.max(c.stunTimer, 2.5);
        c.frozen = true;
      }
    }
  }
  if (a.t >= a.delay + a.duration) {
    state.avalanche = null;
    state.events.push({ type: 'avalancheEnded' });
  }
}

/** Tempestade de areia: inimigos (menos chefes) longe do herói e de toda criatura ficam ocultos. */
function updateSandHidden(state: RunState): void {
  const rule = STAGES[state.stage].weather;
  const storm = rule?.kind === 'sandstorm' && state.weather.active;
  const reveal = rule?.revealRadius ?? 0;
  for (const enemy of state.enemies) {
    if (!storm || enemy.def.isBoss || enemy.allyTimer > 0) {
      enemy.hidden = false;
      continue;
    }
    const hero = state.hero;
    const seen = (!hero.dead && distance(hero, enemy) <= reveal) || state.creatures.some((c) => distance(c, enemy) <= reveal);
    enemy.hidden = !seen;
  }
}

export function updateMapEvents(state: RunState, dt: number, crush: (index: number) => void = () => {}): void {
  updateAvalanche(state, dt, crush);
  updateSandHidden(state);
  const rule = STAGES[state.stage].weather;
  if (rule && !state.weather.forced) {
    state.weather.timer -= dt;
    if (!state.weather.active && !state.weather.warned && state.weather.timer <= rule.warning) {
      state.weather.warned = true;
      state.events.push({ type: 'weatherWarning', kind: rule.kind, seconds: Math.ceil(state.weather.timer) });
    }
    if (state.weather.timer <= 0) {
      if (state.weather.active) endWeather(state);
      else startWeather(state, false);
    }
  }
  // herói parado perto de uma fogueira apagada a reacende
  const hero = state.hero;
  for (const o of state.interactables) {
    if (o.lit) continue;
    if (!hero.dead && distance(hero, o) <= INTERACT.reach) {
      o.progress += dt;
      if (o.progress >= INTERACT.time) {
        o.lit = true;
        o.progress = 0;
        state.events.push({ type: 'interactableActivated', kind: o.kind, x: o.x, y: o.y });
      }
    } else o.progress = Math.max(0, o.progress - dt * 2);
  }
}

/** Alcance da criatura sob o clima: menor na nevasca, a não ser perto de uma fogueira acesa. */
export function weatherRangeFactor(state: RunState, creature: Creature): number {
  const rule = STAGES[state.stage].weather;
  if (!rule || !state.weather.active || rule.kind !== 'blizzard') return 1;
  const warm = state.interactables.some((o) => o.kind === 'brazier' && o.lit && distance(o, creature) <= o.radius);
  return warm ? 1 : rule.rangeMultiplier;
}
