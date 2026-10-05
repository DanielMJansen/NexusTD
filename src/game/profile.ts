import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import { META_UPGRADES, META_UPGRADE_IDS, type MetaUpgradeId } from '../data/upgrades';
import type { RunSetup } from './state';

/** Progresso permanente do jogador (o que é salvo entre runs). */
export interface Profile {
  essence: number;
  metaLevels: Record<MetaUpgradeId, number>;
  /** Criaturas compradas com Essência (as iniciais não entram aqui). */
  unlockedCreatures: CreatureId[];
}

export function createProfile(): Profile {
  const metaLevels = Object.fromEntries(META_UPGRADE_IDS.map((id) => [id, 0])) as Record<MetaUpgradeId, number>;
  return { essence: 0, metaLevels, unlockedCreatures: [] };
}

export function metaUpgradeCost(profile: Profile, id: MetaUpgradeId): number {
  return META_UPGRADES[id].costPerLevel * (profile.metaLevels[id] + 1);
}

export function isMetaUpgradeMaxed(profile: Profile, id: MetaUpgradeId): boolean {
  return profile.metaLevels[id] >= META_UPGRADES[id].maxLevel;
}

export function buyMetaUpgrade(profile: Profile, id: MetaUpgradeId): boolean {
  const cost = metaUpgradeCost(profile, id);
  if (isMetaUpgradeMaxed(profile, id) || profile.essence < cost) return false;
  profile.essence -= cost;
  profile.metaLevels[id]++;
  return true;
}

/** Criatura disponível no início da run: inicial por padrão ou comprada. */
export function ownsCreature(profile: Profile, id: CreatureId): boolean {
  return CREATURES[id].unlock.kind === 'start' || profile.unlockedCreatures.includes(id);
}

export function unlockCreature(profile: Profile, id: CreatureId): boolean {
  const unlock = CREATURES[id].unlock;
  if (unlock.kind !== 'essence' || ownsCreature(profile, id) || profile.essence < unlock.cost) return false;
  profile.essence -= unlock.cost;
  profile.unlockedCreatures.push(id);
  return true;
}

export function runSetup(profile: Profile): RunSetup {
  return {
    metaLevels: { ...profile.metaLevels },
    unlockedCreatures: CREATURE_IDS.filter((id) => ownsCreature(profile, id)),
  };
}
