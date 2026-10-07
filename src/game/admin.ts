import { RELIC_IDS } from '../data/relics';
// Painel de administrador: edita o perfil local à vontade (para testar). Simulação pura: só mexe no perfil;
// quem chama salva e passa o perfil pela limpeza do save (equipe, herói e equipes salvas válidos).
import { ACHIEVEMENT_IDS, type AchievementId } from '../data/achievements';
import { VARIANT_TIERS, type VariantTier } from '../data/altar';
import { ALL_CREATURE_IDS, CREATURES, type CreatureId } from '../data/creatures';
import { GIFT_IDS, type GiftId } from '../data/gifts';
import { ALL_HERO_IDS, HEROES, STARTER_HERO, type HeroId } from '../data/heroes';
import { NEXUS_COLORS } from '../data/nexusSkins';
import { SANCTUARY } from '../data/sanctuary';
import { STAGE_IDS, type StageId } from '../data/stages';
import { TALENT_IDS, talentMaxLevel } from '../data/talents';
import { grantGift, type Profile } from './profile';

/** SHA-256 do código de administrador (o código em si não fica no jogo). */
export const ADMIN_HASH = '19d2dcb11870148b5f9da34e1f778c07bad899cdeb7906c991e10e1cd70c34c4';

const clampInt = (value: number, min: number, max = Number.MAX_SAFE_INTEGER): number =>
  Math.max(min, Math.min(max, Math.floor(Number.isFinite(value) ? value : 0)));

/** Raças que existem nos dados (inclusive as exclusivas). */
export const adminRaces = (): string[] => [...new Set(ALL_CREATURE_IDS.map((id) => CREATURES[id].race))];

export function setEssence(profile: Profile, value: number): void {
  profile.essence = clampInt(value, 0);
}

export function setCrystals(profile: Profile, value: number): void {
  profile.crystals = clampInt(value, 0);
}

export function setFragments(profile: Profile, race: string, value: number): void {
  profile.fragments[race] = clampInt(value, 0);
}

export function setCreatureOwned(profile: Profile, id: CreatureId, owned: boolean): void {
  if (owned && !profile.ownedCreatures.includes(id)) profile.ownedCreatures.push(id);
  if (!owned) {
    profile.ownedCreatures = profile.ownedCreatures.filter((c) => c !== id);
    profile.team = profile.team.filter((c) => c !== id);
    for (const l of profile.loadouts) l.team = l.team.filter((c) => c !== id);
  }
}

export function setSanctuaryLevel(profile: Profile, id: CreatureId, level: number): void {
  profile.sanctuary[id] = clampInt(level, 0, SANCTUARY.maxLevel);
  if (profile.sanctuary[id]! < SANCTUARY.maxLevel) profile.awakened = profile.awakened.filter((c) => c !== id);
}

/** Desperta (sobe o Santuário ao máximo e tem a criatura) ou desfaz. */
export function setAwakened(profile: Profile, id: CreatureId, awakened: boolean): void {
  if (awakened) {
    setCreatureOwned(profile, id, true);
    profile.sanctuary[id] = SANCTUARY.maxLevel;
    if (!profile.awakened.includes(id)) profile.awakened.push(id);
  } else profile.awakened = profile.awakened.filter((c) => c !== id);
}

export function toggleVariant(profile: Profile, id: CreatureId, tier: VariantTier): void {
  const owned = profile.variants[id] ?? [];
  if (owned.includes(tier)) {
    profile.variants[id] = owned.filter((t) => t !== tier);
    if (profile.selectedVariants[id] === tier) delete profile.selectedVariants[id];
  } else profile.variants[id] = VARIANT_TIERS.filter((t) => t === tier || owned.includes(t));
}

export function setHeroOwned(profile: Profile, id: HeroId, owned: boolean): void {
  if (owned && !profile.ownedHeroes.includes(id)) profile.ownedHeroes.push(id);
  if (!owned && id !== STARTER_HERO) {
    profile.ownedHeroes = profile.ownedHeroes.filter((h) => h !== id);
    if (profile.selectedHero === id) profile.selectedHero = STARTER_HERO;
    for (const l of profile.loadouts) if (l.hero === id) l.hero = STARTER_HERO;
  }
}

export function setAchievement(profile: Profile, id: AchievementId, done: boolean): void {
  if (done && !profile.achievements.includes(id)) profile.achievements.push(id);
  if (!done) profile.achievements = profile.achievements.filter((a) => a !== id);
}

/** Fase vencida (libera a seguinte e o modelo do Nexus da fase) ou não. */
export function setStageWon(profile: Profile, id: StageId, won: boolean): void {
  const record = (profile.stageRecords[id] ??= { wins: 0, bestWave: 0 });
  record.wins = won ? Math.max(1, record.wins) : 0;
}

export function toggleNexusColor(profile: Profile, id: string): void {
  if (profile.nexusColors.includes(id)) profile.nexusColors = profile.nexusColors.filter((c) => c !== id);
  else profile.nexusColors.push(id);
}

export function setTalentsMax(profile: Profile, max: boolean): void {
  profile.talents = {};
  if (max) for (const id of TALENT_IDS) profile.talents[id] = talentMaxLevel(id);
}

/** Presente: liberar entrega o conteúdo; remover tira o presente e o conteúdo exclusivo dele. */
export function setGift(profile: Profile, gift: GiftId, on: boolean): void {
  if (on) {
    grantGift(profile, gift);
    return;
  }
  profile.gifts = profile.gifts.filter((g) => g !== gift);
  for (const id of ALL_CREATURE_IDS) {
    const unlock = CREATURES[id].unlock;
    if (unlock.kind === 'gift' && unlock.gift === gift) setCreatureOwned(profile, id, false);
  }
  for (const id of ALL_HERO_IDS) if (HEROES[id].gift === gift) setHeroOwned(profile, id, false);
}

/** Relíquias: todas ou nenhuma (tira as equipadas junto). */
export function setAllRelics(profile: Profile, all: boolean): void {
  profile.relics = all ? [...RELIC_IDS] : [];
  if (!all) profile.equippedRelics = [];
}

/** Libera tudo: criaturas, heróis, conquistas (skins), fases, cores, talentos e presentes. */
export function unlockEverything(profile: Profile): void {
  for (const gift of GIFT_IDS) setGift(profile, gift, true);
  for (const id of ALL_CREATURE_IDS) setCreatureOwned(profile, id, true);
  for (const id of ALL_HERO_IDS) setHeroOwned(profile, id, true);
  for (const id of ACHIEVEMENT_IDS) setAchievement(profile, id, true);
  for (const id of STAGE_IDS) setStageWon(profile, id, true);
  for (const c of NEXUS_COLORS) if (c.unlock.kind !== 'achievement' && !profile.nexusColors.includes(c.id)) profile.nexusColors.push(c.id);
  setTalentsMax(profile, true);
  setAllRelics(profile, true);
}
