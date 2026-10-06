import { CREATURE_IDS, CREATURES, type CreatureId } from '../data/creatures';
import { SANCTUARY, sanctuaryCost } from '../data/sanctuary';
import type { Profile } from '../game/profile';
import { racesInOrder } from './collection';
import { fragments } from './currency';
import { showOverlay } from './overlay';

export interface SanctuaryHandlers {
  onUpgrade(id: CreatureId): void;
  onBack(): void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

function bonusText(level: number): string {
  if (!level) return 'Sem bônus ainda';
  return `+${pct(SANCTUARY.damagePerLevel * level)} de dano · +${pct(SANCTUARY.attackSpeedPerLevel * level)} de vel. de ataque`;
}

function footerHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const cost = sanctuaryCost(level);
  if (cost === null) return '<span class="cc-tag">✓ Nível máximo</span>';
  const race = CREATURES[id].race;
  const enough = (profile.fragments[race] ?? 0) >= cost;
  return `<button data-action="ask" data-value="${id}"${enough ? '' : ' disabled'}>Fortalecer ${fragments(cost)}</button>`;
}

function confirmHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const cost = sanctuaryCost(level) ?? 0;
  const race = CREATURES[id].race;
  return `<div class="cc-confirm">
    <span>Nível ${level + 1} por ${fragments(cost)}? Sobram ${fragments((profile.fragments[race] ?? 0) - cost, race)}</span>
    <button data-action="cancel" data-value="${id}">Cancelar</button>
    <button class="play-button" data-action="buy" data-value="${id}">Confirmar</button>
  </div>`;
}

/** Santuário: nível permanente das criaturas da coleção, pago com Fragmentos da raça. */
export function showSanctuary(profile: Profile, handlers: SanctuaryHandlers, highlight?: CreatureId): void {
  const groups = racesInOrder()
    .map((race) => {
      const owned = CREATURE_IDS.filter((id) => CREATURES[id].race === race && profile.ownedCreatures.includes(id));
      if (!owned.length) return '';
      const cards = owned
        .map((id) => {
          const def = CREATURES[id];
          const level = profile.sanctuary[id] ?? 0;
          const stars = '★'.repeat(level) + '☆'.repeat(SANCTUARY.maxLevel - level);
          return `<div class="sanctuary-card${highlight === id ? ' just-unlocked' : ''}" data-card="${id}" style="--card-color:${def.color}">
            <canvas data-sprite="${id}"></canvas>
            <div class="sanctuary-body">
              <b>${def.name}</b>
              <span class="sanctuary-stars">${stars}</span>
              <small>${bonusText(level)}</small>
              <div class="cc-footer">${footerHtml(profile, id)}</div>
            </div>
          </div>`;
        })
        .join('');
      return `<h3>${race} <span class="sanctuary-balance">${fragments(profile.fragments[race] ?? 0)}</span></h3><div class="sanctuary-grid">${cards}</div>`;
    })
    .join('');
  const footer = (id: string) => element.querySelector<HTMLElement>(`[data-card="${id}"] .cc-footer`);
  const element = showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Santuário</h2>
        <div></div>
      </div>
      <p class="subtitle">Fragmentos caem a partir da Fase 2, das raças que você usa na run (ondas vencidas + ${SANCTUARY.perBoss} por chefe). Cada nível dá +${pct(SANCTUARY.damagePerLevel)} de dano e +${pct(SANCTUARY.attackSpeedPerLevel)} de velocidade de ataque, para sempre.</p>
      ${groups}
    </div>`,
    {
      ask: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = confirmHtml(profile, id as CreatureId);
      },
      cancel: (id) => {
        const target = footer(id);
        if (target) target.innerHTML = footerHtml(profile, id as CreatureId);
      },
      buy: (id) => handlers.onUpgrade(id as CreatureId),
      back: () => handlers.onBack(),
    },
    { keepScroll: highlight !== undefined },
  );
}
