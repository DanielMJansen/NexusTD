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
  /** Papel na defesa, em poucas palavras (ficha do herói: "Humano · Guardião corpo a corpo"). */
  role: string;
  description: string;
  /** História do herói (ficha na tela de heróis). */
  lore: string;
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
    role: 'Guardião corpo a corpo',
    description: 'Guardião versátil: espada rápida e uma investida com escudo que joga o perigo para longe do Nexus.',
    lore: 'Último da Ordem da Vigília, cavaleiros juramentados a guardar o Nexus da capital. A ordem caiu numa única noite e só ele saiu de pé, com a espada partida e o juramento inteiro. Não tem asas, garras nem magia: tem disciplina e a teimosia de quem já perdeu tudo uma vez e não pretende perder de novo.',
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
    role: 'Duelista corpo a corpo, se cura lutando',
    description: 'Duelista elegante: cada golpe devolve vida a ele, e a revoada de morcegos faz os inimigos sangrarem.',
    lore: 'Viveu quatro séculos entre bailes e intrigas, alimentando-se da nobreza que o temia. Quando os Nexus começaram a cair, entendeu antes de todos que um mundo sem vivos é um mundo sem banquete. Luta com elegância e sem pressa, e cada inimigo que cai o deixa um pouco mais jovem.',
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
    role: 'Lança-chamas resistente, dano em área',
    description: 'Meio-dragão lento e resistente: cospe fogo em leque e solta um jato de chamas que segue a mira.',
    lore: 'O último ovo de uma ninhada que os caçadores de dragões não chegaram a encontrar. Chocou sozinho, nas cinzas do ninho onde a mãe morreu, e cresceu sem ninguém para lhe ensinar o que era. Aprendeu a voar caindo e a cuspir fogo queimando a própria garganta. Hoje carrega o sangue de uma raça quase extinta e não pretende ser o último dela: se os Nexus caírem, não haverá mundo onde os dragões possam renascer.',
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
    role: 'Fera corpo a corpo, muito rápida',
    description: 'Fera de garras rapidíssimas. No Pulso vira um lobisomem gigante que ataca em leque e se cura a cada golpe.',
    lore: 'Era caçador de lobisomens até ser mordido pela fera que perseguia havia dez anos. Hoje lidera a matilha que um dia caçou e aprendeu a ouvir a lua em vez de temê-la. Ainda carrega as marcas das duas vidas: o faro da fera e a paciência do caçador.',
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
    role: 'Atravessador, ignora armadura',
    description: 'Ignora armaduras. O Pulso é uma travessia translúcida que fere tudo no caminho e espanta quem sobrevive.',
    lore: 'Morreu defendendo um Nexus e se recusou a atravessar o véu enquanto o cristal não estivesse seguro. Não sente frio, não sente dor e não lembra o próprio nome, só o dever. As armaduras não o detêm porque ele não precisa delas: passa através de tudo, inclusive dos inimigos.',
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
    role: 'Feiticeira à distância, controle',
    description: 'Ataca de longe com orbes. O feitiço transforma os inimigos ao redor em sapos lentos, frágeis e inofensivos.',
    lore: 'Viveu reclusa no fundo do Pântano, colecionando venenos, segredos e inimizades. Foi a primeira a perceber que os Nexus estavam se apagando, porque as poções dela pararam de funcionar. Não luta por heroísmo: luta porque sem magia no mundo ela é só uma velha com um caldeirão.',
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
    role: 'Suporte à distância',
    description: 'Frágil, mas rápida. A Bênção Feérica faz todas as criaturas atacarem muito mais rápido por alguns segundos.',
    lore: 'Governa um reino escondido entre o orvalho e a luz da manhã, invisível para quem não acredita. Os Nexus alimentam as flores do reino dela, e as flores estão murchando. Frágil como uma asa, mas uma palavra dela faz um exército inteiro lutar com o dobro da pressa.',
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
    role: 'Tanque, controle',
    description: 'Lento e muito resistente. Esmaga tudo à frente e abre uma fenda no chão que atordoa e deixa lento quem passa.',
    lore: 'Foi esculpido há milênios para proteger o primeiro Nexus e dormiu de pé ao lado dele até o dia em que o cristal tremeu. Fala pouco, anda devagar e não esquece nada. Cada pedra do corpo dele é uma promessa antiga, e nenhuma ainda foi quebrada.',
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
    role: 'Invocador corpo a corpo',
    description: 'Corta em leque com a foice. O Pulso ergue esqueletos que lutam do seu lado.',
    lore: 'Foi enterrado vivo por ordem de um rei que temia o que ele sabia. Passou sete dias no escuro da cripta, ouvindo os mortos ao redor, até que um deles respondeu. Saiu de lá com a foice do coveiro e um exército que nenhum rei poderia comprar. Conhece o outro lado do véu melhor do que qualquer vivo e sabe que o que está do lado de lá não quer servos. Quer só um mundo vazio.',
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
    role: 'Controladora a média distância',
    description: 'Ataca de média distância com a lança-serpente. O Olhar Fatal petrifica tudo num leque à frente.',
    lore: 'Rainha de um povo exilado em ruínas de mármore, cercada pelas estátuas de quem um dia tentou caçá-la. Os humanos a chamam de monstro, mas foi ela quem guardou o Nexus do Deserto por séculos, sozinha. Agora aceita aliados pela primeira vez e não olha diretamente para nenhum deles, por cortesia.',
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
    role: 'Destruidor de área',
    description: 'Lança chamas em leque. A Chuva de Meteoros custa parte da vida do herói, mas incendeia uma área inteira.',
    lore: 'Um senhor do abismo que fez um pacto com o próprio Nexus: poder em troca de proteção. Ninguém sabe ao certo quem saiu ganhando, nem mesmo ele. Paga em vida própria por cada explosão e sorri enquanto paga, porque, para um demônio, todo preço vale um bom espetáculo.',
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
    role: 'Caçador de chefes',
    description: 'Espada de luz rápida. O Juízo Celestial faz descer uma coluna de luz que fere forte e marca os inimigos.',
    lore: 'Desceu da Cidadela Celeste quando o Serafim que a governava foi corrompido pela mesma força que caça os Nexus. Carrega a vergonha de não ter percebido a tempo e uma espada de luz que não perdoa. Luta como quem quer consertar o céu inteiro, um inimigo de cada vez.',
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
    role: 'Encantador à distância',
    description: 'Unicórnio alado. Ataca com o raio do chifre; o Arco-Íris fere e encanta uma fila de inimigos, que passam a lutar do seu lado.',
    lore: 'Um ser tão raro que a maioria o considera lenda, inclusive os outros unicórnios. Nasceu da primeira luz que um Nexus emitiu e sente cada cristal que se apaga como uma ferida no próprio corpo. A luz do chifre dele não só fere: lembra aos inimigos de que lado eles deveriam estar.',
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
