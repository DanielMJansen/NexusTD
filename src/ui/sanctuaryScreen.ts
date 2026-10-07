import { currentTab, setTab, tabsHtml, type Tab } from './tabs';
import { ALL_CREATURE_IDS, CREATURES, type CreatureId } from '../data/creatures';
import { SANCTUARY, sanctuaryCost } from '../data/sanctuary';
import { canAwaken, type Profile } from '../game/profile';
import { racesInOrder } from './collection';
import { crystals, fragments } from './currency';
import { showOverlay } from './overlay';

export interface SanctuaryHandlers {
  onUpgrade(id: CreatureId): void;
  onBack(): void;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

function bonusText(level: number, awakened: boolean): string {
  if (!level) return 'Sem bônus ainda';
  const text = `+${pct(SANCTUARY.damagePerLevel * level)} de dano · +${pct(SANCTUARY.attackSpeedPerLevel * level)} de vel. de ataque`;
  return awakened ? `${text} · <b class="awakened">Desperta: +${pct(SANCTUARY.awakenBonus)} e Forma Suprema em ★5</b>` : text;
}

function footerHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const cost = sanctuaryCost(level);
  const race = CREATURES[id].race;
  if (cost === null) {
    if (profile.awakened.includes(id)) return '<span class="cc-tag awakened">✦ Desperta</span>';
    return `<button class="awaken-button" data-action="ask" data-value="${id}"${canAwaken(profile, id) ? '' : ' disabled'}>✦ Despertar ${fragments(SANCTUARY.awakenCost)} + ${crystals(SANCTUARY.awakenCrystals)}</button>`;
  }
  const enough = (profile.fragments[race] ?? 0) >= cost;
  return `<button data-action="ask" data-value="${id}"${enough ? '' : ' disabled'}>Fortalecer ${fragments(cost)}</button>`;
}

function confirmHtml(profile: Profile, id: CreatureId): string {
  const level = profile.sanctuary[id] ?? 0;
  const awaken = sanctuaryCost(level) === null;
  const cost = sanctuaryCost(level) ?? SANCTUARY.awakenCost;
  const race = CREATURES[id].race;
  return `<div class="cc-confirm">
    <span>${awaken ? `Despertar por ${fragments(cost)} + ${crystals(SANCTUARY.awakenCrystals)}?` : `Nível ${level + 1} por ${fragments(cost)}?`} Sobram ${fragments((profile.fragments[race] ?? 0) - cost, race)}</span>
    <button data-action="cancel" data-value="${id}">Cancelar</button>
    <button class="play-button" data-action="buy" data-value="${id}">Confirmar</button>
  </div>`;
}

/** Santuário: nível permanente das criaturas da coleção, pago com Fragmentos da raça. */
export function showSanctuary(profile: Profile, handlers: SanctuaryHandlers, highlight?: CreatureId): void {
  const races = racesInOrder(profile).filter((race) => ALL_CREATURE_IDS.some((id) => CREATURES[id].race === race && profile.ownedCreatures.includes(id)));
  const tabs: Tab[] = races.map((race) => ({ id: race, label: race, badge: `${profile.fragments[race] ?? 0} ❖`, color: CREATURES[ALL_CREATURE_IDS.find((id) => CREATURES[id].race === race)!].color }));
  if (highlight) setTab('sanctuary', CREATURES[highlight].race);
  const shownRace = currentTab('sanctuary', tabs);
  const groups = tabsHtml(tabs, shownRace) + [shownRace]
    .map((race) => {
      const owned = ALL_CREATURE_IDS.filter((id) => CREATURES[id].race === race && profile.ownedCreatures.includes(id));
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
              <small>${bonusText(level, profile.awakened.includes(id))}</small>
              ${profile.awakened.includes(id) ? '' : `<small class="awaken-path">✦ Despertar: Santuário ${level}/${SANCTUARY.maxLevel} · ${fragments(SANCTUARY.awakenCost)} · ${crystals(SANCTUARY.awakenCrystals)} <em>(você tem ${crystals(profile.crystals)})</em></small>`}
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
      <p class="subtitle">Fragmentos caem a partir da Fase 2, das raças que você usa na run (ondas vencidas + ${SANCTUARY.perBoss} por chefe). Cada nível dá +${pct(SANCTUARY.damagePerLevel)} de dano e +${pct(SANCTUARY.attackSpeedPerLevel)} de velocidade de ataque, para sempre. No nível máximo, <b>Despertar</b> (${SANCTUARY.awakenCost} ❖ + ${SANCTUARY.awakenCrystals} Cristais Ancestrais) dá +${pct(SANCTUARY.awakenBonus)} de dano e de velocidade e libera a <b>Forma Suprema</b> (★5, até 2 por run). Cristais: 1 por vitória a partir da Fase 2 e 1 a cada ${SANCTUARY.crystalEveryEndlessWaves} ondas do Sem Fim. Você tem ${crystals(profile.crystals)}.</p>
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
      tab: (id) => {
        setTab('sanctuary', id);
        showSanctuary(profile, handlers);
      },
      back: () => handlers.onBack(),
    },
    { keepScroll: highlight !== undefined },
  );
}
