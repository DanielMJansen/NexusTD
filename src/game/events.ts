import type { WaveKind } from '../data/stages';
import type { CreatureId } from '../data/creatures';
import type { EnemyId } from '../data/enemies';
import type { HeroId, PulseEffect } from '../data/heroes';
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
  | { type: 'enemyShot'; kind: 'arrow' | 'bolt' | 'web' | 'curse' | 'acid'; from: Point; to: Point }
  | { type: 'enemyLeap'; x: number; y: number }
  | { type: 'pulseReady'; x: number; y: number }
  | { type: 'guardHit'; x: number; y: number; damage: number }
  | { type: 'guardDestroyed'; name: string; x: number; y: number }
  | { type: 'caravanMoved'; from: Point; to: Point }
  | { type: 'weatherWarning'; kind: 'blizzard'; seconds: number }
  | { type: 'weatherStarted'; kind: 'blizzard'; forced: boolean }
  | { type: 'weatherEnded'; kind: 'blizzard' }
  | { type: 'interactableActivated'; kind: 'brazier'; x: number; y: number }
  | { type: 'creatureSwallowed'; x: number; y: number }
  | { type: 'creatureReleased'; x: number; y: number }
  | { type: 'enemyBurrow'; x: number; y: number; surfacing: boolean }
  | { type: 'headCut'; x: number; y: number; heads: number }
  | { type: 'headsRegrown'; x: number; y: number; heads: number }
  | { type: 'enemySummoned'; x: number; y: number; color: string }
  | { type: 'enemyCharge'; x: number; y: number }
  | { type: 'enemyHealed'; x: number; y: number; radius: number }
  | { type: 'stomp'; x: number; y: number; radius: number }
  | { type: 'bossShield'; x: number; y: number }
  | { type: 'bossEnraged'; enemy: EnemyId; x: number; y: number }
  /** Pulso do herói; `to` existe quando é uma investida em linha. */
  | {
      type: 'pulse';
      hero: HeroId;
      kind: PulseEffect['kind'];
      x: number;
      y: number;
      radius: number;
      to?: Point;
      cone?: { angle: number; halfAngle: number; length: number };
    }
  /** Revoada: morcegos saem do herói até cada alvo. */
  | { type: 'pulseSwarm'; from: Point; to: Point[] }
  /** Lança-Chamas (a cada quadro enquanto dura). */
  | { type: 'pulseFlame'; x: number; y: number; angle: number; halfAngle: number; length: number }
  /** Eco do Pulso: recarregou quase na hora. */
  | { type: 'pulseEcho'; x: number; y: number }
  /** Meteoro ou coluna de luz caindo. */
  | { type: 'pulseStrike'; kind: 'meteor' | 'judgment'; x: number; y: number; radius: number }
  /** Grito em leque (Banshee). */
  | { type: 'screech'; x: number; y: number; angle: number; halfAngle: number; range: number }
  | { type: 'poolCreated'; x: number; y: number; radius: number }
  | { type: 'wardBlocked' }
  | { type: 'nexusHit'; damage: number }
  /** Golpe direto num inimigo (números de dano). */
  | { type: 'enemyDamaged'; x: number; y: number; amount: number; crit?: boolean }
  | { type: 'nexusHealed'; amount: number }
  /** Inimigo possuído ou esqueleto erguido como aliado temporário. */
  | { type: 'possessed'; x: number; y: number }
  | { type: 'allyFaded'; x: number; y: number }
  | { type: 'executed'; x: number; y: number }
  | { type: 'explosion'; x: number; y: number; radius: number }
  /** Golpe em área ao redor de uma criatura (Uivador, Magma...). */
  | { type: 'nova'; source: CreatureId; x: number; y: number; radius: number }
  /** Raio que atravessa em linha (Cristal, Valquíria...). */
  | { type: 'beam'; source: CreatureId; from: Point; to: Point; width: number }
  /** Ouro extra de um abate do Caldeirão Alquímico. */
  | { type: 'bountyGold'; x: number; y: number; gold: number }
  | { type: 'bossSpawned'; enemy: EnemyId }
  | { type: 'creaturePlaced'; creature: CreatureId; x: number; y: number }
  | { type: 'creatureSold'; x: number; y: number; refund: number }
  | { type: 'creatureEvolved'; creature: CreatureId; x: number; y: number; level: number; ascended: boolean; name: string }
  | { type: 'choiceMade' }
  | { type: 'shopPurchase'; item: 'reroll' | 'extraSlot' }
  | { type: 'waveStarted'; wave: number; total: number; kind: WaveKind; title?: string }
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
