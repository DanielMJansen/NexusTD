import { findNexusColor, NEXUS_MODELS, type NexusColorDef, type NexusModelId } from '../data/nexusSkins';
import type { Profile } from './profile';

// Skins do Nexus no perfil: o que está liberado, compra com Essência e escolha.

export function isNexusModelUnlocked(profile: Profile, id: NexusModelId): boolean {
  const stage = NEXUS_MODELS[id].stage;
  return stage === null || (profile.stageRecords[stage]?.wins ?? 0) > 0;
}

export function isNexusColorUnlocked(profile: Profile, color: NexusColorDef): boolean {
  if (color.unlock.kind === 'achievement') return profile.achievements.includes(color.unlock.id);
  return profile.nexusColors.includes(color.id);
}

export function buyNexusColor(profile: Profile, id: string): boolean {
  const color = findNexusColor(id);
  if (!color || color.unlock.kind !== 'essence' || isNexusColorUnlocked(profile, color) || profile.essence < color.unlock.cost) return false;
  profile.essence -= color.unlock.cost;
  profile.nexusColors.push(id);
  profile.nexusLook.color = id;
  return true;
}

/** Escolhe modelo ('map' = o da fase) e/ou cor ('original'). */
export function selectNexusLook(profile: Profile, change: { model?: NexusModelId | 'map'; color?: string }): boolean {
  if (change.model && change.model !== 'map' && !isNexusModelUnlocked(profile, change.model)) return false;
  if (change.color && change.color !== 'original') {
    const color = findNexusColor(change.color);
    if (!color || !isNexusColorUnlocked(profile, color)) return false;
  }
  profile.nexusLook = { ...profile.nexusLook, ...change };
  return true;
}
