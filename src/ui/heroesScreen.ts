import { HERO_IDS, HEROES, type HeroDef, type HeroId, type RaceBonus } from '../data/heroes';
import { ACHIEVEMENTS } from '../data/achievements';
import { skinsOf } from '../data/skins';
import { heroSkin, isSkinUnlocked, ownsHero, type Profile } from '../game/profile';
import { essence } from './currency';
import { formatNumber } from './describe';
import { showOverlay } from './overlay';

export interface HeroHandlers {
  onBuy(id: HeroId): void;
  onSelect(id: HeroId): void;
  onSkin(skinId: string): void;
  onBack(): void;
}

export function raceBonusText(race: string, bonus: RaceBonus): string {
  const plural = `Criaturas da raça ${race}`;
  switch (bonus.kind) {
    case 'range':
      return `${plural}: +${Math.round(bonus.value * 100)}% de alcance.`;
    case 'damage':
      return `${plural}: +${Math.round(bonus.value * 100)}% de dano.`;
    case 'killHeal':
      return `${plural}: cada abate cura ${bonus.value} de vida do Nexus.`;
    case 'attackSpeed':
      return `${plural}: +${Math.round(bonus.value * 100)}% de velocidade de ataque.`;
    case 'armorPierce':
      return `${plural}: ignoram ${bonus.value} de armadura.`;
    case 'poisonDuration':
      return `${plural}: venenos, poças e efeitos de golpe duram +${bonus.value} s.`;
    case 'critChance':
      return `${plural}: +${Math.round(bonus.value * 100)}% de chance de crítico.`;
    case 'vsStrong':
      return `${plural}: +${Math.round(bonus.value * 100)}% de dano contra elites e chefes.`;
  }
}

function attackText(def: HeroDef): string {
  const a = def.attack;
  const area = a.pattern.kind === 'cone' ? 'em leque (todos à frente)' : 'num alvo';
  const heal =
    (a.healPerHit > 0 ? ` Cada golpe cura ${formatNumber(a.healPerHit)} do Nexus.` : '') +
    (a.pierceArmor ? ' Ignora armadura.' : '');
  return `${a.damage} de dano ${area} a cada ${formatNumber(a.cooldown)} s, alcance ${a.range}.${heal}`;
}

export function pulseText(def: HeroDef): string {
  const p = def.pulse;
  const heal = p.healPerEnemy > 0 ? ` Cura ${p.healPerEnemy} do Nexus por inimigo atingido.` : '';
  const fear = p.fear ? ` Inimigos fogem do Nexus por ${p.fear} s.` : '';
  const poison = p.poison ? ` Envenena: ${p.poison.dps}/s por ${p.poison.duration} s.` : '';
  const stun = p.stun ? ` ${p.stun.look === 'stone' ? 'Petrifica' : 'Atordoa'} por ${formatNumber(p.stun.duration)} s (chefes resistem).` : '';
  const haste = p.haste ? ` Todas as criaturas atacam ${Math.round(p.haste.amount * 100)}% mais rápido por ${formatNumber(p.haste.duration)} s.` : '';
  const raise = p.raise ? ` Ergue ${p.raise.count} esqueletos aliados por ${formatNumber(p.raise.duration)} s.` : '';
  const cost = p.selfDamage ? ` Custa ${Math.round(p.selfDamage * 100)}% da vida do herói.` : '';
  const area =
    p.shape?.kind === 'dash'
      ? `investida de ${p.shape.length} que atravessa o campo`
      : p.shape?.kind === 'cone'
        ? `leque à frente (alcance ${p.shape.length})`
        : p.shape?.kind === 'beam'
          ? `raio em linha (alcance ${p.shape.length})`
          : `raio de ${p.radius}`;
  const damage = p.damage > 0 ? `${p.damage} de dano, ` : '';
  return `<b>${p.name}</b>: ${damage}${area}, recarga ${p.cooldown} s.${heal}${fear}${poison}${stun}${haste}${raise}${cost}`;
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
