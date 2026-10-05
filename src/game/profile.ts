import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import { TALENTS, talentMaxLevel, type TalentId } from '../data/talents';
import type { RunSetup } from './state';
import { talentBonuses, type TalentLevels } from './talents';

/** Vagas da equipe levada para a run (atalhos 1–6). */
export const TEAM_SIZE = 6;

/** Progresso permanente do jogador (o que é salvo entre runs). */
export interface Profile {
  essence: number;
  /** Nível comprado de cada talento. */
  talents: TalentLevels;
  /** Coleção: criaturas que o jogador possui (inclui as gratuitas). */
  ownedCreatures: CreatureId[];
  /** Equipe da próxima run (subconjunto da coleção, na ordem dos atalhos). */
  team: CreatureId[];
}

/** Criaturas que já vêm na coleção. */
export const STARTER_CREATURES = CREATURE_IDS.filter((id) => CREATURES[id].unlock.kind === 'start');

export function createProfile(): Profile {
  return { essence: 0, talents: {}, ownedCreatures: [...STARTER_CREATURES], team: [...STARTER_CREATURES] };
}

// ---------- talentos ----------

export const talentLevel = (profile: Profile, id: TalentId): number => profile.talents[id] ?? 0;

export const isTalentMaxed = (profile: Profile, id: TalentId): boolean => talentLevel(profile, id) >= talentMaxLevel(id);

/** Custo do próximo nível; null se já está no máximo. */
export function talentCost(profile: Profile, id: TalentId): number | null {
  return TALENTS[id].costs[talentLevel(profile, id)] ?? null;
}

/** O pré-requisito (nível mínimo no nó pai) foi cumprido? */
export function isTalentAvailable(profile: Profile, id: TalentId): boolean {
  const req = TALENTS[id].requires;
  return !req || talentLevel(profile, req.id) >= req.level;
}

export function canBuyTalent(profile: Profile, id: TalentId): boolean {
  const cost = talentCost(profile, id);
  return cost !== null && isTalentAvailable(profile, id) && profile.essence >= cost;
}

export function buyTalent(profile: Profile, id: TalentId): boolean {
  const cost = talentCost(profile, id);
  if (cost === null || !canBuyTalent(profile, id)) return false;
  profile.essence -= cost;
  profile.talents[id] = talentLevel(profile, id) + 1;
  return true;
}

// ---------- coleção e equipe ----------

export const ownsCreature = (profile: Profile, id: CreatureId): boolean => profile.ownedCreatures.includes(id);

export function unlockCreature(profile: Profile, id: CreatureId): boolean {
  const unlock = CREATURES[id].unlock;
  if (unlock.kind !== 'essence' || ownsCreature(profile, id) || profile.essence < unlock.cost) return false;
  profile.essence -= unlock.cost;
  profile.ownedCreatures.push(id);
  if (profile.team.length < TEAM_SIZE) profile.team.push(id);
  return true;
}

/** Primeiro companheiro: uma criatura mística de presente (só quando ainda não há nenhuma). */
export function grantStarterCreature(profile: Profile, id: CreatureId): boolean {
  if (ownsCreature(profile, id)) return false;
  profile.ownedCreatures.push(id);
  if (profile.team.length < TEAM_SIZE) profile.team.push(id);
  return true;
}

/** Adiciona ou remove da equipe. Devolve false se não deu (equipe cheia ou criatura não possuída). */
export function toggleTeamMember(profile: Profile, id: CreatureId): boolean {
  if (profile.team.includes(id)) {
    profile.team = profile.team.filter((c) => c !== id);
    return true;
  }
  if (!ownsCreature(profile, id) || profile.team.length >= TEAM_SIZE) return false;
  profile.team.push(id);
  return true;
}

export function runSetup(profile: Profile): RunSetup {
  return {
    talents: talentBonuses(profile.talents),
    team: profile.team.filter((id) => ownsCreature(profile, id)),
  };
}
