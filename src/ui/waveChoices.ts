import { CREATURES } from '../data/creatures';
import type { Choice, RunState } from '../game/state';
import { showOverlay } from './overlay';

export type ChoiceReason = 'start' | 'waveCleared';

function choiceText(choice: Choice): string {
  if (choice.kind === 'upgrade') return choice.upgrade.text;
  const def = CREATURES[choice.creature];
  return `🥚 Nova criatura: ${def.icon} ${def.race} ${def.name}`;
}

/** Escolher 1 entre as opções sorteadas: ovo inicial ou recompensa de fim de onda. */
export function showWaveChoices(run: RunState, reason: ChoiceReason, onChoose: (index: number) => void): void {
  const title = reason === 'start' ? 'Escolha seu primeiro ovo' : `Onda ${run.wave} vencida!`;
  const buttons = run.choices
    .map((choice, i) => `<button data-action="choose" data-value="${i}">${choiceText(choice)}</button>`)
    .join('');
  showOverlay(`<h3>${title}</h3>${buttons}`, { choose: (i) => onChoose(Number(i)) });
}
