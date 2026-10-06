import { FIRST_STAGE, STAGES } from '../data/stages';
import { ACHIEVEMENT_IDS } from '../data/achievements';
import { GAME_TITLE } from '../data/config';
import { CREATURE_IDS } from '../data/creatures';
import { ENEMIES } from '../data/enemies';
import { HEROES } from '../data/heroes';
import { WAVES } from '../data/waves';
import { hasSanctuary, heroSkin, TEAM_SIZE, type Profile, runSetup } from '../game/profile';
import type { SavedRunSummary } from '../save/runSave';
import { essence } from './currency';
import { CODEX_ENEMIES } from './codexScreen';
import { showOverlay } from './overlay';

export interface MenuHandlers {
  onPlay(): void;
  onContinue(): void;
  onTeam(): void;
  onHeroes(): void;
  onCollection(): void;
  onTalents(): void;
  onAchievements(): void;
  onCodex(): void;
  onStages(): void;
  onSanctuary(): void;
  onSettings(): void;
}

/** Menu principal: atalhos para jogar e para as telas de meta-progressão. */
/** `saved`: run em andamento salva (mostra "Continuar run"). */
export function showMenu(profile: Profile, saved: SavedRunSummary | null, handlers: MenuHandlers): void {
  const stage = STAGES[runSetup(profile).stage ?? FIRST_STAGE];
  const finalBoss = stage.bosses.at(-1);
  const goal = finalBoss
    ? `Fase ${stage.number} · ${stage.name}: proteja o Nexus por ${WAVES.total} ondas e vença o chefe final, <b>${ENEMIES[finalBoss.enemy].name}</b>.`
    : `Fase ${stage.number} · ${stage.name}: proteja o Nexus por ${WAVES.total} ondas.`;
  const hero = `<canvas class="team-mini" data-sprite="${profile.selectedHero}" data-skin="${heroSkin(profile, profile.selectedHero).id}"></canvas>`;
  const team = hero + profile.team.map((id) => `<canvas class="team-mini" data-sprite="${id}"></canvas>`).join('');

  showOverlay(
    `<div class="panel menu-hub">
      <h1>${GAME_TITLE}</h1>
      <p class="subtitle">Um herói. Um exército de monstros.</p>
      <div class="essence">${essence(profile.essence)} de Essência</div>
      <p>${goal}</p>
      <div class="hub-team">${team}</div>
      <div class="hub-buttons">
        ${saved ? `<button class="play-button" data-action="continue">▶ Continuar run <small>onda ${saved.wave} · ${HEROES[saved.hero].name}</small></button>` : ''}
        <button class="${saved ? '' : 'play-button'}" data-action="play"${profile.team.length ? '' : ' disabled'}>${saved ? 'Nova run' : '▶ Jogar'}</button>
        <button data-action="stages">Fase <small>${stage.number} · ${stage.name}</small></button>
        <button data-action="heroes">Herói <small>${HEROES[profile.selectedHero].name}</small></button>
        <button data-action="team">Equipe <small>${profile.team.length}/${TEAM_SIZE}</small></button>
        <button data-action="collection">Coleção <small>${profile.ownedCreatures.length}/${CREATURE_IDS.length}</small></button>
        <button data-action="talents">Talentos</button>
        ${hasSanctuary(profile) ? `<button data-action="sanctuary">Santuário <small>${Object.values(profile.fragments).reduce((a, b) => a + b, 0)} ❖</small></button>` : ''}
        <button data-action="achievements">Conquistas <small>${profile.achievements.length}/${ACHIEVEMENT_IDS.length}</small></button>
        <button data-action="codex">Códex <small>${CODEX_ENEMIES.filter((id) => profile.seenEnemies.includes(id)).length}/${CODEX_ENEMIES.length}</small></button>
        <button data-action="settings">⚙ Configurações</button>
      </div>
    </div>`,
    {
      play: () => handlers.onPlay(),
      continue: () => handlers.onContinue(),
      team: () => handlers.onTeam(),
      stages: () => handlers.onStages(),
      sanctuary: () => handlers.onSanctuary(),
      heroes: () => handlers.onHeroes(),
      collection: () => handlers.onCollection(),
      talents: () => handlers.onTalents(),
      achievements: () => handlers.onAchievements(),
      codex: () => handlers.onCodex(),
      settings: () => handlers.onSettings(),
    },
  );
}
