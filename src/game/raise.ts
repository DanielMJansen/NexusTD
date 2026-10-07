import type { RunState } from './state';

// Erguer Mortos: quais corpos recentes o próximo Pulso levanta (para mostrar na tela).

/** Segundos que um corpo fica disponível para ser erguido. */
export const CORPSE_LIFE = 6;

/** Corpos que o Pulso de erguer levantaria agora (os mais recentes, até o limite), ou [] se o herói não ergue. */
export function raisableCorpses(state: RunState): { x: number; y: number; at: number }[] {
  const effect = state.hero.def.pulse.effect;
  if (effect.kind !== 'raise') return [];
  const count = Math.round(effect.count * (1 + state.heroStats.pulseSize));
  return state.recentDeaths.filter((d) => state.time - d.at <= CORPSE_LIFE).slice(-count);
}
