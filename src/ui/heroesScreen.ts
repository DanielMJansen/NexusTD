import { HERO_IDS, HEROES, type HeroDef, type HeroId, type RaceBonus } from '../data/heroes';
import { ownsHero, type Profile } from '../game/profile';
import { essence } from './currency';
import { formatNumber } from './describe';
import { showOverlay } from './overlay';

export interface HeroHandlers {
  onBuy(id: HeroId): void;
  onSelect(id: HeroId): void;
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
  }
}

function attackText(def: HeroDef): string {
  const a = def.attack;
  const area = a.pattern.kind === 'cone' ? 'em leque (todos à frente)' : 'num alvo';
  const heal = a.healPerHit > 0 ? ` Cada golpe cura ${formatNumber(a.healPerHit)} do Nexus.` : '';
  return `${a.damage} de dano ${area} a cada ${formatNumber(a.cooldown)} s, alcance ${a.range}.${heal}`;
}

function pulseText(def: HeroDef): string {
  const p = def.pulse;
  const heal = p.healPerEnemy > 0 ? ` Cura ${p.healPerEnemy} do Nexus por inimigo atingido.` : '';
  return `<b>${p.name}</b>: ${p.damage} de dano num raio de ${p.radius}, recarga ${p.cooldown} s.${heal}`;
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
      <div class="cc-portraits"><canvas data-sprite="${id}"${owned ? '' : ' data-silhouette'}></canvas></div>
      <div class="cc-body">
        <div class="cc-head"><b>${def.name}</b><span>${def.race}</span></div>
        <p class="cc-desc">${def.description}</p>
        <p class="cc-ability"><b>Ataque:</b> ${attackText(def)}</p>
        <p class="cc-ability"><b>Pulso</b> — ${pulseText(def)}</p>
        <p class="cc-ability evolved"><b>Bônus de raça</b> — ${raceBonusText(def.race, def.raceBonus)}</p>
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
      back: () => handlers.onBack(),
    },
  );
}
