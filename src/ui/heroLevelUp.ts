import type { RunState } from '../game/state';
import { showOverlay } from './overlay';

/** Subiu de nível: escolher 1 entre 3 melhorias do herói (o jogo fica pausado). */
export function showHeroLevelUp(run: RunState, onChoose: (index: number) => void): void {
  const hero = run.hero;
  const cards = run.heroChoices
    .map(
      (u, i) => `<button class="choice" style="--card-color:${hero.def.color}" data-action="choose" data-value="${i}">
        <span class="upgrade-icon">${u.icon}</span>
        <span class="choice-kind">Herói</span>
        <span class="choice-name">${u.name}</span>
        <span class="choice-detail">${u.text}</span>
      </button>`,
    )
    .join('');
  const more = run.pendingLevels > 1 ? `<p class="hint">Mais ${run.pendingLevels - 1} nível(is) para escolher.</p>` : '';
  showOverlay(
    `<div class="panel wide">
      <h2>${hero.def.name} — nível ${hero.level - run.pendingLevels + 1}!</h2>
      <p class="subtitle">Escolha uma melhoria só para o herói.</p>
      <div class="choices">${cards}</div>
      ${more}
    </div>`,
    { choose: (i) => onChoose(Number(i)) },
  );
}
