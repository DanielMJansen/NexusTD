import { TALENT_IDS, TALENTS, type TalentEffectKind, type TalentId } from '../data/talents';

/** Soma dos efeitos de todos os talentos comprados, por tipo de efeito. */
export type TalentBonuses = Record<TalentEffectKind, number>;

export type TalentLevels = Partial<Record<TalentId, number>>;

const ZERO: TalentBonuses = {
  nexusMaxHp: 0,
  nexusHeal: 0,
  nexusRegen: 0,
  nexusWard: 0,
  startGold: 0,
  incomeInterval: 0,
  evolveDiscount: 0,
  killGold: 0,
  damage: 0,
  attackSpeed: 0,
  range: 0,
  creatureSlots: 0,
  heroDamage: 0,
  pulseCooldown: 0,
  heroSpeed: 0,
  pulseRadius: 0,
  essenceGain: 0,
  victoryEssence: 0,
  essencePerWave: 0,
  heroRespawn: 0,
  heroXp: 0,
};

export const noTalentBonuses = (): TalentBonuses => ({ ...ZERO });

export function talentBonuses(levels: TalentLevels): TalentBonuses {
  const bonuses = noTalentBonuses();
  for (const id of TALENT_IDS) {
    const level = levels[id] ?? 0;
    const { kind, perLevel } = TALENTS[id].effect;
    bonuses[kind] += perLevel * level;
  }
  return bonuses;
}
