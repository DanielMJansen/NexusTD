import { ACHIEVEMENT_IDS } from '../data/achievements';
import { GAME_TITLE } from '../data/config';
import { CREATURE_IDS } from '../data/creatures';
import { ENEMIES } from '../data/enemies';
import { HEROES } from '../data/heroes';
import { WAVES } from '../data/waves';
import { heroSkin, TEAM_SIZE, type Profile } from '../game/profile';
import { essence } from './currency';
import { showOverlay } from './overlay';

export interface MenuHandlers {
  onPlay(): void;
  onTeam(): void;
  onHeroes(): void;
  onCollection(): void;
  onTalents(): void;
  onAchievements(): void;
  onSettings(): void;
}

/** Menu principal: atalhos para jogar e para as telas de meta-progressão. */
export function showMenu(profile: Profile, handlers: MenuHandlers): void {
  const finalBoss = WAVES.bosses.at(-1);
  const goal = finalBoss
    ? `Proteja o Nexus por ${WAVES.total} ondas e derrote o <b>${ENEMIES[finalBoss.enemy].name}</b>.`
    : `Proteja o Nexus por ${WAVES.total} ondas.`;
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
        <button class="play-button" data-action="play"${profile.team.length ? '' : ' disabled'}>▶ Jogar</button>
        <button data-action="heroes">Herói <small>${HEROES[profile.selectedHero].name}</small></button>
        <button data-action="team">Equipe <small>${profile.team.length}/${TEAM_SIZE}</small></button>
        <button data-action="collection">Coleção <small>${profile.ownedCreatures.length}/${CREATURE_IDS.length}</small></button>
        <button data-action="talents">Talentos</button>
        <button data-action="achievements">Conquistas <small>${profile.achievements.length}/${ACHIEVEMENT_IDS.length}</small></button>
        <button data-action="settings">⚙ Configurações</button>
      </div>
    </div>`,
    {
      play: () => handlers.onPlay(),
      team: () => handlers.onTeam(),
      heroes: () => handlers.onHeroes(),
      collection: () => handlers.onCollection(),
      talents: () => handlers.onTalents(),
      achievements: () => handlers.onAchievements(),
      settings: () => handlers.onSettings(),
    },
  );
}
