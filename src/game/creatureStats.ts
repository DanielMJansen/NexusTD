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

/** Bônus do herói que vale para esta criatura (mesma raça), ou 0. */
function raceBonusValue(creature: Creature, modifiers: Modifiers, kind: 'damage' | 'range'): number {
  const { race, bonus } = modifiers.raceBonus;
  return creature.def.race === race && bonus.kind === kind ? bonus.value : 0;
}

export const creatureDamage = (creature: Creature, modifiers: Modifiers): number =>
  creature.def.damage *
  levelInfo(creature).damage *
  modifiers.damage *
  (1 + raceBonusValue(creature, modifiers, 'damage') + (modifiers.raceDamage[creature.def.race] ?? 0));

/** Ataques por segundo com melhorias, bônus de raça e aura (sem frenesi). */
export function creatureAttacksPerSecond(creature: Creature, modifiers: Modifiers): number {
  const { race, bonus } = modifiers.raceBonus;
  const raceSpeed = bonus.kind === 'attackSpeed' && creature.def.race === race ? bonus.value : 0;
  return (modifiers.attackSpeed * (1 + raceSpeed + creature.auraBonus)) / creature.def.cooldown;
}

export const creatureRange = (creature: Creature, modifiers: Modifiers): number =>
  creature.def.range * levelInfo(creature).range * modifiers.range * (1 + raceBonusValue(creature, modifiers, 'range'));
