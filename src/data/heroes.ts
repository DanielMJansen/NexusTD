// Heróis jogáveis: um por raça. O Cavaleiro (Humano) é o inicial; os outros custam Essência.
// Valores PROPOSTA: calibrar em playtest.

export type HeroId = 'knight' | 'vampireLord' | 'draconian';

export type HeroAttack = {
  damage: number;
  range: number;
  /** Segundos entre ataques. */
  cooldown: number;
  /** single = um alvo; cone = todos num leque na direção do alvo mais próximo. */
  pattern: { kind: 'single' } | { kind: 'cone'; halfAngle: number };
  /** Cada golpe que acerta cura o Nexus. */
  healPerHit: number;
};

export type HeroPulse = {
  name: string;
  damage: number;
  radius: number;
  cooldown: number;
  /** Cura do Nexus por inimigo atingido. */
  healPerEnemy: number;
};

/** Bônus para as criaturas da mesma raça do herói. */
export type RaceBonus =
  | { kind: 'range'; value: number }
  | { kind: 'damage'; value: number }
  /** Abates dessas criaturas curam o Nexus. */
  | { kind: 'killHeal'; value: number };

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
    cost: 200,
  },
};

export const HERO_IDS = Object.keys(HEROES) as HeroId[];
export const STARTER_HERO: HeroId = 'knight';
