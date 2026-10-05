import { GAME_TITLE } from '../data/config';
import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import { ENEMIES } from '../data/enemies';
import { META_UPGRADES, META_UPGRADE_IDS, type MetaUpgradeId } from '../data/upgrades';
import { WAVES } from '../data/waves';
import { isMetaUpgradeMaxed, metaUpgradeCost, ownsCreature, type Profile } from '../game/profile';
import { showOverlay } from './overlay';

export interface MenuHandlers {
  onBuyUpgrade(id: MetaUpgradeId): void;
  onUnlockCreature(id: CreatureId): void;
  onPlay(): void;
}

const disabledIf = (condition: boolean) => (condition ? ' disabled' : '');

export function showMenu(profile: Profile, handlers: MenuHandlers): void {
  const finalBoss = WAVES.bosses.at(-1);
  const goal = finalBoss
    ? `Proteja o Nexus por ${WAVES.total} ondas e derrote o <b>${ENEMIES[finalBoss.enemy].name}</b>.`
    : `Proteja o Nexus por ${WAVES.total} ondas.`;

  const upgrades = META_UPGRADE_IDS.map((id) => {
    const def = META_UPGRADES[id];
    const level = profile.metaLevels[id];
    const cost = metaUpgradeCost(profile, id);
    const maxed = isMetaUpgradeMaxed(profile, id);
    const pips = '●'.repeat(level) + '○'.repeat(def.maxLevel - level);
    return `<button class="shop-item" data-action="buy" data-value="${id}"${disabledIf(maxed || profile.essence < cost)}>
      <span>${def.text}<span class="pips">${pips}</span></span><b>${maxed ? 'MÁX' : `${cost} ✦`}</b></button>`;
  }).join('');

  const creatures = CREATURE_IDS.map((id) => {
    const def = CREATURES[id];
    if (def.unlock.kind !== 'essence') return '';
    const owned = ownsCreature(profile, id);
    return `<button class="shop-item" data-action="unlock" data-value="${id}"${disabledIf(owned || profile.essence < def.unlock.cost)}>
      <canvas data-sprite="${id}"></canvas>
      <span style="flex:1">${def.race} ${def.name}<span class="pips" style="letter-spacing:0">${def.role}</span></span>
      <b>${owned ? '✔' : `${def.unlock.cost} ✦`}</b></button>`;
  }).join('');

  showOverlay(
    `<div class="panel wide">
      <h1>${GAME_TITLE}</h1>
      <p class="subtitle">Um humano comum. Um exército de monstros.</p>
      <div class="essence">✦ ${profile.essence} de Essência</div>
      <p>${goal} Cada run começa com um <b>ovo de criatura mística</b>; outros surgem entre as ondas.</p>
      <div class="columns">
        <div><h3>Melhorias permanentes</h3>${upgrades}</div>
        <div><h3>Começar a run com</h3>${creatures}</div>
      </div>
      <button class="play-button" data-action="play">▶ Jogar</button>
    </div>`,
    {
      buy: (id) => handlers.onBuyUpgrade(id as MetaUpgradeId),
      unlock: (id) => handlers.onUnlockCreature(id as CreatureId),
      play: () => handlers.onPlay(),
    },
  );
}
