// Melhorias temporárias (escolhidas entre ondas) e permanentes (compradas com Essência).

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

export type MetaUpgradeId = 'damage' | 'nexusHp' | 'startGold';

export interface MetaUpgradeDef {
  id: MetaUpgradeId;
  text: string;
  /** Custo do próximo nível = costPerLevel × (nível atual + 1). */
  costPerLevel: number;
  maxLevel: number;
  /** Bônus por nível: fração de dano, vida do Nexus ou ouro inicial. */
  perLevel: number;
}

// A ordem aqui é a ordem no menu.
export const META_UPGRADES: Record<MetaUpgradeId, MetaUpgradeDef> = {
  damage: { id: 'damage', text: '+8% dano', costPerLevel: 20, maxLevel: 5, perLevel: 0.08 },
  nexusHp: { id: 'nexusHp', text: '+15 vida do Nexus', costPerLevel: 20, maxLevel: 5, perLevel: 15 },
  startGold: { id: 'startGold', text: '+10 ouro inicial', costPerLevel: 15, maxLevel: 5, perLevel: 10 },
};

export const META_UPGRADE_IDS = Object.keys(META_UPGRADES) as MetaUpgradeId[];
