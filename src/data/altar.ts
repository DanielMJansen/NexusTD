// Altar de Variantes: sorteio cosmético pago com Essência (liberado ao vencer a Fase 2). Não dá poder.

export type VariantTier = 'rare' | 'epic' | 'legendary';
export const VARIANT_TIERS: VariantTier[] = ['rare', 'epic', 'legendary'];

/** Raridade da variante (nome e cor do selo). O visual de cada criatura vem do tema (`variantThemes`). */
export interface VariantLook {
  name: string;
  color: string;
}

export const VARIANTS: Record<VariantTier, VariantLook> = {
  rare: { name: 'Rara', color: '#6ab8ff' },
  epic: { name: 'Épica', color: '#c08aff' },
  legendary: { name: 'Lendária', color: '#ffd25a' },
};

export type AltarOutcome =
  /** Pior prêmio: devolve parte da Essência. */
  | { kind: 'refund'; amount: number; weight: number }
  /** Fragmentos de uma raça da coleção (sorteada). */
  | { kind: 'fragments'; amount: number; weight: number }
  | { kind: 'variant'; tier: VariantTier; weight: number };

export const ALTAR = {
  cost: 600,
  outcomes: [
    { kind: 'refund', amount: 200, weight: 32 },
    { kind: 'fragments', amount: 12, weight: 32 },
    { kind: 'variant', tier: 'rare', weight: 26 },
    { kind: 'variant', tier: 'epic', weight: 8.5 },
    { kind: 'variant', tier: 'legendary', weight: 1.5 },
  ] as AltarOutcome[],
  /** Garantia: no N-ésimo sorteio sem Épica (ou melhor) / sem Lendária, ela vem. */
  pity: { epic: 20, legendary: 60 },
  /** Variante repetida (ou coleção completa naquela raridade) vira Fragmentos da raça. */
  duplicateFragments: { rare: 15, epic: 30, legendary: 60 } as Record<VariantTier, number>,
};
