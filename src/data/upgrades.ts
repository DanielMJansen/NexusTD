// Melhorias temporárias, escolhidas entre ondas (melhorias 2.0).
// Cada melhoria é uma FAMÍLIA com um valor por TIER (Comum → Lendária). Cada carta sorteia o tier
// (tiers altos ficam mais prováveis ao longo da run) e depois uma família que tenha esse tier.
// Os % somam dentro da mesma categoria (com os talentos); categorias diferentes multiplicam.
// Valores PROPOSTA.

export type Tier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const TIER_ORDER: Tier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const TIERS: Record<Tier, { name: string; color: string }> = {
  common: { name: 'Comum', color: '#c8c0d8' },
  uncommon: { name: 'Incomum', color: '#5ae08a' },
  rare: { name: 'Rara', color: '#5aa8ff' },
  epic: { name: 'Épica', color: '#c07aff' },
  legendary: { name: 'Lendária', color: '#ffb02a' },
};

/** Pesos dos tiers na primeira e na última onda (interpolados entre elas), na ordem de TIER_ORDER. */
export const TIER_WEIGHTS = {
  start: [62, 27, 9, 2, 0],
  end: [28, 30, 22, 13, 7],
};

export type UpgradeEffectKind =
  | 'damage' // +fração de dano (criaturas e herói)
  | 'attackSpeed' // +fração de velocidade de ataque
  | 'range' // +fração de alcance (criaturas e herói)
  | 'gold' // +ouro na hora
  | 'nexusMaxHp' // +vida máxima (e cura o mesmo)
  | 'nexusHeart' // +vida máxima e cura total
  | 'pulseCooldown' // −fração da recarga do Pulso
  | 'nexusRegen' // +vida/s do Nexus
  | 'killGold' // +fração de ouro por abate
  | 'heroXp' // +fração de XP do herói
  | 'evolveDiscount' // −fração no custo de evoluir
  | 'raceDamage' // +fração de dano para uma raça da equipe
  | 'critChance' // +chance de crítico (dano ×2)
  | 'heroDamage' // +fração de dano do herói
  | 'creatureSlot' // +vagas de criatura
  | 'ascendAll' // criaturas em campo sobem N níveis
  | 'ward' // 1º golpe de cada onda anulado
  | 'execute'; // inimigos comuns abaixo desta fração de vida morrem

/** Como mostrar o valor no texto da carta. */
export type ValueFormat = 'percent' | 'flat' | 'perSecond' | 'none';

export interface UpgradeFamily {
  id: string;
  name: string;
  icon: string;
  /** Texto com {v} no lugar do valor (e {race} para sinergias). */
  text: string;
  kind: UpgradeEffectKind;
  format: ValueFormat;
  /** Valor em cada tier disponível. */
  values: Partial<Record<Tier, number>>;
  /** Quantas vezes a família pode ser escolhida numa run. */
  maxPicks?: number;
  /** Sinergia: a carta sorteia uma raça presente na equipe. */
  perRace?: boolean;
}

export const UPGRADE_FAMILIES: UpgradeFamily[] = [
  {
    id: 'fury',
    name: 'Fúria',
    icon: '⚔',
    text: '+{v} de dano',
    kind: 'damage',
    format: 'percent',
    values: { common: 0.06, uncommon: 0.1, rare: 0.16, epic: 0.25, legendary: 0.4 },
  },
  {
    id: 'rhythm',
    name: 'Ritmo de Batalha',
    icon: '➶',
    text: '+{v} de velocidade de ataque',
    kind: 'attackSpeed',
    format: 'percent',
    values: { common: 0.05, uncommon: 0.08, rare: 0.13, epic: 0.2, legendary: 0.32 },
  },
  {
    id: 'keenEye',
    name: 'Olhar Aguçado',
    icon: '◎',
    text: '+{v} de alcance (criaturas e herói)',
    kind: 'range',
    format: 'percent',
    values: { common: 0.05, uncommon: 0.08, rare: 0.12, epic: 0.18, legendary: 0.28 },
  },
  {
    id: 'loot',
    name: 'Saque',
    icon: '◉',
    text: '+{v} de ouro',
    kind: 'gold',
    format: 'flat',
    values: { common: 25, uncommon: 40, rare: 70, epic: 110, legendary: 180 },
  },
  {
    id: 'reinforce',
    name: 'Reforço',
    icon: '◆',
    text: 'Nexus +{v} de vida máxima',
    kind: 'nexusMaxHp',
    format: 'flat',
    values: { common: 15, uncommon: 25, rare: 40, epic: 60, legendary: 100 },
  },
  {
    id: 'focus',
    name: 'Concentração',
    icon: '✺',
    text: 'Pulso recarrega {v} mais rápido',
    kind: 'pulseCooldown',
    format: 'percent',
    values: { common: 0.06, uncommon: 0.1, rare: 0.15, epic: 0.22, legendary: 0.32 },
  },
  {
    id: 'livingRoots',
    name: 'Raízes Vivas',
    icon: '❦',
    text: 'O Nexus regenera {v}',
    kind: 'nexusRegen',
    format: 'perSecond',
    values: { common: 0.2, uncommon: 0.35, rare: 0.6, epic: 1, legendary: 1.6 },
  },
  {
    id: 'greed',
    name: 'Cobiça',
    icon: '☠',
    text: '+{v} de ouro por abate',
    kind: 'killGold',
    format: 'percent',
    values: { common: 0.1, uncommon: 0.18, rare: 0.3, epic: 0.45, legendary: 0.7 },
  },
  {
    id: 'wisdom',
    name: 'Sabedoria',
    icon: '❂',
    text: '+{v} de XP do herói',
    kind: 'heroXp',
    format: 'percent',
    values: { common: 0.1, uncommon: 0.18, rare: 0.3, epic: 0.45, legendary: 0.7 },
  },
  {
    id: 'alchemy',
    name: 'Alquimia',
    icon: '⚗',
    text: 'Evoluir fica {v} mais barato',
    kind: 'evolveDiscount',
    format: 'percent',
    values: { common: 0.06, uncommon: 0.1, rare: 0.15, epic: 0.22, legendary: 0.3 },
  },
  {
    id: 'kinship',
    name: 'Laços de Sangue',
    icon: '♆',
    text: '+{v} de dano para criaturas da raça {race}',
    kind: 'raceDamage',
    format: 'percent',
    values: { common: 0.1, uncommon: 0.16, rare: 0.25, epic: 0.38, legendary: 0.6 },
    perRace: true,
  },
  {
    id: 'precision',
    name: 'Precisão',
    icon: '✧',
    text: '+{v} de chance de crítico (dano ×2)',
    kind: 'critChance',
    format: 'percent',
    values: { common: 0.03, uncommon: 0.05, rare: 0.08, epic: 0.12, legendary: 0.18 },
  },
  {
    id: 'champion',
    name: 'Campeão',
    icon: '✪',
    text: '+{v} de dano do herói',
    kind: 'heroDamage',
    format: 'percent',
    values: { common: 0.08, uncommon: 0.12, rare: 0.2, epic: 0.3, legendary: 0.45 },
  },
  {
    id: 'recruit',
    name: 'Recrutamento',
    icon: '✚',
    text: '+{v} vaga(s) de criatura',
    kind: 'creatureSlot',
    format: 'flat',
    values: { rare: 1, epic: 1, legendary: 2 },
    maxPicks: 2,
  },
  {
    id: 'aegis',
    name: 'Égide Eterna',
    icon: '⛨',
    text: 'O primeiro inimigo que alcança o Nexus em cada onda não causa dano',
    kind: 'ward',
    format: 'none',
    values: { rare: 1 },
    maxPicks: 1,
  },
  {
    id: 'ascension',
    name: 'Ascensão',
    icon: '★',
    text: 'Todas as criaturas em campo sobem {v} nível(is) de graça',
    kind: 'ascendAll',
    format: 'flat',
    values: { epic: 1, legendary: 2 },
  },
  {
    id: 'heart',
    name: 'Coração do Nexus',
    icon: '♥',
    text: 'Nexus +{v} de vida máxima e cura total',
    kind: 'nexusHeart',
    format: 'flat',
    values: { epic: 50, legendary: 100 },
  },
  {
    id: 'sentence',
    name: 'Sentença',
    icon: '⚖',
    text: 'Inimigos comuns abaixo de {v} da vida morrem na hora',
    kind: 'execute',
    format: 'percent',
    values: { legendary: 0.1 },
    maxPicks: 1,
  },
];

/** Uma melhoria concreta oferecida numa carta: família + tier (+ raça nas sinergias). */
export interface OfferedUpgrade {
  family: UpgradeFamily;
  tier: Tier;
  value: number;
  race?: string;
}

export const findFamily = (id: string): UpgradeFamily | undefined => UPGRADE_FAMILIES.find((f) => f.id === id);

/** Pesos dos tiers numa fração da run (0 = primeira onda, 1 = última). */
export function tierWeights(progress: number): number[] {
  const p = Math.max(0, Math.min(1, progress));
  return TIER_WEIGHTS.start.map((w, i) => w + (TIER_WEIGHTS.end[i]! - w) * p);
}
