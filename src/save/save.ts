import { CREATURE_IDS, type CreatureId } from '../data/creatures';
import { ACHIEVEMENT_IDS } from '../data/achievements';
import { HERO_IDS, STARTER_HERO, type HeroId } from '../data/heroes';
import { findSkin } from '../data/skins';
import { TALENT_IDS, talentMaxLevel, type TalentId } from '../data/talents';
import { createProfile, STARTER_CREATURES, TEAM_SIZE, type Profile } from '../game/profile';

const SAVE_KEY = 'nx4';
/** Versão do formato do perfil (vai junto nos arquivos exportados). */
export const PROFILE_VERSION = 4;

/** Saves antigos continuam no armazenamento (não são apagados) e são migrados ao carregar. */
const V3_KEY = 'nx3';
const V2_KEY = 'nx2';

interface SaveFile {
  version: number;
  profile: unknown;
}

/** Formato v3: melhorias permanentes fixas e criaturas compradas. */
interface ProfileV3 {
  essence?: unknown;
  metaLevels?: { damage?: unknown; nexusHp?: unknown; startGold?: unknown };
  unlockedCreatures?: unknown;
}

/** As três melhorias da v3 viraram as raízes da árvore de talentos (mesmo nível). */
const V3_TO_TALENT = { damage: 'armyDamage', nexusHp: 'nexusVitality', startGold: 'startingGold' } as const;

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return sanitize((JSON.parse(raw) as SaveFile).profile);
    const v3 = localStorage.getItem(V3_KEY);
    if (v3) return migrateV3((JSON.parse(v3) as SaveFile).profile as ProfileV3);
    const v2 = localStorage.getItem(V2_KEY);
    if (v2) return migrateV3(v2ToV3(JSON.parse(v2)));
  } catch {
    // Save corrompido ou localStorage bloqueado: começa do zero.
  }
  return createProfile();
}

/** Apaga o perfil (e os saves antigos que seriam migrados de novo). */
export function deleteProfile(): void {
  try {
    for (const key of [SAVE_KEY, V3_KEY, V2_KEY]) localStorage.removeItem(key);
  } catch {
    // nada a apagar
  }
}

export function saveProfile(profile: Profile): void {
  try {
    const file: SaveFile = { version: PROFILE_VERSION, profile };
    localStorage.setItem(SAVE_KEY, JSON.stringify(file));
  } catch {
    // Sem localStorage (aba privada etc.): o jogo segue sem salvar.
  }
}

/** Perfil vindo de um arquivo importado; lança erro legível se a versão não for suportada. */
export function profileFromData(data: unknown, version: unknown): Profile {
  if (typeof version !== 'number' || version > PROFILE_VERSION) {
    throw new Error('Esse save é de uma versão mais nova do jogo.');
  }
  return version >= 4 ? sanitize(data) : migrateV3(data as ProfileV3);
}

/** Protótipo v2: { ess, up: { d, h, e }, un: { V, D, G } }. */
function v2ToV3(old: { ess?: unknown; up?: Record<string, unknown>; un?: Record<string, unknown> }): ProfileV3 {
  const creatures: Record<string, CreatureId> = { V: 'duelist', D: 'fireDragon', G: 'iceDragon' };
  return {
    essence: old.ess,
    metaLevels: { damage: old.up?.d, nexusHp: old.up?.h, startGold: old.up?.e },
    unlockedCreatures: Object.entries(creatures)
      .filter(([key]) => old.un?.[key])
      .map(([, id]) => id),
  };
}

function migrateV3(old: ProfileV3 | undefined): Profile {
  const talents: Partial<Record<TalentId, number>> = {};
  for (const [oldId, talentId] of Object.entries(V3_TO_TALENT)) {
    talents[talentId] = toNumber(old?.metaLevels?.[oldId as keyof typeof V3_TO_TALENT]);
  }
  const owned = [...STARTER_CREATURES, ...(Array.isArray(old?.unlockedCreatures) ? old.unlockedCreatures : [])];
  return sanitize({ essence: old?.essence, talents, ownedCreatures: owned, team: owned });
}

/** Garante um perfil válido mesmo com dados velhos, de outra versão ou editados à mão. */
function sanitize(data: unknown): Profile {
  const raw = (data ?? {}) as Partial<Record<keyof Profile, unknown>>;
  const profile = createProfile();
  profile.essence = Math.floor(toNumber(raw.essence));

  const talents = (raw.talents ?? {}) as Record<string, unknown>;
  for (const id of TALENT_IDS) {
    const level = Math.min(talentMaxLevel(id), Math.floor(toNumber(talents[id])));
    if (level > 0) profile.talents[id] = level;
  }

  const owned = new Set<CreatureId>([...STARTER_CREATURES, ...validCreatures(raw.ownedCreatures)]);
  profile.ownedCreatures = CREATURE_IDS.filter((id) => owned.has(id));
  const team = [...new Set(validCreatures(raw.team))].filter((id) => owned.has(id)).slice(0, TEAM_SIZE);
  profile.team = team.length ? team : profile.ownedCreatures.slice(0, TEAM_SIZE);

  const heroes = Array.isArray(raw.ownedHeroes) ? raw.ownedHeroes : [];
  profile.ownedHeroes = HERO_IDS.filter((id) => id === STARTER_HERO || heroes.includes(id));
  const selected = raw.selectedHero as HeroId;
  profile.selectedHero = profile.ownedHeroes.includes(selected) ? selected : STARTER_HERO;

  const achievements = Array.isArray(raw.achievements) ? raw.achievements : [];
  profile.achievements = ACHIEVEMENT_IDS.filter((id) => achievements.includes(id));
  const stats = (raw.stats ?? {}) as Record<string, unknown>;
  profile.stats = { runs: toNumber(stats.runs), wins: toNumber(stats.wins), kills: toNumber(stats.kills) };
  const skins = (raw.selectedSkins ?? {}) as Record<string, unknown>;
  for (const hero of HERO_IDS) {
    const skin = findSkin(String(skins[hero] ?? ''));
    if (skin && skin.hero === hero) profile.selectedSkins[hero] = skin.id;
  }
  return profile;
}

function validCreatures(value: unknown): CreatureId[] {
  return Array.isArray(value) ? value.filter((id): id is CreatureId => CREATURE_IDS.includes(id)) : [];
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}
