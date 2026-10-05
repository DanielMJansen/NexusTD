import { ARENA } from '../data/config';
import { ENEMIES, type EnemyId } from '../data/enemies';
import { WAVES } from '../data/waves';
import { random } from './random';
import type { RunState } from './state';

export function waveEnemyCount(wave: number): number {
  return WAVES.enemyCount.base + WAVES.enemyCount.perWave * wave;
}

export function spawnInterval(wave: number): number {
  const rule = WAVES.spawnInterval;
  return Math.max(rule.min, rule.base + rule.perWave * wave);
}

function rollEnemy(wave: number): EnemyId {
  const roll = random();
  const entry = WAVES.composition.find((e) => wave >= e.fromWave && roll < e.rollBelow);
  return entry ? entry.enemy : WAVES.fallbackEnemy;
}

export function buildWaveQueue(wave: number): EnemyId[] {
  const queue = Array.from({ length: waveEnemyCount(wave) }, () => rollEnemy(wave));
  for (const boss of WAVES.bosses) if (boss.wave === wave) queue.push(boss.enemy);
  return queue;
}

export function startWave(state: RunState): void {
  state.wave++;
  state.spawnQueue = buildWaveQueue(state.wave);
  state.spawnTimer = 0;
  state.phase = 'playing';
  state.events.push({ type: 'waveStarted', wave: state.wave });
}

/** Cria um inimigo no anel externo. Sem ângulo, sorteia um e pode trazer o bando junto. */
export function spawnEnemy(state: RunState, id: EnemyId, angle?: number): void {
  const def = ENEMIES[id];
  const isLeader = angle === undefined;
  const a = angle ?? random() * Math.PI * 2;
  const hp = def.hp * (1 + WAVES.hpGrowthPerWave * state.wave);
  if (def.isBoss) state.events.push({ type: 'bossSpawned' });
  state.enemies.push({
    def,
    x: ARENA.center.x + Math.cos(a) * WAVES.spawnRadius,
    y: ARENA.center.y + Math.sin(a) * WAVES.spawnRadius,
    hp,
    maxHp: hp,
    slowTimer: 0,
    slowMultiplier: 1,
    animationOffset: random() * 6,
    dead: false,
  });
  if (isLeader && def.pack && random() < def.pack.chance) {
    for (const offset of def.pack.angleOffsets) spawnEnemy(state, id, a + offset);
  }
}
