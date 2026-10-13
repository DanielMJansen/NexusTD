// Telas do menu que liberam conforme o jogador avança (cadeado → NOVO → tutorial na 1ª visita).
import type { StageId, StageTip } from './stages';

export type FeatureId = 'talents' | 'achievements' | 'codex' | 'sanctuary' | 'nexus' | 'altar' | 'relics';

export type FeatureCondition =
  /** Terminar esta quantidade de runs (vitória ou derrota). */
  | { kind: 'runs'; count: number }
  /** Vencer esta fase. */
  | { kind: 'stageWon'; stage: StageId };

export interface FeatureDef {
  id: FeatureId;
  name: string;
  /** Texto do cadeado ("libera ao …"). */
  lockedHint: string;
  condition: FeatureCondition;
  /** Quadro da 1ª visita: o que é, dicas e a mini ilustração animada (`render/featureDemos`). */
  intro: { subtitle: string; color: string; tips: StageTip[] };
}

export const FEATURES: Record<FeatureId, FeatureDef> = {
  talents: {
    id: 'talents',
    name: 'Talentos',
    lockedHint: 'libera ao terminar a 1ª run',
    condition: { kind: 'runs', count: 1 },
    intro: {
      subtitle: 'Gaste Essência em melhorias permanentes que valem em toda run.',
      color: '#b48cff',
      tips: [
        { icon: '✦', title: 'Essência', text: 'Toda run rende Essência, vencendo ou não: ondas alcançadas, abates e um bônus pela vitória. Fases mais difíceis dão mais.' },
        { icon: '🌳', title: 'Árvore', text: 'Cada ramo fortalece uma parte do jogo: Nexus, economia, criaturas, herói e a própria Essência. Alguns talentos pedem outro antes.' },
        { icon: '↺', title: 'Sem pressa', text: 'Os talentos nunca se perdem. Se uma fase estiver difícil, junte Essência e volte mais forte.' },
      ],
    },
  },
  achievements: {
    id: 'achievements',
    name: 'Conquistas',
    lockedHint: 'libera ao terminar a 1ª run',
    condition: { kind: 'runs', count: 1 },
    intro: {
      subtitle: 'Desafios que contam ao longo de todas as runs.',
      color: '#f0c35a',
      tips: [
        { icon: '🏆', title: 'Objetivos', text: 'Vencer com cada herói, abater muitos inimigos, chegar longe no Sem Fim… o progresso aparece em cada uma.' },
        { icon: '🎨', title: 'Skins', text: 'Muitas conquistas liberam skins de herói e cores do Nexus.' },
      ],
    },
  },
  codex: {
    id: 'codex',
    name: 'Códex',
    lockedHint: 'libera ao terminar a 1ª run',
    condition: { kind: 'runs', count: 1 },
    intro: {
      subtitle: 'O livro dos inimigos que você já enfrentou.',
      color: '#8ad0ff',
      tips: [
        { icon: '📖', title: 'Fichas', text: 'Cada inimigo visto ganha uma ficha com vida, velocidade, armadura e habilidades, por fase.' },
        { icon: '?', title: 'Ainda não visto', text: 'Inimigos que você nunca enfrentou aparecem como silhueta.' },
      ],
    },
  },
  sanctuary: {
    id: 'sanctuary',
    name: 'Santuário',
    lockedHint: 'libera ao vencer o Cemitério',
    condition: { kind: 'stageWon', stage: 'graveyard' },
    // o Santuário usa o próprio quadro (sanctuaryScreen), com estes campos só de reserva
    intro: { subtitle: '', color: '#6af0d0', tips: [] },
  },
  nexus: {
    id: 'nexus',
    name: 'Nexus',
    lockedHint: 'libera ao vencer o Cemitério',
    condition: { kind: 'stageWon', stage: 'graveyard' },
    intro: {
      subtitle: 'Mude o visual do seu Nexus: modelo e cor.',
      color: '#7af0d8',
      tips: [
        { icon: '💠', title: 'Modelos', text: 'Vencer cada fase libera o Nexus dela (Lótus do Pântano, Pináculo da Tundra, Obelisco do Deserto…). "Do mapa" usa o de cada fase.' },
        { icon: '🎨', title: 'Cores', text: 'Algumas cores se compram com Essência, outras vêm de conquistas ou do Altar. É só visual: não muda a força.' },
      ],
    },
  },
  altar: {
    id: 'altar',
    name: 'Altar de Variantes',
    lockedHint: 'libera ao vencer o Pântano',
    condition: { kind: 'stageWon', stage: 'swamp' },
    intro: {
      subtitle: 'Gaste Essência para tirar variantes de cor das suas criaturas.',
      color: '#ff8ad8',
      tips: [
        { icon: '🎲', title: 'Sorteio', text: 'Cada tiragem dá uma variante de uma criatura da sua coleção, ou Fragmentos se ela já for repetida. Raras e lendárias têm garantia depois de várias tentativas.' },
        { icon: '🎨', title: 'Visual', text: 'Escolha a variante na Coleção: ela aparece no jogo e em todas as telas. Não muda a força.' },
      ],
    },
  },
  relics: {
    id: 'relics',
    name: 'Relíquias',
    lockedHint: 'libera ao vencer a Tundra',
    condition: { kind: 'stageWon', stage: 'tundra' },
    intro: {
      subtitle: 'Tesouros deixados pelos chefes: equipe antes da run.',
      color: '#f0c35a',
      tips: [
        { icon: '👑', title: 'Baús raros', text: 'A partir de agora, chefes de todas as fases podem deixar um baú de Relíquia. Chefes finais e fases avançadas dão mais chance; depois de muitos chefes sem baú, o próximo vem garantido.' },
        { icon: '⬆', title: 'Níveis', text: 'Cada Relíquia tem 3 níveis. Uma repetida vira cópia: use para subir o nível ou troque por Essência.' },
        { icon: '◎', title: 'Vagas', text: 'Começa com 1 vaga. Vencer o Deserto abre a 2ª; chegar à onda 30 do Sem Fim no Deserto abre a 3ª.' },
      ],
    },
  },
};
