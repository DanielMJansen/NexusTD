// Skins do Nexus: modelo (forma) + cor (paleta). Só visual. Padrão "do mapa": cada fase mostra seu modelo.
import type { AchievementId } from './achievements';
import type { StageId } from './stages';

export type NexusModelId = 'crystal' | 'lotus' | 'glacier' | 'obelisk' | 'eye';

/** Cores do Nexus; os modelos usam as mesmas chaves. */
export interface NexusPalette {
  /** Face escura, média e clara. */
  dark: string;
  mid: string;
  light: string;
  /** Brilho ao redor e luz no chão. */
  glow: string;
  /** Detalhes (estilhaços, miolo). */
  accent: string;
}

export interface NexusModelDef {
  id: NexusModelId;
  name: string;
  description: string;
  /** Fase que libera o modelo ao ser vencida (null = desde o início). */
  stage: StageId | null;
  /** Cores próprias do modelo (opção "Original"). */
  palette: NexusPalette;
}

export const NEXUS_MODELS: Record<NexusModelId, NexusModelDef> = {
  crystal: {
    id: 'crystal',
    name: 'Cristal Rúnico',
    description: 'O cristal flutuante do Cemitério.',
    stage: null,
    palette: { dark: '#7a3cf0', mid: '#a26bff', light: '#dcc4ff', glow: '#b36bff', accent: '#c9a8ff' },
  },
  lotus: {
    id: 'lotus',
    name: 'Lótus Ancestral',
    description: 'Uma flor de luz que brota do Pântano. Vença o Pântano para liberar.',
    stage: 'swamp',
    palette: { dark: '#c0407a', mid: '#f07ab0', light: '#ffd0e8', glow: '#ff8ac8', accent: '#ffe08a' },
  },
  glacier: {
    id: 'glacier',
    name: 'Pináculo Glacial',
    description: 'Uma agulha de gelo eterno da Tundra. Vença a Tundra para liberar.',
    stage: 'tundra',
    palette: { dark: '#3a8ad0', mid: '#7ac4f4', light: '#e4f6ff', glow: '#9adcff', accent: '#ffffff' },
  },
  obelisk: {
    id: 'obelisk',
    name: 'Obelisco Solar',
    description: 'Um obelisco de arenito com um sol de ouro no topo. Vença o Deserto para liberar.',
    stage: 'desert',
    palette: { dark: '#a06a10', mid: '#e8b030', light: '#fff0b0', glow: '#ffd25a', accent: '#ff8a3a' },
  },
  eye: {
    id: 'eye',
    name: 'Olho Celeste',
    description: 'Um olho de luz dentro de anéis de ouro que giram sobre as nuvens. Vença a Cidadela para liberar.',
    stage: 'citadel',
    palette: { dark: '#5a4aa8', mid: '#a890ff', light: '#f4f0ff', glow: '#c8b8ff', accent: '#ffd87a' },
  },
};

export const NEXUS_MODEL_IDS = Object.keys(NEXUS_MODELS) as NexusModelId[];

export type NexusColorUnlock =
  | { kind: 'essence'; cost: number }
  | { kind: 'achievement'; id: AchievementId }
  | { kind: 'altar'; tier: 'epic' | 'legendary' };

export interface NexusColorDef {
  id: string;
  name: string;
  palette: NexusPalette;
  /** Aurora: as cores giram com o tempo. */
  animated?: boolean;
  unlock: NexusColorUnlock;
}

export const NEXUS_COLORS: NexusColorDef[] = [
  { id: 'ruby', name: 'Rubi', palette: { dark: '#a01830', mid: '#e0304a', light: '#ffb0b8', glow: '#ff4a5a', accent: '#ff8a9a' }, unlock: { kind: 'essence', cost: 400 } },
  { id: 'emerald', name: 'Esmeralda', palette: { dark: '#108a50', mid: '#2fd080', light: '#b8ffd8', glow: '#4fe8a0', accent: '#8affc0' }, unlock: { kind: 'essence', cost: 400 } },
  { id: 'sapphire', name: 'Safira', palette: { dark: '#1840b0', mid: '#3a7aff', light: '#b8d4ff', glow: '#5a9aff', accent: '#9ac0ff' }, unlock: { kind: 'essence', cost: 400 } },
  { id: 'silver', name: 'Prata Lunar', palette: { dark: '#6a7488', mid: '#b8c4d8', light: '#f4f8ff', glow: '#d8e4ff', accent: '#ffffff' }, unlock: { kind: 'achievement', id: 'untouchable' } },
  { id: 'blood', name: 'Sangue', palette: { dark: '#4a0810', mid: '#8a1020', light: '#e04050', glow: '#c01830', accent: '#ff6070' }, unlock: { kind: 'achievement', id: 'slayer' } },
  { id: 'gold', name: 'Ouro Real', palette: { dark: '#a06a10', mid: '#e8b030', light: '#fff0b0', glow: '#ffd25a', accent: '#fff4c8' }, unlock: { kind: 'achievement', id: 'champion' } },
  { id: 'obsidian', name: 'Obsidiana', palette: { dark: '#0a0812', mid: '#2a2438', light: '#6a5a8a', glow: '#8a6aff', accent: '#b8a0ff' }, unlock: { kind: 'achievement', id: 'collector' } },
  { id: 'void', name: 'Vazio', palette: { dark: '#05020a', mid: '#1a0a2e', light: '#4a2a7a', glow: '#c040ff', accent: '#e080ff' }, unlock: { kind: 'altar', tier: 'epic' } },
  { id: 'aurora', name: 'Aurora', palette: { dark: '#2a8a8a', mid: '#4ae0c0', light: '#e0fff8', glow: '#8affd8', accent: '#ff9ae0' }, animated: true, unlock: { kind: 'altar', tier: 'legendary' } },
];

export const findNexusColor = (id: string): NexusColorDef | undefined => NEXUS_COLORS.find((c) => c.id === id);

/** Chance de, numa Épica/Lendária do Altar, vir a cor do Nexus dessa raridade (se ainda não tiver). */
export const ALTAR_NEXUS_CHANCE = 0.2;

/** Escolha do jogador: modelo ('map' = o da fase) e cor ('original' = a do modelo). */
export interface NexusLook {
  model: NexusModelId | 'map';
  color: string;
}
