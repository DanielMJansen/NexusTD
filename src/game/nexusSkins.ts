import { findNexusColor, NEXUS_MODELS, type NexusColorDef, type NexusLook, type NexusModelId } from '../data/nexusSkins';
import type { StageId } from '../data/stages';
import type { Profile } from './profile';

// Skins do Nexus no perfil: o que está liberado, compra com Essência e escolha (por fase).

const DEFAULT_LOOK: NexusLook = { model: 'map', color: 'original' };

/** Aparência escolhida para a fase (padrão: modelo do mapa, cores originais). */
export function nexusLookFor(profile: Profile, stage: StageId): NexusLook {
  return profile.nexusLooks[stage] ?? DEFAULT_LOOK;
}

export function isNexusModelUnlocked(profile: Profile, id: NexusModelId): boolean {
  const stage = NEXUS_MODELS[id].stage;
  return stage === null || (profile.stageRecords[stage]?.wins ?? 0) > 0;
}

export function isNexusColorUnlocked(profile: Profile, color: NexusColorDef): boolean {
  if (color.unlock.kind === 'achievement') return profile.achievements.includes(color.unlock.id);
  return profile.nexusColors.includes(color.id);
}

export function buyNexusColor(profile: Profile, id: string, stage: StageId): boolean {
  const color = findNexusColor(id);
  if (!color || color.unlock.kind !== 'essence' || isNexusColorUnlocked(profile, color) || profile.essence < color.unlock.cost) return false;
  profile.essence -= color.unlock.cost;
  profile.nexusColors.push(id);
  profile.nexusLooks[stage] = { ...nexusLookFor(profile, stage), color: id };
  return true;
}

/** Escolhe modelo ('map' = o da fase) e/ou cor ('original'). */
export function selectNexusLook(profile: Profile, stage: StageId, change: { model?: NexusModelId | 'map'; color?: string }): boolean {
  if (change.model && change.model !== 'map' && !isNexusModelUnlocked(profile, change.model)) return false;
  if (change.color && change.color !== 'original') {
    const color = findNexusColor(change.color);
    if (!color || !isNexusColorUnlocked(profile, color)) return false;
  }
  profile.nexusLooks[stage] = { ...nexusLookFor(profile, stage), ...change };
  return true;
}
