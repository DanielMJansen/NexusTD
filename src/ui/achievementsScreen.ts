import { ACHIEVEMENT_IDS, ACHIEVEMENTS } from '../data/achievements';
import { HEROES } from '../data/heroes';
import { SKINS } from '../data/skins';
import { achievementProgress } from '../game/achievements';
import type { Profile } from '../game/profile';
import { showOverlay } from './overlay';

/** Lista de conquistas, com progresso e a skin que cada uma libera. */
export function showAchievements(profile: Profile, onBack: () => void): void {
  const items = ACHIEVEMENT_IDS.map((id) => {
    const def = ACHIEVEMENTS[id];
    const done = profile.achievements.includes(id);
    const progress = achievementProgress(profile, id);
    const rewards = SKINS.filter((s) => s.unlockedBy === id).map(
      (s) => `<canvas data-sprite="${s.hero}" data-skin="${s.id}"${done ? '' : ' data-silhouette'}></canvas>
        <small>Skin <b>${s.name}</b><br>${HEROES[s.hero].name}</small>`,
    );
    return `<div class="achievement${done ? ' done' : ''}">
      <span class="achievement-icon">${done ? '🏆' : '🔒'}</span>
      <div class="achievement-text">
        <b>${def.name}</b>
        <span>${def.description}${progress && !done ? ` <em>(${progress})</em>` : ''}</span>
      </div>
      <div class="achievement-reward">${rewards.join('')}</div>
    </div>`;
  }).join('');

  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Conquistas</h2>
        <span class="muted">${profile.achievements.length}/${ACHIEVEMENT_IDS.length}</span>
      </div>
      <p class="subtitle">${profile.stats.runs} runs · ${profile.stats.wins} vitórias · ${profile.stats.kills} abates</p>
      <div class="achievement-grid">${items}</div>
    </div>`,
    { back: () => onBack() },
  );
}
