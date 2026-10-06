import { SHOP } from '../data/config';
import { TIERS, type OfferedUpgrade } from '../data/upgrades';
import { canBuyExtraSlot, canReroll, extraSlotCost, rerollCost } from '../game/shop';
import type { Choice, RunState } from '../game/state';
import { formatNumber } from './describe';
import { showOverlay } from './overlay';

export type ChoiceReason = 'start' | 'waveCleared';

export interface ChoiceHandlers {
  onChoose(index: number): void;
  onReroll(): void;
  onBuyExtraSlot(): void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Texto da carta com o valor do tier no lugar de {v}. */
export function upgradeText(upgrade: OfferedUpgrade): string {
  const { family, value, race } = upgrade;
  const v =
    family.format === 'percent'
      ? pct(value)
      : family.format === 'perSecond'
        ? `${formatNumber(value)} de vida/s`
        : family.format === 'flat'
          ? formatNumber(value)
          : '';
  return family.text.replace('{v}', v).replace('{race}', race ?? '');
}

export function choiceCard(choice: Choice, index: number): string {
  const { upgrade } = choice;
  const tier = TIERS[upgrade.tier];
  return `<button class="choice tier-${upgrade.tier}" style="--card-color:${tier.color}" data-action="choose" data-value="${index}">
    <span class="upgrade-icon">${upgrade.family.icon}</span>
    <span class="choice-kind">${tier.name}</span>
    <span class="choice-name">${upgrade.family.name}</span>
    <span class="choice-detail">${upgradeText(upgrade)}</span>
  </button>`;
}

/** Totais que o jogador já acumulou nesta run (talentos + melhorias). */
export function bonusRows(run: RunState): [string, string][] {
  const m = run.modifiers;
  const t = run.talents;
  const rows: [string, string][] = [
    ['Dano', `+${pct(m.damage - 1)}`],
    ['Vel. de ataque', `+${pct(m.attackSpeed - 1)}`],
    ['Alcance', `+${pct(m.range - 1)}`],
  ];
  if (m.critChance > 0) rows.push(['Crítico', pct(m.critChance)]);
  for (const [race, value] of Object.entries(m.raceDamage)) rows.push([`Dano ${race}`, `+${pct(value)}`]);
  if (t.heroDamage > 0) rows.push(['Dano do herói', `+${pct(t.heroDamage)}`]);
  if (t.pulseCooldown > 0) rows.push(['Recarga do Pulso', `−${pct(Math.min(0.65, t.pulseCooldown))}`]);
  if (t.nexusRegen > 0) rows.push(['Regeneração', `${formatNumber(Math.round(t.nexusRegen * 100) / 100)}/s`]);
  if (t.killGold > 0) rows.push(['Ouro por abate', `+${pct(t.killGold)}`]);
  if (t.heroXp > 0) rows.push(['XP do herói', `+${pct(t.heroXp)}`]);
  if (t.evolveDiscount > 0) rows.push(['Custo de evoluir', `−${pct(t.evolveDiscount)}`]);
  if (m.executeBelow > 0) rows.push(['Sentença', `< ${pct(m.executeBelow)} de vida`]);
  if (t.nexusWard > 0) rows.push(['Égide', 'ativa']);
  return rows;
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

/** Escolher 1 entre as melhorias sorteadas no fim da onda (com loja e o resumo dos bônus). */
export function showWaveChoices(run: RunState, reason: ChoiceReason, handlers: ChoiceHandlers): void {
  const bonuses = bonusRows(run)
    .map(([label, value]) => `<span><small>${label}</small> <b>${value}</b></span>`)
    .join('');
  showOverlay(
    `<div class="panel wide">
      <h2>Onda ${run.wave} vencida!</h2>
      <p class="subtitle">Escolha uma recompensa.</p>
      <div class="choices">${run.choices.map(choiceCard).join('')}</div>
      ${reason === 'waveCleared' ? shopFooter(run) : ''}
      <div class="bonus-summary"><h3>Seus bônus</h3><div>${bonuses}</div></div>
    </div>`,
    {
      choose: (i) => handlers.onChoose(Number(i)),
      reroll: () => handlers.onReroll(),
      slot: () => handlers.onBuyExtraSlot(),
    },
  );
}
