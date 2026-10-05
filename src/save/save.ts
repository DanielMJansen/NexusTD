import { CREATURE_IDS, type CreatureId } from '../data/creatures';
import { META_UPGRADES, META_UPGRADE_IDS } from '../data/upgrades';
import { createProfile, type Profile } from '../game/profile';

const SAVE_KEY = 'nx3';
const SAVE_VERSION = 3;
/** Save do protótipo v2: { ess, up: { d, h, e }, un: { V, D, G } }. */
const LEGACY_KEY = 'nx2';
const LEGACY_UPGRADES = { d: 'damage', h: 'nexusHp', e: 'startGold' } as const;
const LEGACY_CREATURES: Record<string, CreatureId> = { V: 'duelist', D: 'fireDragon', G: 'iceDragon' };

interface SaveFile {
  version: number;
  profile: Profile;
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return sanitize((JSON.parse(raw) as SaveFile).profile);
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return migrateLegacy(JSON.parse(legacy));
  } catch {
    // Save corrompido ou localStorage bloqueado: começa do zero.
  }
  return createProfile();
}

export function saveProfile(profile: Profile): void {
  try {
    const file: SaveFile = { version: SAVE_VERSION, profile };
    localStorage.setItem(SAVE_KEY, JSON.stringify(file));
  } catch {
    // Sem localStorage (aba privada etc.): o jogo segue sem salvar.
  }
}

function migrateLegacy(old: { ess?: unknown; up?: Record<string, unknown>; un?: Record<string, unknown> }): Profile {
  const profile = createProfile();
  profile.essence = toNumber(old.ess);
  for (const [key, id] of Object.entries(LEGACY_UPGRADES)) profile.metaLevels[id] = toNumber(old.up?.[key]);
  for (const [key, id] of Object.entries(LEGACY_CREATURES)) if (old.un?.[key]) profile.unlockedCreatures.push(id);
  return sanitize(profile);
}

/** Garante um perfil válido mesmo com dados velhos ou editados à mão. */
function sanitize(data: Partial<Profile> | undefined): Profile {
  const profile = createProfile();
  profile.essence = toNumber(data?.essence);
  for (const id of META_UPGRADE_IDS) {
    const level = Math.floor(toNumber(data?.metaLevels?.[id]));
    profile.metaLevels[id] = Math.min(META_UPGRADES[id].maxLevel, level);
  }
  const unlocked = Array.isArray(data?.unlockedCreatures) ? data.unlockedCreatures : [];
  profile.unlockedCreatures = CREATURE_IDS.filter((id) => unlocked.includes(id));
  return profile;
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}
