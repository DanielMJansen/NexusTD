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
  | 'collector';

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
  | { kind: 'totalWins'; count: number };

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
};

export const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENTS) as AchievementId[];
