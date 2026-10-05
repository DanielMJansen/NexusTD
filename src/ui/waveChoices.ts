import { SHOP } from '../data/config';
import type { RunUpgradeEffect } from '../data/upgrades';
import { canBuyExtraSlot, canReroll, extraSlotCost, rerollCost } from '../game/shop';
import type { Choice, RunState } from '../game/state';
import { showOverlay } from './overlay';

export type ChoiceReason = 'start' | 'waveCleared';

export interface ChoiceHandlers {
  onChoose(index: number): void;
  onReroll(): void;
  onBuyExtraSlot(): void;
}

/** Ícone e cor de cada tipo de melhoria. */
const UPGRADE_LOOK: Record<RunUpgradeEffect['kind'], { icon: string; color: string }> = {
  damageMultiplier: { icon: '⚔', color: '#ff7a5a' },
  rangeMultiplier: { icon: '◎', color: '#7fd8ff' },
  attackSpeedMultiplier: { icon: '➶', color: '#ffd25a' },
  gold: { icon: '◉', color: '#ffd25a' },
  nexusMaxHp: { icon: '◆', color: '#4fd88a' },
  pulseCooldownMultiplier: { icon: '✺', color: '#c08cff' },
};

function choiceCard(choice: Choice, index: number): string {
  const look = UPGRADE_LOOK[choice.upgrade.effect.kind];
  return `<button class="choice" style="--card-color:${look.color}" data-action="choose" data-value="${index}">
    <span class="upgrade-icon">${look.icon}</span>
    <span class="choice-kind">Melhoria</span>
    <span class="choice-name">${choice.upgrade.text}</span>
  </button>`;
}

const disabledUnless = (condition: boolean) => (condition ? '' : ' disabled');

/** Rodapé com a loja: sortear de novo e comprar vaga. Só aparece depois de uma onda. */
function shopFooter(run: RunState): string {
  const slotCost = extraSlotCost(run);
  const slot =
    slotCost === null
      ? `<button class="shop-button" disabled>Vagas no máximo (+${SHOP.extraSlot.max})</button>`
      : `<button class="shop-button" data-action="slot"${disabledUnless(canBuyExtraSlot(run))}>
          +1 vaga de criatura <b>◉ ${slotCost}</b></button>`;
  return `<div class="shop">
    <span class="shop-gold">◉ ${run.gold} de ouro</span>
    <button class="shop-button" data-action="reroll"${disabledUnless(canReroll(run))}>
      ↻ Sortear de novo <b>◉ ${rerollCost(run)}</b></button>
    ${slot}
  </div>`;
}

/** Escolher 1 entre as opções sorteadas: ovo inicial ou recompensa de fim de onda (com loja). */
export function showWaveChoices(run: RunState, reason: ChoiceReason, handlers: ChoiceHandlers): void {
  const title = `Onda ${run.wave} vencida!`;
  const subtitle = 'Escolha uma recompensa.';
  showOverlay(
    `<div class="panel wide">
      <h2>${title}</h2>
      <p class="subtitle">${subtitle}</p>
      <div class="choices">${run.choices.map(choiceCard).join('')}</div>
      ${reason === 'waveCleared' ? shopFooter(run) : ''}
    </div>`,
    {
      choose: (i) => handlers.onChoose(Number(i)),
      reroll: () => handlers.onReroll(),
      slot: () => handlers.onBuyExtraSlot(),
    },
  );
}
