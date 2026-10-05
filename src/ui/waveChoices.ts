import { CREATURES } from '../data/creatures';
import type { RunUpgradeEffect } from '../data/upgrades';
import type { Choice, RunState } from '../game/state';
import { abilityText } from './describe';
import { showOverlay } from './overlay';

export type ChoiceReason = 'start' | 'waveCleared';

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
  if (choice.kind === 'egg') {
    const def = CREATURES[choice.creature];
    return `<button class="choice" style="--card-color:${def.color}" data-action="choose" data-value="${index}">
      <canvas data-sprite="${def.id}"></canvas>
      <span class="choice-kind">Ovo · ${def.race}</span>
      <span class="choice-name">${def.name}</span>
      <span class="choice-detail"><i>${def.role}</i><br>${abilityText(def.ability)}</span>
    </button>`;
  }
  const look = UPGRADE_LOOK[choice.upgrade.effect.kind];
  return `<button class="choice" style="--card-color:${look.color}" data-action="choose" data-value="${index}">
    <span class="upgrade-icon">${look.icon}</span>
    <span class="choice-kind">Melhoria</span>
    <span class="choice-name">${choice.upgrade.text}</span>
  </button>`;
}

/** Escolher 1 entre as opções sorteadas: ovo inicial ou recompensa de fim de onda. */
export function showWaveChoices(run: RunState, reason: ChoiceReason, onChoose: (index: number) => void): void {
  const onlyEggs = run.choices.every((c) => c.kind === 'egg');
  const title = reason === 'start' ? 'Escolha seu primeiro ovo' : `Onda ${run.wave} vencida!`;
  const subtitle =
    reason === 'start'
      ? 'Uma criatura mística vai lutar ao seu lado.'
      : onlyEggs
        ? 'Um novo ovo está pronto para chocar.'
        : 'Escolha uma recompensa.';
  showOverlay(
    `<div class="panel wide">
      <h2>${title}</h2>
      <p class="subtitle">${subtitle}</p>
      <div class="choices">${run.choices.map(choiceCard).join('')}</div>
    </div>`,
    { choose: (i) => onChoose(Number(i)) },
  );
}
