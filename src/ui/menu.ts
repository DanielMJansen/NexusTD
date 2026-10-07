import { isAltarUnlocked } from '../game/altar';
import { FIRST_STAGE, stageWaveCount, STAGES } from '../data/stages';
import { ACHIEVEMENT_IDS } from '../data/achievements';
import { GAME_TITLE } from '../data/config';
import { CREATURE_IDS } from '../data/creatures';
import { ENEMIES } from '../data/enemies';
import { HEROES } from '../data/heroes';
import { hasSanctuary, heroSkin, TEAM_SIZE, type Profile, runSetup } from '../game/profile';
import type { SavedRunSummary } from '../save/runSave';
import { CODEX_ENEMIES } from './codexScreen';
import { showOverlay } from './overlay';
import { paintStageThumbnail } from '../render/arena';

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
  onNexus(): void;
  onSelectLoadout(index: number): void;
  onSanctuary(): void;
  onAltar(): void;
  onSettings(): void;
  /** Só no modo administrador. */
  onAdmin?: () => void;
}

/** Menu principal: atalhos para jogar e para as telas de meta-progressão. */
/** `saved`: run em andamento salva (mostra "Continuar run"). */
export function showMenu(profile: Profile, saved: SavedRunSummary | null, handlers: MenuHandlers): void {
  const stage = STAGES[runSetup(profile).stage ?? FIRST_STAGE];
  const finalBoss = stage.bosses.at(-1);
  const goal = finalBoss
    ? `${stageWaveCount(stage.id)} ondas · chefe final: <b>${ENEMIES[finalBoss.enemy].name}</b>`
    : `${stageWaveCount(stage.id)} ondas`;
  // fase escolhida em destaque: miniatura do mapa, nome e objetivo (clicar troca de fase)
  const stageCard = `<button class="hub-stage" data-action="stages" style="--stage: ${stage.color}" title="Trocar de fase">
        <canvas class="hub-stage-map" width="240" height="135"></canvas>
        <span class="hub-stage-info"><small>Fase ${stage.number} escolhida</small><b>${stage.name}</b><span>${goal}</span><em>Trocar fase ›</em></span>
      </button>`;
  const hero = `<canvas class="team-mini" data-sprite="${profile.selectedHero}" data-skin="${heroSkin(profile, profile.selectedHero).id}"></canvas>`;
  const team = hero + profile.team.map((id) => `<canvas class="team-mini" data-sprite="${id}"></canvas>`).join('');

  showOverlay(
    `<div class="menu-page">
      <section class="hub-hero">
      <h1>${GAME_TITLE}</h1>
      <p class="subtitle">Um herói. Um exército de monstros.</p>
      ${stageCard}
      <div class="hub-team">${team}</div>
      ${profile.loadouts.length > 1 ? `<div class="hub-loadouts">${profile.loadouts.map((l, i) => `<button class="${i === profile.activeLoadout ? 'active' : ''}" data-action="loadout" data-value="${i}" title="${HEROES[l.hero].name} + ${l.team.length} criatura(s)">${l.name}</button>`).join('')}</div>` : ''}
      <div class="hub-play">
        ${saved ? `<button class="play-button" data-action="continue">▶ Continuar run <small>onda ${saved.wave} · ${HEROES[saved.hero].name}</small></button>` : ''}
        <button class="${saved ? '' : 'play-button'}" data-action="play"${profile.team.length ? '' : ' disabled'}>${saved ? 'Nova run' : '▶ Jogar'}</button>
      </div>
      </section>
      <section class="hub-buttons">
        <button data-action="stages">Fase <small>${stage.number} · ${stage.name}</small></button>
        <button data-action="heroes">Herói <small>${HEROES[profile.selectedHero].name}</small></button>
        <button data-action="team">Equipes <small>${profile.loadouts[profile.activeLoadout]?.name ?? ''} · ${profile.team.length} de ${TEAM_SIZE}</small></button>
        <button data-action="collection">Coleção <small>${CREATURE_IDS.filter((id) => profile.ownedCreatures.includes(id)).length} de ${CREATURE_IDS.length}</small></button>
        <button data-action="talents">Talentos</button>
        <button data-action="nexus">Nexus <small>modelo e cor</small></button>
        ${isAltarUnlocked(profile) ? '<button data-action="altar">Altar de Variantes</button>' : ''}
        ${hasSanctuary(profile) ? `<button data-action="sanctuary">Santuário <small>${Object.values(profile.fragments).reduce((a, b) => a + b, 0)} ❖ para gastar</small></button>` : ''}
        <button data-action="achievements">Conquistas <small>${profile.achievements.length} de ${ACHIEVEMENT_IDS.length}</small></button>
        <button data-action="codex">Códex <small>${CODEX_ENEMIES.filter((id) => profile.seenEnemies.includes(id)).length} de ${CODEX_ENEMIES.length} vistos</small></button>
        <button data-action="settings">⚙ Configurações</button>
        ${handlers.onAdmin ? '<button data-action="admin">🛠 Admin</button>' : ''}
      </section>
    </div>`,
    {
      play: () => handlers.onPlay(),
      continue: () => handlers.onContinue(),
      team: () => handlers.onTeam(),
      loadout: (i) => handlers.onSelectLoadout(Number(i)),
      stages: () => handlers.onStages(),
      nexus: () => handlers.onNexus(),
      sanctuary: () => handlers.onSanctuary(),
      altar: () => handlers.onAltar(),
      heroes: () => handlers.onHeroes(),
      collection: () => handlers.onCollection(),
      talents: () => handlers.onTalents(),
      achievements: () => handlers.onAchievements(),
      codex: () => handlers.onCodex(),
      settings: () => handlers.onSettings(),
      admin: () => handlers.onAdmin?.(),
    },
  );
  const map = document.querySelector<HTMLCanvasElement>('.hub-stage-map');
  if (map) paintStageThumbnail(map, stage);
}
