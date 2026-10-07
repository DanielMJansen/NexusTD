import type { NexusModelId } from './nexusSkins';
import type { EnemyId } from './enemies';
import { WAVES } from './waves';
import type { BossEntry, WaveEntry } from './waves';

export type StageId = 'graveyard' | 'swamp' | 'tundra' | 'desert';
/** Cenário desenhado na arena. */
export type Biome = 'graveyard' | 'swamp' | 'tundra' | 'desert';

/** Lama: criaturas invocadas nela atacam mais devagar; o herói anda mais devagar. */
export interface MudTerrain {
  kind: 'mud';
  pools: { x: number; y: number; rx: number; ry: number }[];
  /** Fração a menos na velocidade de ataque das criaturas na lama. */
  creatureAttackSlow: number;
  /** Fração a menos na velocidade do herói na lama. */
  heroSlow: number;
}

/** Lago congelado: inimigos deslizam (mais rápidos, não podem ser segurados); onde muitos passam, o gelo racha e vira buraco. */
export interface IceTerrain {
  kind: 'ice';
  lake: { x: number; y: number; rx: number; ry: number };
  /** Ilha de pedra (sem gelo) onde fica o Nexus. */
  island: { x: number; y: number; r: number };
  /** Multiplicador de velocidade no gelo. */
  slide: number;
  /** Tamanho da célula da grade de rachaduras e "cansaço" (segundos×inimigo) para rachar. */
  cell: number;
  crackAt: number;
  /** Segundos até o buraco congelar de novo. */
  holeTime: number;
}

/** Areia com oásis: o herói recupera vida dentro deles e as criaturas ali atacam mais rápido. */
export interface SandTerrain {
  kind: 'sand';
  oases: { x: number; y: number; r: number }[];
  /** Vida por segundo do herói dentro de um oásis. */
  heroRegen: number;
  /** Fração a mais na velocidade de ataque das criaturas dentro de um oásis. */
  creatureAttackSpeed: number;
}

export type Terrain = MudTerrain | IceTerrain | SandTerrain;

/** Geometria do mapa: tamanho do mundo e posição do Nexus (padrão: a tela, Nexus no centro). */
export interface StageMap {
  width: number;
  height: number;
  nexus: { x: number; y: number };
}

/**
 * Entrada de inimigos: o primeiro ponto é onde nascem (de preferência fora do mundo visível);
 * os seguintes são a trilha até perto do Nexus. Inimigos terrestres seguem a trilha; voadores vão direto.
 */
export interface Entrance {
  name: string;
  path: { x: number; y: number }[];
}

/** Objeto do mapa que o herói ativa ficando perto (fogueira: protege criaturas do clima ao redor). */
export interface Interactable {
  kind: 'brazier';
  x: number;
  y: number;
  /** Raio protegido quando acesa. */
  radius: number;
}

/** Clima periódico da fase (nevasca: alcance das criaturas cai, fogueiras apagam). */
export type WeatherKind = 'blizzard' | 'sandstorm';

/** Clima periódico: nevasca (alcance menor longe das fogueiras) ou tempestade de areia (inimigos longe ficam ocultos). */
export interface WeatherRule {
  kind: WeatherKind;
  /** Segundos entre um clima e outro, duração e aviso antes de começar. */
  every: number;
  duration: number;
  warning: number;
  /** Multiplicador de alcance das criaturas fora das fogueiras acesas. */
  rangeMultiplier: number;
  /** Tempestade de areia: inimigos (menos chefes) mais longe que isso do herói e de toda criatura ficam ocultos e não podem ser alvo. */
  revealRadius?: number;
}

/** Decoração do cenário (só visual): muro com portões, rio. */
export interface StageDecor {
  /** Muro ao redor do mapa, com aberturas onde as trilhas entram. */
  walls?: boolean;
  /** Rio: linha central e largura. */
  river?: { path: { x: number; y: number }[]; width: number };
}

/** Ponto extra a defender (ex.: segundo Nexus). Vital: se cair, a run acaba. */
export interface GuardPoint {
  name: string;
  x: number;
  y: number;
  hp: number;
  vital: boolean;
  /** Segundo Nexus: desenhado como o Nexus da fase e com a mesma vida máxima dele. */
  twin?: boolean;
}

/** Escolta: o Nexus (com criaturas e herói) muda de parada a cada `wavesPerStop` ondas. */
export interface EscortRule {
  stops: { x: number; y: number }[];
  wavesPerStop: number;
}

/** Tipo de onda do roteiro (muda a faixa e o que acontece). */
export type WaveKind = 'normal' | 'horde' | 'elite' | 'event' | 'boss' | 'truce';

/** Grupo de inimigos de uma onda roteirizada. */
export interface WaveGroup {
  enemy: EnemyId;
  count: number;
  /** Entrada (índice) por onde vêm; padrão: sorteada. */
  entrance?: number;
  /** Todos vêm como elite. */
  elite?: boolean;
}

/** Onda roteirizada: tipo, título e conteúdo próprios. */
export interface ScriptedWave {
  kind: WaveKind;
  /** Nome na faixa (ex.: "Matilha"). */
  title?: string;
  /** Grupos fixos (chefes também entram aqui). */
  groups?: WaveGroup[];
  /** Inimigos sorteados da composição da fase, como fração da quantidade normal da onda (padrão: 1 se não houver grupos). */
  rolls?: number;
  /** Segundos entre inimigos (padrão: a fórmula). */
  interval?: number;
  /** Entradas usadas pelos inimigos sorteados nesta onda (padrão: as de cada inimigo). */
  entrances?: number[];
  /** Força o clima da fase durante a onda inteira (ex.: Nevasca Eterna). */
  weather?: boolean;
  /** Evento da onda: avalanche que desce por uma entrada (avisada antes). */
  event?: { kind: 'avalanche'; entrance: number; delay: number; duration: number; width: number };
}

export const DEFAULT_MAP: StageMap = { width: 640, height: 360, nexus: { x: 320, y: 180 } };

/** Fase: bioma, inimigos e chefes próprios; as regras de onda (quantidade, escala, elites) são globais. */
/** Dica do tutorial da fase (quadro na primeira run da fase e na pausa). */
export interface StageTip {
  icon: string;
  title: string;
  text: string;
}

export interface StageDef {
  id: StageId;
  number: number;
  name: string;
  description: string;
  biome: Biome;
  color: string;
  /** Multiplicadores de vida e dano dos inimigos em toda a fase (fases seguintes começam mais fortes). */
  power: { hp: number; damage: number };
  /** Multiplicador da Essência ganha na fase. */
  essenceMultiplier: number;
  /** A fase rende Fragmentos de raça (Santuário). */
  fragments: boolean;
  /** Modelo do Nexus "do mapa". */
  nexusModel: NexusModelId;
  composition: WaveEntry[];
  bosses: BossEntry[];
  /** Chefes do Sem Fim, em rodízio. */
  endlessBosses: EnemyId[];
  /** Regra de mapa (opcional). */
  terrain?: Terrain;
  /** Geometria (padrão: DEFAULT_MAP). */
  map?: StageMap;
  /** Entradas com trilhas (padrão: inimigos vêm de todas as bordas, em linha reta). */
  entrances?: Entrance[];
  /** Roteiro de ondas (padrão: WAVES.total ondas pela fórmula, chefes em `bosses`). */
  script?: ScriptedWave[];
  /** Objetos interativos do mapa. */
  interactables?: Interactable[];
  /** Clima periódico. */
  weather?: WeatherRule;
  /** Pontos extras a defender. */
  guards?: GuardPoint[];
  /** Decoração do cenário. */
  decor?: StageDecor;
  /** Escolta (Nexus que avança por paradas). */
  escort?: EscortRule;
  /** Fase que precisa ser vencida para liberar esta (null = aberta desde o início). */
  requires: StageId | null;
  /** Como funciona a fase (sem números: os valores ficam nas regras acima). */
  intro: StageTip[];
}

export const STAGES: Record<StageId, StageDef> = {
  graveyard: {
    id: 'graveyard',
    number: 1,
    name: 'Cemitério',
    description: 'Mortos-vivos, aranhas e gárgulas cercam o Nexus entre lápides e velas.',
    intro: [
      { icon: '🚪', title: 'Muro e portões', text: 'O cemitério é cercado por um muro. Os inimigos entram pelos portões e seguem as alamedas até o Nexus; nas primeiras ondas, só pelos portões do oeste e do leste. Invoque criaturas ao longo das alamedas.' },
      { icon: '🗺', title: 'Mapa maior que a tela', text: 'A câmera acompanha o herói. O minimapa, no canto, mostra o Nexus, os inimigos e as suas criaturas.' },
      { icon: '🏴', title: 'Ondas especiais', text: 'Algumas ondas têm nome (Revoada, Noite dos Mortos, Cavaleiros...) e uma faixa avisa quando começam. Na Trégua não vem ninguém: aproveite para invocar, evoluir e melhorar o Nexus.' },
      { icon: '👑', title: 'Chefes', text: 'Nas ondas de chefe a música muda. O chefe é bem mais forte: concentre as criaturas e guarde o Pulso para ele.' },
    ],
    biome: 'graveyard',
    color: '#9a7aff',
    power: { hp: 0.75, damage: 0.85 },
    essenceMultiplier: 1,
    fragments: false,
    nexusModel: 'crystal',
    composition: [
      { enemy: 'zombie', fromWave: 1, weight: 10, perWave: -0.3, minWeight: 3 },
      { enemy: 'bat', fromWave: 2, weight: 4, perWave: 0 },
      { enemy: 'skeletonArcher', fromWave: 3, weight: 3, perWave: 0.05 },
      { enemy: 'ogre', fromWave: 4, weight: 2, perWave: 0.04 },
      { enemy: 'slime', fromWave: 5, weight: 3, perWave: 0 },
      { enemy: 'spider', fromWave: 6, weight: 3, perWave: 0 },
      { enemy: 'gargoyle', fromWave: 8, weight: 2.5, perWave: 0 },
      { enemy: 'headless', fromWave: 9, weight: 2, perWave: 0.05 },
      { enemy: 'darkBanshee', fromWave: 11, weight: 1.2, perWave: 0 },
      { enemy: 'necromancer', fromWave: 12, weight: 1, perWave: 0.03 },
    ],
    bosses: [
      { wave: 7, enemy: 'ogreKing' },
      { wave: 14, enemy: 'spiderQueen' },
      { wave: 20, enemy: 'lich' },
    ],
    endlessBosses: ['ogreKing', 'spiderQueen', 'lich'],
    // cemitério murado (1,5× a tela), 4 portões com alamedas até o Nexus
    map: { width: 960, height: 540, nexus: { x: 480, y: 270 } },
    entrances: [
      { name: 'Portão oeste', path: [{ x: -24, y: 270 }, { x: 30, y: 270 }, { x: 140, y: 270 }, { x: 200, y: 200 }, { x: 330, y: 200 }, { x: 390, y: 250 }] },
      { name: 'Portão leste', path: [{ x: 984, y: 270 }, { x: 930, y: 270 }, { x: 820, y: 270 }, { x: 760, y: 340 }, { x: 630, y: 340 }, { x: 570, y: 290 }] },
      { name: 'Portão norte', path: [{ x: 480, y: -24 }, { x: 480, y: 30 }, { x: 480, y: 80 }, { x: 590, y: 120 }, { x: 590, y: 175 }, { x: 520, y: 215 }] },
      { name: 'Portão sul', path: [{ x: 480, y: 564 }, { x: 480, y: 510 }, { x: 480, y: 460 }, { x: 370, y: 420 }, { x: 370, y: 365 }, { x: 440, y: 325 }] },
    ],
    decor: { walls: true },
    script: [
      { kind: 'normal', entrances: [0, 1] },
      { kind: 'normal', entrances: [0, 1] },
      { kind: 'normal', entrances: [0, 1] },
      { kind: 'horde', title: 'Revoada', groups: [{ enemy: 'bat', count: 18 }], rolls: 0.4, interval: 0.35 },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'boss', title: 'O Rei Ogro', groups: [{ enemy: 'ogreKing', count: 1 }], rolls: 1 },
      { kind: 'normal' },
      {
        kind: 'horde',
        title: 'Noite dos Mortos',
        groups: [
          { enemy: 'zombie', count: 7, entrance: 0 },
          { enemy: 'zombie', count: 7, entrance: 1 },
          { enemy: 'zombie', count: 7, entrance: 2 },
          { enemy: 'zombie', count: 7, entrance: 3 },
        ],
        rolls: 0.2,
        interval: 0.25,
      },
      { kind: 'truce', title: 'Trégua' },
      { kind: 'normal' },
      { kind: 'elite', title: 'Cavaleiros', groups: [{ enemy: 'headless', count: 4, elite: true }], rolls: 0.4 },
      { kind: 'normal' },
      { kind: 'boss', title: 'A Rainha Aranha', groups: [{ enemy: 'spiderQueen', count: 1 }], rolls: 1 },
      { kind: 'normal' },
      { kind: 'horde', title: 'Ninhada', groups: [{ enemy: 'spider', count: 24 }], rolls: 0.5, interval: 0.3 },
      { kind: 'normal' },
      { kind: 'elite', title: 'A Guarda do Lich', groups: [{ enemy: 'skeletonArcher', count: 4, elite: true }, { enemy: 'necromancer', count: 2, elite: true }], rolls: 0.5 },
      { kind: 'normal' },
      { kind: 'boss', title: 'O Lich', groups: [{ enemy: 'lich', count: 1 }], rolls: 1 },
    ],
    requires: null,
  },
  swamp: {
    id: 'swamp',
    number: 2,
    name: 'Pântano',
    description: 'Lama que prende os pés, sapos que saltam, sanguessugas e a Hidra que não morre fácil.',
    intro: [
      { icon: '🟤', title: 'Lama', text: 'Criaturas invocadas na lama atacam mais devagar, e o herói anda mais devagar dentro dela. Prefira invocar em terra firme, nas margens.' },
      { icon: '🌊', title: 'Rio', text: 'Além das quatro margens, os inimigos também chegam pelas duas pontas do rio, direto para a ilhota do Nexus.' },
      { icon: '🐊', title: 'Crocodilos', text: 'Dentro da lama, crocodilos ficam submersos e não podem ser atingidos. Posicione as criaturas onde eles saem da lama.' },
      { icon: '🐉', title: 'Hidra', text: 'No chefe final, cada cabeça é uma barra de vida. Cabeças cortadas renascem em dobro se a Hidra não morrer a tempo: junte dano e Pulso para acabar rápido.' },
    ],
    biome: 'swamp',
    color: '#7aba5a',
    power: { hp: 0.9, damage: 1 },
    essenceMultiplier: 1.25,
    fragments: true,
    nexusModel: 'lotus',
    composition: [
      { enemy: 'leech', fromWave: 1, weight: 9, perWave: -0.25, minWeight: 3, entrances: [0, 1, 2, 3] },
      { enemy: 'toad', fromWave: 1, weight: 6, perWave: -0.1, minWeight: 3, entrances: [0, 1, 2, 3] },
      { enemy: 'wisp', fromWave: 3, weight: 2.5, perWave: 0.03 },
      { enemy: 'bogHag', fromWave: 5, weight: 2.2, perWave: 0.02, entrances: [0, 1, 2, 3] },
      { enemy: 'crocodile', fromWave: 6, weight: 1.8, perWave: 0.05, entrances: [4, 5] },
      { enemy: 'slime', fromWave: 9, weight: 2, perWave: 0, entrances: [0, 1, 2, 3] },
    ],
    bosses: [
      { wave: 7, enemy: 'toadKing' },
      { wave: 14, enemy: 'elderCroc' },
      { wave: 20, enemy: 'hydra' },
    ],
    endlessBosses: ['toadKing', 'elderCroc', 'hydra'],
    terrain: {
      kind: 'mud',
      // lama no rio (crocodilos submersos) e nas trilhas
      pools: [
        { x: 150, y: 276, rx: 95, ry: 24 },
        { x: 390, y: 280, rx: 95, ry: 24 },
        { x: 890, y: 262, rx: 95, ry: 24 },
        { x: 1130, y: 268, rx: 95, ry: 24 },
        { x: 300, y: 140, rx: 44, ry: 22 },
        { x: 980, y: 140, rx: 44, ry: 22 },
        { x: 300, y: 400, rx: 44, ry: 22 },
        { x: 980, y: 400, rx: 44, ry: 22 },
      ],
      creatureAttackSlow: 0.25,
      heroSlow: 0.4,
    },
    // pântano largo (2× a tela) cortado por um rio; o Nexus fica numa ilhota no meio
    map: { width: 1280, height: 540, nexus: { x: 640, y: 270 } },
    entrances: [
      { name: 'Margem noroeste', path: [{ x: -24, y: 110 }, { x: 160, y: 120 }, { x: 360, y: 150 }, { x: 530, y: 210 }] },
      { name: 'Margem nordeste', path: [{ x: 1304, y: 110 }, { x: 1120, y: 120 }, { x: 920, y: 150 }, { x: 750, y: 210 }] },
      { name: 'Margem sudoeste', path: [{ x: -24, y: 430 }, { x: 160, y: 420 }, { x: 360, y: 390 }, { x: 530, y: 330 }] },
      { name: 'Margem sudeste', path: [{ x: 1304, y: 430 }, { x: 1120, y: 420 }, { x: 920, y: 390 }, { x: 750, y: 330 }] },
      { name: 'Rio (oeste)', path: [{ x: -24, y: 272 }, { x: 150, y: 276 }, { x: 390, y: 280 }, { x: 560, y: 272 }] },
      { name: 'Rio (leste)', path: [{ x: 1304, y: 268 }, { x: 1130, y: 268 }, { x: 890, y: 262 }, { x: 720, y: 268 }] },
    ],
    decor: { river: { path: [{ x: -40, y: 272 }, { x: 150, y: 276 }, { x: 390, y: 280 }, { x: 640, y: 270 }, { x: 890, y: 262 }, { x: 1130, y: 268 }, { x: 1320, y: 268 }], width: 54 } },
    script: [
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'horde', title: 'Enxame de Sanguessugas', groups: [{ enemy: 'leech', count: 12 }], rolls: 0, interval: 0.4, entrances: [0, 1, 2, 3] },
      { kind: 'normal' },
      { kind: 'boss', title: 'O Rei Sapo', groups: [{ enemy: 'toadKing', count: 1 }], rolls: 1 },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'truce', title: 'Trégua' },
      { kind: 'horde', title: 'Revoada de Fogos-fátuos', groups: [{ enemy: 'wisp', count: 10 }], rolls: 0.4, interval: 0.4 },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'boss', title: 'O Crocodilo Ancião', groups: [{ enemy: 'elderCroc', count: 1, entrance: 4 }], rolls: 1 },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'elite', title: 'Coro dos Sapos', groups: [{ enemy: 'toad', count: 10, elite: true }], rolls: 0.6 },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'boss', title: 'A Hidra', groups: [{ enemy: 'hydra', count: 1, entrance: 5 }], rolls: 1 },
    ],
    requires: 'graveyard',
  },
  tundra: {
    id: 'tundra',
    number: 3,
    name: 'Tundra Gelada',
    description: 'Um lago congelado cercado de montanhas: o gelo racha, a nevasca cega e a avalanche não perdoa.',
    intro: [
      { icon: '🧊', title: 'Gelo', text: 'No lago congelado os inimigos deslizam: ficam mais rápidos e não podem ser segurados. O Nexus fica numa ilha de pedra no meio.' },
      { icon: '🕳', title: 'O gelo racha', text: 'Onde muitos inimigos passam, o gelo racha (veja as trincas) e vira um buraco por um tempo. Inimigo comum que cai no buraco morre; chefes não caem.' },
      { icon: '❄', title: 'Nevasca', text: 'De tempos em tempos vem uma nevasca (com aviso antes): o alcance das criaturas cai, menos perto das fogueiras acesas. A nevasca apaga as fogueiras; pare o herói perto de uma para reacendê-la.' },
      { icon: '🔥', title: 'Fogo contra gelo', text: 'Criaturas de fogo (Dragão de Fogo, Diabrete, Infernal, Golem de Magma) causam mais dano aqui e impedem que os inimigos regenerem. Alguns inimigos de gelo congelam criaturas por alguns segundos.' },
      { icon: '🏔', title: 'Avalanche', text: 'Em algumas ondas, uma avalanche desce por uma trilha (com aviso): esmaga os inimigos comuns e congela as criaturas no caminho.' },
      { icon: '⚔', title: 'Corpo a corpo sofre', text: 'No gelo os inimigos passam deslizando, e o Wyrm de Gelo ataca de longe. Criaturas de corpo a corpo rendem menos aqui: misture criaturas à distância ou avance as de perto pelas trilhas. Os lobisomens saltam até quem está longe.' },
    ],
    biome: 'tundra',
    color: '#8ad0ff',
    power: { hp: 1.1, damage: 1 },
    essenceMultiplier: 1.5,
    fragments: true,
    nexusModel: 'glacier',
    composition: [
      { enemy: 'frostWolf', fromWave: 1, weight: 8, perWave: -0.2, minWeight: 3 },
      { enemy: 'snowGolem', fromWave: 2, weight: 4, perWave: 0 },
      { enemy: 'iceSpirit', fromWave: 4, weight: 2.5, perWave: 0.03 },
      { enemy: 'kobold', fromWave: 5, weight: 2, perWave: 0.02 },
      { enemy: 'glacierTroll', fromWave: 7, weight: 1.8, perWave: 0.04 },
    ],
    bosses: [
      { wave: 6, enemy: 'yetiElder' },
      { wave: 18, enemy: 'frostWyrm' },
    ],
    endlessBosses: ['yetiElder', 'frostWyrm'],
    // lago congelado (2 telas de largura) com o Nexus numa ilha de pedra; 3 passagens nas montanhas
    map: { width: 1280, height: 720, nexus: { x: 640, y: 380 } },
    entrances: [
      { name: 'Passagem norte', path: [{ x: 640, y: -24 }, { x: 640, y: 40 }, { x: 600, y: 110 }, { x: 640, y: 165 }, { x: 640, y: 290 }] },
      { name: 'Passagem oeste', path: [{ x: -24, y: 300 }, { x: 40, y: 300 }, { x: 150, y: 330 }, { x: 240, y: 370 }, { x: 540, y: 380 }] },
      { name: 'Passagem leste', path: [{ x: 1304, y: 300 }, { x: 1240, y: 300 }, { x: 1130, y: 330 }, { x: 1040, y: 370 }, { x: 740, y: 380 }] },
    ],
    terrain: { kind: 'ice', lake: { x: 640, y: 380, rx: 420, ry: 230 }, island: { x: 640, y: 380, r: 78 }, slide: 1.3, cell: 32, crackAt: 7, holeTime: 18 },
    interactables: [
      { kind: 'brazier', x: 520, y: 330, radius: 90 },
      { kind: 'brazier', x: 760, y: 330, radius: 90 },
      { kind: 'brazier', x: 640, y: 470, radius: 90 },
    ],
    weather: { kind: 'blizzard', every: 60, duration: 12, warning: 5, rangeMultiplier: 0.7 },
    script: [
      { kind: 'normal', entrances: [1, 2], rolls: 0.7 },
      { kind: 'normal', entrances: [1, 2], rolls: 0.7 },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'horde', title: 'Matilha', groups: [{ enemy: 'frostWolf', count: 28, entrance: 0 }], rolls: 0, interval: 0.18 },
      { kind: 'boss', title: 'O Yeti Ancião', groups: [{ enemy: 'yetiElder', count: 1, entrance: 0 }], rolls: 1 },
      { kind: 'normal' },
      { kind: 'normal' },
      { kind: 'elite', title: 'Guarda Gélida', groups: [{ enemy: 'glacierTroll', count: 3, elite: true }, { enemy: 'snowGolem', count: 3, elite: true }], rolls: 0.5 },
      { kind: 'event', title: 'Avalanche', groups: [{ enemy: 'frostWolf', count: 12, entrance: 0 }], rolls: 0.6, event: { kind: 'avalanche', entrance: 0, delay: 7, duration: 5, width: 34 } },
      { kind: 'truce', title: 'Trégua' },
      { kind: 'elite', title: 'Gigantes', groups: [{ enemy: 'glacierTroll', count: 5 }, { enemy: 'snowGolem', count: 4 }], rolls: 0.2, interval: 1.2 },
      { kind: 'event', title: 'Nevasca Eterna', weather: true },
      { kind: 'elite', title: 'Gigantes', groups: [{ enemy: 'glacierTroll', count: 3, elite: true }], rolls: 0.8 },
      { kind: 'normal' },
      {
        kind: 'horde',
        title: 'Grande Matilha',
        groups: [
          { enemy: 'frostWolf', count: 14, entrance: 0 },
          { enemy: 'frostWolf', count: 14, entrance: 1 },
          { enemy: 'frostWolf', count: 14, entrance: 2 },
        ],
        rolls: 0,
        interval: 0.12,
      },
      { kind: 'normal', rolls: 1.3 },
      { kind: 'boss', title: 'O Wyrm de Gelo', groups: [{ enemy: 'frostWyrm', count: 1, entrance: 0 }], rolls: 1 },
    ],
    requires: 'swamp',
  },
  desert: {
    id: 'desert',
    number: 4,
    name: 'Deserto Dourado',
    description: 'Dois Obeliscos Solares em dois oásis: proteja os dois, porque basta um cair para tudo acabar.',
    intro: [
      { icon: '☀', title: 'Dois Obeliscos', text: 'Há dois Nexus, um em cada oásis. Os inimigos atacam o mais próximo, e se qualquer um cair a run acaba. Divida as criaturas e mova o herói entre os dois lados.' },
      { icon: '🌴', title: 'Oásis', text: 'Parado num oásis, o herói recupera vida. Criaturas invocadas dentro dele atacam mais rápido.' },
      { icon: '🌪', title: 'Tempestade de areia', text: 'De tempos em tempos (com aviso) a areia cobre tudo: inimigos longe do herói e das criaturas ficam ocultos e não podem ser alvo até chegar perto. Espalhe criaturas pelas trilhas e use o herói para revelar.' },
      { icon: '🗺', title: 'Mapa aberto', text: 'Inimigos chegam pelo norte, pelo sul e pelas duas pontas da estrada de caravana. Use o zoom (roda do mouse) para ver o mapa inteiro.' },
    ],
    biome: 'desert',
    color: '#f0c35a',
    power: { hp: 1.25, damage: 1.05 },
    essenceMultiplier: 1.75,
    fragments: true,
    nexusModel: 'obelisk',
    // provisório (parte 1): inimigos de fases anteriores até chegarem os do deserto
    composition: [
      { enemy: 'spider', fromWave: 1, weight: 6, perWave: -0.15, minWeight: 2 },
      { enemy: 'gargoyle', fromWave: 2, weight: 3, perWave: 0.02 },
      { enemy: 'headless', fromWave: 4, weight: 2.5, perWave: 0.03 },
      { enemy: 'kobold', fromWave: 5, weight: 2, perWave: 0.02 },
      { enemy: 'ogre', fromWave: 7, weight: 1.6, perWave: 0.04 },
    ],
    bosses: [
      { wave: 10, enemy: 'ogreKing' },
      { wave: 20, enemy: 'lich' },
    ],
    endlessBosses: ['ogreKing', 'lich'],
    // deserto largo: Obelisco oeste (o Nexus principal) e Obelisco leste, cada um num oásis
    map: { width: 1280, height: 720, nexus: { x: 420, y: 380 } },
    guards: [{ name: 'Obelisco Leste', x: 860, y: 380, hp: 100, vital: true, twin: true }],
    entrances: [
      { name: 'Duna norte', path: [{ x: 640, y: -24 }, { x: 640, y: 60 }, { x: 610, y: 170 }, { x: 640, y: 280 }] },
      { name: 'Duna sul', path: [{ x: 640, y: 744 }, { x: 640, y: 660 }, { x: 670, y: 560 }, { x: 640, y: 480 }] },
      { name: 'Estrada oeste', path: [{ x: -24, y: 360 }, { x: 90, y: 350 }, { x: 200, y: 370 }, { x: 330, y: 380 }] },
      { name: 'Estrada leste', path: [{ x: 1304, y: 360 }, { x: 1190, y: 350 }, { x: 1080, y: 370 }, { x: 950, y: 380 }] },
    ],
    terrain: { kind: 'sand', oases: [{ x: 420, y: 380, r: 75 }, { x: 860, y: 380, r: 75 }], heroRegen: 4, creatureAttackSpeed: 0.15 },
    weather: { kind: 'sandstorm', every: 70, duration: 14, warning: 5, rangeMultiplier: 1, revealRadius: 85 },
    requires: 'tundra',
  },
};

export const STAGE_IDS = Object.keys(STAGES) as StageId[];
export const FIRST_STAGE: StageId = 'graveyard';

/** Número de ondas da fase (roteiro ou o padrão). */
export const stageWaveCount = (id: StageId): number => STAGES[id].script?.length ?? WAVES.total;

/** Onda roteirizada (null nas fases sem roteiro e no Sem Fim). */
export const scriptedWave = (id: StageId, wave: number): ScriptedWave | null => STAGES[id].script?.[wave - 1] ?? null;
