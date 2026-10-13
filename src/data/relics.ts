// Relíquias (F15): itens permanentes que o herói equipa antes da run. Liberadas ao chegar no Deserto
// (vencer a Tundra); chefes de todas as fases passam a deixá-las, em baús raros (12/10/2026).
// Cada Relíquia tem 3 níveis: cópias repetidas sobem o nível ou viram Essência.
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

/** Um nível da Relíquia: texto do efeito, bônus somados aos talentos e efeito especial. */
export interface RelicLevel {
  description: string;
  bonuses: Partial<Record<TalentEffectKind, number>>;
  special?: RelicSpecial;
}

export interface RelicDef {
  id: RelicId;
  name: string;
  icon: string;
  lore: string;
  /** Níveis 1, 2 e 3 (índice 0 = nível 1). */
  levels: [RelicLevel, RelicLevel, RelicLevel];
}

export const RELIC_MAX_LEVEL = 3;

/** Relíquia equipada com o nível dela. */
export interface EquippedRelic {
  id: RelicId;
  level: number;
}

export const RELICS: Record<RelicId, RelicDef> = {
  scarabAmulet: {
    id: 'scarabAmulet',
    name: 'Amuleto do Escaravelho',
    icon: '🪲',
    lore: 'O besouro sagrado empurra o sol; quem o carrega nunca anda de bolso vazio.',
    levels: [
      { description: '+8% de ouro por abate e +5 de ouro inicial.', bonuses: { killGold: 0.08, startGold: 5 } },
      { description: '+12% de ouro por abate e +8 de ouro inicial.', bonuses: { killGold: 0.12, startGold: 8 } },
      { description: '+15% de ouro por abate e +10 de ouro inicial.', bonuses: { killGold: 0.15, startGold: 10 } },
    ],
  },
  eyeOfHorus: {
    id: 'eyeOfHorus',
    name: 'Olho de Hórus',
    icon: '👁',
    lore: 'O olho que tudo vê enxerga além da tempestade.',
    levels: [
      { description: '+5% de alcance das criaturas e do herói.', bonuses: { range: 0.05 } },
      { description: '+8% de alcance das criaturas e do herói.', bonuses: { range: 0.08 } },
      { description: '+10% de alcance das criaturas e do herói.', bonuses: { range: 0.1 } },
    ],
  },
  ankh: {
    id: 'ankh',
    name: 'Ankh',
    icon: '☥',
    lore: 'A chave da vida abre a porta de volta, mas só uma vez.',
    levels: [
      { description: 'O Nexus (ou Obelisco) que cairia volta com 10% da vida, uma vez por run.', bonuses: {}, special: { kind: 'ankh', hp: 0.1 } },
      { description: 'O Nexus (ou Obelisco) que cairia volta com 15% da vida, uma vez por run.', bonuses: {}, special: { kind: 'ankh', hp: 0.15 } },
      // 30% rendia +17 vitórias em 90 no Deserto (bot, 13/10/2026); 20% fica na faixa das outras Relíquias
      { description: 'O Nexus (ou Obelisco) que cairia volta com 20% da vida, uma vez por run.', bonuses: {}, special: { kind: 'ankh', hp: 0.2 } },
    ],
  },
  pharaohCrown: {
    id: 'pharaohCrown',
    name: 'Coroa do Faraó',
    icon: '👑',
    lore: 'Pesada de ouro e de ordens: o exército obedece com mais fúria.',
    levels: [
      { description: '+4% de dano das criaturas e do herói.', bonuses: { damage: 0.04 } },
      { description: '+6% de dano das criaturas e do herói.', bonuses: { damage: 0.06 } },
      { description: '+8% de dano das criaturas e do herói.', bonuses: { damage: 0.08 } },
    ],
  },
  sandsOfTime: {
    id: 'sandsOfTime',
    name: 'Areia do Tempo',
    icon: '⏳',
    lore: 'Vire a ampulheta e o instante certo volta mais cedo.',
    levels: [
      { description: 'Pulso recarrega 8% mais rápido e tem +5% de raio.', bonuses: { pulseCooldown: 0.08, pulseRadius: 0.05 } },
      { description: 'Pulso recarrega 12% mais rápido e tem +8% de raio.', bonuses: { pulseCooldown: 0.12, pulseRadius: 0.08 } },
      { description: 'Pulso recarrega 15% mais rápido e tem +10% de raio.', bonuses: { pulseCooldown: 0.15, pulseRadius: 0.1 } },
    ],
  },
  desertHeart: {
    id: 'desertHeart',
    name: 'Coração do Deserto',
    icon: '🔆',
    lore: 'Uma brasa do sol do meio-dia, presa em âmbar.',
    levels: [
      { description: '+20 de vida máxima do Nexus e +3 de cura entre ondas.', bonuses: { nexusMaxHp: 20, nexusHeal: 3 } },
      { description: '+30 de vida máxima do Nexus e +4 de cura entre ondas.', bonuses: { nexusMaxHp: 30, nexusHeal: 4 } },
      { description: '+40 de vida máxima do Nexus e +5 de cura entre ondas.', bonuses: { nexusMaxHp: 40, nexusHeal: 5 } },
    ],
  },
  maatFeather: {
    id: 'maatFeather',
    name: 'Pena de Maat',
    icon: '🪶',
    lore: 'Pesa o coração de cada criatura e acha o caminho mais justo para crescer.',
    levels: [
      { description: 'Evoluir criaturas custa 6% menos.', bonuses: { evolveDiscount: 0.06 } },
      { description: 'Evoluir criaturas custa 9% menos.', bonuses: { evolveDiscount: 0.09 } },
      { description: 'Evoluir criaturas custa 12% menos.', bonuses: { evolveDiscount: 0.12 } },
    ],
  },
  djinnLamp: {
    id: 'djinnLamp',
    name: 'Lâmpada do Djinn',
    icon: '🪔',
    lore: 'Esfregue e um gênio entediado adianta seu salário.',
    levels: [
      { description: '+12 de ouro inicial e renda passiva 0,25 s mais rápida.', bonuses: { startGold: 12, incomeInterval: 0.25 } },
      { description: '+18 de ouro inicial e renda passiva 0,4 s mais rápida.', bonuses: { startGold: 18, incomeInterval: 0.4 } },
      { description: '+25 de ouro inicial e renda passiva 0,5 s mais rápida.', bonuses: { startGold: 25, incomeInterval: 0.5 } },
    ],
  },
  scorpionFang: {
    id: 'scorpionFang',
    name: 'Presa do Escorpião',
    icon: '🦂',
    lore: 'Ainda pinga veneno: quem a toca ataca antes de pensar.',
    levels: [
      { description: '+4% de velocidade de ataque.', bonuses: { attackSpeed: 0.04 } },
      { description: '+6% de velocidade de ataque.', bonuses: { attackSpeed: 0.06 } },
      { description: '+8% de velocidade de ataque.', bonuses: { attackSpeed: 0.08 } },
    ],
  },
  lichPhylactery: {
    id: 'lichPhylactery',
    name: 'Filactério do Lich',
    icon: '⚱',
    lore: 'A alma do Lich não cabe aqui dentro; sobra espaço para mais um aliado.',
    levels: [
      { description: '+1 vaga de criatura.', bonuses: { creatureSlots: 1 } },
      { description: '+1 vaga de criatura e +10 de ouro inicial.', bonuses: { creatureSlots: 1, startGold: 10 } },
      { description: '+1 vaga de criatura e +20 de ouro inicial.', bonuses: { creatureSlots: 1, startGold: 20 } },
    ],
  },
  hydraScale: {
    id: 'hydraScale',
    name: 'Escama da Hidra',
    icon: '🐍',
    lore: 'Corte uma e nascem duas: o herói aprende a voltar.',
    levels: [
      { description: '+20 de vida do herói e renasce 15% mais rápido.', bonuses: { heroMaxHp: 20, heroRespawn: 0.15 } },
      { description: '+30 de vida do herói e renasce 25% mais rápido.', bonuses: { heroMaxHp: 30, heroRespawn: 0.25 } },
      { description: '+40 de vida do herói e renasce 30% mais rápido.', bonuses: { heroMaxHp: 40, heroRespawn: 0.3 } },
    ],
  },
  ogreTooth: {
    id: 'ogreTooth',
    name: 'Dente do Rei Ogro',
    icon: '🦷',
    lore: 'Arrancado na base do porrete. Ainda morde.',
    levels: [
      { description: '+15% de dano do herói e +5% de velocidade dele.', bonuses: { heroDamage: 0.15, heroSpeed: 0.05 } },
      { description: '+22% de dano do herói e +8% de velocidade dele.', bonuses: { heroDamage: 0.22, heroSpeed: 0.08 } },
      { description: '+30% de dano do herói e +10% de velocidade dele.', bonuses: { heroDamage: 0.3, heroSpeed: 0.1 } },
    ],
  },
};

export const RELIC_IDS = Object.keys(RELICS) as RelicId[];

/** Nível de uma Relíquia (1–3). */
export const relicLevel = (id: RelicId, level: number): RelicLevel => RELICS[id].levels[Math.min(RELIC_MAX_LEVEL, Math.max(1, level)) - 1]!;

/**
 * Baús de Relíquia (12/10/2026): cada abate de chefe tem chance de deixar um baú, maior no chefe final
 * que nos do meio da run e maior nas fases avançadas; o Sem Fim conta.
 * chance = base + porFase × (número da fase − 1). Depois de `pity` chefes sem baú, o próximo garante um.
 * O baú sorteia qualquer Relíquia; repetida vira cópia: sobe um nível ou vale `copyEssence` de Essência.
 */
export const RELIC_DROPS = {
  mid: { base: 0.03, perStage: 0.03 },
  final: { base: 0.06, perStage: 0.0475 },
  pity: 12,
  copyEssence: 150,
};

/** Vagas: 1 ao liberar (vencer a Tundra), 2 ao vencer o Deserto, 3 ao chegar na onda 30 do Sem Fim do Deserto. */
export const RELIC_SLOTS = { desertEndlessWave: 30, max: 3 };
