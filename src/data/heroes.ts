// Heróis jogáveis: um por raça. O Cavaleiro (Humano) é o inicial; os outros custam Essência.
// Valores PROPOSTA: calibrar em playtest.
import type { GiftId } from './gifts';

export type HeroId = 'knight' | 'vampireLord' | 'draconian' | 'lycan' | 'specter' | 'witch' | 'faeQueen' | 'colossus' | 'deathLord' | 'gorgonQueen' | 'archdemon' | 'archangel' | 'alicorn';

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

/** O que o Pulso faz: cada herói tem um tipo próprio (com parâmetros). */
export type PulseEffect =
  /** Explosão ao redor do herói (raio = `radius`). */
  | { kind: 'burst' }
  /** Avança com o escudo na direção da mira, atropelando e arremessando para longe do Nexus. */
  | { kind: 'charge'; length: number; width: number; knockback: number }
  /** Desliza translúcido até a mira em `duration` s, ferindo quem atravessa. */
  | { kind: 'glide'; length: number; width: number; duration: number }
  /** Leque à frente, na direção da mira. */
  | { kind: 'cone'; length: number; halfAngle: number }
  /** Enxame que caça os `count` inimigos mais próximos (até `range`), fazendo sangrar. */
  | { kind: 'swarm'; count: number; range: number; bleed: { dps: number; duration: number } }
  /** Jato contínuo por `duration` s na direção da mira; `damage` do Pulso é por segundo. */
  | { kind: 'flame'; length: number; halfAngle: number; duration: number; burn: { dps: number; duration: number } }
  /** Transformação por `duration` s: ataca mais rápido e mais forte, em leque, curando a cada golpe. */
  | { kind: 'transform'; duration: number; attackSpeed: number; damage: number; lifesteal: number; scale: number }
  /** Transforma inimigos comuns no raio em sapos: lentos, frágeis e inofensivos. */
  | { kind: 'hex'; duration: number; vulnerable: number }
  /** Todas as criaturas atacam mais rápido por um tempo. */
  | { kind: 'haste'; amount: number; duration: number }
  /** Fenda em linha na direção da mira; fica no chão deixando quem passa lento. */
  | { kind: 'fissure'; length: number; width: number; duration: number; slow: number }
  /** Ergue esqueletos aliados onde inimigos morreram há pouco (ou ao redor do herói). */
  | { kind: 'raise'; count: number; fallback: number; duration: number }
  /** Meteoros caem em sequência ao redor da mira, deixando o chão em chamas. */
  | { kind: 'meteors'; count: number; spread: number; interval: number; radius: number; burn: { dps: number; duration: number } }
  /** Coluna de luz desce na mira após `delay` s; marca quem atinge. */
  | { kind: 'judgment'; delay: number; radius: number; mark: { amount: number; duration: number } }
  /** Feixe de arco-íris em linha na direção da mira: fere e encanta (inimigos comuns lutam do seu lado por `charm` s). */
  | { kind: 'rainbow'; length: number; width: number; charm: number };

export type HeroPulse = {
  name: string;
  /** Dano do Pulso (no lança-chamas, por segundo). Cresce +10% por nível do herói. */
  damage: number;
  /** Raio das explosões ao redor do herói (burst, transformação, sapo, aceleração, erguer). */
  radius: number;
  cooldown: number;
  /** Cura do herói por inimigo atingido. */
  healPerEnemy: number;
  effect: PulseEffect;
  /** Inimigos atingidos ficam parados (atordoados ou petrificados) por um tempo (s). */
  stun?: { duration: number; look: 'stun' | 'stone' };
  /** Inimigos atingidos fogem do Nexus por um tempo (s). */
  fear?: number;
  /** Custa esta fração da vida máxima do herói (não o derruba). */
  selfDamage?: number;
};

/** Bônus para as criaturas da mesma raça do herói. */
export type RaceBonus =
  | { kind: 'range'; value: number }
  | { kind: 'damage'; value: number }
  /** Abates dessas criaturas curam o herói. */
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
  /** Exclusivo: liberado só por código de presente (não aparece para quem não tem). */
  gift?: GiftId;
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
    pulse: { name: 'Carga Heroica', damage: 40, radius: 0, cooldown: 11, healPerEnemy: 0, effect: { kind: 'charge', length: 150, width: 30, knockback: 60 } },
    raceBonus: { kind: 'range', value: 0.1 },
    color: '#ffd25a',
    maxHp: 120,
    cost: null,
  },
  vampireLord: {
    id: 'vampireLord',
    name: 'Nobre Vampiro',
    race: 'Vampiro',
    description: 'Duelista elegante que rouba vida a cada golpe e se cura com os abates dos vampiros.',
    speed: 125,
    attack: { damage: 8, range: 55, cooldown: 0.45, pattern: { kind: 'single' }, healPerHit: 0.5 },
    pulse: { name: 'Revoada de Morcegos', damage: 30, radius: 0, cooldown: 12, healPerEnemy: 4, effect: { kind: 'swarm', count: 6, range: 150, bleed: { dps: 6, duration: 3 } } },
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
    pulse: { name: 'Lança-Chamas', damage: 45, radius: 0, cooldown: 13, healPerEnemy: 0, effect: { kind: 'flame', length: 110, halfAngle: 0.35, duration: 2.5, burn: { dps: 6, duration: 2 } } },
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
    pulse: { name: 'Fúria Lunar', damage: 15, radius: 90, cooldown: 16, healPerEnemy: 0, fear: 1.5, effect: { kind: 'transform', duration: 6, attackSpeed: 1, damage: 0.5, lifesteal: 0.15, scale: 1.45 } },
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
    pulse: { name: 'Travessia', damage: 45, radius: 0, cooldown: 10, healPerEnemy: 0, fear: 1.5, effect: { kind: 'glide', length: 200, width: 26, duration: 0.6 } },
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
    pulse: { name: 'Feitiço do Sapo', damage: 15, radius: 90, cooldown: 16, healPerEnemy: 0, effect: { kind: 'hex', duration: 4, vulnerable: 0.5 } },
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
    pulse: { name: 'Bênção Feérica', damage: 15, radius: 90, cooldown: 14, healPerEnemy: 0, effect: { kind: 'haste', amount: 0.5, duration: 5 } },
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
    attack: { damage: 12, range: 55, cooldown: 0.9, pattern: { kind: 'cone', halfAngle: 1 }, healPerHit: 0 },
    pulse: { name: 'Fenda Sísmica', damage: 30, radius: 0, cooldown: 13, healPerEnemy: 0, stun: { duration: 1.5, look: 'stun' }, effect: { kind: 'fissure', length: 170, width: 26, duration: 3, slow: 0.5 } },
    raceBonus: { kind: 'damage', value: 0.12 },
    color: '#c8a070',
    maxHp: 220,
    cost: 260,
  },
  deathLord: {
    id: 'deathLord',
    name: 'Senhor dos Mortos',
    race: 'Necromante',
    description: 'Corta em leque com a foice. O Pulso ergue esqueletos que lutam do seu lado.',
    speed: 110,
    attack: { damage: 9, range: 55, cooldown: 0.6, pattern: { kind: 'cone', halfAngle: 0.7 }, healPerHit: 0 },
    pulse: { name: 'Erguer Mortos', damage: 10, radius: 80, cooldown: 14, healPerEnemy: 0, effect: { kind: 'raise', count: 5, fallback: 2, duration: 8 } },
    raceBonus: { kind: 'attackSpeed', value: 0.2 },
    color: '#7affb0',
    maxHp: 110,
    cost: 260,
  },
  gorgonQueen: {
    id: 'gorgonQueen',
    name: 'Rainha Górgona',
    race: 'Górgona',
    description: 'Ataca de média distância com a lança-serpente. O Olhar Fatal petrifica tudo num leque à frente.',
    speed: 115,
    attack: { damage: 9, range: 85, cooldown: 0.55, pattern: { kind: 'single' }, healPerHit: 0 },
    pulse: { name: 'Olhar Fatal', damage: 20, radius: 0, cooldown: 13, healPerEnemy: 0, stun: { duration: 2.2, look: 'stone' }, effect: { kind: 'cone', length: 140, halfAngle: 0.5 } },
    raceBonus: { kind: 'poisonDuration', value: 1 },
    color: '#3a9a6a',
    maxHp: 100,
    cost: 260,
  },
  archdemon: {
    id: 'archdemon',
    name: 'Arquidemônio',
    race: 'Demônio',
    description: 'Lança chamas em leque. O Pacto custa parte da vida do herói, mas causa uma explosão enorme.',
    speed: 120,
    attack: { damage: 9, range: 60, cooldown: 0.55, pattern: { kind: 'cone', halfAngle: 0.5 }, healPerHit: 0 },
    pulse: { name: 'Chuva de Meteoros', damage: 45, radius: 0, cooldown: 13, healPerEnemy: 0, selfDamage: 0.25, effect: { kind: 'meteors', count: 5, spread: 55, interval: 0.25, radius: 38, burn: { dps: 10, duration: 2.5 } } },
    raceBonus: { kind: 'critChance', value: 0.1 },
    color: '#ff4a2a',
    maxHp: 130,
    cost: 280,
  },
  archangel: {
    id: 'archangel',
    name: 'Arcanjo',
    race: 'Anjo',
    description: 'Espada de luz rápida. O Juízo dispara um raio sagrado em linha que atravessa o campo.',
    speed: 125,
    attack: { damage: 11, range: 60, cooldown: 0.5, pattern: { kind: 'single' }, healPerHit: 0 },
    pulse: { name: 'Juízo Celestial', damage: 110, radius: 0, cooldown: 12, healPerEnemy: 0, effect: { kind: 'judgment', delay: 0.8, radius: 45, mark: { amount: 0.3, duration: 4 } } },
    raceBonus: { kind: 'vsStrong', value: 0.25 },
    color: '#ffe9a8',
    maxHp: 120,
    cost: 280,
  },
  alicorn: {
    id: 'alicorn',
    name: 'Alicórnio',
    race: 'Unicórnio',
    description: 'Unicórnio alado. Ataca com o raio do chifre; o Arco-Íris fere e encanta uma fila de inimigos, que passam a lutar do seu lado.',
    speed: 125,
    attack: { damage: 8, range: 100, cooldown: 0.5, pattern: { kind: 'single' }, healPerHit: 0 },
    pulse: { name: 'Arco-Íris', damage: 30, radius: 0, cooldown: 15, healPerEnemy: 0, effect: { kind: 'rainbow', length: 190, width: 30, charm: 4 } },
    raceBonus: { kind: 'range', value: 0.1 },
    color: '#ffd0f4',
    maxHp: 100,
    cost: 0,
    gift: 'unicorn',
  },
};
/** Todos os heróis, inclusive os exclusivos (validar saves). */
export const ALL_HERO_IDS = Object.keys(HEROES) as HeroId[];
/** Heróis públicos (telas e contagens); os de presente só aparecem para quem tem. */
export const HERO_IDS = ALL_HERO_IDS.filter((id) => !HEROES[id].gift);
export const STARTER_HERO: HeroId = 'knight';
