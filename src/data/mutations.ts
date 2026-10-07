// Mutações do Sem Fim: a cada `every` ondas além do fim da fase, uma nova (sorteada, sem repetir) se soma às
// anteriores e vale até o fim da run.

export type MutationId = 'armored' | 'swift' | 'splitting' | 'regenerating' | 'explosive' | 'shielded' | 'invasion' | 'frenzy';

export interface MutationDef {
  id: MutationId;
  name: string;
  icon: string;
  description: string;
}

export const MUTATION_RULES = {
  /** Uma mutação nova a cada N ondas do Sem Fim. */
  every: 5,
  /** Blindados: armadura extra. */
  armor: 2,
  /** Velozes: velocidade extra (fração). */
  speed: 0.25,
  /** Divisores: filhotes ao morrer e a fração da vida máxima de cada um. */
  split: { count: 2, hpRatio: 0.35 },
  /** Regenerantes: fração da vida máxima por segundo (fogo corta por alguns segundos). */
  regen: 0.02,
  /** Explosivos: raio e atordoamento das criaturas próximas ao morrer. */
  explode: { radius: 40, stun: 1 },
  /** Invasão: fração da onda trocada por inimigos de outras fases. */
  invasion: 0.3,
  /** Frenesi: multiplicador da chance de elite (com teto). */
  elite: { multiplier: 2, max: 0.7 },
} as const;

export const MUTATIONS: Record<MutationId, MutationDef> = {
  armored: { id: 'armored', name: 'Blindados', icon: '⛨', description: `Inimigos com +${MUTATION_RULES.armor} de armadura.` },
  swift: { id: 'swift', name: 'Velozes', icon: '»', description: `Inimigos ${Math.round(MUTATION_RULES.speed * 100)}% mais rápidos.` },
  splitting: { id: 'splitting', name: 'Divisores', icon: '⁂', description: 'Inimigos comuns se partem em 2 menores ao morrer.' },
  regenerating: { id: 'regenerating', name: 'Regenerantes', icon: '✚', description: 'Inimigos recuperam vida com o tempo, a não ser que levem dano de fogo.' },
  explosive: { id: 'explosive', name: 'Explosivos', icon: '✹', description: 'Ao morrer, inimigos atordoam as criaturas próximas por 1 s.' },
  shielded: { id: 'shielded', name: 'Escudados', icon: '◈', description: 'Um escudo bloqueia o primeiro golpe de cada inimigo.' },
  invasion: { id: 'invasion', name: 'Invasão', icon: '⚑', description: 'Inimigos de outras fases entram nas ondas.' },
  frenzy: { id: 'frenzy', name: 'Frenesi', icon: '✦', description: 'Elites aparecem com o dobro da frequência.' },
};

export const MUTATION_IDS = Object.keys(MUTATIONS) as MutationId[];
