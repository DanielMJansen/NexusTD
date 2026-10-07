import { ACHIEVEMENT_IDS, ACHIEVEMENTS, type AchievementDef, type AchievementId } from '../data/achievements';
import { CREATURE_IDS } from '../data/creatures';
import type { Profile } from './profile';
import type { RunResult } from './state';

/** Registra o fim de uma run nas estatísticas do perfil. */
export function recordRun(profile: Profile, result: RunResult): void {
  // o Sem Fim continua uma run já contada: só soma os abates novos
  if (!result.endless) profile.stats.runs++;
  profile.stats.kills += result.kills - result.previousKills;
  if (result.victory) profile.stats.wins++;
  for (const id of result.seenEnemies) if (!profile.seenEnemies.includes(id)) profile.seenEnemies.push(id);
  profile.bestWave = Math.max(profile.bestWave, result.wave);
  for (const [race, amount] of Object.entries(result.fragments)) profile.fragments[race] = (profile.fragments[race] ?? 0) + amount;
  profile.crystals += result.crystals ?? 0;
  const record = (profile.stageRecords[result.stage] ??= { wins: 0, bestWave: 0 });
  if (result.victory) record.wins++;
  record.bestWave = Math.max(record.bestWave, result.wave);
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
      return CREATURE_IDS.every((id) => profile.ownedCreatures.includes(id));
    case 'totalRuns':
      return profile.stats.runs >= goal.count;
    case 'totalWins':
      return profile.stats.wins >= goal.count;
    case 'winNoCreatures':
      return !!result?.victory && result.creaturesPlaced === 0;
    case 'endlessWave':
      return !!result?.endless && result.wave >= goal.wave && (!goal.hero || result.hero === goal.hero);
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
  if (goal.kind === 'fullCollection') return `${CREATURE_IDS.filter((id) => profile.ownedCreatures.includes(id)).length}/${CREATURE_IDS.length}`;
  if (goal.kind === 'totalRuns') return `${Math.min(profile.stats.runs, goal.count)}/${goal.count}`;
  if (goal.kind === 'totalWins') return `${Math.min(profile.stats.wins, goal.count)}/${goal.count}`;
  return null;
}
