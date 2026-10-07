import { ALL_CREATURE_IDS, CREATURES } from '../data/creatures';
import { SYNERGIES } from '../data/synergies';
import { noSynergy, type RunState } from './state';

/** Quantas classes cada raça tem (para mostrar "2/3"). */
export const raceClassCount = (race: string): number => ALL_CREATURE_IDS.filter((id) => CREATURES[id].race === race).length;

/** Classes diferentes de cada raça em campo (criaturas engolidas não contam). */
export function racesInField(state: RunState): Record<string, number> {
  const seen: Record<string, Set<string>> = {};
  for (const c of state.creatures) {
    if ((c.swallowTimer ?? 0) > 0) continue;
    (seen[c.def.race] ??= new Set()).add(c.def.id);
  }
  return Object.fromEntries(Object.entries(seen).map(([race, ids]) => [race, ids.size]));
}

/** Recalcula as Sinergias ativas e os bônus; avisa quando uma raça sobe ou desce de nível. */
export function updateSynergies(state: RunState): void {
  const bonus = noSynergy();
  if (!state.synergiesOn) {
    state.modifiers.synergy = bonus;
    return;
  }
  const field = racesInField(state);
  for (const race of Object.keys(SYNERGIES)) {
    const count = field[race] ?? 0;
    const tier = count >= 3 ? 2 : count >= 2 ? 1 : 0;
    const before = state.synergyTiers[race] ?? 0;
    if (tier !== before) {
      state.synergyTiers[race] = tier;
      if (tier > before) state.events.push({ type: 'synergyUp', race, tier });
    }
    if (!tier) continue;
    const def = SYNERGIES[race]!;
    const value = def.values[tier - 1]!;
    switch (def.kind) {
      case 'damage':
        bonus.damage += value;
        break;
      case 'heroLifesteal':
        bonus.heroLifesteal += value;
        break;
      case 'area':
        bonus.area += value;
        break;
      case 'range':
        bonus.range += value;
        break;
      case 'nexusArmor':
        bonus.nexusArmor += value;
        break;
      case 'raise':
        bonus.raise += value;
        break;
      case 'attackSpeed':
        bonus.attackSpeed[race] = value;
        break;
      case 'armorIgnore':
        bonus.armorIgnore[race] = value;
        break;
      case 'effectDuration':
        bonus.effectDuration[race] = value;
        break;
      case 'effectChance':
        bonus.effectChance[race] = value;
        break;
      case 'vsBoss':
        bonus.vsBoss[race] = value;
        break;
      case 'crit':
        bonus.critChance[race] = value;
        bonus.critDamage[race] = def.critDamage?.[tier - 1] ?? 0;
        break;
    }
  }
  state.modifiers.synergy = bonus;
}
