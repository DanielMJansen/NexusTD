export type CreatureId = 'archer' | 'guard' | 'duelist' | 'sanguine' | 'fireDragon' | 'iceDragon';

export type CreatureAbility =
  | { kind: 'none' }
  /** Após N golpes, entra em frenesi: mais dano e ataques mais rápidos por um tempo. */
  | {
      kind: 'frenzy';
      hitsToTrigger: number;
      duration: number;
      damageMultiplier: number;
      attackSpeedMultiplier: number;
    }
  /** Inimigos perto do alvo recebem parte do dano. */
  | { kind: 'splash'; radius: number; damageRatio: number }
  /** O alvo fica lento por um tempo. */
  | { kind: 'slow'; speedMultiplier: number; duration: number }
  /** Ataca vários inimigos de uma vez (os mais próximos do Nexus). */
  | { kind: 'multishot'; targets: number }
  /** Segura até N inimigos (exceto chefes) dentro do raio: eles param de andar. */
  | { kind: 'block'; radius: number; capacity: number }
  /** Cada abate desta criatura cura o Nexus. */
  | { kind: 'lifesteal'; healPerKill: number };

export type CreatureUnlock = { kind: 'start' } | { kind: 'essence'; cost: number };

export interface CreatureDef {
  id: CreatureId;
  name: string;
  race: string;
  /** Papel na defesa (GDD seção 4). */
  role: string;
  icon: string;
  baseCost: number;
  damage: number;
  range: number;
  /** Segundos entre ataques. */
  cooldown: number;
  color: string;
  ability: CreatureAbility;
  /** Como começar a run com ela: já liberada ou comprada com Essência. */
  unlock: CreatureUnlock;
  /** Forma evoluída no nível máximo: novo nome e habilidade turbinada. */
  ascended: { name: string; ability: CreatureAbility };
}

// A ordem aqui é a ordem das cartas no painel (e dos atalhos 1, 2, 3...).
export const CREATURES: Record<CreatureId, CreatureDef> = {
  archer: {
    id: 'archer',
    name: 'Arqueiro',
    race: 'Humano',
    role: 'DPS à distância',
    icon: '🏹',
    baseCost: 15,
    damage: 7,
    range: 120,
    cooldown: 0.7,
    color: '#8cf',
    ability: { kind: 'none' },
    unlock: { kind: 'start' },
    ascended: { name: 'Patrulheiro', ability: { kind: 'multishot', targets: 2 } },
  },
  guard: {
    id: 'guard',
    name: 'Guarda',
    race: 'Humano',
    role: 'Bloqueio',
    icon: '🛡',
    baseCost: 20,
    damage: 5,
    range: 45,
    cooldown: 0.8,
    color: '#c9d4e8',
    ability: { kind: 'block', radius: 30, capacity: 2 },
    unlock: { kind: 'essence', cost: 30 },
    ascended: { name: 'Paladino', ability: { kind: 'block', radius: 36, capacity: 4 } },
  },
  duelist: {
    id: 'duelist',
    name: 'Duelista',
    race: 'Vampiro',
    role: 'DPS alvo único',
    icon: '🧛',
    baseCost: 20,
    damage: 8,
    range: 90,
    cooldown: 0.5,
    color: '#e33',
    ability: { kind: 'frenzy', hitsToTrigger: 6, duration: 3, damageMultiplier: 1.5, attackSpeedMultiplier: 2 },
    unlock: { kind: 'essence', cost: 40 },
    ascended: {
      name: 'Conde Vampiro',
      ability: { kind: 'frenzy', hitsToTrigger: 4, duration: 4, damageMultiplier: 1.8, attackSpeedMultiplier: 2 },
    },
  },
  sanguine: {
    id: 'sanguine',
    name: 'Sanguinário',
    race: 'Vampiro',
    role: 'Sustento',
    icon: '🩸',
    baseCost: 25,
    damage: 6,
    range: 100,
    cooldown: 0.8,
    color: '#d0304a',
    ability: { kind: 'lifesteal', healPerKill: 2 },
    unlock: { kind: 'essence', cost: 50 },
    ascended: { name: 'Lorde de Sangue', ability: { kind: 'lifesteal', healPerKill: 4 } },
  },
  fireDragon: {
    id: 'fireDragon',
    name: 'Fogo',
    race: 'Dragão',
    role: 'Área',
    icon: '🐉',
    baseCost: 30,
    damage: 14,
    range: 110,
    cooldown: 1.4,
    color: '#f90',
    ability: { kind: 'splash', radius: 40, damageRatio: 0.6 },
    unlock: { kind: 'essence', cost: 80 },
    ascended: { name: 'Dragão Ancião', ability: { kind: 'splash', radius: 60, damageRatio: 0.8 } },
  },
  iceDragon: {
    id: 'iceDragon',
    name: 'Gelo',
    race: 'Dragão',
    role: 'Controle',
    icon: '🐲',
    baseCost: 25,
    damage: 4,
    range: 100,
    cooldown: 1,
    color: '#6cf',
    ability: { kind: 'slow', speedMultiplier: 0.5, duration: 1.5 },
    unlock: { kind: 'essence', cost: 80 },
    ascended: { name: 'Dragão Glacial', ability: { kind: 'slow', speedMultiplier: 0.35, duration: 2.5 } },
  },
};

export const CREATURE_IDS = Object.keys(CREATURES) as CreatureId[];

/** Criaturas místicas são as de raças não humanas (o ovo inicial só oferece estas). */
export const isMystical = (def: CreatureDef): boolean => def.race !== 'Humano';
