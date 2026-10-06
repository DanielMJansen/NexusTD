import type { HeroId } from './heroes';

// Conquistas: liberam skins dos heróis. Checadas no fim de cada run (game/achievements.ts).

export type AchievementId =
  | 'firstVictory'
  | 'knightVictory'
  | 'vampireVictory'
  | 'draconianVictory'
  | 'lycanVictory'
  | 'specterVictory'
  | 'witchVictory'
  | 'marathon'
  | 'champion'
  | 'untouchable'
  | 'ascension'
  | 'slayer'
  | 'collector'
  | 'noTowers'
  | 'faeQueenVictory'
  | 'faeQueenEndless'
  | 'colossusVictory'
  | 'colossusEndless'
  | 'deathLordVictory'
  | 'deathLordEndless'
  | 'gorgonQueenVictory'
  | 'gorgonQueenEndless'
  | 'archdemonVictory'
  | 'archdemonEndless'
  | 'archangelVictory'
  | 'archangelEndless';

export type AchievementGoal =
  /** Vencer uma run (com um herói específico, se informado). */
  | { kind: 'win'; hero?: HeroId }
  /** Vencer sem o Nexus cair abaixo desta fração da vida máxima. */
  | { kind: 'winAboveHp'; ratio: number }
  /** Ter N criaturas na forma evoluída ao mesmo tempo numa run. */
  | { kind: 'ascendedAtOnce'; count: number }
  /** Abates somados em todas as runs. */
  | { kind: 'totalKills'; count: number }
  /** Ter todas as criaturas na coleção. */
  | { kind: 'fullCollection' }
  /** Runs jogadas / vencidas, somando todas. */
  | { kind: 'totalRuns'; count: number }
  | { kind: 'totalWins'; count: number }
  /** Vencer sem invocar nenhuma criatura. */
  | { kind: 'winNoCreatures' }
  /** Alcançar esta onda no Sem Fim (com um herói específico, se informado). */
  | { kind: 'endlessWave'; wave: number; hero?: HeroId };

export interface AchievementDef {
  id: AchievementId;
  name: string;
  description: string;
  goal: AchievementGoal;
}

export const ACHIEVEMENTS: Record<AchievementId, AchievementDef> = {
  firstVictory: { id: 'firstVictory', name: 'Primeira Vitória', description: 'Vença uma run.', goal: { kind: 'win' } },
  knightVictory: {
    id: 'knightVictory',
    name: 'Juramento Cumprido',
    description: 'Vença uma run com o Cavaleiro.',
    goal: { kind: 'win', hero: 'knight' },
  },
  vampireVictory: {
    id: 'vampireVictory',
    name: 'Noite Eterna',
    description: 'Vença uma run com o Nobre Vampiro.',
    goal: { kind: 'win', hero: 'vampireLord' },
  },
  draconianVictory: {
    id: 'draconianVictory',
    name: 'Sangue de Dragão',
    description: 'Vença uma run com o Draconato.',
    goal: { kind: 'win', hero: 'draconian' },
  },
  lycanVictory: {
    id: 'lycanVictory',
    name: 'Lua Cheia',
    description: 'Vença uma run com o Licantropo.',
    goal: { kind: 'win', hero: 'lycan' },
  },
  specterVictory: {
    id: 'specterVictory',
    name: 'Além do Véu',
    description: 'Vença uma run com o Espectro.',
    goal: { kind: 'win', hero: 'specter' },
  },
  witchVictory: {
    id: 'witchVictory',
    name: 'Feitiço Perfeito',
    description: 'Vença uma run com a Bruxa.',
    goal: { kind: 'win', hero: 'witch' },
  },
  marathon: { id: 'marathon', name: 'Maratonista', description: 'Jogue 25 runs.', goal: { kind: 'totalRuns', count: 25 } },
  champion: { id: 'champion', name: 'Campeão', description: 'Vença 10 runs.', goal: { kind: 'totalWins', count: 10 } },
  noTowers: {
    id: 'noTowers',
    name: 'Sem Torres',
    description: 'Vença uma run sem invocar nenhuma criatura — só o herói.',
    goal: { kind: 'winNoCreatures' },
  },
  untouchable: {
    id: 'untouchable',
    name: 'Intocável',
    description: 'Vença sem o Nexus ficar abaixo de 50% da vida.',
    goal: { kind: 'winAboveHp', ratio: 0.5 },
  },
  ascension: {
    id: 'ascension',
    name: 'Ascensão',
    description: 'Tenha 3 criaturas na forma evoluída ao mesmo tempo.',
    goal: { kind: 'ascendedAtOnce', count: 3 },
  },
  slayer: { id: 'slayer', name: 'Exterminador', description: 'Derrote 1000 inimigos no total.', goal: { kind: 'totalKills', count: 1000 } },
  collector: {
    id: 'collector',
    name: 'Colecionador',
    description: 'Tenha todas as criaturas na coleção.',
    goal: { kind: 'fullCollection' },
  },
  faeQueenVictory: {
    id: 'faeQueenVictory',
    name: 'Primavera Eterna',
    description: 'Vença uma run com a Rainha Fada.',
    goal: { kind: 'win', hero: 'faeQueen' },
  },
  faeQueenEndless: {
    id: 'faeQueenEndless',
    name: 'Conto Sem Fim',
    description: 'Alcance a onda 30 do Sem Fim com a Rainha Fada.',
    goal: { kind: 'endlessWave', wave: 30, hero: 'faeQueen' },
  },
  colossusVictory: {
    id: 'colossusVictory',
    name: 'Inabalável',
    description: 'Vença uma run com o Colosso.',
    goal: { kind: 'win', hero: 'colossus' },
  },
  colossusEndless: {
    id: 'colossusEndless',
    name: 'Montanha Viva',
    description: 'Alcance a onda 30 do Sem Fim com o Colosso.',
    goal: { kind: 'endlessWave', wave: 30, hero: 'colossus' },
  },
  deathLordVictory: {
    id: 'deathLordVictory',
    name: 'Exército de Ossos',
    description: 'Vença uma run com o Senhor dos Mortos.',
    goal: { kind: 'win', hero: 'deathLord' },
  },
  deathLordEndless: {
    id: 'deathLordEndless',
    name: 'Morte Sem Fim',
    description: 'Alcance a onda 30 do Sem Fim com o Senhor dos Mortos.',
    goal: { kind: 'endlessWave', wave: 30, hero: 'deathLord' },
  },
  gorgonQueenVictory: {
    id: 'gorgonQueenVictory',
    name: 'Olhar de Pedra',
    description: 'Vença uma run com a Rainha Górgona.',
    goal: { kind: 'win', hero: 'gorgonQueen' },
  },
  gorgonQueenEndless: {
    id: 'gorgonQueenEndless',
    name: 'Jardim de Estátuas',
    description: 'Alcance a onda 30 do Sem Fim com a Rainha Górgona.',
    goal: { kind: 'endlessWave', wave: 30, hero: 'gorgonQueen' },
  },
  archdemonVictory: {
    id: 'archdemonVictory',
    name: 'Pacto Selado',
    description: 'Vença uma run com o Arquidemônio.',
    goal: { kind: 'win', hero: 'archdemon' },
  },
  archdemonEndless: {
    id: 'archdemonEndless',
    name: 'Inferno Sem Fim',
    description: 'Alcance a onda 30 do Sem Fim com o Arquidemônio.',
    goal: { kind: 'endlessWave', wave: 30, hero: 'archdemon' },
  },
  archangelVictory: {
    id: 'archangelVictory',
    name: 'Juízo Final',
    description: 'Vença uma run com o Arcanjo.',
    goal: { kind: 'win', hero: 'archangel' },
  },
  archangelEndless: {
    id: 'archangelEndless',
    name: 'Luz Eterna',
    description: 'Alcance a onda 30 do Sem Fim com o Arcanjo.',
    goal: { kind: 'endlessWave', wave: 30, hero: 'archangel' },
  },
};

export const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS) as AchievementId[];
