import { CHOICES, NEXUS } from '../data/config';
import { RARITIES, RUN_UPGRADES, type Rarity, type RunUpgradeDef, type RunUpgradeEffect } from '../data/upgrades';
import { promoteCreature } from './economy';
import { random } from './random';
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

/** A melhoria pode ser oferecida agora? (limite de escolhas e efeitos que não fariam nada) */
function isAvailable(state: RunState, upgrade: RunUpgradeDef): boolean {
  if (upgrade.maxPicks !== undefined && (state.upgradePicks[upgrade.id] ?? 0) >= upgrade.maxPicks) return false;
  return upgrade.effects.every((effect) => {
    switch (effect.kind) {
      case 'ascendAll':
        return state.creatures.length > 0;
      case 'ward':
        return state.talents.nexusWard <= 0;
      case 'evolveDiscount':
        return state.talents.evolveDiscount < 0.75;
      default:
        return true;
    }
  });
}

/** Opções possíveis no fim da onda (todas as raridades). */
export function waveChoicePool(state: RunState): Choice[] {
  return RUN_UPGRADES.filter((u) => isAvailable(state, u)).map((upgrade) => ({ kind: 'upgrade', upgrade }));
}

function rollRarity(): Rarity {
  let roll = random();
  for (const rarity of Object.keys(RARITIES) as Rarity[]) {
    roll -= RARITIES[rarity].weight;
    if (roll < 0) return rarity;
  }
  return 'common';
}

/** Cada carta sorteia a raridade e depois uma melhoria dela (sem repetir na mesma mão). */
export function rollWaveChoices(state: RunState): void {
  const pool = waveChoicePool(state);
  const hand: Choice[] = [];
  for (let i = 0; i < CHOICES.count && pool.length; i++) {
    const rarity = rollRarity();
    const sameRarity = pool.filter((c) => c.upgrade.rarity === rarity);
    const options = sameRarity.length ? sameRarity : pool;
    const pick = options[Math.floor(random() * options.length)]!;
    hand.push(pick);
    pool.splice(pool.indexOf(pick), 1);
  }
  state.choices = hand;
}

function applyEffect(state: RunState, effect: RunUpgradeEffect): void {
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
      state.nexus.hp = effect.fullHeal ? state.nexus.maxHp : state.nexus.hp + effect.amount;
      break;
    case 'pulseCooldownMultiplier':
      state.pulse.cooldown *= effect.value;
      break;
    case 'evolveDiscount':
      state.talents.evolveDiscount = Math.min(0.75, state.talents.evolveDiscount + effect.value);
      break;
    case 'creatureSlot':
      state.creatureLimit += effect.amount;
      break;
    case 'nexusRegen':
      state.talents.nexusRegen += effect.value;
      break;
    case 'killGold':
      state.talents.killGold += effect.value;
      break;
    case 'ascendAll':
      for (const creature of state.creatures) promoteCreature(state, creature);
      break;
    case 'ward':
      state.talents.nexusWard = 1;
      break;
  }
}

export function applyChoice(state: RunState, choice: Choice): void {
  for (const effect of choice.upgrade.effects) applyEffect(state, effect);
  state.upgradePicks[choice.upgrade.id] = (state.upgradePicks[choice.upgrade.id] ?? 0) + 1;
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
