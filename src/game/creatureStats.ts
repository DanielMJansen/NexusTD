import { SANCTUARY } from '../data/sanctuary';
import type { AscendedForm, CreatureAbility, HitEffect } from '../data/creatures';
import { ASCENDED_LEVEL, EVOLUTION_LEVELS, MAX_CREATURE_LEVEL, type EvolutionLevel } from '../data/evolution';
import type { Creature, Modifiers } from './state';

// Atributos efetivos de uma criatura em campo, considerando nível e melhorias.

export const levelInfo = (creature: Creature): EvolutionLevel => EVOLUTION_LEVELS[creature.level - 1]!;

export const isAscended = (creature: Creature): boolean => creature.level >= ASCENDED_LEVEL;

/** Vertente escolhida, sem a Forma Suprema. */
const branchForm = (creature: Creature): AscendedForm | null =>
  isAscended(creature) ? creature.def.ascended[creature.branch === 1 ? 1 : 0] : null;

/** A vertente escolhida tem Forma Suprema definida? */
export const hasSupremeForm = (creature: Creature): boolean => !!branchForm(creature)?.supreme;

/** Forma Suprema ativa: despertada, ★5 e a vertente tem forma suprema definida. */
export const isSupreme = (creature: Creature): boolean =>
  !!creature.awakened && creature.level >= MAX_CREATURE_LEVEL && !!branchForm(creature)?.supreme;

/** Vertente escolhida (da forma evoluída em diante); na Forma Suprema, com o que ela substitui. */
export function ascendedForm(creature: Creature): AscendedForm | null {
  const form = branchForm(creature);
  if (!form || !isSupreme(creature)) return form;
  return { ...form, ...form.supreme!, ability: form.supreme!.ability ?? form.ability, effects: form.supreme!.effects ?? form.effects };
}

/** Bônus de criatura despertada (dano e velocidade de ataque). */
const awaken = (creature: Creature): number => (creature.awakened ? SANCTUARY.awakenBonus : 0);

export const creatureAbility = (creature: Creature): CreatureAbility => ascendedForm(creature)?.ability ?? creature.def.ability;

export const creatureName = (creature: Creature): string => ascendedForm(creature)?.name ?? creature.def.name;

/** Efeitos de golpe ativos: os da vertente, se ela definir, senão os da forma base. */
export const creatureEffects = (creature: Creature): readonly HitEffect[] =>
  ascendedForm(creature)?.effects ?? creature.def.effects ?? [];

/** Aceleração acumulada por abates nesta onda (Revoada Faminta). */
export function killHaste(creature: Creature): number {
  const haste = creatureEffects(creature).find((e) => e.kind === 'killHaste');
  return haste?.kind === 'killHaste' ? Math.min(haste.max, haste.perKill * creature.killStacks) : 0;
}

/** Segundos entre ataques (algumas vertentes atacam mais devagar ou mais rápido; o Santuário e as estrelas aceleram). */
export const creatureCooldown = (creature: Creature): number =>
  (creature.def.cooldown * (ascendedForm(creature)?.stats?.cooldown ?? 1)) /
  (1 + SANCTUARY.attackSpeedPerLevel * (creature.sanctuary ?? 0)) /
  (levelInfo(creature).attackSpeed ?? 1) /
  (1 + awaken(creature));

/** Bônus do herói que vale para esta criatura (mesma raça), ou 0. */
function raceBonusValue(creature: Creature, modifiers: Modifiers, kind: 'damage' | 'range'): number {
  const { race, bonus } = modifiers.raceBonus;
  return creature.def.race === race && bonus.kind === kind ? bonus.value : 0;
}

export const creatureDamage = (creature: Creature, modifiers: Modifiers): number =>
  creature.def.damage *
  levelInfo(creature).damage *
  (ascendedForm(creature)?.stats?.damage ?? 1) *
  modifiers.damage *
  (1 + creature.blessDamage) *
  (1 + SANCTUARY.damagePerLevel * (creature.sanctuary ?? 0)) *
  (1 + awaken(creature)) *
  (1 + modifiers.synergy.damage) *
  (1 + raceBonusValue(creature, modifiers, 'damage') + (modifiers.raceDamage[creature.def.race] ?? 0));

/** Ataques por segundo com melhorias, bônus de raça, auras e abates acumulados (sem frenesi). */
export function creatureAttacksPerSecond(creature: Creature, modifiers: Modifiers): number {
  const { race, bonus } = modifiers.raceBonus;
  const raceSpeed = bonus.kind === 'attackSpeed' && creature.def.race === race ? bonus.value : 0;
  return (modifiers.attackSpeed * (1 + raceSpeed + (modifiers.synergy.attackSpeed[creature.def.race] ?? 0) + creature.auraBonus + killHaste(creature))) / creatureCooldown(creature);
}

export const creatureRange = (creature: Creature, modifiers: Modifiers): number =>
  creature.def.range *
  levelInfo(creature).range *
  (ascendedForm(creature)?.stats?.range ?? 1) *
  modifiers.range *
  (1 + modifiers.synergy.range) *
  (1 + creature.blessRange) *
  (1 + raceBonusValue(creature, modifiers, 'range'));
