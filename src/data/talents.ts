// Árvore de talentos (progresso permanente, pago com Essência).
// Ramos em colunas; cada nó filho exige um nível mínimo no nó pai (modelo do Myth TD).
// Valores PROPOSTA: calibrar em playtest.

export type TalentBranch = 'nexus' | 'gold' | 'army' | 'hero' | 'essence';

/** O que cada nível de talento soma. Os efeitos são somados por tipo em game/talents.ts. */
export type TalentEffectKind =
  | 'nexusMaxHp' // +vida máxima do Nexus
  | 'nexusHeal' // +cura do Nexus entre ondas
  | 'nexusRegen' // vida por segundo durante a onda
  | 'nexusWard' // anula o 1º golpe no Nexus a cada onda (0/1)
  | 'startGold' // +ouro inicial
  | 'incomeInterval' // −segundos no intervalo da renda passiva
  | 'evolveDiscount' // fração de desconto na evolução
  | 'killGold' // fração extra de ouro por abate
  | 'damage' // fração de dano das criaturas e do herói
  | 'attackSpeed' // fração de velocidade de ataque
  | 'range' // fração de alcance das criaturas
  | 'creatureSlots' // vagas extras de criatura
  | 'heroDamage' // fração de dano do herói
  | 'pulseCooldown' // fração a menos na recarga do Pulso
  | 'heroSpeed' // fração de velocidade do herói
  | 'pulseRadius' // fração de raio do Pulso
  | 'essenceGain' // fração extra de Essência por run
  | 'victoryEssence' // Essência extra ao vencer
  | 'essencePerWave'; // Essência extra por onda alcançada

export type TalentId =
  | 'nexusVitality'
  | 'nexusMending'
  | 'nexusRegen'
  | 'nexusWard'
  | 'startingGold'
  | 'goldenFlow'
  | 'cheapEvolution'
  | 'bounty'
  | 'armyDamage'
  | 'armySpeed'
  | 'armyRange'
  | 'legion'
  | 'heroMight'
  | 'pulseFocus'
  | 'heroSwiftness'
  | 'pulseReach'
  | 'essenceHarvest'
  | 'victoryTithe'
  | 'veteran';

export interface TalentDef {
  id: TalentId;
  branch: TalentBranch;
  name: string;
  description: string;
  /** Custo em Essência de cada nível (índice 0 = nível 1). O tamanho define o nível máximo. */
  costs: number[];
  effect: { kind: TalentEffectKind; perLevel: number };
  requires?: { id: TalentId; level: number };
}

export const TALENT_BRANCHES: { id: TalentBranch; name: string; icon: string }[] = [
  { id: 'nexus', name: 'Nexus', icon: '◆' },
  { id: 'gold', name: 'Ouro', icon: '◉' },
  { id: 'army', name: 'Exército', icon: '⚔' },
  { id: 'hero', name: 'Herói', icon: '✪' },
  { id: 'essence', name: 'Essência', icon: '✦' },
];

const linear = (step: number, levels: number) => Array.from({ length: levels }, (_, i) => step * (i + 1));

// A ordem dentro de cada ramo é a ordem de exibição na coluna.
export const TALENTS: Record<TalentId, TalentDef> = {
  nexusVitality: {
    id: 'nexusVitality',
    branch: 'nexus',
    name: 'Vitalidade do Nexus',
    description: 'Aumenta a vida máxima do Nexus.',
    costs: linear(20, 5),
    effect: { kind: 'nexusMaxHp', perLevel: 15 },
  },
  nexusMending: {
    id: 'nexusMending',
    branch: 'nexus',
    name: 'Restauração',
    description: 'O Nexus cura mais ao fim de cada onda.',
    costs: [40, 80, 120],
    effect: { kind: 'nexusHeal', perLevel: 5 },
    requires: { id: 'nexusVitality', level: 2 },
  },
  nexusRegen: {
    id: 'nexusRegen',
    branch: 'nexus',
    name: 'Pulsar Vital',
    description: 'O Nexus regenera vida aos poucos durante as ondas.',
    costs: [100, 200],
    effect: { kind: 'nexusRegen', perLevel: 0.25 },
    requires: { id: 'nexusMending', level: 1 },
  },
  nexusWard: {
    id: 'nexusWard',
    branch: 'nexus',
    name: 'Égide Rúnica',
    description: 'O primeiro inimigo que alcança o Nexus em cada onda não causa dano.',
    costs: [250],
    effect: { kind: 'nexusWard', perLevel: 1 },
    requires: { id: 'nexusVitality', level: 5 },
  },

  startingGold: {
    id: 'startingGold',
    branch: 'gold',
    name: 'Tesouro Inicial',
    description: 'Começa cada run com mais ouro.',
    costs: linear(15, 5),
    effect: { kind: 'startGold', perLevel: 10 },
  },
  goldenFlow: {
    id: 'goldenFlow',
    branch: 'gold',
    name: 'Fluxo Dourado',
    description: 'A renda passiva de ouro chega mais rápido.',
    costs: [60, 120],
    effect: { kind: 'incomeInterval', perLevel: 0.25 },
    requires: { id: 'startingGold', level: 2 },
  },
  cheapEvolution: {
    id: 'cheapEvolution',
    branch: 'gold',
    name: 'Alquimia',
    description: 'Evoluir criaturas fica mais barato.',
    costs: [50, 100, 150],
    effect: { kind: 'evolveDiscount', perLevel: 0.1 },
    requires: { id: 'startingGold', level: 3 },
  },
  bounty: {
    id: 'bounty',
    branch: 'gold',
    name: 'Recompensa',
    description: 'Cada abate rende mais ouro.',
    costs: [100, 200],
    effect: { kind: 'killGold', perLevel: 0.2 },
    requires: { id: 'goldenFlow', level: 1 },
  },

  armyDamage: {
    id: 'armyDamage',
    branch: 'army',
    name: 'Fúria do Exército',
    description: 'Criaturas e herói causam mais dano.',
    costs: linear(20, 5),
    effect: { kind: 'damage', perLevel: 0.08 },
  },
  armySpeed: {
    id: 'armySpeed',
    branch: 'army',
    name: 'Prontidão',
    description: 'Criaturas e herói atacam mais rápido.',
    costs: [60, 120, 180],
    effect: { kind: 'attackSpeed', perLevel: 0.06 },
    requires: { id: 'armyDamage', level: 2 },
  },
  armyRange: {
    id: 'armyRange',
    branch: 'army',
    name: 'Olhos Atentos',
    description: 'Criaturas alcançam mais longe.',
    costs: [60, 120, 180],
    effect: { kind: 'range', perLevel: 0.06 },
    requires: { id: 'armyDamage', level: 2 },
  },
  legion: {
    id: 'legion',
    branch: 'army',
    name: 'Legião',
    description: 'Mais uma vaga de criatura em campo.',
    costs: [300],
    effect: { kind: 'creatureSlots', perLevel: 1 },
    requires: { id: 'armySpeed', level: 2 },
  },

  heroMight: {
    id: 'heroMight',
    branch: 'hero',
    name: 'Força do Herói',
    description: 'O herói causa mais dano.',
    costs: [30, 60, 90],
    effect: { kind: 'heroDamage', perLevel: 0.15 },
  },
  pulseFocus: {
    id: 'pulseFocus',
    branch: 'hero',
    name: 'Foco do Pulso',
    description: 'O Pulso recarrega mais rápido.',
    costs: [50, 100, 150],
    effect: { kind: 'pulseCooldown', perLevel: 0.1 },
    requires: { id: 'heroMight', level: 1 },
  },
  heroSwiftness: {
    id: 'heroSwiftness',
    branch: 'hero',
    name: 'Passos Leves',
    description: 'O herói se move mais rápido.',
    costs: [40, 80],
    effect: { kind: 'heroSpeed', perLevel: 0.1 },
    requires: { id: 'heroMight', level: 1 },
  },
  pulseReach: {
    id: 'pulseReach',
    branch: 'hero',
    name: 'Pulso Amplo',
    description: 'O Pulso atinge uma área maior.',
    costs: [200],
    effect: { kind: 'pulseRadius', perLevel: 0.2 },
    requires: { id: 'pulseFocus', level: 2 },
  },

  essenceHarvest: {
    id: 'essenceHarvest',
    branch: 'essence',
    name: 'Colheita de Almas',
    description: 'Ganha mais Essência ao fim de cada run.',
    costs: linear(30, 5),
    effect: { kind: 'essenceGain', perLevel: 0.1 },
  },
  victoryTithe: {
    id: 'victoryTithe',
    branch: 'essence',
    name: 'Dízimo da Vitória',
    description: 'Essência extra ao vencer uma run.',
    costs: [80, 160],
    effect: { kind: 'victoryEssence', perLevel: 20 },
    requires: { id: 'essenceHarvest', level: 2 },
  },
  veteran: {
    id: 'veteran',
    branch: 'essence',
    name: 'Veterano',
    description: 'Cada onda alcançada rende mais Essência.',
    costs: [100, 200],
    effect: { kind: 'essencePerWave', perLevel: 1 },
    requires: { id: 'essenceHarvest', level: 3 },
  },
};

export const TALENT_IDS = Object.keys(TALENTS) as TalentId[];

export const talentMaxLevel = (id: TalentId): number => TALENTS[id].costs.length;
