// Relíquias (F15): itens permanentes que o herói equipa antes da run. Liberadas ao chegar no Deserto
// (vencer a Tundra); chefes de todas as fases passam a deixá-las.
import type { TalentEffectKind } from './talents';

export type RelicId =
  | 'scarabAmulet'
  | 'eyeOfHorus'
  | 'ankh'
  | 'pharaohCrown'
  | 'sandsOfTime'
  | 'desertHeart'
  | 'maatFeather'
  | 'djinnLamp'
  | 'scorpionFang'
  | 'lichPhylactery'
  | 'hydraScale'
  | 'ogreTooth';

/** Efeito especial (fora da soma dos talentos). */
export type RelicSpecial =
  /** Uma vez por run, o Nexus ou Obelisco que cairia volta com `hp` da vida máxima. */
  { kind: 'ankh'; hp: number };

export interface RelicDef {
  id: RelicId;
  name: string;
  icon: string;
  /** Texto curto do efeito (a tela também lista os números). */
  description: string;
  lore: string;
  /** Bônus somados aos dos talentos durante a run. */
  bonuses: Partial<Record<TalentEffectKind, number>>;
  special?: RelicSpecial;
}

export const RELICS: Record<RelicId, RelicDef> = {
  scarabAmulet: {
    id: 'scarabAmulet',
    name: 'Amuleto do Escaravelho',
    icon: '🪲',
    description: '+15% de ouro por abate e +10 de ouro inicial.',
    lore: 'O besouro sagrado empurra o sol; quem o carrega nunca anda de bolso vazio.',
    bonuses: { killGold: 0.15, startGold: 10 },
  },
  eyeOfHorus: {
    id: 'eyeOfHorus',
    name: 'Olho de Hórus',
    icon: '👁',
    description: '+10% de alcance das criaturas e do herói.',
    lore: 'O olho que tudo vê enxerga além da tempestade.',
    bonuses: { range: 0.1 },
  },
  ankh: {
    id: 'ankh',
    name: 'Ankh',
    icon: '☥',
    description: 'Uma vez por run, o Nexus (ou Obelisco) que cairia resiste e volta com 30% da vida.',
    lore: 'A chave da vida abre a porta de volta, mas só uma vez.',
    bonuses: {},
    special: { kind: 'ankh', hp: 0.3 },
  },
  pharaohCrown: {
    id: 'pharaohCrown',
    name: 'Coroa do Faraó',
    icon: '👑',
    description: '+8% de dano das criaturas e do herói.',
    lore: 'Pesada de ouro e de ordens: o exército obedece com mais fúria.',
    bonuses: { damage: 0.08 },
  },
  sandsOfTime: {
    id: 'sandsOfTime',
    name: 'Areia do Tempo',
    icon: '⏳',
    description: 'Pulso recarrega 15% mais rápido e tem +10% de raio.',
    lore: 'Vire a ampulheta e o instante certo volta mais cedo.',
    bonuses: { pulseCooldown: 0.15, pulseRadius: 0.1 },
  },
  desertHeart: {
    id: 'desertHeart',
    name: 'Coração do Deserto',
    icon: '🔆',
    description: '+40 de vida máxima do Nexus e +5 de cura entre ondas.',
    lore: 'Uma brasa do sol do meio-dia, presa em âmbar.',
    bonuses: { nexusMaxHp: 40, nexusHeal: 5 },
  },
  maatFeather: {
    id: 'maatFeather',
    name: 'Pena de Maat',
    icon: '🪶',
    description: 'Evoluir criaturas custa 12% menos.',
    lore: 'Pesa o coração de cada criatura e acha o caminho mais justo para crescer.',
    bonuses: { evolveDiscount: 0.12 },
  },
  djinnLamp: {
    id: 'djinnLamp',
    name: 'Lâmpada do Djinn',
    icon: '🪔',
    description: '+25 de ouro inicial e renda passiva 0,5 s mais rápida.',
    lore: 'Esfregue e um gênio entediado adianta seu salário.',
    bonuses: { startGold: 25, incomeInterval: 0.5 },
  },
  scorpionFang: {
    id: 'scorpionFang',
    name: 'Presa do Escorpião',
    icon: '🦂',
    description: '+8% de velocidade de ataque.',
    lore: 'Ainda pinga veneno: quem a toca ataca antes de pensar.',
    bonuses: { attackSpeed: 0.08 },
  },
  lichPhylactery: {
    id: 'lichPhylactery',
    name: 'Filactério do Lich',
    icon: '⚱',
    description: '+1 vaga de criatura.',
    lore: 'A alma do Lich não cabe aqui dentro; sobra espaço para mais um aliado.',
    bonuses: { creatureSlots: 1 },
  },
  hydraScale: {
    id: 'hydraScale',
    name: 'Escama da Hidra',
    icon: '🐍',
    description: '+40 de vida do herói e renasce 30% mais rápido.',
    lore: 'Corte uma e nascem duas: o herói aprende a voltar.',
    bonuses: { heroMaxHp: 40, heroRespawn: 0.3 },
  },
  ogreTooth: {
    id: 'ogreTooth',
    name: 'Dente do Rei Ogro',
    icon: '🦷',
    description: '+30% de dano do herói e +10% de velocidade dele.',
    lore: 'Arrancado na base do porrete. Ainda morde.',
    bonuses: { heroDamage: 0.3, heroSpeed: 0.1 },
  },
};

export const RELIC_IDS = Object.keys(RELICS) as RelicId[];

/**
 * Queda de Relíquias: o 1º abate de cada chefe (com Relíquias liberadas) garante uma; depois, chance
 * por abate — maior no chefe final que no do meio da run e maior nas fases mais avançadas.
 * chance = (final ? finalChance : midChance) × (1 + perStage × (número da fase − 1)).
 */
export const RELIC_DROPS = {
  midChance: 0.06,
  finalChance: 0.12,
  perStage: 0.25,
};

/** Vagas: 1 ao liberar (vencer a Tundra), 2 ao vencer o Deserto, 3 ao chegar na onda 30 do Sem Fim do Deserto. */
export const RELIC_SLOTS = { desertEndlessWave: 30, max: 3 };
