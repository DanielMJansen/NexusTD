// Heróis jogáveis: um por raça. O Cavaleiro (Humano) é o inicial; os outros custam Essência.
// Valores PROPOSTA: calibrar em playtest.

export type HeroId = 'knight' | 'vampireLord' | 'draconian' | 'lycan' | 'specter' | 'witch' | 'faeQueen' | 'colossus';

export type HeroAttack = {
  damage: number;
  range: number;
  /** Segundos entre ataques. */
  cooldown: number;
  /** single = um alvo; cone = todos num leque na direção do alvo mais próximo. */
  pattern: { kind: 'single' } | { kind: 'cone'; halfAngle: number };
  /** Cada golpe que acerta cura o Nexus. */
  healPerHit: number;
  /** Ignora a armadura dos inimigos. */
  pierceArmor?: boolean;
};

export type HeroPulse = {
  name: string;
  damage: number;
  radius: number;
  cooldown: number;
  /** Cura do Nexus por inimigo atingido. */
  healPerEnemy: number;
  /**
   * Formato: círculo ao redor do herói, investida em linha (o herói atravessa o campo),
   * leque à frente ou raio em linha (o herói fica parado).
   */
  shape?:
    | { kind: 'circle' }
    | { kind: 'dash'; length: number; width: number }
    | { kind: 'cone'; length: number; halfAngle: number }
    | { kind: 'beam'; length: number; width: number };
  /** Todas as criaturas atacam mais rápido por um tempo. */
  haste?: { amount: number; duration: number };
  /** Inimigos atingidos ficam parados (atordoados ou petrificados) por um tempo (s). */
  stun?: { duration: number; look: 'stun' | 'stone' };
  /** Ergue esqueletos aliados temporários ao redor do herói. */
  raise?: { count: number; duration: number };
  /** Custa esta fração da vida máxima do herói (não o derruba). */
  selfDamage?: number;
  /** Inimigos atingidos fogem do Nexus por um tempo (s). */
  fear?: number;
  /** Inimigos atingidos ficam envenenados. */
  poison?: { dps: number; duration: number };
};

/** Bônus para as criaturas da mesma raça do herói. */
export type RaceBonus =
  | { kind: 'range'; value: number }
  | { kind: 'damage'; value: number }
  /** Abates dessas criaturas curam o Nexus. */
  | { kind: 'killHeal'; value: number }
  | { kind: 'attackSpeed'; value: number }
  /** Ignoram mais pontos de armadura. */
  | { kind: 'armorPierce'; value: number }
  /** Efeitos de golpe (veneno, raízes, petrificação, marca...) duram mais segundos. */
  | { kind: 'poisonDuration'; value: number }
  /** Chance extra de golpe crítico. */
  | { kind: 'critChance'; value: number }
  /** Dano extra contra elites e chefes. */
  | { kind: 'vsStrong'; value: number };

export interface HeroDef {
  id: HeroId;
  name: string;
  race: string;
  description: string;
  speed: number;
  attack: HeroAttack;
  pulse: HeroPulse;
  raceBonus: RaceBonus;
  /** Cor da marca sob os pés e dos efeitos. */
  color: string;
  /** Vida máxima do herói (morto, renasce no Nexus). */
  maxHp: number;
  /** null = herói inicial (gratuito). */
  cost: number | null;
}

// A ordem aqui é a ordem na tela de heróis.
export const HEROES: Record<HeroId, HeroDef> = {
  knight: {
    id: 'knight',
    name: 'Cavaleiro',
    race: 'Humano',
    description: 'Guardião versátil: espada rápida e uma onda de choque que afasta o perigo do Nexus.',
    speed: 115,
    attack: { damage: 10, range: 60, cooldown: 0.5, pattern: { kind: 'single' }, healPerHit: 0 },
    pulse: { name: 'Onda de Choque', damage: 35, radius: 95, cooldown: 12, healPerEnemy: 0 },
    raceBonus: { kind: 'range', value: 0.1 },
    color: '#ffd25a',
    maxHp: 120,
    cost: null,
  },
  vampireLord: {
    id: 'vampireLord',
    name: 'Nobre Vampiro',
    race: 'Vampiro',
    description: 'Duelista elegante que rouba vida para o Nexus a cada golpe.',
    speed: 125,
    attack: { damage: 8, range: 55, cooldown: 0.45, pattern: { kind: 'single' }, healPerHit: 0.5 },
    pulse: { name: 'Revoada de Morcegos', damage: 25, radius: 100, cooldown: 12, healPerEnemy: 1 },
    raceBonus: { kind: 'killHeal', value: 1 },
    color: '#ff3a50',
    maxHp: 100,
    cost: 150,
  },
  draconian: {
    id: 'draconian',
    name: 'Draconato',
    race: 'Dragão',
    description: 'Meio-dragão lento e resistente: cospe fogo em leque e ruge chamas ao redor.',
    speed: 105,
    attack: { damage: 8, range: 55, cooldown: 0.65, pattern: { kind: 'cone', halfAngle: 0.6 }, healPerHit: 0 },
    pulse: { name: 'Rugido Flamejante', damage: 30, radius: 130, cooldown: 13, healPerEnemy: 0 },
    raceBonus: { kind: 'damage', value: 0.1 },
    color: '#ff8a2a',
    maxHp: 150,
    cost: 200,
  },
  lycan: {
    id: 'lycan',
    name: 'Licantropo',
    race: 'Lobisomem',
    description: 'Fera de garras rápidas. O uivo dele espanta as hordas para longe do Nexus.',
    speed: 135,
    attack: { damage: 6, range: 48, cooldown: 0.3, pattern: { kind: 'single' }, healPerHit: 0 },
    pulse: { name: 'Uivo', damage: 15, radius: 110, cooldown: 12, healPerEnemy: 0, fear: 2 },
    raceBonus: { kind: 'attackSpeed', value: 0.15 },
    color: '#c8a070',
    maxHp: 110,
    cost: 200,
  },
  specter: {
    id: 'specter',
    name: 'Espectro',
    race: 'Fantasma',
    description: 'Atravessa paredes e armaduras. O Pulso é uma investida que cruza o campo ferindo tudo no caminho.',
    speed: 120,
    attack: { damage: 11, range: 75, cooldown: 0.5, pattern: { kind: 'single' }, healPerHit: 0, pierceArmor: true },
    pulse: {
      name: 'Travessia',
      damage: 45,
      radius: 0,
      cooldown: 10,
      healPerEnemy: 0,
      shape: { kind: 'dash', length: 200, width: 26 },
    },
    raceBonus: { kind: 'armorPierce', value: 2 },
    color: '#8ce8d8',
    maxHp: 90,
    cost: 220,
  },
  witch: {
    id: 'witch',
    name: 'Bruxa',
    race: 'Bruxa',
    description: 'Ataca de longe com orbes e lança uma maldição que envenena todos ao redor.',
    speed: 115,
    attack: { damage: 8, range: 110, cooldown: 0.7, pattern: { kind: 'single' }, healPerHit: 0 },
    pulse: { name: 'Maldição', damage: 10, radius: 115, cooldown: 12, healPerEnemy: 0, poison: { dps: 8, duration: 4 } },
    raceBonus: { kind: 'poisonDuration', value: 1 },
    color: '#7ad85a',
    maxHp: 90,
    cost: 220,
  },
  faeQueen: {
    id: 'faeQueen',
    name: 'Rainha Fada',
    race: 'Fada',
    description: 'Frágil, mas rápida. A Bênção Feérica faz todas as criaturas atacarem muito mais rápido por alguns segundos.',
    speed: 130,
    attack: { damage: 7, range: 95, cooldown: 0.45, pattern: { kind: 'single' }, healPerHit: 0 },
    pulse: { name: 'Bênção Feérica', damage: 15, radius: 90, cooldown: 14, healPerEnemy: 0, haste: { amount: 0.5, duration: 5 } },
    raceBonus: { kind: 'range', value: 0.12 },
    color: '#ff8ad0',
    maxHp: 85,
    cost: 240,
  },
  colossus: {
    id: 'colossus',
    name: 'Colosso',
    race: 'Golem',
    description: 'Lento e muito resistente. Esmaga tudo à frente e o Terremoto atordoa os inimigos ao redor.',
    speed: 85,
    attack: { damage: 12, range: 45, cooldown: 0.9, pattern: { kind: 'cone', halfAngle: 1 }, healPerHit: 0 },
    pulse: { name: 'Terremoto', damage: 25, radius: 100, cooldown: 13, healPerEnemy: 0, stun: { duration: 1.8, look: 'stun' } },
    raceBonus: { kind: 'damage', value: 0.12 },
    color: '#c8a070',
    maxHp: 220,
    cost: 260,
  },
};
export const HERO_IDS = Object.keys(HEROES) as HeroId[];
export const STARTER_HERO: HeroId = 'knight';
