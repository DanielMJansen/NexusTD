import { ECONOMY, REWARDS } from '../data/config';
import { WAVES } from '../data/waves';
import { offerChoices } from './choices';
import { applyBlocks, updateCreatures, updateDamageOverTime, updateHero } from './combat';
import { updateEnemies } from './enemies';
import { updateLoot } from './loot';
import { updateNexus } from './nexus';
import { updateHeroVitals } from './hero';
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
  // Pausa enquanto a escolha do herói ou de um baú estiver aberta.
  if (state.phase !== 'playing' || state.heroChoices.length || state.chestChoices.length) return;
  state.time += dt;

  state.incomeTimer += dt;
  if (state.incomeTimer > ECONOMY.passiveIncome.interval - state.talents.incomeInterval) {
    state.incomeTimer = 0;
    state.gold += ECONOMY.passiveIncome.amount;
  }

  state.pulse.remaining = Math.max(0, state.pulse.remaining - dt);
  if (state.talents.nexusRegen > 0 && state.nexus.hp < state.nexus.maxHp) {
    state.nexus.hp = Math.min(state.nexus.maxHp, state.nexus.hp + state.talents.nexusRegen * dt);
  }

  state.spawnTimer -= dt;
  const next = state.spawnQueue[0];
  if (next && state.spawnTimer <= 0) {
    state.spawnQueue.shift();
    spawnEnemy(state, next);
    state.spawnTimer = spawnInterval(state.wave);
  }

  updateHeroVitals(state, dt);
  updateHero(state, dt, input.direction);
  applyBlocks(state);
  updateEnemies(state, dt);
  updateNexus(state, dt);
  updateCreatures(state, dt);
  updateDamageOverTime(state, dt);
  updateLoot(state, dt);
  state.enemies = state.enemies.filter((e) => !e.dead);

  if (state.nexus.hp <= 0) endRun(state, false);
  else if (!state.spawnQueue.length && !state.enemies.length) {
    if (state.wave >= WAVES.total && !state.endless) endRun(state, true);
    else offerChoices(state);
  }
}

/** Depois da vitória: segue no modo Sem Fim, começando pela escolha de fim de onda. */
export function enterEndless(state: RunState): void {
  if (!state.result?.victory || state.endless) return;
  state.endless = true;
  state.endlessKills = state.kills;
  state.result = null;
  offerChoices(state);
}

function endRun(state: RunState, victory: boolean): void {
  state.phase = 'ended';
  const t = state.talents;
  // No Sem Fim, a Essência das 20 ondas já foi paga na vitória: conta só o que veio depois.
  const waves = state.endless ? state.wave - WAVES.total : state.wave;
  const kills = state.kills - (state.endless ? state.endlessKills : 0);
  const base =
    waves * (REWARDS.essencePerWave + t.essencePerWave) +
    Math.floor(kills / REWARDS.killsPerEssence) +
    (victory ? REWARDS.victoryBonus + t.victoryEssence : 0);
  const essence = Math.floor(base * (1 + t.essenceGain));
  state.result = {
    victory,
    wave: state.wave,
    kills: state.kills,
    essence,
    hero: state.hero.def.id,
    lowestNexusRatio: state.lowestNexusRatio,
    ascendedPeak: state.ascendedPeak,
    creaturesPlaced: state.creaturesPlaced,
    seenEnemies: [...state.seenEnemies],
    endless: state.endless,
    previousKills: state.endless ? state.endlessKills : 0,
  };
  state.events.push({ type: 'runEnded', result: state.result });
}
