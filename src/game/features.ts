import { FEATURES, type FeatureId } from '../data/features';
import type { Profile } from './profile';

// Liberação progressiva das telas do menu.

/** Chave do tutorial da 1ª visita (o Santuário usa a que já existia). */
export const featureTutorialKey = (id: FeatureId): string => (id === 'sanctuary' ? 'sanctuary' : `feature:${id}`);

export function isFeatureUnlocked(profile: Profile, id: FeatureId): boolean {
  const condition = FEATURES[id].condition;
  switch (condition.kind) {
    case 'runs':
      return profile.stats.runs >= condition.count;
    case 'stageWon':
      return (profile.stageRecords[condition.stage]?.wins ?? 0) > 0;
  }
}

/** Liberada e ainda não visitada (selo NOVO e tutorial na 1ª visita). */
export const isFeatureNew = (profile: Profile, id: FeatureId): boolean =>
  isFeatureUnlocked(profile, id) && !profile.seenTutorials.includes(featureTutorialKey(id));

/** Marca a 1ª visita. Retorna true se era a primeira. */
export function markFeatureSeen(profile: Profile, id: FeatureId): boolean {
  const key = featureTutorialKey(id);
  if (profile.seenTutorials.includes(key)) return false;
  profile.seenTutorials.push(key);
  return true;
}
