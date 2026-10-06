// Melhorias do Nexus compradas com ouro durante a run (valem só para a run atual).

export type NexusUpgradeId = 'vitality' | 'armor' | 'bolt' | 'shield' | 'slowField';

/** Valores de um nível de cada melhoria (índice 0 = nível 1). */
export type NexusLevel =
  | { kind: 'vitality'; maxHp: number }
  | { kind: 'armor'; reduction: number }
  | { kind: 'bolt'; damage: number; cooldown: number; range: number }
  | { kind: 'shield'; duration: number; cooldown: number }
  | { kind: 'slowField'; radius: number; slow: number };

export interface NexusUpgradeDef {
  id: NexusUpgradeId;
  name: string;
  icon: string;
  /** Texto curto do que faz (o valor de cada nível vem de `levels`). */
  description: string;
  /** Custo em ouro de cada nível. */
  costs: number[];
  levels: NexusLevel[];
}

export const NEXUS_UPGRADES: NexusUpgradeDef[] = [
  {
    id: 'vitality',
    name: 'Vitalidade',
    icon: '♥',
    description: 'Mais vida máxima (e cura o mesmo tanto ao comprar).',
    costs: [60, 100, 150, 210, 280],
    levels: [25, 50, 75, 100, 125].map((maxHp) => ({ kind: 'vitality', maxHp })),
  },
  {
    id: 'armor',
    name: 'Muralha',
    icon: '⛨',
    description: 'Reduz o dano que os inimigos causam ao Nexus.',
    costs: [70, 120, 180, 250, 330],
    levels: [0.06, 0.12, 0.18, 0.24, 0.3].map((reduction) => ({ kind: 'armor', reduction })),
  },
  {
    id: 'bolt',
    name: 'Raio do Nexus',
    icon: 'ϟ',
    description: 'O Nexus dispara sozinho no inimigo mais próximo.',
    costs: [120, 220, 350],
    levels: [
      { kind: 'bolt', damage: 10, cooldown: 1.3, range: 105 },
      { kind: 'bolt', damage: 16, cooldown: 1.1, range: 120 },
      { kind: 'bolt', damage: 24, cooldown: 0.9, range: 135 },
    ],
  },
  {
    id: 'shield',
    name: 'Escudo',
    icon: '◈',
    description: 'Ao levar um golpe com o escudo pronto, fica imune por alguns segundos.',
    costs: [120, 200, 300],
    levels: [
      { kind: 'shield', duration: 2, cooldown: 40 },
      { kind: 'shield', duration: 3, cooldown: 32 },
      { kind: 'shield', duration: 4, cooldown: 25 },
    ],
  },
  {
    id: 'slowField',
    name: 'Campo de Lentidão',
    icon: '❄',
    description: 'Inimigos perto do Nexus andam mais devagar.',
    costs: [100, 180, 280],
    levels: [
      { kind: 'slowField', radius: 60, slow: 0.25 },
      { kind: 'slowField', radius: 75, slow: 0.35 },
      { kind: 'slowField', radius: 90, slow: 0.45 },
    ],
  },
];

export const noNexusLevels = (): Record<NexusUpgradeId, number> => ({
  vitality: 0,
  armor: 0,
  bolt: 0,
  shield: 0,
  slowField: 0,
});

export const findNexusUpgrade = (id: NexusUpgradeId): NexusUpgradeDef => NEXUS_UPGRADES.find((u) => u.id === id)!;

/** Loot que cai dos inimigos e o herói coleta passando por cima. */
export const LOOT = {
  /** Chance de um inimigo comum soltar uma moeda extra. */
  coinChance: 0.08,
  /** Valor da moeda = ouro do inimigo × coinValue (mínimo 2). */
  coinValue: 1.5,
  /** Chance de soltar baú: inimigo comum, elite (chefes sempre soltam). */
  chestChance: 0.002,
  eliteChestChance: 0.06,
  /** Segundos no chão antes de sumir. */
  lifetime: 12,
  /** Distância do herói para coletar. */
  pickupRadius: 16,
  /** Baú: tier mínimo das 3 melhorias oferecidas. */
  chestMinTier: 'rare',
} as const;
