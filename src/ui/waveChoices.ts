import { SHOP } from '../data/config';
import { RARITIES, type RunUpgradeEffect } from '../data/upgrades';
import { canBuyExtraSlot, canReroll, extraSlotCost, rerollCost } from '../game/shop';
import type { Choice, RunState } from '../game/state';
import { showOverlay } from './overlay';

export type ChoiceReason = 'start' | 'waveCleared';

export interface ChoiceHandlers {
  onChoose(index: number): void;
  onReroll(): void;
  onBuyExtraSlot(): void;
}

/** Ícone de cada tipo de efeito (o do primeiro efeito da melhoria). */
const ICONS: Record<RunUpgradeEffect['kind'], string> = {
  damageMultiplier: '⚔',
  rangeMultiplier: '◎',
  attackSpeedMultiplier: '➶',
  gold: '◉',
  nexusMaxHp: '◆',
  pulseCooldownMultiplier: '✺',
  evolveDiscount: '⚗',
  creatureSlot: '✚',
  nexusRegen: '❦',
  killGold: '☠',
  ascendAll: '★',
  ward: '⛨',
};

function choiceCard(choice: Choice, index: number): string {
  const { upgrade } = choice;
  const rarity = RARITIES[upgrade.rarity];
  return `<button class="choice rarity-${upgrade.rarity}" style="--card-color:${rarity.color}" data-action="choose" data-value="${index}">
    <span class="upgrade-icon">${ICONS[upgrade.effects[0]!.kind]}</span>
    <span class="choice-kind">${rarity.name}</span>
    <span class="choice-name">${upgrade.name}</span>
    <span class="choice-detail">${upgrade.text}</span>
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
