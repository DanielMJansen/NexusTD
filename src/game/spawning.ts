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
  state.wardReady = state.talents.nexusWard > 0;
  state.events.push({ type: 'waveStarted', wave: state.wave });
}

/** Ponto logo fora da borda da tela, na direção do ângulo a partir do Nexus. */
function spawnPoint(angle: number): { x: number; y: number } {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const toEdge = Math.min(
    dx ? ARENA.center.x / Math.abs(dx) : Infinity,
    dy ? ARENA.center.y / Math.abs(dy) : Infinity,
  );
  const distance = toEdge + WAVES.spawnMargin;
  return { x: ARENA.center.x + dx * distance, y: ARENA.center.y + dy * distance };
}

/** Cria um inimigo fora da tela. Sem ângulo, sorteia um e pode trazer o bando junto. */
export function spawnEnemy(state: RunState, id: EnemyId, angle?: number): void {
  const def = ENEMIES[id];
  const isLeader = angle === undefined;
  const a = angle ?? random() * Math.PI * 2;
  const hp = def.hp * (1 + WAVES.hpGrowthPerWave * state.wave);
  if (def.isBoss) state.events.push({ type: 'bossSpawned', enemy: id });
  state.enemies.push({
    def,
    ...spawnPoint(a),
    hp,
    maxHp: hp,
    slowTimer: 0,
    slowMultiplier: 1,
    animationOffset: random() * 6,
    lastHitAt: -Infinity,
    held: false,
    dead: false,
  });
  if (isLeader && def.pack && random() < def.pack.chance) {
    for (const offset of def.pack.angleOffsets) spawnEnemy(state, id, a + offset);
  }
}
