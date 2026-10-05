// Melhorias temporárias, escolhidas entre ondas. (As permanentes viraram a árvore de talentos.)

export type RunUpgradeEffect =
  /** Afeta criaturas e herói (não o Pulso). */
  | { kind: 'damageMultiplier'; value: number }
  /** Afeta só criaturas. */
  | { kind: 'rangeMultiplier'; value: number }
  /** Afeta criaturas e herói. */
  | { kind: 'attackSpeedMultiplier'; value: number }
  | { kind: 'gold'; amount: number }
  /** Aumenta a vida máxima e a atual. */
  | { kind: 'nexusMaxHp'; amount: number }
  | { kind: 'pulseCooldownMultiplier'; value: number };

export interface RunUpgradeDef {
  id: string;
  text: string;
  effect: RunUpgradeEffect;
}

export const RUN_UPGRADES: RunUpgradeDef[] = [
  { id: 'damage', text: '+30% dano', effect: { kind: 'damageMultiplier', value: 1.3 } },
  { id: 'range', text: '+20% alcance', effect: { kind: 'rangeMultiplier', value: 1.2 } },
  { id: 'attackSpeed', text: '+25% velocidade de ataque', effect: { kind: 'attackSpeedMultiplier', value: 1.25 } },
  { id: 'gold', text: '+40 ouro', effect: { kind: 'gold', amount: 40 } },
  { id: 'nexusHp', text: 'Nexus +30 de vida', effect: { kind: 'nexusMaxHp', amount: 30 } },
  { id: 'pulse', text: 'Pulso recarrega 30% mais rápido', effect: { kind: 'pulseCooldownMultiplier', value: 0.7 } },
];
