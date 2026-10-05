import { CREATURES } from '../data/creatures';
import type { Choice, RunState } from '../game/state';
import { showOverlay } from './overlay';

function choiceText(choice: Choice): string {
  if (choice.kind === 'upgrade') return choice.upgrade.text;
  const def = CREATURES[choice.creature];
  return `🥚 Nova criatura: ${def.icon} ${def.race} ${def.name}`;
}

/** Fim de onda: escolher 1 entre as opções sorteadas. */
export function showWaveChoices(run: RunState, onChoose: (index: number) => void): void {
  const firstEgg = run.wave === 1 && run.choices.some((c) => c.kind === 'egg');
  const buttons = run.choices
    .map((choice, i) => `<button data-action="choose" data-value="${i}">${choiceText(choice)}</button>`)
    .join('');
  showOverlay(
    `<h3>Onda ${run.wave} vencida!${firstEgg ? '<br>Seu primeiro ovo choca...' : ''}</h3>${buttons}`,
    { choose: (i) => onChoose(Number(i)) },
  );
}
