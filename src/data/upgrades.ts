// Melhorias temporárias, escolhidas entre ondas, com raridade (modelo das bênçãos do Myth TD).
// Cada carta sorteia primeiro a raridade e depois uma melhoria dela. Valores PROPOSTA.

export type Rarity = 'common' | 'uncommon' | 'rare';

export const RARITIES: Record<Rarity, { name: string; weight: number; color: string }> = {
  common: { name: 'Comum', weight: 0.6, color: '#c8c0d8' },
  uncommon: { name: 'Incomum', weight: 0.3, color: '#5ae08a' },
  rare: { name: 'Rara', weight: 0.1, color: '#ffd25a' },
};

export type RunUpgradeEffect =
  /** Afeta criaturas e herói (não o Pulso). */
  | { kind: 'damageMultiplier'; value: number }
  /** Afeta só criaturas. */
  | { kind: 'rangeMultiplier'; value: number }
  /** Afeta criaturas e herói. */
  | { kind: 'attackSpeedMultiplier'; value: number }
  | { kind: 'gold'; amount: number }
  /** Aumenta a vida máxima e a atual (fullHeal: cura tudo). */
  | { kind: 'nexusMaxHp'; amount: number; fullHeal?: boolean }
  | { kind: 'pulseCooldownMultiplier'; value: number }
  /** Fração de desconto na evolução até o fim da run (máx. 75%). */
  | { kind: 'evolveDiscount'; value: number }
  | { kind: 'creatureSlot'; amount: number }
  /** Vida por segundo do Nexus durante as ondas. */
  | { kind: 'nexusRegen'; value: number }
  /** Fração extra de ouro por abate. */
  | { kind: 'killGold'; value: number }
  /** Todas as criaturas em campo sobem 1 nível de graça. */
  | { kind: 'ascendAll' }
  /** O primeiro golpe no Nexus a cada onda é anulado. */
  | { kind: 'ward' };

export interface RunUpgradeDef {
  id: string;
  name: string;
  text: string;
  rarity: Rarity;
  effects: RunUpgradeEffect[];
  /** Quantas vezes pode ser escolhida na mesma run (padrão: sem limite). */
  maxPicks?: number;
}

export const RUN_UPGRADES: RunUpgradeDef[] = [
  // comuns
  { id: 'sharpen', name: 'Afiar Armas', text: '+20% de dano', rarity: 'common', effects: [{ kind: 'damageMultiplier', value: 1.2 }] },
  { id: 'keenEye', name: 'Olhar Aguçado', text: '+15% de alcance', rarity: 'common', effects: [{ kind: 'rangeMultiplier', value: 1.15 }] },
  {
    id: 'battleRhythm',
    name: 'Ritmo de Batalha',
    text: '+18% de velocidade de ataque',
    rarity: 'common',
    effects: [{ kind: 'attackSpeedMultiplier', value: 1.18 }],
  },
  { id: 'loot', name: 'Saque', text: '+40 de ouro', rarity: 'common', effects: [{ kind: 'gold', amount: 40 }] },
  { id: 'reinforce', name: 'Reforço', text: 'Nexus +30 de vida máxima', rarity: 'common', effects: [{ kind: 'nexusMaxHp', amount: 30 }] },
  {
    id: 'focus',
    name: 'Concentração',
    text: 'Pulso recarrega 20% mais rápido',
    rarity: 'common',
    effects: [{ kind: 'pulseCooldownMultiplier', value: 0.8 }],
  },
  // incomuns
  { id: 'fury', name: 'Fúria', text: '+35% de dano', rarity: 'uncommon', effects: [{ kind: 'damageMultiplier', value: 1.35 }] },
  {
    id: 'packFrenzy',
    name: 'Frenesi Coletivo',
    text: '+30% de velocidade de ataque',
    rarity: 'uncommon',
    effects: [{ kind: 'attackSpeedMultiplier', value: 1.3 }],
  },
  {
    id: 'quickAlchemy',
    name: 'Alquimia Rápida',
    text: 'Evoluir fica 25% mais barato',
    rarity: 'uncommon',
    effects: [{ kind: 'evolveDiscount', value: 0.25 }],
    maxPicks: 2,
  },
  {
    id: 'recruit',
    name: 'Recrutamento',
    text: '+1 vaga de criatura',
    rarity: 'uncommon',
    effects: [{ kind: 'creatureSlot', amount: 1 }],
    maxPicks: 2,
  },
  { id: 'livingRoots', name: 'Raízes Vivas', text: 'O Nexus regenera 0,5 de vida/s', rarity: 'uncommon', effects: [{ kind: 'nexusRegen', value: 0.5 }] },
  { id: 'greed', name: 'Cobiça', text: '+50% de ouro por abate', rarity: 'uncommon', effects: [{ kind: 'killGold', value: 0.5 }], maxPicks: 2 },
  // raras
  {
    id: 'ascension',
    name: 'Ascensão',
    text: 'Todas as criaturas em campo sobem 1 nível de graça',
    rarity: 'rare',
    effects: [{ kind: 'ascendAll' }],
  },
  {
    id: 'nexusHeart',
    name: 'Coração do Nexus',
    text: 'Nexus +50 de vida máxima e cura total',
    rarity: 'rare',
    effects: [{ kind: 'nexusMaxHp', amount: 50, fullHeal: true }],
  },
  {
    id: 'mastery',
    name: 'Maestria',
    text: '+25% de dano e +25% de velocidade de ataque',
    rarity: 'rare',
    effects: [
      { kind: 'damageMultiplier', value: 1.25 },
      { kind: 'attackSpeedMultiplier', value: 1.25 },
    ],
  },
  {
    id: 'eternalAegis',
    name: 'Égide Eterna',
    text: 'O primeiro inimigo que alcança o Nexus em cada onda não causa dano',
    rarity: 'rare',
    effects: [{ kind: 'ward' }],
    maxPicks: 1,
  },
  { id: 'dragonHoard', name: 'Tesouro do Dragão', text: '+150 de ouro', rarity: 'rare', effects: [{ kind: 'gold', amount: 150 }] },
];
