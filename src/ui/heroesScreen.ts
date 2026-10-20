import { currentTab, setTab } from './tabs';
import { ALL_HERO_IDS, HEROES, type HeroId } from '../data/heroes';
import { ACHIEVEMENTS } from '../data/achievements';
import { skinsOf } from '../data/skins';
import { heroSkin, isSkinUnlocked, ownsHero, type Profile } from '../game/profile';
import { confirmPurchaseHtml, essence } from './currency';
import { attackText, heroFightText, pulseText, raceBonusText } from './describe';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

export interface HeroHandlers {
  onBuy(id: HeroId): void;
  onSelect(id: HeroId): void;
  onSkin(skinId: string): void;
  onBack(): void;
}

/**
 * Skins do herói: liberadas por conquistas; clicar escolhe. Embaixo do nome, como se libera.
 * Passar o mouse mostra a skin no herói grande da ficha (inclusive as bloqueadas).
 * Bloqueadas não usam `disabled` (botão desabilitado não recebe o mouse): ficam sem ação e com a classe `locked`.
 */
function skinRow(profile: Profile, hero: HeroId, owned: boolean): string {
  const current = heroSkin(profile, hero).id;
  return skinsOf(hero)
    .map((skin) => {
      const unlocked = isSkinUnlocked(profile, skin);
      const how = skin.unlockedBy ? t('Conquista: {name}', { name: ACHIEVEMENTS[skin.unlockedBy].name }) : t('Padrão');
      const title = skin.unlockedBy ? `${ACHIEVEMENTS[skin.unlockedBy].name}: ${ACHIEVEMENTS[skin.unlockedBy].description}` : skin.name;
      const usable = unlocked && owned;
      return `<button class="skin${skin.id === current ? ' selected' : ''}${unlocked ? '' : ' locked'}" ${usable ? 'data-action="skin" ' : ''}data-preview="${skin.id}" data-value="${skin.id}" title="${title}"${usable || !unlocked ? '' : ' disabled'}>
        <canvas data-sprite="${hero}" data-skin="${skin.id}"${unlocked ? '' : ' data-silhouette'}></canvas>
        <span>${unlocked ? '' : '🔒 '}${skin.name}</span><small>${unlocked ? (skin.id === current ? t('✓ Em uso') : how) : how}</small></button>`;
    })
    .join('');
}

/** Rodapé da ficha: escolhido, escolher ou o botão de desbloquear (que pede confirmação). */
function footerHtml(profile: Profile, id: HeroId): string {
  if (profile.selectedHero === id) return `<span class="cc-tag">${t('✓ Herói escolhido')}</span>`;
  if (ownsHero(profile, id)) return `<button class="play-button" data-action="select" data-value="${id}">${t('Escolher')}</button>`;
  const cost = HEROES[id].cost ?? 0;
  return `<button data-action="ask" data-value="${id}"${profile.essence >= cost ? '' : ' disabled'}>${t('Desbloquear')} ${essence(cost)}</button>`;
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
      return `<button class="${classes}" data-action="tab" data-value="${id}" style="--card-color:${HEROES[id].color}" title="${HEROES[id].name} · ${t(HEROES[id].race)}">
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
        <canvas class="hero-big" data-sprite="${shown}" data-skin="${heroSkin(profile, shown).id}"${owned ? '' : ' data-silhouette'}></canvas>
        <div class="hero-stats"><span title="${t('Vida máxima')}">♥ ${t('{n} de vida', { n: def.maxHp })}</span><span title="${t('Velocidade de movimento')}">➹ ${t('{n} de velocidade', { n: def.speed })}</span></div>
      </div>
      <div class="hero-info">
        <div class="hero-title"><h3>${def.name}</h3><span><canvas class="inline-badge" data-race="${def.race}"></canvas>${t(def.race)} · ${def.role}</span></div>
        <p class="hero-tagline">${def.description}</p>
        <p class="hero-lore">${def.lore}</p>
        <p class="hero-fight">${heroFightText(def)}</p>
        <div class="hero-kit">
          <div><b>${t('Ataque')}</b><p>${attackText(def)}</p></div>
          <div><b>${t('Pulso')}</b><p>${pulseText(def)}</p></div>
          <div class="race-bonus"><b>${t('Bônus de raça')}</b><p>${raceBonusText(def.race, def.raceBonus)}</p></div>
        </div>
        <div class="skin-row">${skinRow(profile, shown, owned)}</div>
        <div class="cc-footer">${footerHtml(profile, shown)}</div>
      </div>
    </section>`;

  const footer = (id: string) => element.querySelector<HTMLElement>(`[data-card="${id}"] .cc-footer`);
  const element = showOverlay(
    `<div class="panel screen heroes-screen">
      <div class="screen-head">
        <button data-action="back">${t('← Voltar')}</button>
        <h2>${t('Heróis')}</h2>
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
  // prévia da skin no herói grande ao passar o mouse; ao sair, volta à skin em uso
  const big = element.querySelector<HTMLCanvasElement>('.hero-big');
  const inUse = heroSkin(profile, shown).id;
  for (const button of element.querySelectorAll<HTMLElement>('[data-preview]')) {
    button.addEventListener('mouseenter', () => {
      if (!big) return;
      big.dataset.skin = button.dataset.preview!;
      delete big.dataset.silhouette;
    });
    button.addEventListener('mouseleave', () => {
      if (!big) return;
      big.dataset.skin = inUse;
      if (!owned) big.dataset.silhouette = '';
    });
  }
}
