import { INTERACT } from '../data/config';
import { STAGES } from '../data/stages';
import { distance, type Creature, type RunState } from './state';

// Mapa vivo: clima periódico (com aviso) e objetos que o herói ativa ficando perto.

/** Liga o clima (nevasca apaga as fogueiras). forced: dura até o fim da onda. */
export function startWeather(state: RunState, forced: boolean): void {
  const rule = STAGES[state.stage].weather;
  if (!rule) return;
  state.weather = { active: true, timer: rule.duration, warned: false, forced };
  for (const o of state.interactables) if (o.kind === 'brazier') o.lit = false;
  state.events.push({ type: 'weatherStarted', kind: rule.kind, forced });
}

export function endWeather(state: RunState): void {
  const rule = STAGES[state.stage].weather;
  if (!rule || !state.weather.active) return;
  state.weather = { active: false, timer: rule.every, warned: false, forced: false };
  state.events.push({ type: 'weatherEnded', kind: rule.kind });
}

export function updateMapEvents(state: RunState, dt: number): void {
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
  if (!rule || !state.weather.active) return 1;
  const warm = state.interactables.some((o) => o.kind === 'brazier' && o.lit && distance(o, creature) <= o.radius);
  return warm ? 1 : rule.rangeMultiplier;
}
