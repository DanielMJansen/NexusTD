import { CHOICES, SHOP } from '../data/config';
import { rollWaveChoices, waveChoicePool } from './choices';
import type { RunState } from './state';

/** A loja só abre na escolha de fim de onda. */
const shopOpen = (state: RunState): boolean => state.phase === 'choosing' && state.choiceReason === 'waveCleared';

export const rerollCost = (state: RunState): number => SHOP.reroll.baseCost + SHOP.reroll.costStep * state.rerolls;

/** Só faz sentido sortear se existem mais opções possíveis do que as mostradas. */
export function canReroll(state: RunState): boolean {
  return shopOpen(state) && waveChoicePool(state).length > CHOICES.count && state.gold >= rerollCost(state);
}

/** Paga para sortear de novo as opções da escolha atual. */
export function reroll(state: RunState): boolean {
  if (!canReroll(state)) return false;
  state.gold -= rerollCost(state);
  state.rerolls++;
  rollWaveChoices(state);
  state.events.push({ type: 'shopPurchase', item: 'reroll' });
  return true;
}

/** Custo da próxima vaga; null se já comprou o máximo. */
export function extraSlotCost(state: RunState): number | null {
  if (state.extraSlots >= SHOP.extraSlot.max) return null;
  return Math.round(SHOP.extraSlot.baseCost * Math.pow(SHOP.extraSlot.costGrowth, state.extraSlots));
}

export function canBuyExtraSlot(state: RunState): boolean {
  const cost = extraSlotCost(state);
  return shopOpen(state) && cost !== null && state.gold >= cost;
}

/** +1 vaga de criatura em campo até o fim da run. */
export function buyExtraSlot(state: RunState): boolean {
  const cost = extraSlotCost(state);
  if (cost === null || !canBuyExtraSlot(state)) return false;
  state.gold -= cost;
  state.extraSlots++;
  state.creatureLimit++;
  state.events.push({ type: 'shopPurchase', item: 'extraSlot' });
  return true;
}
