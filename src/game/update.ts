import { SANCTUARY } from '../data/sanctuary';
import { STAGES } from '../data/stages';
import { ECONOMY, REWARDS } from '../data/config';
import { WAVES } from '../data/waves';
import { offerChoices } from './choices';
import { applyBlocks, updateCreatures, updateDamageOverTime, updateHero } from './combat';
import { updateEnemies } from './enemies';
import { updatePulses } from './pulses';
import { updateLoot } from './loot';
import { updateNexus } from './nexus';
import { updateHeroVitals } from './hero';
import { spawnEnemy, spawnInterval, startWave } from './spawning';
import { createRun, type Point, type RunSetup, type RunState } from './state';

export interface FrameInput {
  /** Direção do teclado (-1, 0 ou 1 em cada eixo). */
  direction: Point;
  /** Ponto mirado (mouse sobre a arena ou direção do teclado), para Pulsos contínuos. */
  aim?: Point;
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
  state.haste.remaining = Math.max(0, state.haste.remaining - dt);
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
  updatePulses(state, dt, input.aim);
  // deslizando (Travessia), o herói não anda nem ataca por conta própria
  if (!state.pulseFx.glide) updateHero(state, dt, input.direction);
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
  const essence = Math.floor(base * (1 + t.essenceGain) * STAGES[state.stage].essenceMultiplier);
  // Fragmentos (fases a partir da 2): ondas vencidas + bônus por chefe, repartidos pelas raças invocadas
  const fragments: Record<string, number> = {};
  const stage = STAGES[state.stage];
  if (stage.fragments) {
    const cleared = victory ? state.wave : state.wave - 1;
    const from = state.endless ? WAVES.total : 0;
    const bosses = state.endless
      ? Math.floor(Math.max(0, cleared - from) / WAVES.endless.bossEvery)
      : stage.bosses.filter((b) => b.wave <= cleared).length;
    const total = Math.max(0, cleared - from) + bosses * SANCTUARY.perBoss;
    const placed = Object.values(state.racePlacements).reduce((a, b) => a + b, 0);
    if (total > 0 && placed > 0) {
      const races = Object.entries(state.racePlacements).sort((a, b) => b[1] - a[1]);
      let left = total;
      for (const [race, count] of races) {
        const share = Math.floor((total * count) / placed);
        fragments[race] = share;
        left -= share;
      }
      // sobra do arredondamento vai para a raça mais usada
      fragments[races[0]![0]] = (fragments[races[0]![0]] ?? 0) + left;
      for (const race of Object.keys(fragments)) if (!fragments[race]) delete fragments[race];
    }
  }
  state.result = {
    stage: state.stage,
    fragments,
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
