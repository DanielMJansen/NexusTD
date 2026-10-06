export type CreatureId =
  | 'archer'
  | 'guard'
  | 'duelist'
  | 'sanguine'
  | 'fireDragon'
  | 'iceDragon'
  | 'hunter'
  | 'alpha'
  | 'haunt'
  | 'banshee'
  | 'sorceress'
  | 'cauldron';

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
  | { kind: 'lifesteal'; healPerKill: number }
  /** O golpe salta do alvo para inimigos próximos, perdendo força a cada salto. */
  | { kind: 'chain'; jumps: number; radius: number; falloff: number }
  /** Criaturas aliadas dentro do raio atacam mais rápido (fração). */
  | { kind: 'aura'; radius: number; attackSpeed: number }
  /** Ignora a armadura; dano extra (fração) contra inimigos com armadura. */
  | { kind: 'pierceArmor'; bonusVsArmored: number }
  /** Grito em leque na direção do alvo: atinge todos e empurra para longe do Nexus. */
  | { kind: 'screech'; halfAngle: number; push: number; fear?: number }
  /** Envenena o alvo: dano por segundo durante um tempo. */
  | { kind: 'poison'; dps: number; duration: number }
  /** Cria uma poça no chão onde o alvo está: dano por segundo em quem estiver dentro. */
  | { kind: 'pool'; radius: number; duration: number; dps: number; bounty?: number }
  /** Chance extra de golpe crítico, com multiplicador próprio. */
  | { kind: 'crit'; chance: number; multiplier: number }
  /** Chance de atordoar o alvo (para de andar; chefes resistem). */
  | { kind: 'stun'; chance: number; duration: number }
  /** Chance de assustar o alvo (foge do Nexus; chefes resistem). */
  | { kind: 'fear'; chance: number; duration: number }
  /** Cada abate desta criatura rende ouro extra. */
  | { kind: 'bounty'; gold: number };

/** Uma das duas formas evoluídas (vertentes) do nível máximo. */
export interface AscendedForm {
  name: string;
  /** Resumo da vertente na escolha. */
  description: string;
  ability: CreatureAbility;
  /** Multiplicadores extras de atributo desta vertente. */
  stats?: { damage?: number; range?: number; cooldown?: number };
  /** Cor da aura e do emblema da vertente. */
  color: string;
  icon: string;
}

export type CreatureUnlock = { kind: 'start' } | { kind: 'essence'; cost: number };

export interface CreatureDef {
  id: CreatureId;
  name: string;
  race: string;
  /** Papel na defesa (GDD seção 4). */
  role: string;
  /** O que faz, em linguagem simples (Coleção e tooltips). */
  description: string;
  /** Uma ou duas frases de ambientação. */
  lore: string;
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
  /** As duas vertentes do nível máximo (o jogador escolhe uma ao evoluir). */
  ascended: [AscendedForm, AscendedForm];
}

// A ordem aqui é a ordem das cartas no painel (e dos atalhos 1, 2, 3...).
export const CREATURES: Record<CreatureId, CreatureDef> = {
  archer: {
    id: 'archer',
    name: 'Arqueiro',
    race: 'Humano',
    role: 'DPS à distância',
    description: 'Atira flechas de longe, um inimigo por vez. Barato e confiável para começar qualquer defesa.',
    lore: 'Caçador das fronteiras que jurou proteger o Nexus. Nunca erra duas vezes.',
    icon: '🏹',
    baseCost: 15,
    damage: 7,
    range: 120,
    cooldown: 0.7,
    color: '#8cf',
    ability: { kind: 'none' },
    unlock: { kind: 'start' },
    ascended: [
      { name: 'Patrulheiro', description: 'Dispara em dois alvos de uma vez.', ability: { kind: 'multishot', targets: 2 }, color: '#ffd25a', icon: '➶' },
      { name: 'Atirador de Elite', description: 'Mais alcance e golpes críticos devastadores, atirando mais devagar.', ability: { kind: 'crit', chance: 0.35, multiplier: 3.5 }, stats: { range: 1.3, cooldown: 1.15 }, color: '#ff7a5a', icon: '◎' },
    ],
  },
  guard: {
    id: 'guard',
    name: 'Guarda',
    race: 'Humano',
    role: 'Bloqueio',
    description:
      'Fica na linha de frente e segura até 2 inimigos parados enquanto o resto do exército ataca. Chefes passam direto.',
    lore: 'Veterano da guarda do cristal. O escudo dele já viu mais hordas do que estrelas.',
    icon: '🛡',
    baseCost: 20,
    damage: 5,
    range: 45,
    cooldown: 0.8,
    color: '#c9d4e8',
    ability: { kind: 'block', radius: 30, capacity: 2 },
    unlock: { kind: 'essence', cost: 30 },
    ascended: [
      { name: 'Paladino', description: 'Segura até 4 inimigos ao redor.', ability: { kind: 'block', radius: 36, capacity: 4 }, color: '#ffd25a', icon: '⛨' },
      { name: 'Martelo Sagrado', description: 'Troca o bloqueio por golpes pesados que atordoam.', ability: { kind: 'stun', chance: 0.35, duration: 1.2 }, stats: { damage: 1.4 }, color: '#9ad8ff', icon: '⚒' },
    ],
  },
  duelist: {
    id: 'duelist',
    name: 'Duelista',
    race: 'Vampiro',
    role: 'DPS alvo único',
    description:
      'Golpes rápidos num só alvo. A cada 6 golpes entra em frenesi: mais dano e ataques ainda mais rápidos por 3 s.',
    lore: 'Nobre vampiro que transforma cada duelo numa dança — e cada golpe numa sede maior.',
    icon: '🧛',
    baseCost: 20,
    damage: 8,
    range: 90,
    cooldown: 0.5,
    color: '#e33',
    ability: { kind: 'frenzy', hitsToTrigger: 6, duration: 3, damageMultiplier: 1.5, attackSpeedMultiplier: 2 },
    unlock: { kind: 'essence', cost: 40 },
    ascended: [
      { name: 'Conde Vampiro', description: 'Frenesi mais frequente, longo e forte.', ability: { kind: 'frenzy', hitsToTrigger: 4, duration: 4, damageMultiplier: 1.8, attackSpeedMultiplier: 2 }, color: '#ffd25a', icon: '♛' },
      { name: 'Lâmina Carmesim', description: 'Golpes críticos frequentes e mais rápidos, sem frenesi.', ability: { kind: 'crit', chance: 0.4, multiplier: 2.5 }, stats: { cooldown: 0.85 }, color: '#ff3a50', icon: '⚔' },
    ],
  },
  sanguine: {
    id: 'sanguine',
    name: 'Sanguinário',
    race: 'Vampiro',
    role: 'Sustento',
    description: 'Lança orbes de sangue à distância. Cada inimigo que ele derrota devolve vida ao Nexus.',
    lore: 'Mago de sangue que arranca a vida dos inimigos e a oferece ao cristal.',
    icon: '🩸',
    baseCost: 25,
    damage: 6,
    range: 100,
    cooldown: 0.8,
    color: '#d0304a',
    ability: { kind: 'lifesteal', healPerKill: 2 },
    unlock: { kind: 'essence', cost: 50 },
    ascended: [
      { name: 'Lorde de Sangue', description: 'Cada abate cura 4 de vida do Nexus.', ability: { kind: 'lifesteal', healPerKill: 4 }, color: '#ffd25a', icon: '♥' },
      { name: 'Mago de Sangue', description: 'Orbes de sangue que saltam entre inimigos.', ability: { kind: 'chain', jumps: 3, radius: 60, falloff: 0.8 }, stats: { damage: 1.5 }, color: '#c03ae0', icon: '❂' },
    ],
  },
  fireDragon: {
    id: 'fireDragon',
    name: 'Fogo',
    race: 'Dragão',
    role: 'Área',
    description: 'Bolas de fogo que explodem e ferem também quem estiver perto do alvo. Ótimo contra bandos.',
    lore: 'Filhote de dragão de pavio curto e fôlego longo.',
    icon: '🐉',
    baseCost: 30,
    damage: 14,
    range: 110,
    cooldown: 1.4,
    color: '#f90',
    ability: { kind: 'splash', radius: 40, damageRatio: 0.6 },
    unlock: { kind: 'essence', cost: 80 },
    ascended: [
      { name: 'Dragão Ancião', description: 'Explosão de fogo maior e mais forte.', ability: { kind: 'splash', radius: 60, damageRatio: 0.8 }, color: '#ffd25a', icon: '✹' },
      { name: 'Wyrm Infernal', description: 'Deixa o chão em chamas onde o golpe cai.', ability: { kind: 'pool', radius: 34, duration: 3, dps: 20 }, color: '#ff5a1a', icon: '♨' },
    ],
  },
  iceDragon: {
    id: 'iceDragon',
    name: 'Gelo',
    race: 'Dragão',
    role: 'Controle',
    description: 'Pouco dano, mas deixa os inimigos lentos — dá tempo para o resto do exército trabalhar.',
    lore: 'Nascido nas geleiras do norte, congela tudo o que encara.',
    icon: '🐲',
    baseCost: 25,
    damage: 4,
    range: 100,
    cooldown: 1,
    color: '#6cf',
    ability: { kind: 'slow', speedMultiplier: 0.5, duration: 1.5 },
    unlock: { kind: 'essence', cost: 80 },
    ascended: [
      { name: 'Dragão Glacial', description: 'Lentidão mais forte e mais longa.', ability: { kind: 'slow', speedMultiplier: 0.35, duration: 2.5 }, color: '#ffd25a', icon: '❄' },
      { name: 'Dragão Congelante', description: 'Chance de congelar o alvo no lugar.', ability: { kind: 'stun', chance: 0.3, duration: 1.4 }, stats: { damage: 1.3 }, color: '#bff0ff', icon: '✧' },
    ],
  },
  hunter: {
    id: 'hunter',
    name: 'Caçador',
    race: 'Lobisomem',
    role: 'Corpo a corpo em cadeia',
    description: 'Garras que saltam do alvo para os inimigos ao redor. Quanto mais gente junta, melhor.',
    lore: 'Na lua cheia, ninguém foge dele duas vezes.',
    icon: '🐺',
    baseCost: 25,
    damage: 12,
    range: 75,
    cooldown: 0.6,
    color: '#c8a070',
    ability: { kind: 'chain', jumps: 2, radius: 60, falloff: 0.8 },
    unlock: { kind: 'essence', cost: 60 },
    ascended: [
      { name: 'Caçador Lunar', description: 'Garras saltam para até 4 inimigos.', ability: { kind: 'chain', jumps: 4, radius: 65, falloff: 0.8 }, color: '#ffd25a', icon: '☾' },
      { name: 'Caçador Feral', description: 'Entra em frenesi a cada 5 golpes.', ability: { kind: 'frenzy', hitsToTrigger: 5, duration: 3, damageMultiplier: 1.6, attackSpeedMultiplier: 1.8 }, color: '#ff8a3a', icon: '✶' },
    ],
  },
  alpha: {
    id: 'alpha',
    name: 'Alfa',
    race: 'Lobisomem',
    role: 'Suporte (aura)',
    description: 'Líder da matilha: criaturas perto dele atacam mais rápido. Também morde quem chega perto.',
    lore: 'Um uivo dele e a matilha inteira acorda.',
    icon: '🌕',
    baseCost: 30,
    damage: 10,
    range: 65,
    cooldown: 0.6,
    color: '#9a8a7a',
    ability: { kind: 'aura', radius: 80, attackSpeed: 0.25 },
    unlock: { kind: 'essence', cost: 70 },
    ascended: [
      { name: 'Líder da Matilha', description: 'Aura maior que acelera ainda mais os aliados.', ability: { kind: 'aura', radius: 100, attackSpeed: 0.4 }, color: '#ffd25a', icon: '✪' },
      { name: 'Fera Devastadora', description: 'Troca a aura por golpes que atingem todos ao redor do alvo.', ability: { kind: 'splash', radius: 38, damageRatio: 0.75 }, stats: { damage: 1.3 }, color: '#e8743a', icon: '✷' },
    ],
  },
  haunt: {
    id: 'haunt',
    name: 'Assombração',
    race: 'Fantasma',
    role: 'Anti-armadura',
    description: 'Toques gélidos que atravessam qualquer armadura. A resposta para ogros e chefes.',
    lore: 'Não tem corpo para ferir, nem paciência para perdoar.',
    icon: '👻',
    baseCost: 25,
    damage: 8,
    range: 100,
    cooldown: 0.7,
    color: '#8ce8d8',
    ability: { kind: 'pierceArmor', bonusVsArmored: 0 },
    unlock: { kind: 'essence', cost: 60 },
    ascended: [
      { name: 'Espírito Vingativo', description: '+50% de dano contra inimigos com armadura.', ability: { kind: 'pierceArmor', bonusVsArmored: 0.5 }, color: '#ffd25a', icon: '☄' },
      { name: 'Aparição Gélida', description: 'Toque gelado e mais forte: o alvo fica 45% mais lento.', ability: { kind: 'slow', speedMultiplier: 0.55, duration: 2 }, stats: { damage: 1.6 }, color: '#8ce8ff', icon: '❅' },
    ],
  },
  banshee: {
    id: 'banshee',
    name: 'Banshee',
    race: 'Fantasma',
    role: 'Controle (empurrão)',
    description: 'Grito em leque que fere todos à frente e os empurra para longe do Nexus.',
    lore: 'Quem ouve o lamento dela costuma voltar correndo.',
    icon: '😱',
    baseCost: 30,
    damage: 5,
    range: 80,
    cooldown: 1.2,
    color: '#b8c8ff',
    ability: { kind: 'screech', halfAngle: 0.5, push: 22 },
    unlock: { kind: 'essence', cost: 70 },
    ascended: [
      { name: 'Banshee Ancestral', description: 'Grito mais largo que empurra mais longe.', ability: { kind: 'screech', halfAngle: 0.75, push: 34 }, color: '#ffd25a', icon: '♫' },
      { name: 'Arauto do Pavor', description: 'Grito em leque que aterroriza: em vez de empurrar, faz todos fugirem do Nexus.', ability: { kind: 'screech', halfAngle: 0.6, push: 0, fear: 1.4 }, stats: { damage: 1.3 }, color: '#a87aff', icon: '☠' },
    ],
  },
  sorceress: {
    id: 'sorceress',
    name: 'Feiticeira',
    race: 'Bruxa',
    role: 'Dano contínuo',
    description: 'Envenena o alvo: pouco dano no golpe, mas o veneno continua corroendo por alguns segundos.',
    lore: 'Sorri enquanto mexe o caldeirão — nunca é um bom sinal.',
    icon: '🧙',
    baseCost: 25,
    damage: 6,
    range: 110,
    cooldown: 0.8,
    color: '#7ad85a',
    ability: { kind: 'poison', dps: 11, duration: 3 },
    unlock: { kind: 'essence', cost: 60 },
    ascended: [
      { name: 'Arquibruxa', description: 'Veneno mais forte e mais longo.', ability: { kind: 'poison', dps: 16, duration: 4 }, color: '#ffd25a', icon: '☣' },
      { name: 'Feiticeira do Caos', description: 'Raios verdes que saltam entre 3 inimigos.', ability: { kind: 'chain', jumps: 3, radius: 70, falloff: 0.85 }, stats: { damage: 2.4, cooldown: 0.85 }, color: '#5adc8a', icon: 'ϟ' },
    ],
  },
  cauldron: {
    id: 'cauldron',
    name: 'Caldeirão',
    race: 'Bruxa',
    role: 'Área no chão',
    description: 'Arremessa poções que deixam uma poça borbulhante: quem pisar nela sofre dano por segundo.',
    lore: 'Dizem que a receita leva olho de zumbi. Os zumbis não acham graça.',
    icon: '🧪',
    baseCost: 35,
    damage: 5,
    range: 100,
    cooldown: 1.8,
    color: '#5ad8a8',
    ability: { kind: 'pool', radius: 30, duration: 3, dps: 16 },
    unlock: { kind: 'essence', cost: 80 },
    ascended: [
      { name: 'Caldeirão Infernal', description: 'Poça maior e mais venenosa.', ability: { kind: 'pool', radius: 40, duration: 4, dps: 24 }, color: '#ffd25a', icon: '♨' },
      { name: 'Caldeirão Alquímico', description: 'Poça dourada: quem morre nela vira ouro (+3 por abate).', ability: { kind: 'pool', radius: 32, duration: 3, dps: 16, bounty: 3 }, color: '#f0c35a', icon: '◉' },
    ],
  },
};
export const CREATURE_IDS = Object.keys(CREATURES) as CreatureId[];

/** Criaturas místicas são as de raças não humanas (o ovo inicial só oferece estas). */
export const isMystical = (def: CreatureDef): boolean => def.race !== 'Humano';
