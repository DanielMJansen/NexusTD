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

export type SoundId = CreatureId | 'kill' | 'coin' | 'place' | 'pulse' | 'hurt' | 'boss' | 'evolve' | 'heal'
  | 'enemyArrow' | 'enemyBolt' | 'web' | 'summon' | 'stomp' | 'shield' | 'enrage' | 'enemyHeal'
  | 'nexusBolt' | 'chest';

export const SOUNDS: Record<SoundId, SoundDef> = {
  archer: { from: 600, to: 300, duration: 0.05, wave: 'triangle' },
  guard: { from: 520, to: 260, duration: 0.06, wave: 'square' },
  duelist: { from: 200, to: 90, duration: 0.06, wave: 'sawtooth' },
  sanguine: { from: 300, to: 150, duration: 0.1, wave: 'sine' },
  fireDragon: { from: 140, to: 50, duration: 0.14, wave: 'square' },
  iceDragon: { from: 900, to: 1400, duration: 0.08, wave: 'sine' },
  hunter: { from: 320, to: 140, duration: 0.05, wave: 'sawtooth', volume: 0.8 },
  alpha: { from: 180, to: 90, duration: 0.08, wave: 'sawtooth', volume: 0.8 },
  haunt: { from: 700, to: 420, duration: 0.12, wave: 'sine' },
  banshee: { from: 1200, to: 600, duration: 0.25, wave: 'triangle', volume: 0.7 },
  sorceress: { from: 500, to: 800, duration: 0.09, wave: 'triangle' },
  cauldron: { from: 220, to: 520, duration: 0.18, wave: 'sine' },
  cherub: { from: 1300, to: 1700, duration: 0.07, wave: 'triangle', volume: 0.6 },
  valkyrie: { from: 700, to: 300, duration: 0.08, wave: 'sawtooth', volume: 0.6 },
  guardianAngel: { from: 500, to: 750, duration: 0.18, wave: 'sine', volume: 0.6 },
  imp: { from: 900, to: 500, duration: 0.05, wave: 'square', volume: 0.5 },
  succubus: { from: 600, to: 1000, duration: 0.15, wave: 'sine', volume: 0.6 },
  infernal: { from: 140, to: 50, duration: 0.3, wave: 'square', volume: 0.8 },
  serpentArcher: { from: 700, to: 400, duration: 0.06, wave: 'triangle', volume: 0.7 },
  medusa: { from: 900, to: 300, duration: 0.25, wave: 'sine', volume: 0.6 },
  basilisk: { from: 250, to: 150, duration: 0.12, wave: 'sawtooth', volume: 0.6 },
  skeletonWarrior: { from: 500, to: 260, duration: 0.06, wave: 'square', volume: 0.6 },
  reaper: { from: 400, to: 140, duration: 0.14, wave: 'sawtooth', volume: 0.6 },
  drainer: { from: 300, to: 200, duration: 0.2, wave: 'sine', volume: 0.6 },
  stoneWall: { from: 120, to: 60, duration: 0.12, wave: 'square', volume: 0.8 },
  crystalGolem: { from: 1800, to: 1200, duration: 0.12, wave: 'triangle', volume: 0.6 },
  magmaGolem: { from: 160, to: 90, duration: 0.2, wave: 'sawtooth', volume: 0.6 },
  enchantress: { from: 1200, to: 1600, duration: 0.1, wave: 'sine', volume: 0.6 },
  trickster: { from: 900, to: 1400, duration: 0.08, wave: 'triangle', volume: 0.6 },
  lumina: { from: 1500, to: 2000, duration: 0.12, wave: 'sine', volume: 0.5 },
  cleric: { from: 880, to: 1180, duration: 0.12, wave: 'sine', volume: 0.7 },
  batSwarm: { from: 1400, to: 900, duration: 0.1, wave: 'triangle', volume: 0.6 },
  storm: { from: 1600, to: 200, duration: 0.12, wave: 'sawtooth', volume: 0.6 },
  howler: { from: 300, to: 520, duration: 0.45, wave: 'sawtooth', volume: 0.7 },
  possessor: { from: 200, to: 120, duration: 0.35, wave: 'sine' },
  herbalist: { from: 260, to: 180, duration: 0.15, wave: 'triangle', volume: 0.8 },
  kill: { from: 330, to: 660, duration: 0.07, wave: 'square' },
  coin: { from: 880, to: 1320, duration: 0.12, wave: 'sine' },
  place: { from: 180, to: 360, duration: 0.1, wave: 'sine' },
  pulse: { from: 100, to: 500, duration: 0.3, wave: 'sawtooth' },
  hurt: { from: 90, to: 50, duration: 0.2, wave: 'sawtooth' },
  boss: { from: 70, to: 40, duration: 0.5, wave: 'sawtooth' },
  evolve: { from: 440, to: 1760, duration: 0.4, wave: 'triangle' },
  heal: { from: 620, to: 930, duration: 0.12, wave: 'sine' },
  enemyArrow: { from: 420, to: 220, duration: 0.05, wave: 'triangle', volume: 0.5 },
  enemyBolt: { from: 260, to: 700, duration: 0.14, wave: 'sine', volume: 0.7 },
  web: { from: 1500, to: 1100, duration: 0.07, wave: 'sine', volume: 0.4 },
  summon: { from: 120, to: 60, duration: 0.3, wave: 'triangle', volume: 0.8 },
  stomp: { from: 60, to: 30, duration: 0.35, wave: 'square' },
  shield: { from: 400, to: 800, duration: 0.25, wave: 'sine', volume: 0.7 },
  enrage: { from: 50, to: 120, duration: 0.6, wave: 'sawtooth' },
  enemyHeal: { from: 500, to: 380, duration: 0.2, wave: 'sine', volume: 0.5 },
  nexusBolt: { from: 1400, to: 300, duration: 0.08, wave: 'sawtooth', volume: 0.45 },
  chest: { from: 520, to: 1560, duration: 0.35, wave: 'triangle' },
};
