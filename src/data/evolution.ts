// Evolução de criaturas em campo, paga com ouro durante a run.

export interface EvolutionLevel {
  /** Custo para chegar a este nível = custo de invocação daquela cópia × costMultiplier. */
  costMultiplier: number;
  /** Multiplicadores sobre os atributos base da criatura. */
  damage: number;
  range: number;
  /** Escala do sprite (só visual). */
  scale: number;
  /** Multiplicador da velocidade de ataque (estrelas). */
  attackSpeed?: number;
}

/**
 * Índice 0 = nível 1 (recém-invocada). No nível 3 (ASCENDED_LEVEL) a criatura vira a forma evoluída
 * (`ascended`, escolhendo a vertente); os níveis 4 e 5 são **estrelas**: bem mais caras, +15% de dano e +5% de
 * velocidade de ataque cada. Uma criatura **despertada** (Santuário) em ★5 vira a Forma Suprema da vertente.
 */
export const EVOLUTION_LEVELS: EvolutionLevel[] = [
  { costMultiplier: 0, damage: 1, range: 1, scale: 1 },
  { costMultiplier: 1.5, damage: 1.5, range: 1.1, scale: 1.08 },
  { costMultiplier: 3, damage: 2.2, range: 1.2, scale: 1.18 },
  { costMultiplier: 10, damage: 2.53, range: 1.2, scale: 1.22, attackSpeed: 1.05 },
  { costMultiplier: 24, damage: 2.91, range: 1.2, scale: 1.26, attackSpeed: 1.1 },
];

/** Nível da forma evoluída (escolha da vertente); os seguintes são estrelas. */
export const ASCENDED_LEVEL = 3;

/** Quantas criaturas podem chegar à Forma Suprema (★5) na mesma run; as outras param em ★4. */
export const SUPREME_PER_RUN = 2;

export const MAX_CREATURE_LEVEL = EVOLUTION_LEVELS.length;
