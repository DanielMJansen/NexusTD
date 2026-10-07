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
  | 'boneWarrior'
  | 'ogreKing'
  | 'spiderQueen'
  | 'lich'
  | 'toad'
  | 'leech'
  | 'bogHag'
  | 'crocodile'
  | 'wisp'
  | 'toadKing'
  | 'elderCroc'
  | 'hydra'
  | 'frostWolf'
  | 'snowGolem'
  | 'snowball'
  | 'iceSpirit'
  | 'glacierTroll'
  | 'kobold'
  | 'yetiElder'
  | 'frostWyrm';

/** Habilidades e passivas dos inimigos (cada uma tem seu próprio tempo de recarga). */
export type EnemyTrait =
  /** Atira no herói quando ele está ao alcance (anda devagar enquanto mira). */
  | { kind: 'ranged'; range: number; damage: number; cooldown: number }
  /** Ao morrer, se divide em inimigos menores. */
  | { kind: 'split'; into: EnemyId; count: number }
  /** Alterna entre voar e pousar como pedra (parado, com armadura extra). */
  | { kind: 'stone'; fly: number; rest: number; armor: number }
  /** Lança teia (ou praga, com look 'curse') nas criaturas mais próximas: atacam mais devagar. */
  | { kind: 'web'; range: number; cooldown: number; duration: number; slow: number; targets: number; look?: 'web' | 'curse' }
  /** Salto: pula `distance` em direção ao Nexus em `duration` s, passando por cima de bloqueios. */
  | { kind: 'leap'; cooldown: number; distance: number; duration: number }
  /** Suga: cada golpe no Nexus cura `amount` da vida máxima; encostado no herói, `amount` por segundo. */
  | { kind: 'drain'; amount: number }
  /** Submerso: dentro da lama fica intocável (não é alvo nem leva dano). */
  | { kind: 'submerge' }
  /** Isca: as criaturas que o alcançam atiram nele primeiro. */
  | { kind: 'lure' }
  /** Engole a criatura mais próxima: fora de combate por `duration` s ou até levar `breakDamage` da vida máxima. */
  | { kind: 'swallow'; range: number; cooldown: number; duration: number; breakDamage: number }
  /** Mergulha (intocável por `hide` s) e reaparece a `landAt` do Nexus, já em investida. */
  | { kind: 'burrow'; cooldown: number; hide: number; landAt: number }
  /** Congela criaturas (toque ou bola de neve): ficam paradas por `duration` s. */
  | { kind: 'freeze'; range: number; cooldown: number; duration: number; targets: number }
  /** Regenera `perSecond` da vida máxima por segundo, a não ser que tenha levado dano de fogo há pouco. */
  | { kind: 'regen'; perSecond: number }
  /** Mergulha sob o gelo (intocável e mais rápido) e emerge rachando o gelo e congelando criaturas próximas. */
  | { kind: 'dive'; surface: number; dive: number; radius: number; freeze: number }
  /** Cabeças: cada uma é uma barra de vida; cabeças cortadas renascem em dobro após `regrow` s (até `max`). */
  | { kind: 'heads'; start: number; max: number; regrow: number }
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
  /** Inimigo de gelo: leva +25% de dano de criaturas de fogo. */
  frost?: boolean;
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
  boneWarrior: {
    ...base,
    id: 'boneWarrior',
    name: 'Esqueleto Aliado',
    description: 'Erguido pelos nossos mortos: luta contra os inimigos por alguns segundos.',
    hp: 40,
    speed: 45,
    radius: 7,
    color: '#e8f0c8',
    nexusDamage: 0,
    heroDps: 12,
    gold: 0,
    xp: 0,
    minion: true,
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
  // ---------- Pântano (Fase 2) ----------
  toad: {
    ...base,
    id: 'toad',
    name: 'Sapo-Boi',
    description: 'Pula para a frente de tempos em tempos, por cima de quem tenta segurá-lo.',
    hp: 26,
    speed: 24,
    radius: 8,
    color: '#7a9a4a',
    nexusDamage: 6,
    heroDps: 8,
    gold: 3,
    xp: 3,
    pack: { chance: 0.25, angleOffsets: [0.1] },
    traits: [{ kind: 'leap', cooldown: 4, distance: 45, duration: 0.45 }],
  },
  leech: {
    ...base,
    id: 'leech',
    name: 'Sanguessuga',
    description: 'Fraca e rápida, vem em bando e se cura a cada golpe.',
    hp: 9,
    speed: 52,
    radius: 5,
    scale: 0.75,
    color: '#a03a5a',
    nexusDamage: 3,
    heroDps: 6,
    gold: 1,
    xp: 1,
    pack: { chance: 0.6, angleOffsets: [0.1, -0.1, 0.2] },
    traits: [{ kind: 'drain', amount: 0.3 }],
  },
  bogHag: {
    ...base,
    id: 'bogHag',
    name: 'Bruxa do Brejo',
    description: 'Amaldiçoa a criatura mais próxima, que passa a atacar bem mais devagar.',
    hp: 30,
    speed: 22,
    radius: 8,
    color: '#8aba5a',
    nexusDamage: 6,
    heroDps: 5,
    gold: 5,
    xp: 4,
    traits: [{ kind: 'web', look: 'curse', range: 110, cooldown: 5, duration: 4, slow: 0.4, targets: 1 }],
  },
  crocodile: {
    ...base,
    id: 'crocodile',
    name: 'Crocodilo',
    description: 'Blindado. Dentro da lama fica submerso e intocável.',
    hp: 110,
    speed: 17,
    radius: 12,
    scale: 1.25,
    color: '#5a7a3a',
    nexusDamage: 14,
    heroDps: 14,
    gold: 8,
    xp: 7,
    armor: 4,
    traits: [{ kind: 'submerge' }],
  },
  wisp: {
    ...base,
    id: 'wisp',
    name: 'Fogo-fátuo',
    description: 'Luz enganosa que flutua: as criaturas atiram nela primeiro.',
    hp: 22,
    speed: 34,
    radius: 6,
    color: '#7affe0',
    nexusDamage: 4,
    heroDps: 3,
    gold: 4,
    xp: 3,
    flying: true,
    zigzag: { lateralSpeed: 24, frequency: 2 },
    traits: [{ kind: 'lure' }],
  },
  toadKing: {
    ...base,
    id: 'toadKing',
    name: 'Rei Sapo',
    description: 'Chefe. Pula e engole uma criatura, que só volta quando ele leva dano suficiente.',
    hp: 440,
    speed: 13,
    radius: 18,
    scale: 2.2,
    color: '#9aba4a',
    nexusDamage: 35,
    heroDps: 35,
    gold: 35,
    xp: 45,
    armor: 3,
    isBoss: true,
    traits: [
      { kind: 'leap', cooldown: 7, distance: 40, duration: 0.6 },
      { kind: 'swallow', range: 75, cooldown: 12, duration: 5, breakDamage: 0.12 },
    ],
  },
  elderCroc: {
    ...base,
    id: 'elderCroc',
    name: 'Crocodilo Ancião',
    description: 'Chefe. Mergulha, some e reaparece perto do Nexus em investida.',
    hp: 680,
    speed: 14,
    radius: 18,
    scale: 2,
    color: '#4a6a3a',
    nexusDamage: 45,
    heroDps: 35,
    gold: 50,
    xp: 65,
    armor: 5,
    isBoss: true,
    traits: [
      { kind: 'burrow', cooldown: 14, hide: 1.4, landAt: 130 },
      { kind: 'charge', cooldown: 9, duration: 0.8, speedMultiplier: 2.5 },
    ],
  },
  hydra: {
    ...base,
    id: 'hydra',
    name: 'Hidra',
    description: 'Chefe final. Cada cabeça é uma barra de vida; cabeças cortadas renascem em dobro se ela não morrer a tempo.',
    hp: 250,
    speed: 11,
    radius: 20,
    scale: 2.2,
    color: '#4a9a6a',
    nexusDamage: 70,
    heroDps: 40,
    gold: 90,
    xp: 110,
    armor: 4,
    isBoss: true,
    traits: [
      { kind: 'heads', start: 3, max: 5, regrow: 10 },
      { kind: 'ranged', range: 120, damage: 6, cooldown: 1.8 },
    ],
  },
  // ---------- Tundra (Fase 3) ----------
  frostWolf: {
    ...base,
    id: 'frostWolf',
    name: 'Lobo Gélido',
    description: 'Rápido e fraco; caça em matilha.',
    hp: 15,
    speed: 56,
    radius: 7,
    scale: 0.95,
    color: '#cfe6ff',
    nexusDamage: 4,
    heroDps: 7,
    gold: 2,
    xp: 2,
    frost: true,
    pack: { chance: 0.45, angleOffsets: [0.08, -0.08] },
  },
  snowGolem: {
    ...base,
    id: 'snowGolem',
    name: 'Golem de Neve',
    description: 'Lento e resistente; ao morrer se desfaz em bolas de neve que rolam rápido.',
    hp: 70,
    speed: 18,
    radius: 11,
    scale: 1.25,
    color: '#e8f4ff',
    nexusDamage: 10,
    heroDps: 10,
    gold: 6,
    xp: 6,
    armor: 2,
    frost: true,
    traits: [{ kind: 'split', into: 'snowball', count: 3 }],
  },
  snowball: {
    ...base,
    id: 'snowball',
    name: 'Bola de Neve',
    description: 'Rola rápido até o Nexus.',
    hp: 10,
    speed: 64,
    radius: 5,
    scale: 0.7,
    color: '#ffffff',
    nexusDamage: 3,
    heroDps: 4,
    gold: 1,
    xp: 1,
    frost: true,
    minion: true,
  },
  iceSpirit: {
    ...base,
    id: 'iceSpirit',
    name: 'Espírito do Gelo',
    description: 'Voa até as criaturas e congela a que tocar.',
    hp: 24,
    speed: 32,
    radius: 6,
    color: '#9adcff',
    nexusDamage: 5,
    heroDps: 4,
    gold: 4,
    xp: 3,
    flying: true,
    frost: true,
    zigzag: { lateralSpeed: 20, frequency: 2.5 },
    traits: [{ kind: 'freeze', range: 26, cooldown: 6, duration: 2, targets: 1 }],
  },
  glacierTroll: {
    ...base,
    id: 'glacierTroll',
    name: 'Troll da Geleira',
    description: 'Tanque que regenera a vida, a não ser que leve dano de fogo.',
    hp: 150,
    speed: 16,
    radius: 12,
    scale: 1.35,
    color: '#7a90a8',
    nexusDamage: 14,
    heroDps: 14,
    gold: 9,
    xp: 8,
    armor: 3,
    frost: true,
    traits: [{ kind: 'regen', perSecond: 0.04 }],
  },
  kobold: {
    ...base,
    id: 'kobold',
    name: 'Kobold Escavador',
    description: 'Cava por baixo da neve e surge perto do Nexus, longe das trilhas.',
    hp: 28,
    speed: 26,
    radius: 7,
    scale: 0.85,
    color: '#b87a4a',
    nexusDamage: 5,
    heroDps: 6,
    gold: 4,
    xp: 3,
    traits: [{ kind: 'burrow', cooldown: 14, hide: 2, landAt: 120 }],
  },
  yetiElder: {
    ...base,
    id: 'yetiElder',
    name: 'Yeti Ancião',
    description: 'Chefe. Arremessa bolas de neve que congelam criaturas e pisa no chão.',
    hp: 440,
    speed: 13,
    radius: 18,
    scale: 2.2,
    color: '#e8f0f8',
    nexusDamage: 25,
    heroDps: 35,
    gold: 40,
    xp: 50,
    armor: 3,
    frost: true,
    isBoss: true,
    traits: [
      { kind: 'freeze', range: 150, cooldown: 5.5, duration: 2.2, targets: 1 },
      { kind: 'stomp', radius: 70, stun: 1, cooldown: 12 },
    ],
  },
  frostWyrm: {
    ...base,
    id: 'frostWyrm',
    name: 'Wyrm de Gelo',
    description: 'Chefe final. Nada sob o gelo do lago, intocável, e emerge rachando o gelo e congelando as criaturas.',
    hp: 1150,
    speed: 12,
    radius: 20,
    scale: 2.2,
    color: '#7ab8e8',
    nexusDamage: 70,
    heroDps: 40,
    gold: 100,
    xp: 120,
    armor: 3,
    frost: true,
    isBoss: true,
    traits: [
      { kind: 'dive', surface: 7, dive: 3, radius: 80, freeze: 1.8 },
      { kind: 'ranged', range: 120, damage: 10, cooldown: 2 },
    ],
  },
};

export const ENEMY_IDS = Object.keys(ENEMIES) as EnemyId[];
