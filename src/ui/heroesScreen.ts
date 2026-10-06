import { HERO_IDS, HEROES, type HeroId } from '../data/heroes';
import { ACHIEVEMENTS } from '../data/achievements';
import { skinsOf } from '../data/skins';
import { heroSkin, isSkinUnlocked, ownsHero, type Profile } from '../game/profile';
import { essence } from './currency';
import { attackText, pulseText, raceBonusText } from './describe';
import { showOverlay } from './overlay';

export interface HeroHandlers {
  onBuy(id: HeroId): void;
  onSelect(id: HeroId): void;
  onSkin(skinId: string): void;
  onBack(): void;
}

/** Skins do herói: liberadas por conquistas; clicar escolhe. */
function skinRow(profile: Profile, hero: HeroId, owned: boolean): string {
  const current = heroSkin(profile, hero).id;
  return skinsOf(hero)
    .map((skin) => {
      const unlocked = isSkinUnlocked(profile, skin);
      const label = unlocked ? skin.name : `🔒 ${ACHIEVEMENTS[skin.unlockedBy!].name}`;
      const title = unlocked ? skin.name : `Conquista: ${ACHIEVEMENTS[skin.unlockedBy!].description}`;
      return `<button class="skin${skin.id === current ? ' selected' : ''}" data-action="skin" data-value="${skin.id}" title="${title}"${unlocked && owned ? '' : ' disabled'}>
        <canvas data-sprite="${hero}" data-skin="${skin.id}"${unlocked ? '' : ' data-silhouette'}></canvas>
        <span>${label}</span></button>`;
    })
    .join('');
}

/** Heróis jogáveis: um por raça; desbloqueio com Essência e escolha do herói da run. */
export function showHeroes(profile: Profile, handlers: HeroHandlers): void {
  const cards = HERO_IDS.map((id) => {
    const def = HEROES[id];
    const owned = ownsHero(profile, id);
    const selected = profile.selectedHero === id;
    let footer: string;
    if (selected) footer = '<span class="cc-tag">✓ Herói escolhido</span>';
    else if (owned) footer = `<button data-action="select" data-value="${id}">Escolher</button>`;
    else {
      const cost = def.cost ?? 0;
      footer = `<button data-action="buy" data-value="${id}"${profile.essence >= cost ? '' : ' disabled'}>Desbloquear ${essence(cost)}</button>`;
    }
    return `<div class="creature-card hero-card${owned ? '' : ' locked'}${selected ? ' selected' : ''}" style="--card-color:${def.color}">
      <div class="cc-portraits"><canvas data-sprite="${id}" data-skin="${heroSkin(profile, id).id}"${owned ? '' : ' data-silhouette'}></canvas></div>
      <div class="cc-body">
        <div class="cc-head"><b>${def.name}</b><span>${def.race}</span></div>
        <p class="cc-desc">${def.description}</p>
        <p class="cc-ability"><b>Ataque:</b> ${attackText(def)}</p>
        <p class="cc-ability"><b>Pulso</b> — ${pulseText(def)}</p>
        <p class="cc-ability evolved"><b>Bônus de raça</b> — ${raceBonusText(def.race, def.raceBonus)}</p>
        <div class="skin-row">${skinRow(profile, id, owned)}</div>
        <div class="cc-footer">${footer}</div>
      </div>
    </div>`;
  }).join('');

  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Heróis</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      <p class="subtitle">O herói luta ao lado do exército e fortalece as criaturas da sua raça.</p>
      <div class="creature-grid">${cards}</div>
    </div>`,
    {
      buy: (id) => handlers.onBuy(id as HeroId),
      select: (id) => handlers.onSelect(id as HeroId),
      skin: (id) => handlers.onSkin(id),
      back: () => handlers.onBack(),
    },
  );
}
