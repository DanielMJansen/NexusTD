// Sinergias de raça (destravadas pela Tundra): 2 ou 3 classes diferentes da mesma raça em campo dão um bônus.

export type SynergyKind =
  | 'damage'
  | 'heroLifesteal'
  | 'area'
  | 'attackSpeed'
  | 'armorIgnore'
  | 'effectDuration'
  | 'range'
  | 'nexusArmor'
  | 'raise'
  | 'effectChance'
  | 'crit'
  | 'vsBoss';

export interface SynergyDef {
  kind: SynergyKind;
  /** Valor com 2 classes e com 3 classes. */
  values: [number, number];
  /** Crítico: dano crítico extra com 2 e 3 classes. */
  critDamage?: [number, number];
  /** Texto do bônus (recebe o valor do nível). */
  text: (value: number, extra?: number) => string;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Por raça (nome usado em CREATURES[id].race). Números iniciais: calibrar com o bot. */
export const SYNERGIES: Record<string, SynergyDef> = {
  Humano: { kind: 'damage', values: [0.04, 0.08], text: (v) => `+${pct(v)} de dano de todas as criaturas` },
  Vampiro: { kind: 'heroLifesteal', values: [0.03, 0.07], text: (v) => `herói +${pct(v)} de roubo de vida` },
  Dragão: { kind: 'area', values: [0.06, 0.15], text: (v) => `dragões +${pct(v)} de área` },
  Lobisomem: { kind: 'attackSpeed', values: [0.05, 0.12], text: (v) => `lobisomens +${pct(v)} de vel. de ataque` },
  Fantasma: { kind: 'armorIgnore', values: [1, 3], text: (v) => `fantasmas ignoram ${v} de armadura` },
  Bruxa: { kind: 'effectDuration', values: [0.15, 0.35], text: (v) => `efeitos das bruxas duram +${pct(v)}` },
  Fada: { kind: 'range', values: [0.05, 0.12], text: (v) => `+${pct(v)} de alcance de todas as criaturas` },
  Golem: { kind: 'nexusArmor', values: [0.05, 0.12], text: (v) => `Nexus recebe −${pct(v)} de dano` },
  Necromante: { kind: 'raise', values: [0.08, 0.18], text: (v) => `${pct(v)} dos abatidos viram esqueleto aliado por 6 s` },
  Górgona: { kind: 'effectChance', values: [0.1, 0.2], text: (v) => `efeitos das górgonas +${pct(v)} de chance` },
  Demônio: { kind: 'crit', values: [0.03, 0.06], critDamage: [0.06, 0.15], text: (v, d) => `demônios +${pct(v)} de chance de crítico e +${pct(d ?? 0)} de dano crítico` },
  Anjo: { kind: 'vsBoss', values: [0.08, 0.18], text: (v) => `anjos +${pct(v)} de dano contra chefes` },
};

/** Duração do esqueleto erguido pela sinergia do Necromante. */
export const SYNERGY_RAISE_DURATION = 6;
