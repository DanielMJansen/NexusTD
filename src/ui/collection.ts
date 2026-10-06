import { CREATURES, CREATURE_IDS, type CreatureDef, type CreatureId } from '../data/creatures';
import { ownsCreature, type Profile } from '../game/profile';
import { essence } from './currency';
import { abilityText, ascendedFormsHtml, creatureStats } from './describe';
import { showOverlay } from './overlay';

export interface CollectionHandlers {
  onBuy(id: CreatureId): void;
  onBack(): void;
}

/** Raças na ordem em que aparecem nos dados. */
export function racesInOrder(): string[] {
  return [...new Set(CREATURE_IDS.map((id) => CREATURES[id].race))];
}

function cardHtml(profile: Profile, def: CreatureDef): string {
  const owned = ownsCreature(profile, def.id);
  const inTeam = profile.team.includes(def.id);
  const stats = creatureStats(def)
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');
  let footer = '';
  if (owned) footer = `<span class="cc-tag">${inTeam ? '✓ Na equipe' : '✓ Na coleção'}</span>`;
  else if (def.unlock.kind === 'essence') {
    footer = `<button data-action="buy" data-value="${def.id}"${profile.essence >= def.unlock.cost ? '' : ' disabled'}>
      Desbloquear ${essence(def.unlock.cost)}</button>`;
  }
  return `<div class="creature-card${owned ? '' : ' locked'}" style="--card-color:${def.color}">
    <div class="cc-portraits">
      <canvas data-sprite="${def.id}"${owned ? '' : ' data-silhouette'}></canvas>
      <span class="cc-evolve-label">Nível 3</span>
      <div class="cc-branches">${def.ascended
        .map(
          (form, i) => `<figure style="--branch-color:${form.color}">
            <canvas data-sprite="${def.id}" data-level="3" data-branch="${i}"${owned ? '' : ' data-silhouette'}></canvas>
            <figcaption>${form.icon} ${form.name}</figcaption>
          </figure>`,
        )
        .join('')}</div>
    </div>
    <div class="cc-body">
      <div class="cc-head"><b>${def.name}</b><span>${def.race} · ${def.role}</span></div>
      <p class="cc-desc">${def.description}</p>
      <p class="cc-lore">“${def.lore}”</p>
      <dl class="cc-stats">${stats}</dl>
      <p class="cc-ability">${abilityText(def.ability, def.effects)}</p>
      ${ascendedFormsHtml(def)}
      <div class="cc-footer">${footer}</div>
    </div>
  </div>`;
}

/** Coleção: ficha de cada criatura, agrupada por raça; desbloqueio com Essência. */
export function showCollection(profile: Profile, handlers: CollectionHandlers): void {
  const groups = racesInOrder()
    .map((race) => {
      const cards = CREATURE_IDS.filter((id) => CREATURES[id].race === race)
        .map((id) => cardHtml(profile, CREATURES[id]))
        .join('');
      return `<h3>${race}</h3><div class="creature-grid">${cards}</div>`;
    })
    .join('');

  showOverlay(
    `<div class="panel screen">
      <div class="screen-head">
        <button data-action="back">← Voltar</button>
        <h2>Coleção</h2>
        <div class="essence">${essence(profile.essence)}</div>
      </div>
      ${groups}
    </div>`,
    { buy: (id) => handlers.onBuy(id as CreatureId), back: () => handlers.onBack() },
  );
}
