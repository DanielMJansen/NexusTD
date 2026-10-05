import type { CreatureId } from '../data/creatures';

/** Som sintetizado: um oscilador que desliza de `from` a `to` Hz em `duration` segundos. */
export interface SoundDef {
  from: number;
  to: number;
  duration: number;
  wave: OscillatorType;
  /** Volume relativo (padrão 1). */
  volume?: number;
}

export type SoundId = CreatureId | 'kill' | 'coin' | 'place' | 'pulse' | 'hurt' | 'boss' | 'evolve' | 'heal';

export const SOUNDS: Record<SoundId, SoundDef> = {
  archer: { from: 600, to: 300, duration: 0.05, wave: 'triangle' },
  guard: { from: 520, to: 260, duration: 0.06, wave: 'square' },
  duelist: { from: 200, to: 90, duration: 0.06, wave: 'sawtooth' },
  sanguine: { from: 300, to: 150, duration: 0.1, wave: 'sine' },
  fireDragon: { from: 140, to: 50, duration: 0.14, wave: 'square' },
  iceDragon: { from: 900, to: 1400, duration: 0.08, wave: 'sine' },
  kill: { from: 330, to: 660, duration: 0.07, wave: 'square' },
  coin: { from: 880, to: 1320, duration: 0.12, wave: 'sine' },
  place: { from: 180, to: 360, duration: 0.1, wave: 'sine' },
  pulse: { from: 100, to: 500, duration: 0.3, wave: 'sawtooth' },
  hurt: { from: 90, to: 50, duration: 0.2, wave: 'sawtooth' },
  boss: { from: 70, to: 40, duration: 0.5, wave: 'sawtooth' },
  evolve: { from: 440, to: 1760, duration: 0.4, wave: 'triangle' },
  heal: { from: 620, to: 930, duration: 0.12, wave: 'sine' },
};
