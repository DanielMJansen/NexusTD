export type EnemyId =
  | 'zombie'
  | 'bat'
  | 'skeletonArcher'
  | 'ogre'
  | 'slime'
  | 'slimeling'
  | 'spider'
  | 'gargoyle'
  | 'headless'
  | 'darkBanshee'
  | 'necromancer'
  | 'ogreKing'
  | 'spiderQueen'
  | 'lich';

/** Habilidades e passivas dos inimigos (cada uma tem seu próprio tempo de recarga). */
export type EnemyTrait =
  /** Atira no herói quando ele está ao alcance (anda devagar enquanto mira). */
  | { kind: 'ranged'; range: number; damage: number; cooldown: number }
  /** Ao morrer, se divide em inimigos menores. */
  | { kind: 'split'; into: EnemyId; count: number }
  /** Alterna entre voar e pousar como pedra (parado, com armadura extra). */
  | { kind: 'stone'; fly: number; rest: number; armor: number }
  /** Lança teia nas criaturas mais próximas: atacam mais devagar. */
  | { kind: 'web'; range: number; cooldown: number; duration: number; slow: number; targets: number }
  /** Ergue outros inimigos ao redor de si. */
  | { kind: 'summon'; enemy: EnemyId; count: number; cooldown: number }
  /** Investida: corre muito por um instante. */
  | { kind: 'charge'; cooldown: number; duration: number; speedMultiplier: number }
  /** Cura aliados próximos (fração da vida máxima de cada um). */
  | { kind: 'heal'; radius: number; amount: number; cooldown: number }
  /** Pisão: atordoa as criaturas próximas (não atacam). */
  | { kind: 'stomp'; radius: number; stun: number; cooldown: number }
  /** Escudo: reduz o dano recebido por alguns segundos. */
  | { kind: 'shield'; cooldown: number; duration: number; reduction: number }
  /** Segunda fase abaixo de uma fração da vida: mais rápido e recargas menores. */
  | { kind: 'enrage'; below: number; speedMultiplier: number; cooldownMultiplier: number };

export interface EnemyDef {
  id: EnemyId;
  name: string;
  /** Texto curto para o códex. */
  description: string;
  hp: number;
  speed: number;
  /** Raio de colisão, também usado para posicionar a barra de vida. */
  radius: number;
  /** Escala do sprite. */
  scale: number;
  color: string;
  nexusDamage: number;
  /** Dano por segundo ao herói enquanto encostado nele. */
  heroDps: number;
  gold: number;
  /** XP que o herói ganha quando este inimigo morre. */
  xp: number;
  /** Reduz o dano de cada golpe: max(1, dano − armadura). */
  armor: number;
  /** Voa (sombra menor, desenho no ar). */
  flying: boolean;
  /** Movimento lateral em zigue-zague; null = anda reto. */
  zigzag: { lateralSpeed: number; frequency: number } | null;
  /** Chance de surgir com companheiros ao lado (ângulos relativos, em radianos). */
  pack: { chance: number; angleOffsets: number[] } | null;
  traits: readonly EnemyTrait[];
  isBoss: boolean;
  /** Só aparece por invocação ou divisão (fica fora do códex). */
  minion?: boolean;
}

const base = {
  flying: false,
  zigzag: null,
  pack: null,
  traits: [],
  isBoss: false,
  armor: 0,
  scale: 1,
} as const;

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  zombie: {
    ...base,
    id: 'zombie',
    name: 'Zumbi',
    description: 'Lento e teimoso. Às vezes chega em bando.',
    hp: 20,
    speed: 30,
    radius: 8,
    color: '#8c8',
    nexusDamage: 5,
    heroDps: 8,
    gold: 3,
    xp: 3,
    pack: { chance: 0.3, angleOffsets: [0.08, -0.08] },
  },
  bat: {
    ...base,
    id: 'bat',
    name: 'Morcego',
    description: 'Rápido e frágil; voa em zigue-zague.',
    hp: 12,
    speed: 62,
    radius: 5,
    scale: 0.8,
    color: '#ee5',
    nexusDamage: 3,
    heroDps: 6,
    gold: 2,
    xp: 2,
    flying: true,
    zigzag: { lateralSpeed: 66, frequency: 5 },
  },
  skeletonArcher: {
    ...base,
    id: 'skeletonArcher',
    name: 'Esqueleto Arqueiro',
    description: 'Atira no herói de longe, avançando devagar enquanto mira.',
    hp: 18,
    speed: 26,
    radius: 7,
    color: '#e8e0c8',
    nexusDamage: 5,
    heroDps: 4,
    gold: 4,
    xp: 3,
    traits: [{ kind: 'ranged', range: 90, damage: 6, cooldown: 1.6 }],
  },
  ogre: {
    ...base,
    id: 'ogre',
    name: 'Ogro',
    description: 'Tanque com armadura: golpes fracos quase não o ferem.',
    hp: 90,
    speed: 18,
    radius: 11,
    scale: 1.4,
    color: '#c85',
    nexusDamage: 15,
    heroDps: 16,
    gold: 8,
    xp: 7,
    armor: 3,
  },
  slime: {
    ...base,
    id: 'slime',
    name: 'Lodo',
    description: 'Ao morrer, se divide em dois lodinhos.',
    hp: 34,
    speed: 22,
    radius: 9,
    scale: 1.1,
    color: '#6fdc8c',
    nexusDamage: 6,
    heroDps: 8,
    gold: 3,
    xp: 3,
    traits: [{ kind: 'split', into: 'slimeling', count: 2 }],
  },
  slimeling: {
    ...base,
    id: 'slimeling',
    name: 'Lodinho',
    description: 'Pedaço de um Lodo.',
    hp: 10,
    speed: 34,
    radius: 5,
    scale: 0.6,
    color: '#8fe8a8',
    nexusDamage: 2,
    heroDps: 4,
    gold: 1,
    xp: 1,
    minion: true,
  },
  spider: {
    ...base,
    id: 'spider',
    name: 'Aranha',
    description: 'Lança teia na criatura mais próxima, que passa a atacar devagar.',
    hp: 26,
    speed: 40,
    radius: 7,
    color: '#a07ad8',
    nexusDamage: 5,
    heroDps: 10,
    gold: 4,
    xp: 4,
    traits: [{ kind: 'web', range: 80, cooldown: 4, duration: 2.5, slow: 0.5, targets: 1 }],
  },
  gargoyle: {
    ...base,
    id: 'gargoyle',
    name: 'Gárgula',
    description: 'Voa rápido e pousa como pedra, com armadura altíssima.',
    hp: 50,
    speed: 44,
    radius: 9,
    color: '#8a90a8',
    nexusDamage: 8,
    heroDps: 10,
    gold: 6,
    xp: 5,
    armor: 1,
    flying: true,
    traits: [{ kind: 'stone', fly: 2.5, rest: 1.5, armor: 6 }],
  },
  headless: {
    ...base,
    id: 'headless',
    name: 'Cavaleiro Sem Cabeça',
    description: 'De tempos em tempos, dispara numa investida veloz.',
    hp: 80,
    speed: 24,
    radius: 10,
    scale: 1.2,
    color: '#5a8aa0',
    nexusDamage: 10,
    heroDps: 18,
    gold: 8,
    xp: 7,
    armor: 2,
    traits: [{ kind: 'charge', cooldown: 6, duration: 0.8, speedMultiplier: 2.6 }],
  },
  darkBanshee: {
    ...base,
    id: 'darkBanshee',
    name: 'Banshee Sombria',
    description: 'Lamenta e cura os inimigos ao redor.',
    hp: 40,
    speed: 28,
    radius: 8,
    color: '#7a5aa8',
    nexusDamage: 6,
    heroDps: 6,
    gold: 7,
    xp: 6,
    flying: true,
    traits: [{ kind: 'heal', radius: 70, amount: 0.15, cooldown: 4 }],
  },
  necromancer: {
    ...base,
    id: 'necromancer',
    name: 'Necromante',
    description: 'Ergue zumbis do chão enquanto caminha.',
    hp: 55,
    speed: 20,
    radius: 8,
    color: '#5adca0',
    nexusDamage: 10,
    heroDps: 8,
    gold: 9,
    xp: 8,
    armor: 1,
    traits: [{ kind: 'summon', enemy: 'zombie', count: 2, cooldown: 6 }],
  },
  ogreKing: {
    ...base,
    id: 'ogreKing',
    name: 'Rei Ogro',
    description: 'Chefe. Pisa no chão e atordoa as criaturas por perto.',
    hp: 450,
    speed: 13,
    radius: 18,
    scale: 2.2,
    color: '#f55',
    nexusDamage: 30,
    heroDps: 35,
    gold: 30,
    xp: 40,
    armor: 4,
    isBoss: true,
    traits: [{ kind: 'stomp', radius: 75, stun: 1.2, cooldown: 7 }],
  },
  spiderQueen: {
    ...base,
    id: 'spiderQueen',
    name: 'Rainha Aranha',
    description: 'Chefe. Prende várias criaturas na teia e choca aranhas.',
    hp: 600,
    speed: 15,
    radius: 16,
    scale: 2,
    color: '#c05ae0',
    nexusDamage: 35,
    heroDps: 30,
    gold: 45,
    xp: 60,
    armor: 3,
    isBoss: true,
    traits: [
      { kind: 'web', range: 120, cooldown: 3.5, duration: 3, slow: 0.6, targets: 3 },
      { kind: 'summon', enemy: 'spider', count: 2, cooldown: 7 },
    ],
  },
  lich: {
    ...base,
    id: 'lich',
    name: 'Lich',
    description: 'Chefe final. Atira no herói, invoca esqueletos, se protege com escudo e enfurece com pouca vida.',
    hp: 800,
    speed: 12,
    radius: 14,
    scale: 1.9,
    color: '#7af0d8',
    nexusDamage: 60,
    heroDps: 40,
    gold: 80,
    xp: 100,
    armor: 4,
    flying: true,
    isBoss: true,
    traits: [
      { kind: 'ranged', range: 120, damage: 14, cooldown: 1.4 },
      { kind: 'summon', enemy: 'skeletonArcher', count: 2, cooldown: 8 },
      { kind: 'shield', cooldown: 12, duration: 3, reduction: 0.8 },
      { kind: 'enrage', below: 0.5, speedMultiplier: 1.4, cooldownMultiplier: 0.6 },
    ],
  },
};

export const ENEMY_IDS = Object.keys(ENEMIES) as EnemyId[];
