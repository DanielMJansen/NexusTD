export type EnemyId = 'zombie' | 'bat' | 'ogre' | 'ogreKing';

export interface EnemyDef {
  id: EnemyId;
  name: string;
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
  /** Movimento lateral em zigue-zague; null = anda reto. */
  zigzag: { lateralSpeed: number; frequency: number } | null;
  /** Chance de surgir com companheiros ao lado (ângulos relativos, em radianos). */
  pack: { chance: number; angleOffsets: number[] } | null;
  isBoss: boolean;
}

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  zombie: {
    id: 'zombie',
    name: 'Zumbi',
    hp: 20,
    speed: 30,
    radius: 8,
    scale: 1,
    color: '#8c8',
    nexusDamage: 5,
    heroDps: 8,
    gold: 3,
    xp: 3,
    armor: 0,
    zigzag: null,
    pack: { chance: 0.3, angleOffsets: [0.08, -0.08] },
    isBoss: false,
  },
  bat: {
    id: 'bat',
    name: 'Morcego',
    hp: 12,
    speed: 62,
    radius: 5,
    scale: 0.8,
    color: '#ee5',
    nexusDamage: 3,
    heroDps: 6,
    gold: 2,
    xp: 2,
    armor: 0,
    zigzag: { lateralSpeed: 66, frequency: 5 },
    pack: null,
    isBoss: false,
  },
  ogre: {
    id: 'ogre',
    name: 'Ogro',
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
    zigzag: null,
    pack: null,
    isBoss: false,
  },
  ogreKing: {
    id: 'ogreKing',
    name: 'Rei Ogro',
    hp: 450,
    speed: 13,
    radius: 18,
    scale: 2.2,
    color: '#f55',
    nexusDamage: 40,
    heroDps: 35,
    gold: 30,
    xp: 40,
    armor: 4,
    zigzag: null,
    pack: null,
    isBoss: true,
  },
};
