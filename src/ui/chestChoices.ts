import type { RunState } from '../game/state';
import { showOverlay } from './overlay';
import { choiceCard } from './waveChoices';
import { t } from '../i18n/i18n';

/** Baú coletado: escolher 1 entre 3 melhorias de tier alto (o jogo fica pausado). */
export function showChestChoices(run: RunState, onChoose: (index: number) => void): void {
  const cards = run.chestChoices.map((choice, i) => choiceCard(run, choice, i)).join('');
  const more = run.pendingChests > 1 ? `<p class="hint">${t('Mais {n} baú(s) para abrir.', { n: run.pendingChests - 1 })}</p>` : '';
  showOverlay(
    `<div class="panel wide">
      <h2>🗝 ${t('Baú do tesouro!')}</h2>
      <p class="subtitle">${t('Escolha uma melhoria rara (ou melhor).')}</p>
      <div class="choices">${cards}</div>
      ${more}
    </div>`,
    { choose: (i) => onChoose(Number(i)) },
  );
}
