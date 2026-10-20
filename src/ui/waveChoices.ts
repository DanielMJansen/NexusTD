import { SHOP } from '../data/config';
import { TIERS, type OfferedUpgrade } from '../data/upgrades';
import { capRoom, upgradeCurrent } from '../game/choices';
import { canBuyExtraSlot, canReroll, extraSlotCost, rerollCost } from '../game/shop';
import type { Choice, RunState } from '../game/state';
import { formatNumber, heroStatRows } from './describe';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

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
        ? t('{n} de vida/s', { n: formatNumber(value) })
        : family.format === 'flat'
          ? formatNumber(value)
          : '';
  return family.text.replace('{v}', v).replace('{race}', race ? t(race) : '');
}

/** Valor atual e depois de pegar a melhoria ("máx." quando bate no teto da família); null quando não há número a comparar. */
export function upgradeDelta(run: RunState, upgrade: OfferedUpgrade): [string, string] | null {
  const { family, race } = upgrade;
  const now = upgradeCurrent(run, family, race);
  const after = now + Math.min(upgrade.value, capRoom(run, family, race));
  const maxed = family.cap !== undefined && after >= family.cap - 1e-9 ? ` ${t('(máx.)')}` : '';
  switch (family.kind) {
    case 'damage':
    case 'attackSpeed':
    case 'range':
    case 'killGold':
    case 'heroXp':
    case 'heroDamage':
    case 'raceDamage':
      return [`+${pct(now)}`, `+${pct(after)}${maxed}`];
    case 'pulseCooldown':
    case 'evolveDiscount':
      return [`−${pct(now)}`, `−${pct(after)}${maxed}`];
    case 'critChance':
      return [pct(now), `${pct(after)}${maxed}`];
    case 'nexusRegen':
      return [`${formatNumber(now)}/s`, `${formatNumber(after)}/s${maxed}`];
    case 'gold':
      return [`◉ ${run.gold}`, `◉ ${run.gold + upgrade.value}`];
    case 'nexusMaxHp':
    case 'nexusHeart':
      return [t('{n} de vida', { n: run.nexus.maxHp }), `${run.nexus.maxHp + upgrade.value}`];
    case 'creatureSlot':
      return [t('{n} vagas', { n: run.creatureLimit }), `${run.creatureLimit + upgrade.value}`];
    case 'execute':
      return run.modifiers.executeBelow > 0 ? [`< ${pct(run.modifiers.executeBelow)}`, `< ${pct(Math.max(run.modifiers.executeBelow, upgrade.value))}`] : null;
    default:
      return null;
  }
}

export function choiceCard(run: RunState, choice: Choice, index: number): string {
  const { upgrade } = choice;
  const tier = TIERS[upgrade.tier];
  const delta = upgradeDelta(run, upgrade);
  return `<button class="choice tier-${upgrade.tier}" style="--card-color:${tier.color}" data-action="choose" data-value="${index}">
    <span class="upgrade-icon">${upgrade.family.icon}</span>
    <span class="choice-kind">${tier.name}</span>
    <span class="choice-name">${upgrade.family.name}</span>
    <span class="choice-detail">${upgradeText(upgrade)}</span>
    ${delta ? `<span class="choice-delta">${t('Agora')} ${delta[0]} → <b>${delta[1]}</b></span>` : ''}
  </button>`;
}

/** Totais que o jogador já acumulou nesta run (talentos + melhorias). */
export function bonusRows(run: RunState): [string, string][] {
  const m = run.modifiers;
  const tal = run.talents;
  const rows: [string, string][] = [
    [t('Dano'), `+${pct(m.damage - 1)}`],
    [t('Vel. de ataque'), `+${pct(m.attackSpeed - 1)}`],
    [t('Alcance'), `+${pct(m.range - 1)}`],
  ];
  if (m.critChance > 0) rows.push([t('Crítico'), pct(m.critChance)]);
  for (const [race, value] of Object.entries(m.raceDamage)) rows.push([t('Dano {race}', { race: t(race) }), `+${pct(value)}`]);
  if (tal.heroDamage > 0) rows.push([t('Dano do herói'), `+${pct(tal.heroDamage)}`]);
  if (tal.pulseCooldown > 0) rows.push([t('Recarga do Pulso'), `−${pct(Math.min(0.65, tal.pulseCooldown))}`]);
  if (tal.nexusRegen > 0) rows.push([t('Regeneração'), `${formatNumber(Math.round(tal.nexusRegen * 100) / 100)}/s`]);
  if (tal.killGold > 0) rows.push([t('Ouro por abate'), `+${pct(tal.killGold)}`]);
  if (tal.heroXp > 0) rows.push([t('XP do herói'), `+${pct(tal.heroXp)}`]);
  if (tal.evolveDiscount > 0) rows.push([t('Custo de evoluir'), `−${pct(tal.evolveDiscount)}`]);
  if (m.executeBelow > 0) rows.push([t('Sentença'), t('< {p} de vida', { p: pct(m.executeBelow) })]);
  if (tal.nexusWard > 0) rows.push([t('Égide'), t('ativa')]);
  // melhorias do herói (níveis)
  for (const text of heroStatRows(run.heroStats)) rows.push([t('Herói'), text]);
  return rows;
}

const disabledUnless = (condition: boolean) => (condition ? '' : ' disabled');

/** Rodapé com a loja: sortear de novo e comprar vaga. Só aparece depois de uma onda. */
function shopFooter(run: RunState): string {
  const slotCost = extraSlotCost(run);
  const slot =
    slotCost === null
      ? `<button class="shop-button" disabled>${t('Vagas no máximo (+{n})', { n: SHOP.extraSlot.max })}</button>`
      : `<button class="shop-button" data-action="slot"${disabledUnless(canBuyExtraSlot(run))}>
          ${t('+1 vaga de criatura')} <b>◉ ${slotCost}</b></button>`;
  return `<div class="shop">
    <span class="shop-gold">${t('◉ {n} de ouro', { n: run.gold })}</span>
    <button class="shop-button" data-action="reroll"${disabledUnless(canReroll(run))}>
      ${t('↻ Sortear de novo')} <b>◉ ${rerollCost(run)}</b></button>
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
      <h2>${t('Onda {n} vencida!', { n: run.wave })}</h2>
      <p class="subtitle">${t('Escolha uma recompensa.')}</p>
      <div class="choices">${run.choices.map((c, i) => choiceCard(run, c, i)).join('')}</div>
      ${reason === 'waveCleared' ? shopFooter(run) : ''}
      <div class="bonus-summary"><h3>${t('Seus bônus')}</h3><div>${bonuses}</div></div>
    </div>`,
    {
      choose: (i) => handlers.onChoose(Number(i)),
      reroll: () => handlers.onReroll(),
      slot: () => handlers.onBuyExtraSlot(),
    },
  );
}
