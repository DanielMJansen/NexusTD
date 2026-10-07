import { FEATURES, type FeatureId } from '../data/features';
import { isFeatureNew, isFeatureUnlocked } from '../game/features';
import { RELIC_IDS } from '../data/relics';
import { FIRST_STAGE, stageWaveCount, STAGES } from '../data/stages';
import { ACHIEVEMENT_IDS } from '../data/achievements';
import { GAME_TITLE } from '../data/config';
import { CREATURE_IDS, CREATURES } from '../data/creatures';
import { ENEMIES } from '../data/enemies';
import { HEROES } from '../data/heroes';
import { activeRelics, heroSkin, relicSlots, TEAM_SIZE, type Profile, runSetup } from '../game/profile';
import type { SavedRunSummary } from '../save/runSave';
import { CODEX_ENEMIES } from './codexScreen';
import { showOverlay } from './overlay';
import { paintStageThumbnail } from '../render/arena';

/** Botão de uma tela que libera com o progresso: cadeado com a condição, selo NOVO até a 1ª visita. */
function featureButton(profile: Profile, id: FeatureId, detail = ''): string {
  const def = FEATURES[id];
  if (!isFeatureUnlocked(profile, id)) return `<button class="hub-locked" disabled>🔒 ${def.name} <small>${def.lockedHint}</small></button>`;
  const badge = isFeatureNew(profile, id) ? '<span class="new-badge">NOVO</span>' : '';
  return `<button data-action="${id}">${badge}${def.name}${detail ? ` <small>${detail}</small>` : ''}</button>`;
}

export interface MenuHandlers {
  /** Tela das Relíquias (quando existir). */
  onRelics?: () => void;
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
  // herói em moldura dourada com o nome; criaturas vizinhas da mesma raça agrupadas sob o nome da raça
  const hero = `<div class="hub-hero-pick" title="Herói: ${HEROES[profile.selectedHero].name}"><small>Herói</small><canvas class="team-mini" data-sprite="${profile.selectedHero}" data-skin="${heroSkin(profile, profile.selectedHero).id}"></canvas><span>${HEROES[profile.selectedHero].name}</span></div>`;
  // cada criatura com o selo da raça no canto (nome e raça no hover)
  const creatures = profile.team
    .map((id) => `<span class="crew-member" title="${CREATURES[id].name} · ${CREATURES[id].race}"><canvas class="team-mini" data-sprite="${id}"></canvas><canvas class="race-badge" data-race="${CREATURES[id].race}"></canvas></span>`)
    .join('');
  const team = `${hero}<div class="hub-crew">${creatures}</div>`;

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
        <button data-action="heroes">Herói <small>${HEROES[profile.selectedHero].name}</small></button>
        <button data-action="team">Equipes <small>${profile.loadouts[profile.activeLoadout]?.name ?? ''} · ${profile.team.length} de ${TEAM_SIZE}</small></button>
        <button data-action="collection">Coleção <small>${CREATURE_IDS.filter((id) => profile.ownedCreatures.includes(id)).length} de ${CREATURE_IDS.length}</small></button>
        ${featureButton(profile, 'talents', `${profile.essence} ✦`)}
        ${featureButton(profile, 'achievements', `${profile.achievements.length} de ${ACHIEVEMENT_IDS.length}`)}
        ${featureButton(profile, 'codex', `${CODEX_ENEMIES.filter((id) => profile.seenEnemies.includes(id)).length} de ${CODEX_ENEMIES.length} vistos`)}
        ${featureButton(profile, 'sanctuary', `${Object.values(profile.fragments).reduce((a, b) => a + b, 0)} ❖ para gastar`)}
        ${featureButton(profile, 'nexus', 'modelo e cor')}
        ${featureButton(profile, 'altar')}
        ${featureButton(profile, 'relics', `${activeRelics(profile).length} de ${relicSlots(profile)} equipadas · ${profile.relics.length} de ${RELIC_IDS.length}`)}
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
      relics: () => handlers.onRelics?.(),
    },
  );
  const map = document.querySelector<HTMLCanvasElement>('.hub-stage-map');
  if (map) paintStageThumbnail(map, stage);
}
