import { ARENA } from '../data/config';
import { ENEMIES, type EnemyId } from '../data/enemies';
import { WAVES } from '../data/waves';
import { random } from './random';
import type { Enemy, Point, RunState } from './state';

export function waveEnemyCount(wave: number): number {
  return Math.round(WAVES.enemyCount.base + WAVES.enemyCount.perWave * wave);
}

export function spawnInterval(wave: number): number {
  const rule = WAVES.spawnInterval;
  return Math.max(rule.min, rule.base + rule.perWave * wave);
}

/** Multiplicadores de força dos inimigos na onda. */
export function waveScaling(wave: number): { hp: number; speed: number; damage: number } {
  const s = WAVES.scaling;
  const o = Math.max(0, wave - 1);
  return {
    hp: 1 + s.hp.linear * o + s.hp.quadratic * o * o,
    speed: 1 + Math.min(s.maxSpeedBonus, s.speedPerWave * o),
    damage: 1 + s.damagePerWave * o,
  };
}

/** Peso de cada inimigo no sorteio da onda (0 = ainda não aparece). */
export function compositionWeights(wave: number): { enemy: EnemyId; weight: number }[] {
  return WAVES.composition
    .filter((e) => wave >= e.fromWave)
    .map((e) => ({ enemy: e.enemy, weight: Math.max(e.minWeight ?? 0, e.weight + e.perWave * (wave - e.fromWave)) }))
    .filter((e) => e.weight > 0);
}

function rollEnemy(wave: number): EnemyId {
  const weights = compositionWeights(wave);
  const total = weights.reduce((sum, e) => sum + e.weight, 0);
  let roll = random() * total;
  for (const e of weights) {
    roll -= e.weight;
    if (roll < 0) return e.enemy;
  }
  return weights[0]?.enemy ?? 'zombie';
}

/** Chefe da onda: os fixos da run e, no Sem Fim, um a cada `bossEvery` ondas em rodízio. */
export function waveBoss(wave: number): EnemyId | null {
  const fixed = WAVES.bosses.find((b) => b.wave === wave);
  if (fixed) return fixed.enemy;
  const { bossEvery, bosses } = WAVES.endless;
  const extra = wave - WAVES.total;
  if (extra > 0 && extra % bossEvery === 0) return bosses[(extra / bossEvery - 1) % bosses.length] ?? null;
  return null;
}

export function buildWaveQueue(wave: number): EnemyId[] {
  const queue = Array.from({ length: waveEnemyCount(wave) }, () => rollEnemy(wave));
  const boss = waveBoss(wave);
  if (boss) queue.push(boss);
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
function spawnPoint(angle: number): Point {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const toEdge = Math.min(
    dx ? ARENA.center.x / Math.abs(dx) : Infinity,
    dy ? ARENA.center.y / Math.abs(dy) : Infinity,
  );
  const distance = toEdge + WAVES.spawnMargin;
  return { x: ARENA.center.x + dx * distance, y: ARENA.center.y + dy * distance };
}

function eliteChance(wave: number): number {
  const e = WAVES.elites;
  if (wave < e.fromWave) return 0;
  return Math.min(e.maxChance, e.chance + e.chancePerWave * (wave - e.fromWave));
}

/** Cria um inimigo já com a força da onda (e talvez elite). */
function createEnemy(state: RunState, id: EnemyId, at: Point, elite: boolean): Enemy {
  const def = ENEMIES[id];
  const scaling = waveScaling(state.wave);
  const e = WAVES.elites;
  const hp = def.hp * scaling.hp * (elite ? e.hp : 1);
  const damage = scaling.damage * (elite ? e.damage : 1);
  if (!state.seenEnemies.includes(id)) state.seenEnemies.push(id);
  return {
    def,
    x: at.x,
    y: at.y,
    hp,
    maxHp: hp,
    speed: def.speed * scaling.speed,
    nexusDamage: Math.round(def.nexusDamage * damage),
    heroDps: def.heroDps * damage,
    damageScale: damage,
    elite,
    slowTimer: 0,
    slowMultiplier: 1,
    animationOffset: random() * 6,
    lastHitAt: -Infinity,
    held: false,
    poisonTimer: 0,
    poisonDps: 0,
    fearTimer: 0,
    // primeira recarga sorteada para os inimigos não agirem em sincronia
    timers: def.traits.map(() => 1 + random() * 2),
    charging: 0,
    stone: false,
    shield: 0,
    enraged: false,
    dead: false,
  };
}

/** Cria um inimigo fora da tela. Sem ângulo, sorteia um e pode trazer o bando junto. */
export function spawnEnemy(state: RunState, id: EnemyId, angle?: number): void {
  const def = ENEMIES[id];
  const isLeader = angle === undefined;
  const a = angle ?? random() * Math.PI * 2;
  const elite = !def.isBoss && random() < eliteChance(state.wave);
  if (def.isBoss) state.events.push({ type: 'bossSpawned', enemy: id });
  state.enemies.push(createEnemy(state, id, spawnPoint(a), elite));
  if (isLeader && def.pack && random() < def.pack.chance) {
    for (const offset of def.pack.angleOffsets) spawnEnemy(state, id, a + offset);
  }
}

/** Cria inimigos num ponto da arena (invocação, divisão do Lodo). */
export function spawnEnemyAt(state: RunState, id: EnemyId, at: Point, spread = 12): Enemy {
  const angle = random() * Math.PI * 2;
  const enemy = createEnemy(state, id, { x: at.x + Math.cos(angle) * spread, y: at.y + Math.sin(angle) * spread }, false);
  state.enemies.push(enemy);
  return enemy;
}
