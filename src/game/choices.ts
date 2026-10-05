import { BETWEEN_WAVES, NEXUS } from '../data/config';
import { CREATURE_IDS } from '../data/creatures';
import { RUN_UPGRADES } from '../data/upgrades';
import { shuffle } from './random';
import { startWave } from './spawning';
import type { Choice, RunState } from './state';

/** Fim de onda: cura o Nexus e sorteia as opções. Após a onda 1, só ovos (se houver). */
export function offerChoices(state: RunState): void {
  state.phase = 'choosing';
  state.nexus.hp = Math.min(state.nexus.maxHp, state.nexus.hp + NEXUS.healBetweenWaves);
  const eggs: Choice[] = CREATURE_IDS.filter((id) => !state.unlocked.has(id)).map((creature) => ({
    kind: 'egg',
    creature,
  }));
  const upgrades: Choice[] = RUN_UPGRADES.map((upgrade) => ({ kind: 'upgrade', upgrade }));
  const pool = state.wave === 1 && eggs.length ? eggs : [...upgrades, ...eggs];
  state.choices = shuffle(pool).slice(0, BETWEEN_WAVES.choices);
  state.events.push({ type: 'waveCleared', wave: state.wave });
}

export function applyChoice(state: RunState, choice: Choice): void {
  if (choice.kind === 'egg') {
    state.unlocked.add(choice.creature);
    return;
  }
  const effect = choice.upgrade.effect;
  switch (effect.kind) {
    case 'damageMultiplier':
      state.modifiers.damage *= effect.value;
      break;
    case 'rangeMultiplier':
      state.modifiers.range *= effect.value;
      break;
    case 'attackSpeedMultiplier':
      state.modifiers.attackSpeed *= effect.value;
      break;
    case 'gold':
      state.gold += effect.amount;
      break;
    case 'nexusMaxHp':
      state.nexus.maxHp += effect.amount;
      state.nexus.hp += effect.amount;
      break;
    case 'pulseCooldownMultiplier':
      state.pulse.cooldown *= effect.value;
      break;
  }
}

/** O jogador escolhe uma das opções oferecidas; a próxima onda começa em seguida. */
export function chooseOption(state: RunState, index: number): void {
  const choice = state.choices[index];
  if (state.phase !== 'choosing' || !choice) return;
  applyChoice(state, choice);
  state.choices = [];
  state.events.push({ type: 'choiceMade' });
  startWave(state);
}
