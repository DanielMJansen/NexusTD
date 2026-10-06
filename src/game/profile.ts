import type { NexusLook } from '../data/nexusSkins';
import { LOADOUTS } from '../data/config';
import type { VariantTier } from '../data/altar';
import { FIRST_STAGE, STAGE_IDS, STAGES, type StageId } from '../data/stages';
import { sanctuaryCost } from '../data/sanctuary';
import type { EnemyId } from '../data/enemies';
import { CREATURES, CREATURE_IDS, type CreatureId } from '../data/creatures';
import type { AchievementId } from '../data/achievements';
import { HEROES, STARTER_HERO, type HeroId } from '../data/heroes';
import { defaultSkin, findSkin, type SkinDef } from '../data/skins';
import { TALENTS, talentMaxLevel, type TalentId } from '../data/talents';
import type { RunSetup } from './state';
import { talentBonuses, type TalentLevels } from './talents';

/** Vagas da equipe levada para a run (atalhos 1–8). */
export const TEAM_SIZE = 8;

/** Progresso permanente do jogador (o que é salvo entre runs). */
export interface Profile {
  essence: number;
  /** Nível comprado de cada talento. */
  talents: TalentLevels;
  /** Coleção: criaturas que o jogador possui (inclui as gratuitas). */
  ownedCreatures: CreatureId[];
  /** Equipe da próxima run (subconjunto da coleção, na ordem dos atalhos). */
  team: CreatureId[];
  ownedHeroes: HeroId[];
  selectedHero: HeroId;
  /** Equipes salvas (herói + criaturas); a ativa espelha `team` e `selectedHero`. */
  loadouts: Loadout[];
  activeLoadout: number;
  /** Skin escolhida de cada herói (id da skin). */
  selectedSkins: Partial<Record<HeroId, string>>;
  achievements: AchievementId[];
  /** Totais de todas as runs. */
  stats: { runs: number; wins: number; kills: number };
  /** Inimigos já enfrentados (códex). */
  seenEnemies: EnemyId[];
  /** Onda mais alta alcançada (inclui o Sem Fim). */
  bestWave: number;
  /** Fragmentos de raça (Santuário). */
  fragments: Record<string, number>;
  /** Nível do Santuário de cada criatura (0 a 5). */
  sanctuary: Partial<Record<CreatureId, number>>;
  /** Altar: variantes obtidas, variante usada e contadores de garantia. */
  variants: Partial<Record<CreatureId, VariantTier[]>>;
  selectedVariants: Partial<Record<CreatureId, VariantTier>>;
  altarPity: { epic: number; legendary: number };
  /** Skins do Nexus: escolha (modelo 'map' = o da fase) e cores compradas/ganhas no Altar. */
  nexusLook: NexusLook;
  nexusColors: string[];
  /** Fase escolhida para a próxima run. */
  selectedStage: StageId;
  /** Recordes por fase (vitórias e onda mais alta). */
  stageRecords: Partial<Record<StageId, StageRecord>>;
}

/** Criaturas que já vêm na coleção. */
export const STARTER_CREATURES = CREATURE_IDS.filter((id) => CREATURES[id].unlock.kind === 'start');

export function createProfile(): Profile {
  const profile: Profile = {
    essence: 0,
    talents: {},
    ownedCreatures: [...STARTER_CREATURES],
    team: [...STARTER_CREATURES],
    ownedHeroes: [STARTER_HERO],
    selectedHero: STARTER_HERO,
    loadouts: [],
    activeLoadout: 0,
    selectedSkins: {},
    achievements: [],
    stats: { runs: 0, wins: 0, kills: 0 },
    seenEnemies: [],
    bestWave: 0,
    selectedStage: FIRST_STAGE,
    fragments: {},
    sanctuary: {},
    variants: {},
    selectedVariants: {},
    altarPity: { epic: 0, legendary: 0 },
    nexusLook: { model: 'map', color: 'original' },
    nexusColors: [],
    stageRecords: {},
  };
  profile.loadouts = Array.from({ length: LOADOUTS.free }, (_, i) => ({ name: loadoutName(i), hero: profile.selectedHero, team: [...profile.team] }));
  return profile;
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
  syncLoadout(profile);
  return true;
}

/** Primeiro companheiro: uma criatura mística de presente (só quando ainda não há nenhuma). */
export function grantStarterCreature(profile: Profile, id: CreatureId): boolean {
  if (ownsCreature(profile, id)) return false;
  profile.ownedCreatures.push(id);
  if (profile.team.length < TEAM_SIZE) profile.team.push(id);
  // presente inicial entra em todas as equipes salvas
  for (const loadout of profile.loadouts) if (!loadout.team.includes(id) && loadout.team.length < TEAM_SIZE) loadout.team.push(id);
  return true;
}

/** Adiciona ou remove da equipe. Devolve false se não deu (equipe cheia ou criatura não possuída). */
export function toggleTeamMember(profile: Profile, id: CreatureId): boolean {
  if (profile.team.includes(id)) {
    profile.team = profile.team.filter((c) => c !== id);
    syncLoadout(profile);
    return true;
  }
  if (!ownsCreature(profile, id) || profile.team.length >= TEAM_SIZE) return false;
  profile.team.push(id);
  syncLoadout(profile);
  return true;
}

// ---------- equipes salvas ----------

export interface Loadout {
  name: string;
  hero: HeroId;
  team: CreatureId[];
}

export const loadoutName = (index: number): string => `Equipe ${index + 1}`;

/** Grava a equipe e o herói atuais na equipe salva ativa. */
export function syncLoadout(profile: Profile): void {
  const loadout = profile.loadouts[profile.activeLoadout];
  if (!loadout) return;
  loadout.hero = profile.selectedHero;
  loadout.team = [...profile.team];
}

/** Troca para outra equipe salva (só criaturas e herói que o jogador possui). */
export function selectLoadout(profile: Profile, index: number): boolean {
  const loadout = profile.loadouts[index];
  if (!loadout) return false;
  profile.activeLoadout = index;
  profile.team = loadout.team.filter((id) => ownsCreature(profile, id)).slice(0, TEAM_SIZE);
  profile.selectedHero = ownsHero(profile, loadout.hero) ? loadout.hero : STARTER_HERO;
  syncLoadout(profile);
  return true;
}

export const loadoutSlotCost = (profile: Profile): number | null => (profile.loadouts.length >= LOADOUTS.max ? null : LOADOUTS.slotCost);

/** Compra uma vaga de equipe (começa como cópia da atual) e passa a usá-la. */
export function buyLoadoutSlot(profile: Profile): boolean {
  const cost = loadoutSlotCost(profile);
  if (cost === null || profile.essence < cost) return false;
  profile.essence -= cost;
  profile.loadouts.push({ name: loadoutName(profile.loadouts.length), hero: profile.selectedHero, team: [...profile.team] });
  profile.activeLoadout = profile.loadouts.length - 1;
  return true;
}

export function renameLoadout(profile: Profile, index: number, name: string): boolean {
  const loadout = profile.loadouts[index];
  const clean = name.replace(/[<>&"]/g, '').trim().slice(0, LOADOUTS.nameLength);
  if (!loadout) return false;
  loadout.name = clean || loadoutName(index);
  return true;
}

// ---------- heróis ----------

export const ownsHero = (profile: Profile, id: HeroId): boolean => profile.ownedHeroes.includes(id);

export function buyHero(profile: Profile, id: HeroId): boolean {
  const cost = HEROES[id].cost;
  if (cost === null || ownsHero(profile, id) || profile.essence < cost) return false;
  profile.essence -= cost;
  profile.ownedHeroes.push(id);
  profile.selectedHero = id;
  syncLoadout(profile);
  return true;
}

export function selectHero(profile: Profile, id: HeroId): boolean {
  if (!ownsHero(profile, id)) return false;
  profile.selectedHero = id;
  syncLoadout(profile);
  return true;
}

// ---------- skins ----------

export const isSkinUnlocked = (profile: Profile, skin: SkinDef): boolean =>
  skin.unlockedBy === null || profile.achievements.includes(skin.unlockedBy);

export function heroSkin(profile: Profile, hero: HeroId): SkinDef {
  const skin = findSkin(profile.selectedSkins[hero] ?? '');
  return skin && skin.hero === hero && isSkinUnlocked(profile, skin) ? skin : defaultSkin(hero);
}

export function selectSkin(profile: Profile, skinId: string): boolean {
  const skin = findSkin(skinId);
  if (!skin || !isSkinUnlocked(profile, skin)) return false;
  profile.selectedSkins[skin.hero] = skin.id;
  return true;
}

export interface StageRecord {
  wins: number;
  bestWave: number;
}

/** Fase liberada: aberta desde o início ou a anterior já foi vencida. */
export function isStageUnlocked(profile: Profile, id: StageId): boolean {
  const required = STAGES[id].requires;
  return required === null || (profile.stageRecords[required]?.wins ?? 0) > 0;
}

/** O Santuário aparece quando alguma fase que dá Fragmentos foi liberada. */
export function hasSanctuary(profile: Profile): boolean {
  return STAGE_IDS.some((id) => STAGES[id].fragments && isStageUnlocked(profile, id));
}

/** Sobe o nível do Santuário de uma criatura da coleção, pagando Fragmentos da raça. */
export function upgradeSanctuary(profile: Profile, id: CreatureId): boolean {
  if (!ownsCreature(profile, id)) return false;
  const level = profile.sanctuary[id] ?? 0;
  const cost = sanctuaryCost(level);
  const race = CREATURES[id].race;
  if (cost === null || (profile.fragments[race] ?? 0) < cost) return false;
  profile.fragments[race] = (profile.fragments[race] ?? 0) - cost;
  profile.sanctuary[id] = level + 1;
  return true;
}

export function selectStage(profile: Profile, id: StageId): boolean {
  if (!isStageUnlocked(profile, id)) return false;
  profile.selectedStage = id;
  return true;
}

export function runSetup(profile: Profile): RunSetup {
  return {
    stage: isStageUnlocked(profile, profile.selectedStage) ? profile.selectedStage : FIRST_STAGE,
    sanctuary: { ...profile.sanctuary },
    variants: { ...profile.selectedVariants },
    nexusLook: { ...profile.nexusLook },
    talents: talentBonuses(profile.talents),
    team: profile.team.filter((id) => ownsCreature(profile, id)),
    hero: ownsHero(profile, profile.selectedHero) ? profile.selectedHero : STARTER_HERO,
    heroPalette: heroSkin(profile, profile.selectedHero).palette,
  };
}
