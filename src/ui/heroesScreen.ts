import { currentTab, setTab } from './tabs';
import { ALL_HERO_IDS, HEROES, type HeroId } from '../data/heroes';
import { ACHIEVEMENTS } from '../data/achievements';
import { skinsOf } from '../data/skins';
import { heroSkin, isSkinUnlocked, ownsHero, type Profile } from '../game/profile';
import { confirmPurchaseHtml, essence } from './currency';
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

/** Rodapé da ficha: escolhido, escolher ou o botão de desbloquear (que pede confirmação). */
function footerHtml(profile: Profile, id: HeroId): string {
  if (profile.selectedHero === id) return '<span class="cc-tag">✓ Herói escolhido</span>';
  if (ownsHero(profile, id)) return `<button class="play-button" data-action="select" data-value="${id}">Escolher</button>`;
  const cost = HEROES[id].cost ?? 0;
  return `<button data-action="ask" data-value="${id}"${profile.essence >= cost ? '' : ' disabled'}>Desbloquear ${essence(cost)}</button>`;
}

export interface HeroScreenOptions {
  /** Herói recém-desbloqueado (em destaque). */
  justUnlocked?: HeroId;
  /** Redesenho da mesma tela (compra, escolha, skin): não volta ao topo. */
  keepScroll?: boolean;
}

/**
 * Heróis jogáveis, um por raça (modelo Soulstone Survivors): retratos à esquerda; à direita o herói
 * grande, a história, ataque, Pulso, bônus de raça, atributos, skins e escolher/desbloquear.
 */
export function showHeroes(profile: Profile, handlers: HeroHandlers, options: HeroScreenOptions = {}): void {
  const ids = ALL_HERO_IDS.filter((id) => !HEROES[id].gift || ownsHero(profile, id));
  if (options.justUnlocked) setTab('heroes', options.justUnlocked);
  if (!options.keepScroll && !options.justUnlocked) setTab('heroes', profile.selectedHero);
  const shown = currentTab('heroes', ids.map((id) => ({ id, label: HEROES[id].name }))) as HeroId;

  const roster = ids
    .map((id) => {
      const owned = ownsHero(profile, id);
      const classes = ['hero-pick', id === shown ? 'active' : '', owned ? '' : 'locked', profile.selectedHero === id ? 'chosen' : ''].filter(Boolean).join(' ');
      return `<button class="${classes}" data-action="tab" data-value="${id}" style="--card-color:${HEROES[id].color}" title="${HEROES[id].name} · ${HEROES[id].race}">
        <canvas data-sprite="${id}" data-skin="${heroSkin(profile, id).id}"${owned ? '' : ' data-silhouette'}></canvas>
        <span>${owned ? '' : '🔒 '}${HEROES[id].name}</span>
        ${profile.selectedHero === id ? '<small class="hero-pick-badge">✓</small>' : ''}
      </button>`;
    })
    .join('');

  const def = HEROES[shown];
  const owned = ownsHero(profile, shown);
  const showcase = `<section class="hero-showcase${owned ? '' : ' locked'}${options.justUnlocked === shown ? ' just-unlocked' : ''}" data-card="${shown}" style="--card-color:${def.color}">
      <div class="hero-stage">
        <canvas data-sprite="${shown}" data-skin="${heroSkin(profile, shown).id}"${owned ? '' : ' data-silhouette'}></canvas>
        <div class="hero-stats"><span title="Vida máxima">♥ ${def.maxHp} de vida</span><span title="Velocidade de movimento">➹ ${def.speed} de velocidade</span></div>
      </div>
      <div class="hero-info">
        <div class="hero-title"><h3>${def.name}</h3><span>${def.race}</span></div>
        <p class="hero-tagline">${def.description}</p>
        <p class="hero-lore">${def.lore}</p>
        <div class="hero-kit">
          <div><b>Ataque</b><p>${attackText(def)}</p></div>
          <div><b>Pulso</b><p>${pulseText(def)}</p></div>
          <div class="race-bonus"><b>Bônus de raça</b><p>${raceBonusText(def.race, def.raceBonus)}</p></div>
        </div>
        <div class="skin-row">${skinRow(profile, shown, owned)}</div>
        <div class="cc-footer">${footerHtml(profile, shown)}</div>
      </div>
    </section>`;

  const footer = (id: string) => element.querySelector<HTMLElement>(`[data-card="${id}"] .cc-footer`);
  const element = showOverlay(
    `<div class="panel screen heroes-screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Heróis</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      <div class="heroes-layout">
        <nav class="hero-roster">${roster}</nav>
        ${showcase}
      </div>
    </div>`,
    {
      ask: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = confirmPurchaseHtml(id, HEROES[id as HeroId].cost ?? 0, profile.essence);
      },
      cancel: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = footerHtml(profile, id as HeroId);
      },
      buy: (id) => handlers.onBuy(id as HeroId),
      select: (id) => handlers.onSelect(id as HeroId),
      skin: (id) => handlers.onSkin(id),
      tab: (id) => {
        setTab('heroes', id);
        showHeroes(profile, handlers, { keepScroll: true });
      },
      back: () => handlers.onBack(),
    },
    { keepScroll: options.keepScroll },
  );
}
