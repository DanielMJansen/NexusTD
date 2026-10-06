import type { StageDef } from '../data/stages';
import { ACHIEVEMENTS, type AchievementId } from '../data/achievements';
import { HEROES } from '../data/heroes';
import { SKINS } from '../data/skins';
import type { RunResult } from '../game/state';
import { essence } from './currency';
import { showOverlay } from './overlay';

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
      const skins = SKINS.filter((s) => s.unlockedBy === id).map((s) => `skin <b>${s.name}</b> (${HEROES[s.hero].name})`);
      return `<li><b>🏆 ${ACHIEVEMENTS[id].name}</b> — ${ACHIEVEMENTS[id].description}${skins.length ? `<br><small>Liberou ${skins.join(', ')}</small>` : ''}</li>`;
    })
    .join('');
  const title = result.victory ? 'Vitória!' : result.endless ? 'Fim do Sem Fim' : 'O Nexus caiu';
  const subtitle = result.victory
    ? 'O Nexus resistiu às hordas.'
    : result.endless
      ? `O Nexus resistiu até a onda ${result.wave}.`
      : `Derrota na onda ${result.wave}.`;
  showOverlay(
    `<div class="panel">
      <h2>${title}</h2>
      <p class="subtitle">${subtitle}</p>
      <div class="result-stats">
        <div>${result.wave}<small>onda</small></div>
        <div>${result.kills}<small>abates</small></div>
        <div>${essence(`+${result.essence}`)}<small>Essência</small></div>
      </div>
      ${stageUnlocked ? `<p class="stage-unlocked">🔓 <b>Fase ${stageUnlocked.number} · ${stageUnlocked.name}</b> liberada! Escolha em <b>Fase</b>, no menu.</p>` : ''}
      ${unlocked ? `<ul class="achievement-list">${unlocked}</ul>` : ''}
      ${onEndless ? '<p class="hint">No <b>Sem Fim</b>, as ondas continuam cada vez mais fortes, com um chefe a cada 5 ondas. A Essência das próximas ondas vem quando o Nexus cair.</p>' : ''}
      <div class="button-row">
        ${onEndless ? '<button class="play-button" data-action="endless">Seguir no Sem Fim</button>' : ''}
        <button class="${onEndless ? '' : 'play-button'}" data-action="continue">${onEndless ? 'Voltar ao menu' : 'Continuar'}</button>
      </div>
    </div>`,
    { continue: () => onContinue(), endless: () => onEndless?.() },
  );
}
