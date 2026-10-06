// Altar de Variantes: sorteio cosmético pago com Essência (liberado ao vencer a Fase 2). Não dá poder.

export type VariantTier = 'rare' | 'epic' | 'legendary';
export const VARIANT_TIERS: VariantTier[] = ['rare', 'epic', 'legendary'];

export interface VariantLook {
  name: string;
  color: string;
  /** Filtro de cor aplicado ao sprite inteiro (uma vez, na camada). */
  filter: string;
  /** Brilho ao redor do sprite (Épica e Lendária). */
  glow?: string;
  /** Faíscas ao redor (Lendária). */
  sparkles?: boolean;
}

export const VARIANTS: Record<VariantTier, VariantLook> = {
  rare: { name: 'Rara', color: '#6ab8ff', filter: 'hue-rotate(150deg) saturate(1.25)' },
  epic: { name: 'Épica', color: '#c08aff', filter: 'hue-rotate(250deg) saturate(1.5) brightness(1.05)', glow: '#c08aff' },
  legendary: {
    name: 'Lendária',
    color: '#ffd25a',
    filter: 'sepia(0.55) saturate(2.4) hue-rotate(-12deg) brightness(1.12)',
    glow: '#ffd25a',
    sparkles: true,
  },
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
