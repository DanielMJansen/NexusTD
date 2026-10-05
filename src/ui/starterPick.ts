import { CREATURES, CREATURE_IDS, isMystical, type CreatureId } from '../data/creatures';
import type { Profile } from '../game/profile';
import { abilityText } from './describe';
import { showOverlay } from './overlay';

/** Criaturas místicas que podem ser o primeiro companheiro (as que ainda não estão na coleção). */
export function starterOptions(profile: Profile): CreatureId[] {
  return CREATURE_IDS.filter((id) => isMystical(CREATURES[id]) && !profile.ownedCreatures.includes(id));
}

/** Precisa escolher o primeiro companheiro? (Ninguém começa sem uma criatura mística.) */
export const needsStarter = (profile: Profile): boolean =>
  !profile.ownedCreatures.some((id) => isMystical(CREATURES[id])) && starterOptions(profile).length > 0;

/** Escolha única de uma criatura mística gratuita para a coleção. */
export function showStarterPick(profile: Profile, onPick: (id: CreatureId) => void): void {
  const cards = starterOptions(profile)
    .map((id) => {
      const def = CREATURES[id];
      return `<button class="choice" style="--card-color:${def.color}" data-action="pick" data-value="${id}">
        <canvas data-sprite="${id}"></canvas>
        <span class="choice-kind">${def.race}</span>
        <span class="choice-name">${def.name}</span>
        <span class="choice-detail"><i>${def.role}</i><br>${abilityText(def.ability)}</span>
      </button>`;
    })
    .join('');
  showOverlay(
    `<div class="panel wide">
      <h2>Escolha seu primeiro companheiro</h2>
      <p class="subtitle">Uma criatura mística entra de graça na sua coleção e na sua equipe.</p>
      <div class="choices">${cards}</div>
    </div>`,
    { pick: (id) => onPick(id as CreatureId) },
  );
}
