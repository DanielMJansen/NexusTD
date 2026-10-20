import type { RunState } from '../game/state';
import { heroStatRows, heroStatText } from './describe';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

/** Subiu de nível: escolher 1 entre 3 melhorias do herói (o jogo fica pausado). */
export function showHeroLevelUp(run: RunState, onChoose: (index: number) => void): void {
  const hero = run.hero;
  const cards = run.heroChoices
    .map((u, i) => {
      // total do atributo agora e depois de escolher (as melhorias somam)
      const now = run.heroStats[u.stat];
      const after = heroStatText(u.stat, now + u.value);
      const total = now > 0 ? `${t('Agora')} ${heroStatText(u.stat, now)} → <b>${after}</b>` : t('Fica {v}', { v: after });
      const picks = run.heroUpgradePicks[u.id] ?? 0;
      const limit = u.maxPicks !== undefined ? ` · ${picks + 1}/${u.maxPicks}` : '';
      return `<button class="choice" style="--card-color:${hero.def.color}" data-action="choose" data-value="${i}">
        <span class="upgrade-icon">${u.icon}</span>
        <span class="choice-kind">${t('Herói')}${limit}</span>
        <span class="choice-name">${u.name}</span>
        <span class="choice-detail">${u.text}</span>
        <span class="choice-total">${total}</span>
      </button>`;
    })
    .join('');
  const rows = heroStatRows(run.heroStats);
  const current = rows.length
    ? `<div class="hero-now"><b>${t('Seu herói agora:')}</b> ${rows.join(' · ')}</div>`
    : '';
  const more = run.pendingLevels > 1 ? `<p class="hint">${t('Mais {n} nível(is) para escolher.', { n: run.pendingLevels - 1 })}</p>` : '';
  showOverlay(
    `<div class="panel wide">
      <h2>${hero.def.name} — ${t('nível {n}', { n: hero.level - run.pendingLevels + 1 })}!</h2>
      <p class="subtitle">${t('Escolha uma melhoria só para o herói. As melhorias se somam.')}</p>
      <div class="choices">${cards}</div>
      ${current}
      ${more}
    </div>`,
    { choose: (i) => onChoose(Number(i)) },
  );
}
