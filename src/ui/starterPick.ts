import { CREATURES, CREATURE_IDS, isMystical, type CreatureId } from '../data/creatures';
import type { Profile } from '../game/profile';
import { gold } from './currency';
import { abilityText, creatureStats } from './describe';
import { showOverlay } from './overlay';

/** Criaturas místicas que podem ser o primeiro companheiro (as que ainda não estão na coleção). */
export function starterOptions(profile: Profile): CreatureId[] {
  return CREATURE_IDS.filter((id) => isMystical(CREATURES[id]) && !profile.ownedCreatures.includes(id));
}

/** Precisa escolher o primeiro companheiro? (Ninguém começa sem uma criatura mística.) */
export const needsStarter = (profile: Profile): boolean =>
  !profile.ownedCreatures.some((id) => isMystical(CREATURES[id])) && starterOptions(profile).length > 0;

/** Escolha única de uma criatura mística gratuita: lista compacta e depois confirmação. */
export function showStarterPick(profile: Profile, onPick: (id: CreatureId) => void): void {
  const cards = starterOptions(profile)
    .map((id) => {
      const def = CREATURES[id];
      return `<button class="starter-option" style="--card-color:${def.color}" data-action="view" data-value="${id}">
        <canvas data-sprite="${id}"></canvas>
        <span class="choice-kind">${def.race}</span>
        <b>${def.name}</b>
        <small>${def.role}</small>
      </button>`;
    })
    .join('');
  showOverlay(
    `<div class="panel wide">
      <h2>Escolha seu primeiro companheiro</h2>
      <p class="subtitle">Uma criatura mística entra de graça na sua coleção e na sua equipe. Clique para ver os detalhes.</p>
      <div class="starter-grid">${cards}</div>
    </div>`,
    { view: (id) => showStarterConfirm(profile, id as CreatureId, onPick) },
  );
}

/** Ficha da criatura escolhida com os valores, pedindo confirmação. */
function showStarterConfirm(profile: Profile, id: CreatureId, onPick: (id: CreatureId) => void): void {
  const def = CREATURES[id];
  const stats = creatureStats(def)
    .filter(([label]) => label !== 'Custo')
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');
  showOverlay(
    `<div class="panel starter-confirm" style="--card-color:${def.color}">
      <canvas data-sprite="${id}"></canvas>
      <h2>${def.race} ${def.name}</h2>
      <p class="subtitle">${def.role}</p>
      <p>${def.description}</p>
      <dl class="cc-stats">${stats}<dt>Custo por unidade</dt><dd>${gold(def.baseCost)}</dd></dl>
      <p class="cc-ability">${abilityText(def.ability)}</p>
      <p class="cc-ability evolved">Nível 3 — <b>${def.ascended.name}</b>: ${abilityText(def.ascended.ability)}</p>
      <div class="row-buttons">
        <button data-action="back">← Ver outras</button>
        <button class="play-button" data-action="confirm">Escolher ${def.name}</button>
      </div>
    </div>`,
    {
      back: () => showStarterPick(profile, onPick),
      confirm: () => onPick(id),
    },
  );
}
