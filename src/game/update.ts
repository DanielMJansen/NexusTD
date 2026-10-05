import { ARENA, ECONOMY, NEXUS, REWARDS } from '../data/config';
import { WAVES } from '../data/waves';
import { offerChoices } from './choices';
import { updateCreatures, updateHero } from './combat';
import { spawnEnemy, spawnInterval, startWave } from './spawning';
import { createRun, type Point, type RunSetup, type RunState } from './state';

export interface FrameInput {
  /** Direção do teclado (-1, 0 ou 1 em cada eixo). */
  direction: Point;
}

export function startRun(setup: RunSetup): RunState {
  const state = createRun(setup);
  startWave(state);
  return state;
}

/** Avança a simulação. Só age durante uma onda. */
export function updateRun(state: RunState, dt: number, input: FrameInput): void {
  if (state.phase !== 'playing') return;
  state.time += dt;

  state.incomeTimer += dt;
  if (state.incomeTimer > ECONOMY.passiveIncome.interval) {
    state.incomeTimer = 0;
    state.gold += ECONOMY.passiveIncome.amount;
  }

  state.pulse.remaining = Math.max(0, state.pulse.remaining - dt);

  state.spawnTimer -= dt;
  const next = state.spawnQueue[0];
  if (next && state.spawnTimer <= 0) {
    state.spawnQueue.shift();
    spawnEnemy(state, next);
    state.spawnTimer = spawnInterval(state.wave);
  }

  updateHero(state, dt, input.direction);
  moveEnemies(state, dt);
  updateCreatures(state, dt);
  state.enemies = state.enemies.filter((e) => !e.dead);

  if (state.nexus.hp <= 0) endRun(state, false);
  else if (!state.spawnQueue.length && !state.enemies.length) {
    if (state.wave >= WAVES.total) endRun(state, true);
    else offerChoices(state);
  }
}

/** Inimigos andam até o Nexus; ao encostar, causam dano e somem (sem recompensa). */
function moveEnemies(state: RunState, dt: number): void {
  const center = ARENA.center;
  for (const enemy of state.enemies) {
    if (enemy.dead) continue;
    enemy.slowTimer -= dt;
    const speedFactor = enemy.slowTimer > 0 ? enemy.slowMultiplier : 1;
    const dx = center.x - enemy.x;
    const dy = center.y - enemy.y;
    const length = Math.hypot(dx, dy);
    if (length < NEXUS.contactRadius) {
      state.nexus.hp -= enemy.def.nexusDamage;
      state.events.push({ type: 'nexusHit', damage: enemy.def.nexusDamage });
      enemy.dead = true;
      continue;
    }
    const zigzag = enemy.def.zigzag;
    const lateral = zigzag
      ? Math.sin(state.time * zigzag.frequency + enemy.animationOffset) * zigzag.lateralSpeed
      : 0;
    const speed = enemy.def.speed * speedFactor;
    enemy.x += ((dx / length) * speed - (dy / length) * lateral) * dt;
    enemy.y += ((dy / length) * speed + (dx / length) * lateral) * dt;
  }
}

function endRun(state: RunState, victory: boolean): void {
  state.phase = 'ended';
  const essence =
    state.wave * REWARDS.essencePerWave +
    Math.floor(state.kills / REWARDS.killsPerEssence) +
    (victory ? REWARDS.victoryBonus : 0);
  state.result = { victory, wave: state.wave, kills: state.kills, essence };
  state.events.push({ type: 'runEnded', result: state.result });
}
