import { ASCENSION, MAX_ASCENSION } from '../data/ascension';
import { RELIC_SLOTS, type RelicId } from '../data/relics';
import { withRelicBonuses } from './relics';
import { GIFT_IDS, GIFTS, type GiftId } from '../data/gifts';
import { ALL_CREATURE_IDS } from '../data/creatures';
import { ALL_HERO_IDS, HEROES as GIFT_HEROES } from '../data/heroes';
import { nexusLookFor } from './nexusSkins';
import type { NexusLook } from '../data/nexusSkins';
import { LOADOUTS } from '../data/config';
import type { VariantTier } from '../data/altar';
import { FIRST_STAGE, STAGE_IDS, STAGES, type StageId } from '../data/stages';
import { SANCTUARY, sanctuaryCost } from '../data/sanctuary';
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
  /** Fases cujo tutorial (quadro de mecânicas) já foi visto. */
  seenStageIntros: StageId[];
  /** Tutoriais de telas já vistos (ex.: 'sanctuary'). */
  seenTutorials: string[];
  /** Presentes resgatados por código (conteúdo exclusivo). */
  gifts: GiftId[];
  /** Onda mais alta alcançada (inclui o Sem Fim). */
  bestWave: number;
  /** Fragmentos de raça (Santuário). */
  fragments: Record<string, number>;
  /** Cristais Ancestrais (moeda rara do Despertar). */
  crystals: number;
  /** Nível do Santuário de cada criatura (0 a 5). */
  sanctuary: Partial<Record<CreatureId, number>>;
  /** Criaturas despertadas no Santuário (bônus permanente e Forma Suprema em ★5). */
  awakened: CreatureId[];
  /** Altar: variantes obtidas, variante usada e contadores de garantia. */
  variants: Partial<Record<CreatureId, VariantTier[]>>;
  selectedVariants: Partial<Record<CreatureId, VariantTier>>;
  altarPity: { epic: number; legendary: number };
  /** Skins do Nexus por fase (modelo 'map' = o da fase) e cores compradas/ganhas no Altar. */
  nexusLooks: Partial<Record<StageId, NexusLook>>;
  nexusColors: string[];
  /** Fase escolhida para a próxima run. */
  selectedStage: StageId;
  /** Recordes por fase (vitórias e onda mais alta). */
  stageRecords: Partial<Record<StageId, StageRecord>>;
  /** Relíquias possuídas, equipadas e chefes já abatidos com elas liberadas (1º abate garante uma). */
  relics: RelicId[];
  equippedRelics: RelicId[];
  relicBosses: EnemyId[];
  /** Ascensão por fase: maior nível liberado e o escolhido para a próxima run. */
  ascension: Partial<Record<StageId, { unlocked: number; selected: number }>>;
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
    seenStageIntros: [],
    seenTutorials: [],
    gifts: [],
    bestWave: 0,
    selectedStage: FIRST_STAGE,
    fragments: {},
    crystals: 0,
    sanctuary: {},
    awakened: [],
    variants: {},
    selectedVariants: {},
    altarPity: { epic: 0, legendary: 0 },
    nexusLooks: {},
    nexusColors: [],
    stageRecords: {},
    relics: [],
    equippedRelics: [],
    relicBosses: [],
    ascension: {},
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

/** Move uma criatura da equipe da posição `from` para `to` (ordem dos atalhos 1–8). */
export function moveTeamMember(profile: Profile, from: number, to: number): boolean {
  if (from === to || from < 0 || to < 0 || from >= profile.team.length || to >= profile.team.length) return false;
  const [id] = profile.team.splice(from, 1);
  profile.team.splice(to, 0, id!);
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

// ---------- Ascensão ----------

/** A Ascensão aparece depois de vencer a Cidadela. */
export const ascensionOpen = (profile: Profile): boolean => (profile.stageRecords[ASCENSION.unlockStage]?.wins ?? 0) > 0;

/** Maior nível de Ascensão liberado numa fase (0 se a fase não foi vencida ou a Ascensão está fechada). */
export function ascensionUnlocked(profile: Profile, stage: StageId): number {
  if (!ascensionOpen(profile) || (profile.stageRecords[stage]?.wins ?? 0) <= 0) return 0;
  return Math.max(1, Math.min(MAX_ASCENSION, profile.ascension[stage]?.unlocked ?? 1));
}

/** Nível escolhido para a próxima run nessa fase (limitado ao liberado). */
export const selectedAscension = (profile: Profile, stage: StageId): number =>
  Math.min(profile.ascension[stage]?.selected ?? 0, ascensionUnlocked(profile, stage));

export function selectAscension(profile: Profile, stage: StageId, level: number): boolean {
  if (level < 0 || level > ascensionUnlocked(profile, stage)) return false;
  profile.ascension[stage] = { unlocked: ascensionUnlocked(profile, stage), selected: level };
  return true;
}

// ---------- Relíquias ----------

/** Relíquias liberadas ao chegar no Deserto (vencer a Tundra). */
export const relicsUnlocked = (profile: Profile): boolean => isStageUnlocked(profile, 'desert');

/** Vagas: 1 ao liberar, 2 ao vencer o Deserto, 3 na onda 30 do Sem Fim do Deserto. */
export function relicSlots(profile: Profile): number {
  if (!relicsUnlocked(profile)) return 0;
  const desert = profile.stageRecords.desert;
  return 1 + ((desert?.wins ?? 0) > 0 ? 1 : 0) + ((desert?.bestWave ?? 0) >= RELIC_SLOTS.desertEndlessWave ? 1 : 0);
}

/** Relíquias que valem na próxima run (equipadas, possuídas e dentro das vagas). */
export const activeRelics = (profile: Profile): RelicId[] =>
  profile.equippedRelics.filter((id) => profile.relics.includes(id)).slice(0, relicSlots(profile));

/** Equipa ou desequipa uma Relíquia; sem vaga livre, não equipa. */
export function toggleRelic(profile: Profile, id: RelicId): boolean {
  if (!profile.relics.includes(id)) return false;
  if (profile.equippedRelics.includes(id)) {
    profile.equippedRelics = profile.equippedRelics.filter((r) => r !== id);
    return true;
  }
  if (activeRelics(profile).length >= relicSlots(profile)) return false;
  profile.equippedRelics = [...activeRelics(profile), id];
  return true;
}

/** O Santuário aparece quando alguma fase que dá Fragmentos foi liberada. */
export function hasSanctuary(profile: Profile): boolean {
  return STAGE_IDS.some((id) => STAGES[id].fragments && isStageUnlocked(profile, id));
}

/** Sobe o nível do Santuário de uma criatura da coleção, pagando Fragmentos da raça; no máximo, desperta. */
export function upgradeSanctuary(profile: Profile, id: CreatureId): boolean {
  if (!ownsCreature(profile, id)) return false;
  const level = profile.sanctuary[id] ?? 0;
  const cost = sanctuaryCost(level);
  const race = CREATURES[id].race;
  if (cost === null) {
    // Despertar: depois do nível máximo
    if (!canAwaken(profile, id)) return false;
    profile.fragments[race] = (profile.fragments[race] ?? 0) - SANCTUARY.awakenCost;
    profile.crystals -= SANCTUARY.awakenCrystals;
    profile.awakened.push(id);
    return true;
  }
  if ((profile.fragments[race] ?? 0) < cost) return false;
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
    awakened: [...profile.awakened],
    synergies: isStageUnlocked(profile, 'tundra'),
    variants: { ...profile.selectedVariants },
    nexusLook: { ...nexusLookFor(profile, isStageUnlocked(profile, profile.selectedStage) ? profile.selectedStage : FIRST_STAGE) },
    talents: withRelicBonuses(talentBonuses(profile.talents), activeRelics(profile)),
    ascension: selectedAscension(profile, isStageUnlocked(profile, profile.selectedStage) ? profile.selectedStage : FIRST_STAGE),
    relics: { unlocked: relicsUnlocked(profile), owned: [...profile.relics], firstKills: [...profile.relicBosses], equipped: activeRelics(profile) },
    team: profile.team.filter((id) => ownsCreature(profile, id)),
    hero: ownsHero(profile, profile.selectedHero) ? profile.selectedHero : STARTER_HERO,
    heroPalette: heroSkin(profile, profile.selectedHero).palette,
  };
}

/** SHA-256 em hex (Web Crypto). */
export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Libera um presente: criaturas e herói exclusivos entram na coleção. */
export function grantGift(profile: Profile, gift: GiftId): void {
  if (!profile.gifts.includes(gift)) profile.gifts.push(gift);
  for (const id of ALL_CREATURE_IDS) {
    const unlock = CREATURES[id].unlock;
    if (unlock.kind === 'gift' && unlock.gift === gift && !profile.ownedCreatures.includes(id)) profile.ownedCreatures.push(id);
  }
  for (const id of ALL_HERO_IDS) {
    if (GIFT_HEROES[id].gift === gift && !profile.ownedHeroes.includes(id)) profile.ownedHeroes.push(id);
  }
}

/** Confere um código de presente; devolve o presente liberado (ou null se o código não vale). */
export async function redeemGiftCode(profile: Profile, code: string): Promise<GiftId | null> {
  const hash = await sha256(code.trim().toUpperCase());
  const gift = GIFT_IDS.find((id) => GIFTS[id].hash === hash);
  if (!gift) return null;
  grantGift(profile, gift);
  return gift;
}

/** Dá para despertar? (nível máximo do Santuário, Fragmentos da raça e Cristais Ancestrais) */
export function canAwaken(profile: Profile, id: CreatureId): boolean {
  return (
    ownsCreature(profile, id) &&
    !profile.awakened.includes(id) &&
    (profile.sanctuary[id] ?? 0) >= SANCTUARY.maxLevel &&
    (profile.fragments[CREATURES[id].race] ?? 0) >= SANCTUARY.awakenCost &&
    profile.crystals >= SANCTUARY.awakenCrystals
  );
}
