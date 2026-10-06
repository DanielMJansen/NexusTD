import { ALTAR, VARIANT_TIERS, type VariantTier } from '../data/altar';
import { CREATURES, type CreatureId } from '../data/creatures';
import { STAGES } from '../data/stages';
import type { Profile } from './profile';

// Altar de Variantes (progresso permanente): sorteio, garantia e escolha da variante usada.

export type AltarResult =
  | { kind: 'refund'; amount: number }
  | { kind: 'fragments'; race: string; amount: number }
  | { kind: 'variant'; tier: VariantTier; creature: CreatureId; duplicate: false }
  | { kind: 'variant'; tier: VariantTier; creature: CreatureId; duplicate: true; race: string; amount: number };

/** O Altar abre ao vencer a Fase 2 (primeira fase que exige outra vencida e dá Fragmentos). */
export function isAltarUnlocked(profile: Profile): boolean {
  return (profile.stageRecords.swamp?.wins ?? 0) > 0 && !!STAGES.swamp;
}

export function canRollAltar(profile: Profile): boolean {
  return isAltarUnlocked(profile) && profile.essence >= ALTAR.cost && profile.ownedCreatures.length > 0;
}

const pick = <T>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)]!;

/** Um sorteio: paga, aplica a garantia, entrega o prêmio e devolve o que saiu. */
export function rollAltar(profile: Profile, random: () => number = Math.random): AltarResult | null {
  if (!canRollAltar(profile)) return null;
  profile.essence -= ALTAR.cost;
  const pity = profile.altarPity;
  pity.epic++;
  pity.legendary++;

  // garantia primeiro; senão, sorteio ponderado
  let outcome = ALTAR.outcomes[0]!;
  if (pity.legendary >= ALTAR.pity.legendary) outcome = ALTAR.outcomes.find((o) => o.kind === 'variant' && o.tier === 'legendary')!;
  else if (pity.epic >= ALTAR.pity.epic) outcome = ALTAR.outcomes.find((o) => o.kind === 'variant' && o.tier === 'epic')!;
  else {
    const total = ALTAR.outcomes.reduce((sum, o) => sum + o.weight, 0);
    let roll = random() * total;
    for (const o of ALTAR.outcomes) {
      roll -= o.weight;
      if (roll < 0) {
        outcome = o;
        break;
      }
    }
  }

  if (outcome.kind === 'refund') {
    profile.essence += outcome.amount;
    return { kind: 'refund', amount: outcome.amount };
  }
  if (outcome.kind === 'fragments') {
    const race = CREATURES[pick(profile.ownedCreatures, random)].race;
    profile.fragments[race] = (profile.fragments[race] ?? 0) + outcome.amount;
    return { kind: 'fragments', race, amount: outcome.amount };
  }
  const tier = outcome.tier;
  // Épica zera a garantia de Épica; Lendária zera as duas (Rara não conta)
  if (tier !== 'rare') pity.epic = 0;
  if (tier === 'legendary') pity.legendary = 0;
  // criatura da coleção que ainda não tem essa variante; se todas têm, vira Fragmentos
  const missing = profile.ownedCreatures.filter((id) => !(profile.variants[id] ?? []).includes(tier));
  if (!missing.length) {
    const creature = pick(profile.ownedCreatures, random);
    const race = CREATURES[creature].race;
    const amount = ALTAR.duplicateFragments[tier];
    profile.fragments[race] = (profile.fragments[race] ?? 0) + amount;
    return { kind: 'variant', tier, creature, duplicate: true, race, amount };
  }
  const creature = pick(missing, random);
  profile.variants[creature] = [...(profile.variants[creature] ?? []), tier].sort((a, b) => VARIANT_TIERS.indexOf(a) - VARIANT_TIERS.indexOf(b));
  return { kind: 'variant', tier, creature, duplicate: false };
}

/** Escolhe a variante usada na arena (null = visual normal). */
export function selectVariant(profile: Profile, id: CreatureId, tier: VariantTier | null): boolean {
  if (tier && !(profile.variants[id] ?? []).includes(tier)) return false;
  if (tier) profile.selectedVariants[id] = tier;
  else delete profile.selectedVariants[id];
  return true;
}
