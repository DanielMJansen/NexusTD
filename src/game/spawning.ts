import { advanceEscort } from './objectives';
import { startWeather } from './mapEvents';
import { entrances, joinNearestPath } from './paths';

import { ENEMIES, type EnemyId } from '../data/enemies';
import { scriptedWave, stageWaveCount, STAGES, type StageDef, type StageId } from '../data/stages';
import { WAVES } from '../data/waves';
import { random } from './random';
import type { Enemy, Point, RunState, SpawnItem } from './state';

export function waveEnemyCount(wave: number): number {
  return Math.round(WAVES.enemyCount.base + WAVES.enemyCount.perWave * wave);
}

export function spawnInterval(wave: number): number {
  const rule = WAVES.spawnInterval;
  return Math.max(rule.min, rule.base + rule.perWave * wave);
}

/** Multiplicadores de força dos inimigos na onda (com a força base da fase). */
export function waveScaling(wave: number, stage: StageDef = STAGES.graveyard): { hp: number; speed: number; damage: number } {
  const s = WAVES.scaling;
  const o = Math.max(0, wave - 1);
  // Sem Fim: escalada exponencial por onda além da última
  const extra = Math.max(0, wave - stageWaveCount(stage.id));
  return {
    hp: (1 + s.hp.linear * o + s.hp.quadratic * o * o) * (1 + WAVES.endless.hpGrowth) ** extra * stage.power.hp,
    speed: 1 + Math.min(s.maxSpeedBonus, s.speedPerWave * o),
    damage: (1 + s.damagePerWave * o) * (1 + WAVES.endless.damageGrowth) ** extra * stage.power.damage,
  };
}

/** Peso de cada inimigo no sorteio da onda (0 = ainda não aparece). */
export function compositionWeights(stage: StageId, wave: number): { enemy: EnemyId; weight: number }[] {
  return STAGES[stage].composition
    .filter((e) => wave >= e.fromWave)
    .map((e) => ({ enemy: e.enemy, weight: Math.max(e.minWeight ?? 0, e.weight + e.perWave * (wave - e.fromWave)) }))
    .filter((e) => e.weight > 0);
}

/** Sorteia um inimigo da composição e a entrada dele (se a fase tiver entradas). */
function rollItem(stage: StageId, wave: number, allowed?: number[]): SpawnItem {
  const enemy = rollEnemy(stage, wave);
  const entry = STAGES[stage].composition.find((c) => c.enemy === enemy);
  const options = allowed ?? entry?.entrances;
  if (!options?.length) return enemy;
  return { enemy, entrance: options[Math.floor(random() * options.length)] };
}

function rollEnemy(stage: StageId, wave: number): EnemyId {
  const weights = compositionWeights(stage, wave);
  const total = weights.reduce((sum, e) => sum + e.weight, 0);
  let roll = random() * total;
  for (const e of weights) {
    roll -= e.weight;
    if (roll < 0) return e.enemy;
  }
  return weights[0]?.enemy ?? 'zombie';
}

/** Chefe da onda: os fixos da run e, no Sem Fim, um a cada `bossEvery` ondas em rodízio. */
export function waveBoss(stage: StageId, wave: number): EnemyId | null {
  const scripted = scriptedWave(stage, wave);
  if (scripted) return scripted.groups?.find((g) => ENEMIES[g.enemy].isBoss)?.enemy ?? null;
  const fixed = STAGES[stage].bosses.find((b) => b.wave === wave);
  if (fixed) return fixed.enemy;
  const { bossEvery } = WAVES.endless;
  const bosses = STAGES[stage].endlessBosses;
  const extra = wave - stageWaveCount(stage);
  if (extra > 0 && extra % bossEvery === 0) return bosses[(extra / bossEvery - 1) % bosses.length] ?? null;
  return null;
}

export function buildWaveQueue(stage: StageId, wave: number): SpawnItem[] {
  const scripted = scriptedWave(stage, wave);
  if (scripted?.kind === 'truce') return [];
  if (scripted) {
    // grupos fixos (embaralhados entre si, chefes no fim) + sorteios da composição
    const fixed: SpawnItem[] = [];
    const bosses: SpawnItem[] = [];
    for (const g of scripted.groups ?? []) {
      for (let i = 0; i < g.count; i++) (ENEMIES[g.enemy].isBoss ? bosses : fixed).push({ enemy: g.enemy, entrance: g.entrance, elite: g.elite });
    }
    const rolls = scripted.rolls ?? (scripted.groups?.length ? 0 : 1);
    for (let i = 0; i < Math.round(waveEnemyCount(wave) * rolls); i++) fixed.push(rollItem(stage, wave, scripted.entrances));
    for (let i = fixed.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [fixed[i], fixed[j]] = [fixed[j]!, fixed[i]!];
    }
    return [...fixed, ...bosses];
  }
  const queue: SpawnItem[] = Array.from({ length: waveEnemyCount(wave) }, () => rollItem(stage, wave));
  const boss = waveBoss(stage, wave);
  if (boss) queue.push(boss);
  return queue;
}

export function startWave(state: RunState): void {
  state.wave++;
  advanceEscort(state);
  state.waveKills = 0;
  for (const creature of state.creatures) creature.killStacks = 0;
  state.spawnQueue = buildWaveQueue(state.stage, state.wave);
  state.spawnIntervalOverride = scriptedWave(state.stage, state.wave)?.interval ?? null;
  state.spawnTimer = 0;
  state.phase = 'playing';
  state.wardReady = state.talents.nexusWard > 0;
  const scripted = scriptedWave(state.stage, state.wave);
  if (scripted?.weather) startWeather(state, true);
  if (scripted?.event?.kind === 'avalanche') {
    const { entrance, delay, duration, width } = scripted.event;
    state.avalanche = { entrance, t: 0, delay, duration, width };
    state.events.push({ type: 'avalancheWarning', entrance, seconds: Math.ceil(delay) });
  }
  state.events.push({ type: 'waveStarted', wave: state.wave, total: stageWaveCount(state.stage), kind: scripted?.kind ?? 'normal', title: scripted?.title });
}

/** Ponto logo fora da borda da tela, na direção do ângulo a partir do Nexus. */
function spawnPoint(state: RunState, angle: number): Point {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const { x: nx, y: ny } = state.nexus;
  const toEdge = Math.min(
    dx > 0 ? (state.map.width - nx) / dx : dx < 0 ? nx / -dx : Infinity,
    dy > 0 ? (state.map.height - ny) / dy : dy < 0 ? ny / -dy : Infinity,
  );
  const distance = toEdge + WAVES.spawnMargin;
  return { x: nx + dx * distance, y: ny + dy * distance };
}

function eliteChance(state: RunState, wave: number): number {
  const e = WAVES.elites;
  if (wave < e.fromWave) return 0;
  const max = wave > stageWaveCount(state.stage) ? WAVES.endless.eliteChance : e.maxChance;
  return Math.min(max, e.chance + e.chancePerWave * (wave - e.fromWave));
}

/** Cria um inimigo já com a força da onda (e talvez elite). */
function createEnemy(state: RunState, id: EnemyId, at: Point, elite: boolean): Enemy {
  const def = ENEMIES[id];
  const scaling = waveScaling(state.wave, STAGES[state.stage]);
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
    gripTimer: 0,
    gripSlow: 0,
    animationOffset: random() * 6,
    lastHitAt: -Infinity,
    held: false,
    heads: def.traits.find((t) => t.kind === 'heads')?.start,
    poisonTimer: 0,
    poisonDps: 0,
    fearTimer: 0,
    stunTimer: 0,
    stunLook: 'stun',
    fearLook: 'fear',
    markTimer: 0,
    markAmount: 0,
    markExplode: null,
    vulnTimer: 0,
    vulnAmount: 0,
    corrodeTimer: 0,
    corrodeAmount: 0,
    weakenTimer: 0,
    weakenSlow: 0,
    weakenDamage: 0,
    allyTimer: 0,
    allyExplode: null,
    summonedAlly: false,
    executed: false,
    nexusTimer: 0,
    lastAttackAt: -Infinity,
    attackAngle: 0,
    hexTimer: 0,
    hexVuln: 0,
    pulseHitId: 0,
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
export function spawnEnemy(state: RunState, id: EnemyId, angle?: number, entrance?: number, forceElite = false): void {
  const def = ENEMIES[id];
  const isLeader = angle === undefined;
  const elite = !def.isBoss && (forceElite || random() < eliteChance(state, state.wave));
  if (def.isBoss) state.events.push({ type: 'bossSpawned', enemy: id });
  const gates = entrances(state);
  // voadores ignoram trilhas e muros: surgem de qualquer borda (só se não vieram por uma entrada escolhida)
  if (gates.length && !(def.flying && entrance === undefined)) {
    // fase com entradas: nasce no começo de uma trilha (o bando sai pela mesma), um pouco espalhado
    const gate = entrance ?? Math.floor(random() * gates.length);
    const start = gates[gate]!.path[0]!;
    const spread = isLeader ? 0 : 14;
    const enemy = createEnemy(state, id, { x: start.x + (random() - 0.5) * spread * 2, y: start.y + (random() - 0.5) * spread * 2 }, elite);
    enemy.path = gate;
    enemy.waypoint = 1;
    state.enemies.push(enemy);
    if (isLeader && def.pack && random() < def.pack.chance) {
      for (const offset of def.pack.angleOffsets) spawnEnemy(state, id, offset, gate);
    }
    return;
  }
  const a = angle ?? random() * Math.PI * 2;
  state.enemies.push(createEnemy(state, id, spawnPoint(state, a), elite));
  if (isLeader && def.pack && random() < def.pack.chance) {
    for (const offset of def.pack.angleOffsets) spawnEnemy(state, id, a + offset);
  }
}

/** Cria inimigos num ponto da arena (invocação, divisão do Lodo). */
export function spawnEnemyAt(state: RunState, id: EnemyId, at: Point, spread = 12): Enemy {
  const angle = random() * Math.PI * 2;
  const enemy = createEnemy(state, id, { x: at.x + Math.cos(angle) * spread, y: at.y + Math.sin(angle) * spread }, false);
  if (entrances(state).length) joinNearestPath(state, enemy);
  state.enemies.push(enemy);
  return enemy;
}
