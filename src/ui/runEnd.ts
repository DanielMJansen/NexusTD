import { RELICS } from '../data/relics';
import type { StageDef } from '../data/stages';
import { ACHIEVEMENTS, type AchievementId } from '../data/achievements';
import { HEROES } from '../data/heroes';
import { SKINS } from '../data/skins';
import type { RunResult } from '../game/state';
import { crystals, essence, fragments } from './currency';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

/** `onEndless`: oferece seguir no modo Sem Fim (só depois da vitória). */
export function showRunEnd(
  result: RunResult,
  newAchievements: AchievementId[],
  onContinue: () => void,
  onEndless?: () => void,
  /** Fase liberada por esta vitória (primeira vez). */
  stageUnlocked?: StageDef,
): void {
  const unlocked = newAchievements
    .map((id) => {
      const skins = SKINS.filter((s) => s.unlockedBy === id).map((s) => t('skin <b>{skin}</b> ({hero})', { skin: s.name, hero: HEROES[s.hero].name }));
      return `<li><b>🏆 ${ACHIEVEMENTS[id].name}</b> — ${ACHIEVEMENTS[id].description}${skins.length ? `<br><small>${t('Liberou {what}', { what: skins.join(', ') })}</small>` : ''}</li>`;
    })
    .join('');
  const title = result.victory ? t('Vitória!') : result.endless ? t('Fim do Sem Fim') : t('O Nexus caiu');
  const subtitle = result.victory
    ? t('O Nexus resistiu às hordas.')
    : result.endless
      ? t('O Nexus resistiu até a onda {n}.', { n: result.wave })
      : t('Derrota na onda {n}.', { n: result.wave });
  showOverlay(
    `<div class="panel">
      <h2>${title}</h2>
      ${result.ascension ? `<p class="subtitle">${t('Ascensão {n}', { n: result.ascension })}</p>` : ''}
      <p class="subtitle">${subtitle}</p>
      <div class="result-stats">
        <div>${result.wave}<small>${t('onda')}</small></div>
        <div>${result.kills}<small>${t('abates')}</small></div>
        <div>${essence(`+${result.essence}`)}<small>${t('Essência')}</small></div>
      </div>
      ${result.relicsFound?.length ? `<p class="run-fragments">${t('Baús de Relíquia:')} ${result.relicsFound.map((id) => `${RELICS[id].icon} <b>${RELICS[id].name}</b>`).join(' · ')}</p>` : ''}
      ${result.crystals ? `<p class="run-fragments">${t('Cristais Ancestrais:')} ${crystals(`+${result.crystals}`)}</p>` : ''}
      ${Object.keys(result.fragments).length ? `<p class="run-fragments">${t('Fragmentos:')} ${Object.entries(result.fragments).map(([race, n]) => fragments(`+${n}`, race)).join(' · ')}</p>` : ''}
      ${stageUnlocked ? `<p class="stage-unlocked">🔓 ${t('<b>Fase {n} · {name}</b> liberada! Escolha em <b>Fase</b>, no menu.', { n: stageUnlocked.number, name: stageUnlocked.name })}</p>` : ''}
      ${unlocked ? `<ul class="achievement-list">${unlocked}</ul>` : ''}
      ${onEndless ? `<p class="hint">${t('No <b>Sem Fim</b>, as ondas continuam cada vez mais fortes, com um chefe a cada 5 ondas. A Essência das próximas ondas vem quando o Nexus cair.')}</p>` : ''}
      <div class="button-row">
        ${onEndless ? `<button class="play-button" data-action="endless">${t('Seguir no Sem Fim')}</button>` : ''}
        <button class="${onEndless ? '' : 'play-button'}" data-action="continue">${onEndless ? t('Voltar ao menu') : t('Continuar')}</button>
      </div>
    </div>`,
    { continue: () => onContinue(), endless: () => onEndless?.() },
  );
}
