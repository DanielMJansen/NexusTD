// Árvore de talentos (progresso permanente, pago com Essência).
// Cada ramo é uma coluna em cadeia vertical: cada nó exige um nível mínimo no nó de cima.
// Valores PROPOSTA: calibrar em playtest.

export type TalentBranch = 'nexus' | 'nexusPlus' | 'gold' | 'army' | 'hero' | 'essence';

/** O que cada nível de talento soma. Os efeitos são somados por tipo em game/talents.ts. */
export type TalentEffectKind =
  | 'nexusMaxHp' // +vida máxima do Nexus
  | 'nexusHeal' // +cura do Nexus entre ondas
  | 'nexusRegen' // vida por segundo durante a onda
  | 'nexusWard' // anula o 1º golpe no Nexus a cada onda (0/1)
  | 'nexusUpgradeDiscount' // fração de desconto nas melhorias do Nexus da run
  | 'startNexusBolt' // começa a run com o Raio do Nexus no nível 1 (0/1)
  | 'startNexusField' // começa a run com o Campo de Lentidão no nível 1 (0/1)
  | 'startNexusShield' // começa a run com o Escudo no nível 1 (0/1)
  | 'startGold' // +ouro inicial
  | 'incomeInterval' // −segundos no intervalo da renda passiva
  | 'evolveDiscount' // fração de desconto na evolução
  | 'killGold' // fração extra de ouro por abate
  | 'damage' // fração de dano das criaturas e do herói
  | 'attackSpeed' // fração de velocidade de ataque
  | 'range' // fração de alcance das criaturas
  | 'creatureSlots' // vagas extras de criatura
  | 'heroDamage' // fração de dano do herói
  | 'heroMaxHp' // +vida máxima do herói
  | 'pulseCooldown' // fração a menos na recarga do Pulso
  | 'heroSpeed' // fração de velocidade do herói
  | 'pulseRadius' // fração de raio do Pulso
  | 'essenceGain' // fração extra de Essência por run
  | 'victoryEssence' // Essência extra ao vencer
  | 'essencePerWave' // Essência extra por onda alcançada
  | 'heroRespawn' // fração a menos no tempo de renascer
  | 'heroXp'; // fração extra de XP do herói

export type TalentId =
  | 'nexusVitality'
  | 'nexusMending'
  | 'nexusRegen'
  | 'nexusWard'
  | 'nexusEngineering'
  | 'awakenedBolt'
  | 'frostField'
  | 'ancientShield'
  | 'startingGold'
  | 'goldenFlow'
  | 'cheapEvolution'
  | 'bounty'
  | 'armyDamage'
  | 'armySpeed'
  | 'armyRange'
  | 'legion'
  | 'heroMight'
  | 'heroVigor'
  | 'pulseFocus'
  | 'heroSwiftness'
  | 'heroRebirth'
  | 'heroWisdom'
  | 'pulseReach'
  | 'essenceHarvest'
  | 'victoryTithe'
  | 'veteran';

export interface TalentDef {
  id: TalentId;
  branch: TalentBranch;
  name: string;
  icon: string;
  description: string;
  /** Custo em Essência de cada nível (índice 0 = nível 1). O tamanho define o nível máximo. */
  costs: number[];
  effect: { kind: TalentEffectKind; perLevel: number };
  /** Nó de cima na cadeia e o nível mínimo nele. */
  requires?: { id: TalentId; level: number };
}

export const TALENT_BRANCHES: { id: TalentBranch; name: string; icon: string; color: string }[] = [
  { id: 'nexus', name: 'Nexus', icon: '◆', color: '#b36bff' },
  { id: 'nexusPlus', name: 'Nexus+', icon: 'ϟ', color: '#5ad0ff' },
  { id: 'gold', name: 'Ouro', icon: '◉', color: '#f0c35a' },
  { id: 'army', name: 'Exército', icon: '⚔', color: '#ff6a5a' },
  { id: 'hero', name: 'Herói', icon: '✪', color: '#5af0a0' },
  { id: 'essence', name: 'Essência', icon: '✦', color: '#d8a8ff' },
];

const linear = (step: number, levels: number) => Array.from({ length: levels }, (_, i) => step * (i + 1));

// A ordem dentro de cada ramo é a ordem da cadeia (de cima para baixo).
export const TALENTS: Record<TalentId, TalentDef> = {
  nexusVitality: {
    id: 'nexusVitality',
    branch: 'nexus',
    name: 'Vitalidade do Nexus',
    icon: '♥',
    description: 'Aumenta a vida máxima do Nexus.',
    costs: linear(20, 5),
    effect: { kind: 'nexusMaxHp', perLevel: 15 },
  },
  nexusMending: {
    id: 'nexusMending',
    branch: 'nexus',
    name: 'Restauração',
    icon: '✚',
    description: 'O Nexus cura mais ao fim de cada onda.',
    costs: [40, 80, 120],
    effect: { kind: 'nexusHeal', perLevel: 5 },
    requires: { id: 'nexusVitality', level: 2 },
  },
  nexusRegen: {
    id: 'nexusRegen',
    branch: 'nexus',
    name: 'Pulsar Vital',
    icon: '❦',
    description: 'O Nexus regenera vida aos poucos durante as ondas.',
    costs: [100, 200],
    effect: { kind: 'nexusRegen', perLevel: 0.25 },
    requires: { id: 'nexusMending', level: 1 },
  },
  nexusWard: {
    id: 'nexusWard',
    branch: 'nexus',
    name: 'Égide Rúnica',
    icon: '⛨',
    description: 'O primeiro inimigo que alcança o Nexus em cada onda não causa dano.',
    costs: [250],
    effect: { kind: 'nexusWard', perLevel: 1 },
    requires: { id: 'nexusRegen', level: 1 },
  },

  nexusEngineering: {
    id: 'nexusEngineering',
    branch: 'nexusPlus',
    name: 'Engenharia Arcana',
    icon: '⚙',
    description: 'As melhorias do Nexus na run custam menos ouro.',
    costs: [40, 80, 120],
    effect: { kind: 'nexusUpgradeDiscount', perLevel: 0.08 },
  },
  awakenedBolt: {
    id: 'awakenedBolt',
    branch: 'nexusPlus',
    name: 'Raio Desperto',
    icon: 'ϟ',
    description: 'Toda run começa com o Raio do Nexus no nível 1.',
    costs: [150],
    effect: { kind: 'startNexusBolt', perLevel: 1 },
    requires: { id: 'nexusEngineering', level: 1 },
  },
  frostField: {
    id: 'frostField',
    branch: 'nexusPlus',
    name: 'Campo Gélido',
    icon: '❄',
    description: 'Toda run começa com o Campo de Lentidão no nível 1.',
    costs: [200],
    effect: { kind: 'startNexusField', perLevel: 1 },
    requires: { id: 'awakenedBolt', level: 1 },
  },
  ancientShield: {
    id: 'ancientShield',
    branch: 'nexusPlus',
    name: 'Escudo Ancestral',
    icon: '◈',
    description: 'Toda run começa com o Escudo do Nexus no nível 1.',
    costs: [250],
    effect: { kind: 'startNexusShield', perLevel: 1 },
    requires: { id: 'frostField', level: 1 },
  },

  startingGold: {
    id: 'startingGold',
    branch: 'gold',
    name: 'Tesouro Inicial',
    icon: '◉',
    description: 'Começa cada run com mais ouro.',
    costs: linear(15, 5),
    effect: { kind: 'startGold', perLevel: 10 },
  },
  goldenFlow: {
    id: 'goldenFlow',
    branch: 'gold',
    name: 'Fluxo Dourado',
    icon: '⧗',
    description: 'A renda passiva de ouro chega mais rápido.',
    costs: [60, 120],
    effect: { kind: 'incomeInterval', perLevel: 0.25 },
    requires: { id: 'startingGold', level: 2 },
  },
  cheapEvolution: {
    id: 'cheapEvolution',
    branch: 'gold',
    name: 'Alquimia',
    icon: '⚗',
    description: 'Evoluir criaturas fica mais barato.',
    costs: [50, 100, 150],
    effect: { kind: 'evolveDiscount', perLevel: 0.1 },
    requires: { id: 'goldenFlow', level: 1 },
  },
  bounty: {
    id: 'bounty',
    branch: 'gold',
    name: 'Recompensa',
    icon: '☠',
    description: 'Cada abate rende mais ouro.',
    costs: [100, 200],
    effect: { kind: 'killGold', perLevel: 0.2 },
    requires: { id: 'cheapEvolution', level: 1 },
  },

  armyDamage: {
    id: 'armyDamage',
    branch: 'army',
    name: 'Fúria do Exército',
    icon: '⚔',
    description: 'Criaturas e herói causam mais dano.',
    costs: linear(20, 5),
    effect: { kind: 'damage', perLevel: 0.08 },
  },
  armySpeed: {
    id: 'armySpeed',
    branch: 'army',
    name: 'Prontidão',
    icon: '➶',
    description: 'Criaturas e herói atacam mais rápido.',
    costs: [60, 120, 180],
    effect: { kind: 'attackSpeed', perLevel: 0.06 },
    requires: { id: 'armyDamage', level: 2 },
  },
  armyRange: {
    id: 'armyRange',
    branch: 'army',
    name: 'Olhos Atentos',
    icon: '◎',
    description: 'Criaturas alcançam mais longe.',
    costs: [60, 120, 180],
    effect: { kind: 'range', perLevel: 0.06 },
    requires: { id: 'armySpeed', level: 1 },
  },
  legion: {
    id: 'legion',
    branch: 'army',
    name: 'Legião',
    icon: '✠',
    description: 'Mais uma vaga de criatura em campo.',
    costs: [300],
    effect: { kind: 'creatureSlots', perLevel: 1 },
    requires: { id: 'armyRange', level: 2 },
  },

  heroMight: {
    id: 'heroMight',
    branch: 'hero',
    name: 'Força do Herói',
    icon: '✪',
    description: 'O herói causa mais dano.',
    costs: [30, 60, 90],
    effect: { kind: 'heroDamage', perLevel: 0.15 },
  },
  heroVigor: {
    id: 'heroVigor',
    branch: 'hero',
    name: 'Vigor',
    icon: '♥',
    description: 'O herói tem mais vida.',
    costs: [30, 60, 90],
    effect: { kind: 'heroMaxHp', perLevel: 15 },
    requires: { id: 'heroMight', level: 1 },
  },
  pulseFocus: {
    id: 'pulseFocus',
    branch: 'hero',
    name: 'Foco do Pulso',
    icon: '✺',
    description: 'O Pulso recarrega mais rápido.',
    costs: [50, 100, 150],
    effect: { kind: 'pulseCooldown', perLevel: 0.1 },
    requires: { id: 'heroVigor', level: 1 },
  },
  heroSwiftness: {
    id: 'heroSwiftness',
    branch: 'hero',
    name: 'Passos Leves',
    icon: '»',
    description: 'O herói se move mais rápido.',
    costs: [40, 80],
    effect: { kind: 'heroSpeed', perLevel: 0.1 },
    requires: { id: 'pulseFocus', level: 1 },
  },
  heroRebirth: {
    id: 'heroRebirth',
    branch: 'hero',
    name: 'Renascer',
    icon: '☀',
    description: 'O herói volta mais rápido depois de cair.',
    costs: [60, 120],
    effect: { kind: 'heroRespawn', perLevel: 0.2 },
    requires: { id: 'heroSwiftness', level: 1 },
  },
  heroWisdom: {
    id: 'heroWisdom',
    branch: 'hero',
    name: 'Sabedoria',
    icon: '❂',
    description: 'O herói ganha mais XP e sobe de nível mais rápido.',
    costs: [50, 100, 150],
    effect: { kind: 'heroXp', perLevel: 0.1 },
    requires: { id: 'heroRebirth', level: 1 },
  },
  pulseReach: {
    id: 'pulseReach',
    branch: 'hero',
    name: 'Pulso Amplo',
    icon: '◌',
    description: 'O Pulso atinge uma área maior.',
    costs: [200],
    effect: { kind: 'pulseRadius', perLevel: 0.2 },
    requires: { id: 'heroWisdom', level: 2 },
  },

  essenceHarvest: {
    id: 'essenceHarvest',
    branch: 'essence',
    name: 'Colheita de Almas',
    icon: '✦',
    description: 'Ganha mais Essência ao fim de cada run.',
    costs: linear(30, 5),
    effect: { kind: 'essenceGain', perLevel: 0.1 },
  },
  victoryTithe: {
    id: 'victoryTithe',
    branch: 'essence',
    name: 'Dízimo da Vitória',
    icon: '♛',
    description: 'Essência extra ao vencer uma run.',
    costs: [80, 160],
    effect: { kind: 'victoryEssence', perLevel: 20 },
    requires: { id: 'essenceHarvest', level: 2 },
  },
  veteran: {
    id: 'veteran',
    branch: 'essence',
    name: 'Veterano',
    icon: '⚜',
    description: 'Cada onda alcançada rende mais Essência.',
    costs: [100, 200],
    effect: { kind: 'essencePerWave', perLevel: 1 },
    requires: { id: 'victoryTithe', level: 1 },
  },
};

export const TALENT_IDS = Object.keys(TALENTS) as TalentId[];

export const talentMaxLevel = (id: TalentId): number => TALENTS[id].costs.length;
