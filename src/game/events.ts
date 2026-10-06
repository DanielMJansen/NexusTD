import type { CreatureId } from '../data/creatures';
import type { EnemyId } from '../data/enemies';
import type { HeroId } from '../data/heroes';
import type { NexusUpgradeId } from '../data/nexusUpgrades';
import type { Point, RunResult } from './state';

/**
 * Acontecimentos da simulação. A simulação só os registra em `state.events`;
 * renderização, áudio e interface reagem a eles.
 */
export type GameEvent =
  | { type: 'shot'; source: CreatureId; from: Point; to: Point }
  /** Ataque do herói; `cone` = meia-abertura do leque (radianos) quando ataca em área. */
  | { type: 'heroAttack'; hero: HeroId; from: Point; to: Point; cone: number | null; range: number }
  | { type: 'enemyKilled'; enemy: EnemyId; x: number; y: number; gold: number; color: string; elite: boolean }
  /** Tiro de inimigo: flecha/raio no herói ou teia numa criatura. */
  | { type: 'enemyShot'; kind: 'arrow' | 'bolt' | 'web'; from: Point; to: Point }
  | { type: 'enemySummoned'; x: number; y: number; color: string }
  | { type: 'enemyCharge'; x: number; y: number }
  | { type: 'enemyHealed'; x: number; y: number; radius: number }
  | { type: 'stomp'; x: number; y: number; radius: number }
  | { type: 'bossShield'; x: number; y: number }
  | { type: 'bossEnraged'; enemy: EnemyId; x: number; y: number }
  /** Pulso do herói; `to` existe quando é uma investida em linha. */
  | { type: 'pulse'; hero: HeroId; x: number; y: number; radius: number; to?: Point }
  /** Grito em leque (Banshee). */
  | { type: 'screech'; x: number; y: number; angle: number; halfAngle: number; range: number }
  | { type: 'poolCreated'; x: number; y: number; radius: number }
  | { type: 'wardBlocked' }
  | { type: 'nexusHit'; damage: number }
  /** Golpe direto num inimigo (números de dano). */
  | { type: 'enemyDamaged'; x: number; y: number; amount: number; crit?: boolean }
  | { type: 'nexusHealed'; amount: number }
  /** Ouro extra de um abate do Caldeirão Alquímico. */
  | { type: 'bountyGold'; x: number; y: number; gold: number }
  | { type: 'bossSpawned'; enemy: EnemyId }
  | { type: 'creaturePlaced'; creature: CreatureId; x: number; y: number }
  | { type: 'creatureSold'; x: number; y: number; refund: number }
  | { type: 'creatureEvolved'; creature: CreatureId; x: number; y: number; level: number; ascended: boolean; name: string }
  | { type: 'choiceMade' }
  | { type: 'shopPurchase'; item: 'reroll' | 'extraSlot' }
  | { type: 'waveStarted'; wave: number }
  | { type: 'choicesOffered'; reason: 'start' | 'waveCleared'; wave: number }
  | { type: 'runEnded'; result: RunResult }
  | { type: 'heroLevelUp'; level: number }
  | { type: 'heroDied'; x: number; y: number; respawn: number }
  | { type: 'heroRespawned'; x: number; y: number }
  | { type: 'nexusUpgraded'; upgrade: NexusUpgradeId; level: number }
  | { type: 'nexusBolt'; to: Point }
  | { type: 'nexusShieldUp'; duration: number }
  | { type: 'nexusShieldBlocked' }
  | { type: 'lootCollected'; kind: 'coin' | 'chest'; x: number; y: number; value: number };
