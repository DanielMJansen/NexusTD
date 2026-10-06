import type { RunState } from '../game/state';
import { heroStatRows, heroStatText } from './describe';
import { showOverlay } from './overlay';

/** Subiu de nível: escolher 1 entre 3 melhorias do herói (o jogo fica pausado). */
export function showHeroLevelUp(run: RunState, onChoose: (index: number) => void): void {
  const hero = run.hero;
  const cards = run.heroChoices
    .map((u, i) => {
      // total do atributo agora e depois de escolher (as melhorias somam)
      const now = run.heroStats[u.stat];
      const after = heroStatText(u.stat, now + u.value);
      const total = now > 0 ? `Agora ${heroStatText(u.stat, now)} → <b>${after}</b>` : `Fica ${after}`;
      const picks = run.heroUpgradePicks[u.id] ?? 0;
      const limit = u.maxPicks !== undefined ? ` · ${picks + 1}/${u.maxPicks}` : '';
      return `<button class="choice" style="--card-color:${hero.def.color}" data-action="choose" data-value="${i}">
        <span class="upgrade-icon">${u.icon}</span>
        <span class="choice-kind">Herói${limit}</span>
        <span class="choice-name">${u.name}</span>
        <span class="choice-detail">${u.text}</span>
        <span class="choice-total">${total}</span>
      </button>`;
    })
    .join('');
  const rows = heroStatRows(run.heroStats);
  const current = rows.length
    ? `<div class="hero-now"><b>Seu herói agora:</b> ${rows.join(' · ')}</div>`
    : '';
  const more = run.pendingLevels > 1 ? `<p class="hint">Mais ${run.pendingLevels - 1} nível(is) para escolher.</p>` : '';
  showOverlay(
    `<div class="panel wide">
      <h2>${hero.def.name} — nível ${hero.level - run.pendingLevels + 1}!</h2>
      <p class="subtitle">Escolha uma melhoria só para o herói. As melhorias se somam.</p>
      <div class="choices">${cards}</div>
      ${current}
      ${more}
    </div>`,
    { choose: (i) => onChoose(Number(i)) },
  );
}
