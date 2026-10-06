import { ACHIEVEMENTS, type AchievementId } from '../data/achievements';
import { HEROES } from '../data/heroes';
import { SKINS } from '../data/skins';
import type { RunResult } from '../game/state';
import { essence } from './currency';
import { showOverlay } from './overlay';

export function showRunEnd(result: RunResult, newAchievements: AchievementId[], onContinue: () => void): void {
  const unlocked = newAchievements
    .map((id) => {
      const skins = SKINS.filter((s) => s.unlockedBy === id).map((s) => `skin <b>${s.name}</b> (${HEROES[s.hero].name})`);
      return `<li><b>🏆 ${ACHIEVEMENTS[id].name}</b> — ${ACHIEVEMENTS[id].description}${skins.length ? `<br><small>Liberou ${skins.join(', ')}</small>` : ''}</li>`;
    })
    .join('');
  const title = result.victory ? 'Vitória!' : 'O Nexus caiu';
  const subtitle = result.victory ? 'O Nexus resistiu às hordas.' : `Derrota na onda ${result.wave}.`;
  showOverlay(
    `<div class="panel">
      <h2>${title}</h2>
      <p class="subtitle">${subtitle}</p>
      <div class="result-stats">
        <div>${result.wave}<small>onda</small></div>
        <div>${result.kills}<small>abates</small></div>
        <div>${essence(`+${result.essence}`)}<small>Essência</small></div>
      </div>
      ${unlocked ? `<ul class="achievement-list">${unlocked}</ul>` : ''}
      <button class="play-button" data-action="continue">Continuar</button>
    </div>`,
    { continue: () => onContinue() },
  );
}
