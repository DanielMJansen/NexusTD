import type { NexusModelId } from './nexusSkins';
import type { EnemyId } from './enemies';
import { WAVES } from './waves';
import type { BossEntry, WaveEntry } from './waves';

export type StageId = 'graveyard' | 'swamp';
/** Cenário desenhado na arena. */
export type Biome = 'graveyard' | 'swamp';

/** Lama: criaturas invocadas nela atacam mais devagar; o herói anda mais devagar. */
export interface MudTerrain {
  kind: 'mud';
  pools: { x: number; y: number; rx: number; ry: number }[];
  /** Fração a menos na velocidade de ataque das criaturas na lama. */
  creatureAttackSlow: number;
  /** Fração a menos na velocidade do herói na lama. */
  heroSlow: number;
}

export type Terrain = MudTerrain;

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
export interface WeatherRule {
  kind: 'blizzard';
  /** Segundos entre um clima e outro, duração e aviso antes de começar. */
  every: number;
  duration: number;
  warning: number;
  /** Multiplicador de alcance das criaturas fora das fogueiras acesas. */
  rangeMultiplier: number;
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
}

export const DEFAULT_MAP: StageMap = { width: 640, height: 360, nexus: { x: 320, y: 180 } };

/** Fase: bioma, inimigos e chefes próprios; as regras de onda (quantidade, escala, elites) são globais. */
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
}

export const STAGES: Record<StageId, StageDef> = {
  graveyard: {
    id: 'graveyard',
    number: 1,
    name: 'Cemitério',
    description: 'Mortos-vivos, aranhas e gárgulas cercam o Nexus entre lápides e velas.',
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
};

export const STAGE_IDS = Object.keys(STAGES) as StageId[];
export const FIRST_STAGE: StageId = 'graveyard';

/** Número de ondas da fase (roteiro ou o padrão). */
export const stageWaveCount = (id: StageId): number => STAGES[id].script?.length ?? WAVES.total;

/** Onda roteirizada (null nas fases sem roteiro e no Sem Fim). */
export const scriptedWave = (id: StageId, wave: number): ScriptedWave | null => STAGES[id].script?.[wave - 1] ?? null;
