import type { CreatureAbility } from '../data/creatures';
import { EVOLUTION_LEVELS, MAX_CREATURE_LEVEL, type EvolutionLevel } from '../data/evolution';
import type { Creature, Modifiers } from './state';

// Atributos efetivos de uma criatura em campo, considerando nível e melhorias.

export const levelInfo = (creature: Creature): EvolutionLevel => EVOLUTION_LEVELS[creature.level - 1]!;

export const isAscended = (creature: Creature): boolean => creature.level >= MAX_CREATURE_LEVEL;

export const creatureAbility = (creature: Creature): CreatureAbility =>
  isAscended(creature) ? creature.def.ascended.ability : creature.def.ability;

export const creatureName = (creature: Creature): string =>
  isAscended(creature) ? creature.def.ascended.name : creature.def.name;

export const creatureDamage = (creature: Creature, modifiers: Modifiers): number =>
  creature.def.damage * levelInfo(creature).damage * modifiers.damage;

export const creatureRange = (creature: Creature, modifiers: Modifiers): number =>
  creature.def.range * levelInfo(creature).range * modifiers.range;
