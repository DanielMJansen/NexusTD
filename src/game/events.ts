import type { CreatureId } from '../data/creatures';
import type { EnemyId } from '../data/enemies';
import type { HeroId } from '../data/heroes';
import type { Point, RunResult } from './state';

/**
 * Acontecimentos da simulação. A simulação só os registra em `state.events`;
 * renderização, áudio e interface reagem a eles.
 */
export type GameEvent =
  | { type: 'shot'; source: CreatureId; from: Point; to: Point }
  /** Ataque do herói; `cone` = meia-abertura do leque (radianos) quando ataca em área. */
  | { type: 'heroAttack'; hero: HeroId; from: Point; to: Point; cone: number | null; range: number }
  | { type: 'enemyKilled'; enemy: EnemyId; x: number; y: number; gold: number; color: string }
  | { type: 'pulse'; hero: HeroId; x: number; y: number; radius: number }
  | { type: 'wardBlocked' }
  | { type: 'nexusHit'; damage: number }
  | { type: 'nexusHealed'; amount: number }
  | { type: 'bossSpawned'; enemy: EnemyId }
  | { type: 'creaturePlaced'; creature: CreatureId; x: number; y: number }
  | { type: 'creatureSold'; x: number; y: number; refund: number }
  | { type: 'creatureEvolved'; creature: CreatureId; x: number; y: number; level: number; ascended: boolean }
  | { type: 'choiceMade' }
  | { type: 'shopPurchase'; item: 'reroll' | 'extraSlot' }
  | { type: 'waveStarted'; wave: number }
  | { type: 'choicesOffered'; reason: 'start' | 'waveCleared'; wave: number }
  | { type: 'runEnded'; result: RunResult };
