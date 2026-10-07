// Passivas de raça: valem sempre para as criaturas daquela raça (independem do herói e das sinergias).

export type RacePassive =
  /** Evoluir custa menos ouro (fração). */
  | { kind: 'evolveDiscount'; value: number }
  /** Golpes agarram o alvo: não desliza no gelo e fica mais lento (fração) por alguns segundos. */
  | { kind: 'grip'; slow: number; duration: number };

export interface RacePassiveDef {
  name: string;
  passive: RacePassive;
}

export const RACE_PASSIVES: Partial<Record<string, RacePassiveDef>> = {
  // Disciplina: a raça inicial evolui mais barato e chega antes ao nível 3
  Humano: { name: 'Disciplina', passive: { kind: 'evolveDiscount', value: 0.4 } },
  // Garras: o alvo não escapa (nem deslizando no gelo da Tundra)
  Lobisomem: { name: 'Garras', passive: { kind: 'grip', slow: 0.25, duration: 1.2 } },
};

/** Desconto de evolução da passiva da raça (0 se não tiver). */
export function raceEvolveDiscount(race: string): number {
  const def = RACE_PASSIVES[race];
  return def?.passive.kind === 'evolveDiscount' ? def.passive.value : 0;
}

/** Garras da raça (null se não tiver). */
export function raceGrip(race: string): Extract<RacePassive, { kind: 'grip' }> | null {
  const def = RACE_PASSIVES[race];
  return def?.passive.kind === 'grip' ? def.passive : null;
}
