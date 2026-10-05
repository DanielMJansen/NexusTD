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
  const goal = finalBoss ? `Derrote o ${ENEMIES[finalBoss.enemy].name} na onda ${finalBoss.wave}.` : '';

  const upgrades = META_UPGRADE_IDS.map((id) => {
    const def = META_UPGRADES[id];
    const level = profile.metaLevels[id];
    const cost = metaUpgradeCost(profile, id);
    const maxed = isMetaUpgradeMaxed(profile, id);
    const pips = '●'.repeat(level) + '○'.repeat(def.maxLevel - level);
    return `<button class="row" data-action="buy" data-value="${id}"${disabledIf(maxed || profile.essence < cost)}>
      <span>${def.text}<br>${pips}</span><b>${maxed ? 'MÁX' : `${cost} ✦`}</b></button>`;
  }).join('');

  const creatures = CREATURE_IDS.map((id) => {
    const def = CREATURES[id];
    if (def.unlock.kind !== 'essence') return '';
    const owned = ownsCreature(profile, id);
    return `<button class="row" data-action="unlock" data-value="${id}"${disabledIf(owned || profile.essence < def.unlock.cost)}>
      <span>${def.race} ${def.name}</span><b>${owned ? '✔' : `${def.unlock.cost} ✦`}</b></button>`;
  }).join('');

  showOverlay(
    `<div class="title">${GAME_TITLE}</div>
    <p>✦ Essência: <b>${profile.essence}</b></p>
    <p>${goal}<br>Mova o herói tocando/segurando ou com setas/WASD. Arraste uma carta para posicionar; toque numa criatura para vendê-la.</p>
    <p><b>Melhorias</b></p>${upgrades}
    <p><b>Criaturas iniciais</b></p>${creatures}
    <button class="selected" data-action="play">▶ JOGAR</button>`,
    {
      buy: (id) => handlers.onBuyUpgrade(id as MetaUpgradeId),
      unlock: (id) => handlers.onUnlockCreature(id as CreatureId),
      play: () => handlers.onPlay(),
    },
  );
}
