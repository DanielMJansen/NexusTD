// Evolução de criaturas em campo, paga com ouro durante a run.

export interface EvolutionLevel {
  /** Custo para chegar a este nível = custo base da criatura × costMultiplier. */
  costMultiplier: number;
  /** Multiplicadores sobre os atributos base da criatura. */
  damage: number;
  range: number;
  /** Escala do sprite (só visual). */
  scale: number;
}

/** Índice 0 = nível 1 (recém-invocada). O último nível usa a forma evoluída (`ascended`). */
export const EVOLUTION_LEVELS: EvolutionLevel[] = [
  { costMultiplier: 0, damage: 1, range: 1, scale: 1 },
  { costMultiplier: 1.5, damage: 1.5, range: 1.1, scale: 1.08 },
  { costMultiplier: 3, damage: 2.2, range: 1.2, scale: 1.18 },
];

export const MAX_CREATURE_LEVEL = EVOLUTION_LEVELS.length;
