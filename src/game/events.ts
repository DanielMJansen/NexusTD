import type { CreatureId } from '../data/creatures';
import type { EnemyId } from '../data/enemies';
import type { Point, RunResult } from './state';

/**
 * Acontecimentos da simulação. A simulação só os registra em `state.events`;
 * renderização, áudio e interface reagem a eles.
 */
export type GameEvent =
  | { type: 'shot'; source: CreatureId | 'hero'; from: Point; to: Point }
  | { type: 'enemyKilled'; enemy: EnemyId; x: number; y: number; gold: number; color: string }
  | { type: 'pulse'; x: number; y: number }
  | { type: 'nexusHit'; damage: number }
  | { type: 'bossSpawned'; enemy: EnemyId }
  | { type: 'creaturePlaced'; creature: CreatureId; x: number; y: number }
  | { type: 'creatureSold'; x: number; y: number; refund: number }
  | { type: 'creatureEvolved'; creature: CreatureId; x: number; y: number; level: number; ascended: boolean }
  | { type: 'choiceMade' }
  | { type: 'shopPurchase'; item: 'reroll' | 'extraSlot' }
  | { type: 'waveStarted'; wave: number }
  | { type: 'choicesOffered'; reason: 'start' | 'waveCleared'; wave: number }
  | { type: 'runEnded'; result: RunResult };
