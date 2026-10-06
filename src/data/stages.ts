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
    power: { hp: 1, damage: 1 },
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
    requires: null,
  },
  swamp: {
    id: 'swamp',
    number: 2,
    name: 'Pântano',
    description: 'Lama que prende os pés, sapos que saltam, sanguessugas e a Hidra que não morre fácil.',
    biome: 'swamp',
    color: '#7aba5a',
    power: { hp: 1.15, damage: 1.1 },
    essenceMultiplier: 1.25,
    fragments: true,
    nexusModel: 'lotus',
    composition: [
      { enemy: 'leech', fromWave: 1, weight: 9, perWave: -0.25, minWeight: 3 },
      { enemy: 'toad', fromWave: 1, weight: 6, perWave: -0.1, minWeight: 3 },
      { enemy: 'wisp', fromWave: 3, weight: 2.5, perWave: 0.03 },
      { enemy: 'bogHag', fromWave: 5, weight: 2.2, perWave: 0.02 },
      { enemy: 'crocodile', fromWave: 6, weight: 1.8, perWave: 0.05 },
      { enemy: 'slime', fromWave: 9, weight: 2, perWave: 0 },
    ],
    bosses: [
      { wave: 7, enemy: 'toadKing' },
      { wave: 14, enemy: 'elderCroc' },
      { wave: 20, enemy: 'hydra' },
    ],
    endlessBosses: ['toadKing', 'elderCroc', 'hydra'],
    terrain: {
      kind: 'mud',
      pools: [
        { x: 175, y: 105, rx: 52, ry: 28 },
        { x: 470, y: 100, rx: 50, ry: 27 },
        { x: 165, y: 268, rx: 56, ry: 30 },
        { x: 478, y: 262, rx: 54, ry: 29 },
      ],
      creatureAttackSlow: 0.25,
      heroSlow: 0.4,
    },
    requires: 'graveyard',
  },
};

export const STAGE_IDS = Object.keys(STAGES) as StageId[];
export const FIRST_STAGE: StageId = 'graveyard';

/** Número de ondas da fase (roteiro ou o padrão). */
export const stageWaveCount = (id: StageId): number => STAGES[id].script?.length ?? WAVES.total;

/** Onda roteirizada (null nas fases sem roteiro e no Sem Fim). */
export const scriptedWave = (id: StageId, wave: number): ScriptedWave | null => STAGES[id].script?.[wave - 1] ?? null;
