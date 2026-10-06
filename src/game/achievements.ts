import { ACHIEVEMENT_IDS, ACHIEVEMENTS, type AchievementDef, type AchievementId } from '../data/achievements';
import { CREATURE_IDS } from '../data/creatures';
import type { Profile } from './profile';
import type { RunResult } from './state';

/** Registra o fim de uma run nas estatísticas do perfil. */
export function recordRun(profile: Profile, result: RunResult): void {
  profile.stats.runs++;
  profile.stats.kills += result.kills;
  if (result.victory) profile.stats.wins++;
}

function isMet(profile: Profile, def: AchievementDef, result: RunResult | null): boolean {
  const goal = def.goal;
  switch (goal.kind) {
    case 'win':
      return !!result?.victory && (!goal.hero || result.hero === goal.hero);
    case 'winAboveHp':
      return !!result?.victory && result.lowestNexusRatio >= goal.ratio;
    case 'ascendedAtOnce':
      return (result?.ascendedPeak ?? 0) >= goal.count;
    case 'totalKills':
      return profile.stats.kills >= goal.count;
    case 'fullCollection':
      return profile.ownedCreatures.length >= CREATURE_IDS.length;
    case 'totalRuns':
      return profile.stats.runs >= goal.count;
    case 'totalWins':
      return profile.stats.wins >= goal.count;
  }
}

/** Libera as conquistas cumpridas (com o resultado da run, se houver). Devolve as novas. */
export function checkAchievements(profile: Profile, result: RunResult | null = null): AchievementId[] {
  const unlocked = ACHIEVEMENT_IDS.filter(
    (id) => !profile.achievements.includes(id) && isMet(profile, ACHIEVEMENTS[id], result),
  );
  profile.achievements.push(...unlocked);
  return unlocked;
}

/** Progresso em texto para metas acumulativas (ex.: "350/1000"). */
export function achievementProgress(profile: Profile, id: AchievementId): string | null {
  const goal = ACHIEVEMENTS[id].goal;
  if (goal.kind === 'totalKills') return `${Math.min(profile.stats.kills, goal.count)}/${goal.count}`;
  if (goal.kind === 'fullCollection') return `${profile.ownedCreatures.length}/${CREATURE_IDS.length}`;
  if (goal.kind === 'totalRuns') return `${Math.min(profile.stats.runs, goal.count)}/${goal.count}`;
  if (goal.kind === 'totalWins') return `${Math.min(profile.stats.wins, goal.count)}/${goal.count}`;
  return null;
}
