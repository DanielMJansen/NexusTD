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
  | 'cauldron'
  | 'cleric'
  | 'batSwarm'
  | 'storm'
  | 'howler'
  | 'possessor'
  | 'herbalist'
  | 'enchantress'
  | 'trickster'
  | 'lumina';

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
  | { kind: 'bounty'; gold: number }
  /**
   * Bênção: aura que fortalece as criaturas no raio (+dano, +alcance, +vel. de ataque,
   * +dano crítico, proteção contra teia/atordoamento) e, opcionalmente, fere inimigos dentro dela.
   */
  | {
      kind: 'bless';
      radius: number;
      damage?: number;
      range?: number;
      attackSpeed?: number;
      critDamage?: number;
      protect?: boolean;
      /** Dano por segundo em inimigos dentro da aura. */
      dps?: number;
    }
  /** Golpe em área ao redor da própria criatura (todos dentro do raio). */
  | { kind: 'nova'; radius: number }
  /** Raio que atravessa todos os inimigos em linha (em leque, se `beams` > 1). */
  | { kind: 'pierce'; width: number; beams: number };

/** Efeitos extras aplicados a cada inimigo atingido (ou ao abater), combináveis entre si. */
export type HitEffect =
  /** Dano contínuo (veneno, sangramento). */
  | { kind: 'poison'; dps: number; duration: number }
  /** Para o inimigo: atordoado, preso em raízes ou petrificado (só muda o visual). */
  | { kind: 'stun'; chance: number; duration: number; look?: 'stun' | 'root' | 'stone' }
  /** Foge do Nexus: medo ou confusão (só muda o visual). */
  | { kind: 'fear'; chance: number; duration: number; look?: 'fear' | 'confuse' }
  /** Marca: recebe +amount de dano de todas as fontes; `explode` = explode ao morrer marcado. */
  | { kind: 'mark'; amount: number; duration: number; explode?: { radius: number; ratio: number } }
  /** Corrói a armadura por um tempo. */
  | { kind: 'corrode'; armor: number; duration: number }
  /** Enfraquece: anda mais devagar e causa menos dano ao Nexus. */
  | { kind: 'weaken'; slow: number; damage: number; duration: number }
  /** Puxa o inimigo na direção da criatura. */
  | { kind: 'pull'; distance: number }
  /** Possui: o inimigo vira aliado temporário (chefes resistem); `explode` ao fim. */
  | { kind: 'possess'; duration: number; explode?: { radius: number; ratio: number } }
  /** Inimigos comuns abaixo desta fração de vida morrem na hora. */
  | { kind: 'execute'; below: number }
  /** Dano extra contra elites e chefes. */
  | { kind: 'vsStrong'; bonus: number }
  /** Cada abate acelera os ataques até o fim da onda. */
  | { kind: 'killHaste'; perKill: number; max: number }
  /** Cada abate aumenta o dano até o fim da onda. */
  | { kind: 'killDamage'; perKill: number; max: number }
  /** Chance de roubar ouro a cada golpe. */
  | { kind: 'steal'; chance: number; gold: number }
  /** Ouro extra ao abater (sempre, só execuções ou só inimigos com medo/confusos). */
  | { kind: 'goldOnKill'; gold: number; when: 'any' | 'executed' | 'feared' }
  /** Chance de erguer um esqueleto aliado temporário ao abater. */
  | { kind: 'raiseOnKill'; chance: number; duration: number }
  /** Recebe mais dano por um tempo (Tormento): igual à marca, mas sem ícone próprio. */
  | { kind: 'vulnerable'; amount: number; duration: number };

/** Como a criatura escolhe o alvo: o mais perto do Nexus (padrão) ou o mais forte. */
export type Targeting = 'first' | 'strongest';

/** Uma das duas formas evoluídas (vertentes) do nível máximo. */
export interface AscendedForm {
  name: string;
  /** Resumo da vertente na escolha. */
  description: string;
  ability: CreatureAbility;
  /** Multiplicadores extras de atributo desta vertente. */
  stats?: { damage?: number; range?: number; cooldown?: number };
  /** Efeitos de golpe desta vertente (substituem os da forma base). */
  effects?: HitEffect[];
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
  /** Efeitos aplicados a cada inimigo atingido. */
  effects?: HitEffect[];
  /** Como escolhe o alvo (padrão: o mais perto do Nexus). */
  targeting?: Targeting;
  /** Criatura voadora (sombra menor, flutua). */
  flying?: boolean;
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
  cleric: {
    id: 'cleric',
    name: 'Clériga',
    race: 'Humano',
    role: 'Suporte (bênção)',
    description: 'Abençoa as criaturas ao redor, que causam mais dano. Ataca com luz, mas o forte dela é fortalecer o grupo.',
    lore: 'Reza ao cristal todas as noites. Ele nunca respondeu, mas as flechas dela acertam mais.',
    icon: '✚',
    baseCost: 25,
    damage: 5,
    range: 90,
    cooldown: 1,
    color: '#ffe9a8',
    ability: { kind: 'bless', radius: 80, damage: 0.15 },
    unlock: { kind: 'essence', cost: 70 },
    ascended: [
      { name: 'Sacerdotisa', description: 'Bênção maior e mais forte, que também protege contra teia e atordoamento.', ability: { kind: 'bless', radius: 100, damage: 0.25, protect: true }, color: '#ffd25a', icon: '✚' },
      { name: 'Inquisidora', description: 'Troca a bênção por raios de luz pesados que atordoam.', ability: { kind: 'none' }, effects: [{ kind: 'stun', chance: 0.35, duration: 1.2 }], stats: { damage: 2.6, range: 1.15 }, color: '#ff7a3a', icon: '☀' },
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
  batSwarm: {
    id: 'batSwarm',
    name: 'Enxame',
    race: 'Vampiro',
    role: 'Área móvel',
    description: 'Uma nuvem de morcegos que voa até o alvo e morde todos ao redor dele.',
    lore: 'Ninguém sabe quantos são. Eles também não.',
    icon: '🦇',
    baseCost: 30,
    damage: 6,
    range: 95,
    cooldown: 1,
    color: '#b04a8a',
    flying: true,
    ability: { kind: 'splash', radius: 32, damageRatio: 1 },
    unlock: { kind: 'essence', cost: 80 },
    ascended: [
      { name: 'Nuvem Sangrenta', description: 'Área maior; as mordidas fazem sangrar.', ability: { kind: 'splash', radius: 45, damageRatio: 1 }, effects: [{ kind: 'poison', dps: 6, duration: 3 }], color: '#ff3a50', icon: '♨' },
      { name: 'Revoada Faminta', description: 'Cada abate deixa o enxame mais rápido até o fim da onda.', ability: { kind: 'splash', radius: 32, damageRatio: 1 }, effects: [{ kind: 'killHaste', perKill: 0.05, max: 0.75 }], color: '#c86aff', icon: '➹' },
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
  storm: {
    id: 'storm',
    name: 'Tempestade',
    race: 'Dragão',
    role: 'Raio em cadeia',
    description: 'Dragão de nuvens que dispara raios que saltam de inimigo em inimigo.',
    lore: 'Nasce quando um trovão cai num ninho. Sempre chega antes do barulho.',
    icon: 'ϟ',
    baseCost: 30,
    damage: 9,
    range: 105,
    cooldown: 1.1,
    color: '#8a9aff',
    flying: true,
    ability: { kind: 'chain', jumps: 3, radius: 70, falloff: 0.85 },
    unlock: { kind: 'essence', cost: 80 },
    ascended: [
      { name: 'Dragão do Trovão', description: 'O raio salta para até 6 inimigos.', ability: { kind: 'chain', jumps: 6, radius: 75, falloff: 0.88 }, color: '#ffe060', icon: 'ϟ' },
      { name: 'Olho da Tormenta', description: 'O raio atordoa quem atinge.', ability: { kind: 'chain', jumps: 3, radius: 70, falloff: 0.85 }, effects: [{ kind: 'stun', chance: 0.3, duration: 1 }], color: '#5ad0ff', icon: '◉' },
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
  howler: {
    id: 'howler',
    name: 'Uivador',
    race: 'Lobisomem',
    role: 'Controle (medo)',
    description: 'De tempos em tempos solta um uivo que fere e assusta todos ao redor: eles fogem do Nexus.',
    lore: 'Uiva para a lua. A lua, por educação, não responde; os monstros correm.',
    icon: '🐺',
    baseCost: 30,
    damage: 4,
    range: 70,
    cooldown: 3,
    color: '#a8b8d8',
    ability: { kind: 'nova', radius: 70 },
    effects: [{ kind: 'fear', chance: 0.6, duration: 1.5 }],
    unlock: { kind: 'essence', cost: 70 },
    ascended: [
      { name: 'Uivo Lunar', description: 'Uivo mais largo; o medo dura mais e pega quase todos.', ability: { kind: 'nova', radius: 90 }, effects: [{ kind: 'fear', chance: 0.85, duration: 2.2 }], stats: { range: 1.2 }, color: '#9fdcff', icon: '☾' },
      { name: 'Grito de Guerra', description: 'Troca o medo por um grito que acelera os aliados próximos.', ability: { kind: 'bless', radius: 90, attackSpeed: 0.35 }, effects: [], stats: { cooldown: 0.4, damage: 2 }, color: '#ff6a3a', icon: '✊' },
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
  possessor: {
    id: 'possessor',
    name: 'Possessor',
    race: 'Fantasma',
    role: 'Controle (possessão)',
    description: 'Entra no corpo de um inimigo, que dá meia-volta e luta contra os outros por alguns segundos. Chefes resistem.',
    lore: 'Prefere corpos emprestados. Devolve sempre — em pior estado.',
    icon: '👁',
    baseCost: 35,
    damage: 4,
    range: 90,
    cooldown: 4,
    color: '#9a6aff',
    flying: true,
    ability: { kind: 'none' },
    effects: [{ kind: 'possess', duration: 4 }],
    unlock: { kind: 'essence', cost: 90 },
    ascended: [
      { name: 'Marionetista', description: 'Possui dois inimigos de uma vez, por mais tempo.', ability: { kind: 'multishot', targets: 2 }, effects: [{ kind: 'possess', duration: 4.5 }], color: '#d8a8ff', icon: '⚚' },
      { name: 'Devorador', description: 'O possuído explode no fim, ferindo quem estiver perto.', ability: { kind: 'none' }, effects: [{ kind: 'possess', duration: 4, explode: { radius: 50, ratio: 0.6 } }], color: '#ff4a6a', icon: '☠' },
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
  herbalist: {
    id: 'herbalist',
    name: 'Herbalista',
    race: 'Bruxa',
    role: 'Controle (raízes)',
    description: 'Faz brotar raízes do chão que prendem o alvo no lugar.',
    lore: 'Conhece o nome de cada planta da floresta. Algumas conhecem o dela.',
    icon: '🌿',
    baseCost: 25,
    damage: 5,
    range: 100,
    cooldown: 1.1,
    color: '#6ad87a',
    ability: { kind: 'none' },
    effects: [{ kind: 'stun', chance: 0.35, duration: 1.4, look: 'root' }],
    unlock: { kind: 'essence', cost: 70 },
    ascended: [
      { name: 'Jardim Venenoso', description: 'As raízes têm espinhos que envenenam.', ability: { kind: 'none' }, effects: [{ kind: 'stun', chance: 0.4, duration: 1.5, look: 'root' }, { kind: 'poison', dps: 10, duration: 3 }], color: '#b86aff', icon: '❀' },
      { name: 'Guardiã do Bosque', description: 'Raízes brotam em área e prendem vários de uma vez.', ability: { kind: 'splash', radius: 40, damageRatio: 0.6 }, effects: [{ kind: 'stun', chance: 0.35, duration: 1.4, look: 'root' }], color: '#5ad85a', icon: '♣' },
    ],
  },
  enchantress: {
    id: 'enchantress',
    name: 'Encantadora',
    race: 'Fada',
    role: 'Suporte (bênção)',
    description: 'Abençoa as criaturas ao redor: causam mais dano e alcançam mais longe.',
    lore: 'Canta para as flores e para as flechas. As duas obedecem.',
    icon: '✿',
    baseCost: 30,
    damage: 5,
    range: 95,
    cooldown: 1,
    color: '#ff8ad0',
    flying: true,
    ability: { kind: 'bless', radius: 85, damage: 0.12, range: 0.1 },
    unlock: { kind: 'essence', cost: 90 },
    ascended: [
      { name: 'Rainha das Flores', description: 'Bênção maior e mais forte.', ability: { kind: 'bless', radius: 110, damage: 0.2, range: 0.15 }, color: '#ffd25a', icon: '❀' },
      { name: 'Fada Guerreira', description: 'Troca a bênção por pó de estrelas em 3 alvos.', ability: { kind: 'multishot', targets: 3 }, stats: { damage: 2.4 }, color: '#ffb84a', icon: '⚔' },
    ],
  },
  trickster: {
    id: 'trickster',
    name: 'Travessa',
    race: 'Fada',
    role: 'Controle (confusão)',
    description: 'Joga pó de confusão: o inimigo atingido pode se perder e andar para trás.',
    lore: 'Troca o caminho dos monstros por diversão. Às vezes troca o seu também.',
    icon: '✧',
    baseCost: 25,
    damage: 6,
    range: 100,
    cooldown: 0.8,
    color: '#7ad85a',
    flying: true,
    ability: { kind: 'none' },
    effects: [{ kind: 'fear', chance: 0.3, duration: 1.6, look: 'confuse' }],
    unlock: { kind: 'essence', cost: 80 },
    ascended: [
      { name: 'Pregadora de Peças', description: 'O pó se espalha: confunde em área.', ability: { kind: 'splash', radius: 35, damageRatio: 0.5 }, effects: [{ kind: 'fear', chance: 0.35, duration: 1.8, look: 'confuse' }], color: '#ff8ad0', icon: '♣' },
      { name: 'Ladra de Ouro', description: 'Inimigos confusos que morrem rendem ouro extra.', ability: { kind: 'none' }, effects: [{ kind: 'fear', chance: 0.35, duration: 1.6, look: 'confuse' }, { kind: 'goldOnKill', gold: 3, when: 'feared' }], stats: { damage: 1.3 }, color: '#f0c35a', icon: '◉' },
    ],
  },
  lumina: {
    id: 'lumina',
    name: 'Lumina',
    race: 'Fada',
    role: 'Suporte (marca)',
    description: 'Ilumina o alvo: inimigos marcados recebem mais dano de todas as criaturas.',
    lore: 'Onde ela aponta, ninguém consegue se esconder — nem dos golpes.',
    icon: '✦',
    baseCost: 30,
    damage: 6,
    range: 110,
    cooldown: 0.9,
    color: '#fff0a0',
    flying: true,
    ability: { kind: 'none' },
    effects: [{ kind: 'mark', amount: 0.2, duration: 3 }],
    unlock: { kind: 'essence', cost: 90 },
    ascended: [
      { name: 'Farol', description: 'Marca 3 inimigos de uma vez, com marca mais forte.', ability: { kind: 'multishot', targets: 3 }, effects: [{ kind: 'mark', amount: 0.25, duration: 3.5 }], color: '#ffd25a', icon: '☀' },
      { name: 'Estrela Cadente', description: 'Marcados explodem em luz ao morrer.', ability: { kind: 'none' }, effects: [{ kind: 'mark', amount: 0.2, duration: 3, explode: { radius: 40, ratio: 0.4 } }], stats: { damage: 1.4 }, color: '#bfe8ff', icon: '★' },
    ],
  },
};
export const CREATURE_IDS = Object.keys(CREATURES) as CreatureId[];

/** Criaturas místicas são as de raças não humanas (o ovo inicial só oferece estas). */
export const isMystical = (def: CreatureDef): boolean => def.race !== 'Humano';
