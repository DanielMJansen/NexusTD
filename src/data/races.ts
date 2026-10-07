// Passivas de raça: valem sempre para as criaturas daquela raça (independem do herói e das sinergias).

export type RacePassive =
  /** Evoluir custa menos ouro (fração). */
  { kind: 'evolveDiscount'; value: number };

export interface RacePassiveDef {
  name: string;
  passive: RacePassive;
}

export const RACE_PASSIVES: Partial<Record<string, RacePassiveDef>> = {
  // Disciplina: a raça inicial evolui mais barato e chega antes ao nível 3
  Humano: { name: 'Disciplina', passive: { kind: 'evolveDiscount', value: 0.4 } },
};

/** Desconto de evolução da passiva da raça (0 se não tiver). */
export function raceEvolveDiscount(race: string): number {
  const def = RACE_PASSIVES[race];
  return def?.passive.kind === 'evolveDiscount' ? def.passive.value : 0;
}
