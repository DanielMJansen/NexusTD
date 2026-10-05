import { CHOICES, NEXUS } from '../data/config';
import { RUN_UPGRADES } from '../data/upgrades';
import { shuffle } from './random';
import { startWave } from './spawning';
import type { Choice, RunState } from './state';

/** Fim de onda: cura o Nexus e sorteia as melhorias oferecidas. */
export function offerChoices(state: RunState): void {
  state.phase = 'choosing';
  state.choiceReason = 'waveCleared';
  state.nexus.hp = Math.min(state.nexus.maxHp, state.nexus.hp + NEXUS.healBetweenWaves + state.talents.nexusHeal);
  rollWaveChoices(state);
  state.events.push({ type: 'choicesOffered', reason: 'waveCleared', wave: state.wave });
}

/** Opções possíveis no fim da onda. */
export function waveChoicePool(_state: RunState): Choice[] {
  return RUN_UPGRADES.map((upgrade) => ({ kind: 'upgrade', upgrade }));
}

export function rollWaveChoices(state: RunState): void {
  state.choices = shuffle(waveChoicePool(state)).slice(0, CHOICES.count);
}

export function applyChoice(state: RunState, choice: Choice): void {
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
