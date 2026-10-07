// Passivas de raça: valem sempre para as criaturas daquela raça (independem do herói e das sinergias).

export type RacePassive =
  /** Evoluir custa menos ouro (fração). */
  | { kind: 'evolveDiscount'; value: number }
  /**
   * Golpes ignoram armadura e agarram o alvo (não desliza no gelo, fica mais lento por alguns segundos).
   * leap: sem alvo no alcance, salta até um inimigo a até `range`, golpeia (dano × `damage`) e volta; recarga em segundos.
   */
  | { kind: 'grip'; slow: number; duration: number; leap?: { range: number; cooldown: number; damage: number } }
  /** Imunes a teia, maldição, atordoamento, congelamento e a ser engolidas. */
  | { kind: 'pure' };

export interface RacePassiveDef {
  name: string;
  passive: RacePassive;
}

export const RACE_PASSIVES: Partial<Record<string, RacePassiveDef>> = {
  // Disciplina: a raça inicial evolui mais barato e chega antes ao nível 3
  Humano: { name: 'Disciplina', passive: { kind: 'evolveDiscount', value: 0.4 } },
  // Pureza: nada prende um unicórnio (raça exclusiva, por código de presente)
  Unicórnio: { name: 'Pureza', passive: { kind: 'pure' } },
  // Caçada: garras que rasgam e prendem, e o salto que alcança quem fica longe (chefes que atiram de longe)
  Lobisomem: { name: 'Caçada', passive: { kind: 'grip', slow: 0.25, duration: 1.2, leap: { range: 190, cooldown: 10, damage: 1 } } },
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

/** A raça é imune a controle (Pureza)? */
export const racePure = (race: string): boolean => RACE_PASSIVES[race]?.passive.kind === 'pure';
