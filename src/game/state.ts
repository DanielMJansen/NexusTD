import type { MutationId } from '../data/mutations';
import { HERO_SPAWN_SHIELD } from '../data/heroUpgrades';
import type { NexusLook } from '../data/nexusSkins';
import type { VariantTier } from '../data/altar';
import { DEFAULT_MAP, FIRST_STAGE, STAGES, type StageId } from '../data/stages';
import { ECONOMY, HERO_PLACEMENT, NEXUS } from '../data/config';
import { HEROES, type HeroDef, type HeroId, type RaceBonus } from '../data/heroes';
import type { CreatureDef, CreatureId } from '../data/creatures';
import type { EnemyDef, EnemyId } from '../data/enemies';
import type { OfferedUpgrade } from '../data/upgrades';
import { noNexusLevels, type NexusUpgradeId } from '../data/nexusUpgrades';
import type { HeroStat, HeroUpgradeDef } from '../data/heroUpgrades';
import type { SkinPalette } from '../data/skins';
import type { TalentBonuses } from './talents';
import type { GameEvent } from './events';

export interface Point {
  x: number;
  y: number;
}

export interface Enemy extends Point {
  def: EnemyDef;
  hp: number;
  maxHp: number;
  /** Atributos já com a força da onda (e de elite). */
  speed: number;
  nexusDamage: number;
  heroDps: number;
  /** Multiplicador de dano da onda (também vale para tiros). */
  damageScale: number;
  /** Elite: mais forte, contorno dourado, rende mais. */
  elite: boolean;
  /** Recarga de cada habilidade (mesma ordem de def.traits). */
  timers: number[];
  /** Segundos restantes de investida. */
  charging: number;
  /** Gárgula pousada como pedra. */
  stone: boolean;
  /** Segundos restantes de escudo. */
  shield: number;
  /** Chefe na segunda fase. */
  enraged: boolean;
  slowTimer: number;
  slowMultiplier: number;
  /** Oculto pela tempestade de areia: não é desenhado nem pode ser alvo. */
  hidden?: boolean;
  /** Mutações do Sem Fim: armadura extra, regeneração, escudo de um golpe e filho de divisão. */
  bonusArmor?: number;
  mutRegen?: number;
  ward?: boolean;
  splitChild?: boolean;
  /** Agarrado (Garras dos lobisomens): não desliza no gelo e anda mais devagar. */
  gripTimer: number;
  gripSlow: number;
  /** Defasagem aleatória da animação e do zigue-zague. */
  animationOffset: number;
  /** Momento (state.time) do último golpe sofrido; só para o visual. */
  lastHitAt: number;
  /** Segurado por um Guarda neste quadro (não anda). */
  held: boolean;
  /** Veneno: dano por segundo enquanto o tempo durar. */
  poisonTimer: number;
  poisonDps: number;
  /** Com medo: anda para longe do Nexus enquanto o tempo durar. */
  fearTimer: number;
  /** Segundos desde o último golpe de fogo (corta a regeneração do Troll). */
  fireHitTimer?: number;
  /** Mergulho do Wyrm: submerso agora e tempo até trocar. */
  diving?: boolean;
  diveTime?: number;
  /** Quando foi erguido (esqueleto aliado subindo da terra). */
  raisedAt?: number;
  /** Morto por um aliado (não ergue outro esqueleto pela sinergia). */
  killedByAlly?: boolean;
  /** Trilha seguida (índice da entrada da fase) e próximo ponto dela; sem trilha, vai direto ao Nexus. */
  path?: number;
  waypoint?: number;
  /** Pântano: intocável (na lama ou mergulhado). */
  submerged?: boolean;
  /** Salto em andamento (segundos restantes). */
  leapTime?: number;
  /** Mergulho do Crocodilo Ancião (segundos restantes até reaparecer). */
  burrowTime?: number;
  /** Múmia/Faraó: já levantou uma vez; segundos caído antes de levantar. */
  revived?: boolean;
  reviveTime?: number;
  /** Saqueador: ouro roubado (devolvido ao morrer). */
  stolen?: number;
  /** Hidra: cabeças vivas, cortadas à espera de renascer e o tempo até renascerem. */
  heads?: number;
  cutHeads?: number;
  regrowTimer?: number;
  /** Rei Sapo: vida no momento em que engoliu (cuspir ao levar dano suficiente). */
  swallowHp?: number;
  /** Até quando o grito (empurrão/medo) não afeta este inimigo de novo (tempo de jogo). */
  screechImmuneUntil?: number;
  /** Atordoado/congelado: não anda enquanto o tempo durar. */
  stunTimer: number;
  /** Visual do atordoamento (estrelas, raízes ou pedra) e do medo (medo ou confusão). */
  stunLook: 'stun' | 'root' | 'stone';
  fearLook: 'fear' | 'confuse';
  /** Marca: recebe +markAmount de dano; pode explodir ao morrer. */
  markTimer: number;
  markAmount: number;
  markExplode: { radius: number; ratio: number } | null;
  /** Vulnerável: recebe +vulnAmount de dano. */
  vulnTimer: number;
  vulnAmount: number;
  /** Corrosão: armadura a menos. */
  corrodeTimer: number;
  corrodeAmount: number;
  /** Enfraquecido: mais lento e com menos dano ao Nexus. */
  weakenTimer: number;
  weakenSlow: number;
  weakenDamage: number;
  /** Aliado temporário (possuído ou erguido): luta contra os outros inimigos enquanto durar. */
  allyTimer: number;
  allyExplode: { radius: number; ratio: number } | null;
  /** Esqueleto erguido por nós: some ao fim, sem recompensa. */
  summonedAlly: boolean;
  /** Morreu executado (Ceifador). */
  executed: boolean;
  /** Recarga do próximo golpe no Nexus (quando colado nele). */
  nexusTimer: number;
  /** Momento e direção do último ataque (golpe no Nexus ou no herói, tiro, teia...): só visual. */
  lastAttackAt: number;
  attackAngle: number;
  /** Virou sapo (Feitiço do Sapo): lento, frágil e inofensivo enquanto durar. */
  hexTimer: number;
  hexVuln: number;
  /** Último deslize do Espectro que já o atingiu (acerta uma vez por deslize). */
  pulseHitId: number;
  dead: boolean;
}

export interface Creature extends Point {
  def: CreatureDef;
  attackTimer: number;
  /** Salto do lobisomem (Caçada): recarga, momento e ponto do último salto. */
  leapTimer?: number;
  leapAt?: number;
  leapTo?: Point;
  /** Golpes acumulados para o frenesi. */
  hitCount: number;
  frenzyTimer: number;
  /** Ouro pago (invocação + evoluções), base do valor de venda. */
  paid: number;
  /** Custo de invocação desta cópia (base do custo de evoluir). */
  summonCost: number;
  /** Nível de evolução, de 1 até MAX_CREATURE_LEVEL. */
  level: number;
  /** Vertente escolhida no nível máximo (0 ou 1). */
  branch: number;
  /** Bônus de velocidade de ataque recebido de auras neste quadro. */
  auraBonus: number;
  /** Bênçãos recebidas neste quadro (dano, alcance, dano crítico) e proteção contra teia/atordoamento. */
  blessDamage: number;
  blessRange: number;
  blessCrit: number;
  protected: boolean;
  /** Abates nesta onda (efeitos que acumulam por abate). */
  killStacks: number;
  /** Dicas visuais: lado para onde olha (1 direita, -1 esquerda) e momento do último ataque. */
  facing: 1 | -1;
  lastAttackAt: number;
  /** Atordoada (pisão do Rei Ogro): não ataca. */
  stunTimer: number;
  /** Presa na teia: ataca mais devagar. */
  webTimer: number;
  webSlow: number;
  /** Nível do Santuário (bônus permanente de dano e velocidade de ataque). */
  sanctuary?: number;
  /** Despertada no Santuário (bônus e Forma Suprema em ★5). */
  awakened?: boolean;
  /** Variante cosmética do Altar (só visual). */
  variant?: VariantTier;
  /** Atordoada por congelamento (bloco de gelo em vez de estrelas). */
  frozen?: boolean;
  /** Visual da lentidão: teia (Aranha) ou praga (Bruxa do Brejo). */
  webLook?: 'web' | 'curse';
  /** Engolida pelo Rei Sapo: fora de combate (segundos restantes). */
  swallowTimer?: number;
}

export interface Hero extends Point {
  def: HeroDef;
  /** Cores da skin escolhida (só visual). */
  palette: SkinPalette;
  target: Point;
  attackTimer: number;
  /** Dicas visuais, como nas criaturas. */
  facing: 1 | -1;
  lastAttackAt: number;
  moving: boolean;
  hp: number;
  dead: boolean;
  /** Segundos até renascer (quando morto). */
  respawnTimer: number;
  /** Segundos de invulnerabilidade restantes (ao nascer). */
  shieldTimer: number;
  level: number;
  xp: number;
  /** Momento do último dano recebido (clarão). */
  lastHitAt: number;
}

/** Poça no chão que causa dano por segundo a quem estiver dentro. */
export interface Pool extends Point {
  radius: number;
  remaining: number;
  duration: number;
  dps: number;
  color: string;
  /** Ouro extra por inimigo que morre dentro (Caldeirão Alquímico). */
  bounty?: number;
  /** Deixa lento quem está dentro (fração), como a Fenda Sísmica. */
  slow?: number;
  /** Visual: poça comum ou rachadura no chão. */
  look?: 'pool' | 'crack';
  /** Rachadura: direção da fenda, comprimento do trecho e posição ao longo dela (0 = herói, 1 = ponta). */
  angle?: number;
  span?: number;
  along?: number;
}

/** Golpe atrasado de um Pulso (meteoro, coluna de luz). */
export interface PulseStrike extends Point {
  delay: number;
  total: number;
  kind: 'meteor' | 'judgment';
}

/** Pulsos que duram no tempo. */
export interface PulseFx {
  /** Travessia do Espectro: desliza de \`from\` até \`to\`. */
  glide: { from: Point; to: Point; elapsed: number; duration: number; width: number; id: number } | null;
  /** Lança-Chamas: segundos restantes e direção atual. */
  flame: { remaining: number; angle: number } | null;
  /** Fúria Lunar: segundos restantes. */
  transform: number;
  strikes: PulseStrike[];
  /** Contador para identificar cada deslize. */
  count: number;
}

/** Moeda extra ou baú no chão (o herói coleta passando por cima). */
export interface LootItem extends Point {
  kind: 'coin' | 'chest';
  /** Ouro da moeda. */
  value: number;
  /** Segundos até sumir. */
  remaining: number;
}

/** Multiplicadores vindos das melhorias (permanentes e da run). */
export interface Modifiers {
  damage: number;
  range: number;
  attackSpeed: number;
  /** Bônus do herói para criaturas da raça dele. */
  raceBonus: { race: string; bonus: RaceBonus };
  /** Chance de crítico (dano ×2) de criaturas e herói. */
  critChance: number;
  /** Dano extra por raça (melhorias de sinergia), somado ao bônus do herói. */
  raceDamage: Record<string, number>;
  /** Inimigos comuns abaixo desta fração de vida morrem na hora (0 = inativo). */
  executeBelow: number;
  /** Bônus das Sinergias de raça ativas (recalculado a cada quadro). */
  synergy: SynergyBonus;
}

/** Bônus somados das Sinergias ativas (zeros = nenhuma). */
export interface SynergyBonus {
  damage: number;
  heroLifesteal: number;
  area: number;
  /** Por raça. */
  attackSpeed: Record<string, number>;
  armorIgnore: Record<string, number>;
  effectDuration: Record<string, number>;
  effectChance: Record<string, number>;
  critChance: Record<string, number>;
  critDamage: Record<string, number>;
  vsBoss: Record<string, number>;
  range: number;
  nexusArmor: number;
  raise: number;
}

export const noSynergy = (): SynergyBonus => ({
  damage: 0,
  heroLifesteal: 0,
  area: 0,
  attackSpeed: {},
  armorIgnore: {},
  effectDuration: {},
  effectChance: {},
  critChance: {},
  critDamage: {},
  vsBoss: {},
  range: 0,
  nexusArmor: 0,
  raise: 0,
});

export type Choice = { kind: 'upgrade'; upgrade: OfferedUpgrade };

export interface RunResult {
  stage: StageId;
  victory: boolean;
  wave: number;
  kills: number;
  essence: number;
  hero: HeroId;
  /** Menor fração de vida do Nexus durante a run (conquistas). */
  lowestNexusRatio: number;
  /** Maior número de criaturas na forma evoluída ao mesmo tempo (conquistas). */
  ascendedPeak: number;
  creaturesPlaced: number;
  /** Fragmentos de raça ganhos (por raça). */
  fragments: Record<string, number>;
  /** Cristais Ancestrais ganhos (Despertar). */
  crystals: number;
  /** Inimigos enfrentados (códex). */
  seenEnemies: EnemyId[];
  /** Fim de uma partida no Sem Fim (a vitória já foi contada antes). */
  endless: boolean;
  /** Abates já contados no perfil antes do Sem Fim. */
  previousKills: number;
}

/** Inimigo na fila de entrada. */
export type SpawnItem = EnemyId | { enemy: EnemyId; entrance?: number; elite?: boolean };

export type Phase = 'playing' | 'choosing' | 'ended';

/** O que vem de fora da run: progresso permanente do jogador. */
export interface RunSetup {
  /** Fase da run (padrão: a primeira). */
  stage?: StageId;
  /** Sinergias de raça destravadas (padrão: não). */
  synergies?: boolean;
  /** Níveis do Santuário das criaturas (padrão: nenhum). */
  sanctuary?: Partial<Record<CreatureId, number>>;
  awakened?: CreatureId[];
  /** Variantes cosméticas escolhidas no Altar (só visual). */
  variants?: Partial<Record<CreatureId, VariantTier>>;
  /** Aparência do Nexus (só visual). */
  nexusLook?: NexusLook;
  /** Soma dos talentos comprados. */
  talents: TalentBonuses;
  /** Equipe da run: criaturas disponíveis, na ordem dos atalhos 1–8. */
  team: readonly CreatureId[];
  hero: HeroId;
  /** Cores da skin do herói (só visual). */
  heroPalette: SkinPalette;
}

export interface RunState {
  phase: Phase;
  wave: number;
  /** Tempo de jogo em segundos (para durante a pausa). */
  time: number;
  /** Nexus: vida e posição no mundo. */
  nexus: { hp: number; maxHp: number; x: number; y: number };
  /** Tamanho do mundo (pode ser maior que a tela). */
  map: { width: number; height: number };
  /** Pontos extras a defender (estado da run). */
  guards: { name: string; x: number; y: number; hp: number; maxHp: number; vital: boolean; twin?: boolean; lastHitAt: number }[];
  /** Escolta: parada atual do Nexus. */
  escortStop: number;
  /** Lago congelado: cansaço e buracos por célula (fases com gelo). */
  ice: { stress: number[]; holes: number[]; cols: number; rows: number; x0: number; y0: number } | null;
  /** Avalanche em andamento (evento da onda). */
  avalanche: { entrance: number; t: number; delay: number; duration: number; width: number } | null;
  /** Objetos interativos do mapa (estado da run). */
  interactables: { kind: 'brazier'; x: number; y: number; radius: number; lit: boolean; progress: number }[];
  /** Clima: ativo agora, segundos até mudar, se já avisou e se a onda forçou. */
  weather: { active: boolean; timer: number; warned: boolean; forced: boolean };
  gold: number;
  /** Fase da run (inimigos, chefes e cenário). */
  stage: StageId;
  /** Sinergias de raça: destravadas e nível atual por raça (0, 1 ou 2). */
  synergiesOn: boolean;
  synergyTiers: Record<string, number>;
  /** Níveis do Santuário das criaturas (fixos na run). */
  sanctuary: Partial<Record<CreatureId, number>>;
  awakened: CreatureId[];
  /** Criaturas invocadas por raça (repartem os Fragmentos). */
  racePlacements: Record<string, number>;
  /** Variantes cosméticas (só visual). */
  variants: Partial<Record<CreatureId, VariantTier>>;
  /** Aparência do Nexus (só visual). */
  nexusLook: NexusLook;
  kills: number;
  /** Inimigos abatidos na onda atual (contador "restantes/total" do HUD). */
  waveKills: number;
  hero: Hero;
  enemies: Enemy[];
  creatures: Creature[];
  /** Equipe da run, na ordem dos atalhos. */
  team: CreatureId[];
  unlocked: Set<CreatureId>;
  modifiers: Modifiers;
  pulse: { cooldown: number; remaining: number; radius: number };
  /** Pulsos em andamento (deslize, lança-chamas, transformação, meteoros, coluna de luz). */
  pulseFx: PulseFx;
  /** Onde inimigos morreram há pouco (Erguer Mortos). */
  recentDeaths: { x: number; y: number; at: number }[];
  /** Aceleração de todas as criaturas dada pelo Pulso (Bênção Feérica). */
  haste: { amount: number; remaining: number };
  /** Bônus dos talentos que valem a run inteira. */
  talents: TalentBonuses;
  /** Poças de dano no chão (Caldeirão). */
  pools: Pool[];
  /** Égide rúnica: o próximo golpe no Nexus nesta onda é anulado. */
  wardReady: boolean;
  /** Estatísticas da run para conquistas. */
  lowestNexusRatio: number;
  ascendedPeak: number;
  /** Fila de entrada da onda: id simples ou com entrada/elite (ondas roteirizadas). */
  spawnQueue: SpawnItem[];
  /** Segundos entre inimigos nesta onda (roteiro), ou null para a fórmula. */
  spawnIntervalOverride: number | null;
  spawnTimer: number;
  incomeTimer: number;
  choices: Choice[];
  /** Por que as opções foram oferecidas (a loja só abre após uma onda). */
  choiceReason: 'start' | 'waveCleared';
  /** Limite de criaturas em campo (aumenta com vagas compradas na loja). */
  creatureLimit: number;
  /** Compras na loja nesta run (encarecem a próxima). */
  rerolls: number;
  extraSlots: number;
  /** Quantas vezes cada melhoria foi escolhida nesta run. */
  upgradePicks: Record<string, number>;
  /** Bônus das melhorias do herói (níveis). */
  heroStats: Record<HeroStat, number>;
  /** Escolha de melhoria do herói aberta (a simulação pausa enquanto houver). */
  heroChoices: HeroUpgradeDef[];
  /** Níveis ganhos ainda sem melhoria escolhida. */
  pendingLevels: number;
  heroUpgradePicks: Record<string, number>;
  /** Criaturas invocadas na run (conquista Sem Torres). */
  creaturesPlaced: number;
  /** Inimigos que já apareceram nesta run (códex). */
  /** Mutações do Sem Fim ativas (somam a cada N ondas). */
  mutations: MutationId[];
  seenEnemies: EnemyId[];
  /** Nível comprado de cada melhoria do Nexus (0 = não comprada). */
  nexusLevels: Record<NexusUpgradeId, number>;
  /** Escudo do Nexus: segundos ativo e recarga restante. */
  nexusShield: { active: number; cooldown: number };
  nexusBoltTimer: number;
  loot: LootItem[];
  /** Baú aberto: escolha de melhoria de tier alto (a simulação pausa enquanto houver). */
  chestChoices: Choice[];
  /** Baús coletados ainda sem escolha. */
  pendingChests: number;
  /** Modo Sem Fim (depois da vitória): ondas continuam até o Nexus cair. */
  endless: boolean;
  /** Abates ao entrar no Sem Fim (a Essência conta só o que vier depois). */
  endlessKills: number;
  result: RunResult | null;
  /** Fila de eventos do quadro; quem consome esvazia. */
  events: GameEvent[];
}

export const noHeroStats = (): Record<HeroStat, number> => ({
  damage: 0,
  attackSpeed: 0,
  range: 0,
  maxHp: 0,
  regen: 0,
  speed: 0,
  pulseCooldown: 0,
  pulseDamage: 0,
  lifesteal: 0,
  thorns: 0,
  armor: 0,
  pickup: 0,
  pulseSize: 0,
  pulseEcho: 0,
});

export function createRun(setup: RunSetup): RunState {
  const t = setup.talents;
  const maxHp = NEXUS.baseHp + t.nexusMaxHp;
  const heroDef = HEROES[setup.hero];
  const geometry = STAGES[setup.stage ?? FIRST_STAGE].map ?? DEFAULT_MAP;
  const heroStart = { x: geometry.nexus.x, y: geometry.nexus.y + HERO_PLACEMENT.startOffsetY };
  return {
    phase: 'playing',
    wave: 0,
    time: 0,
    nexus: { hp: maxHp, maxHp, x: geometry.nexus.x, y: geometry.nexus.y },
    map: { width: geometry.width, height: geometry.height },
    // pontos gêmeos (segundo Nexus) nascem com a vida máxima do Nexus principal
    guards: (STAGES[setup.stage ?? FIRST_STAGE].guards ?? []).map((g) => ({ ...g, hp: g.twin ? maxHp : g.hp, maxHp: g.twin ? maxHp : g.hp, lastHitAt: -Infinity })),
    escortStop: 0,
    ice: null,
    avalanche: null,
    interactables: (STAGES[setup.stage ?? FIRST_STAGE].interactables ?? []).map((o) => ({ ...o, lit: true, progress: 0 })),
    weather: { active: false, timer: STAGES[setup.stage ?? FIRST_STAGE].weather?.every ?? 0, warned: false, forced: false },
    gold: ECONOMY.startGold + t.startGold,
    stage: setup.stage ?? FIRST_STAGE,
    synergiesOn: setup.synergies ?? false,
    synergyTiers: {},
    sanctuary: { ...(setup.sanctuary ?? {}) },
    awakened: [...(setup.awakened ?? [])],
    racePlacements: {},
    variants: { ...(setup.variants ?? {}) },
    nexusLook: { ...(setup.nexusLook ?? { model: 'map', color: 'original' }) },
    kills: 0,
    waveKills: 0,
    hero: {
      ...heroStart,
      def: heroDef,
      palette: { ...setup.heroPalette },
      target: { ...heroStart },
      attackTimer: 0,
      facing: 1,
      lastAttackAt: -Infinity,
      moving: false,
      hp: heroDef.maxHp + t.heroMaxHp,
      dead: false,
      respawnTimer: 0,
      shieldTimer: HERO_SPAWN_SHIELD,
      level: 1,
      xp: 0,
      lastHitAt: -Infinity,
    },
    heroStats: noHeroStats(),
    heroChoices: [],
    pendingLevels: 0,
    heroUpgradePicks: {},
    creaturesPlaced: 0,
    seenEnemies: [],
    mutations: [],
    // Nexus+: habilidades que já começam no nível 1
    nexusLevels: { ...noNexusLevels(), bolt: t.startNexusBolt > 0 ? 1 : 0, slowField: t.startNexusField > 0 ? 1 : 0, shield: t.startNexusShield > 0 ? 1 : 0 },
    nexusShield: { active: 0, cooldown: 0 },
    nexusBoltTimer: 0,
    loot: [],
    chestChoices: [],
    pendingChests: 0,
    endless: false,
    endlessKills: 0,
    enemies: [],
    creatures: [],
    team: [...setup.team],
    unlocked: new Set(setup.team),
    modifiers: {
      damage: 1 + t.damage,
      range: 1 + t.range,
      attackSpeed: 1 + t.attackSpeed,
      raceBonus: { race: heroDef.race, bonus: heroDef.raceBonus },
      critChance: 0,
      raceDamage: {},
      executeBelow: 0,
      synergy: noSynergy(),
    },
    pulse: {
      cooldown: heroDef.pulse.cooldown * Math.max(0.35, 1 - t.pulseCooldown),
      remaining: 0,
      radius: heroDef.pulse.radius * (1 + t.pulseRadius),
    },
    talents: { ...t },
    haste: { amount: 0, remaining: 0 },
    pulseFx: { glide: null, flame: null, transform: 0, strikes: [], count: 0 },
    recentDeaths: [],
    pools: [],
    wardReady: false,
    lowestNexusRatio: 1,
    ascendedPeak: 0,
    spawnQueue: [],
    spawnIntervalOverride: null,
    spawnTimer: 0,
    incomeTimer: 0,
    choices: [],
    choiceReason: 'start',
    creatureLimit: ECONOMY.creatureLimit + t.creatureSlots,
    rerolls: 0,
    extraSlots: 0,
    upgradePicks: {},
    result: null,
    events: [],
  };
}

export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
