// Passos do tutorial da primeira run (modelo do Myth TD).
// "read": pausa o jogo e avança com "Próximo". Os outros avançam quando o jogador faz a ação.

export type TutorialAdvance = 'read' | 'heroMoved' | 'creaturePlaced' | 'pulse' | 'inspect';

export interface TutorialStep {
  title: string;
  text: string;
  advance: TutorialAdvance;
  /** Seletor do elemento destacado na tela. */
  highlight?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Proteja o Nexus',
    text: 'O cristal no centro é o Nexus. Hordas vêm de todos os lados; se a vida dele zerar, a run acaba.',
    advance: 'read',
    highlight: '.chip.nexus',
  },
  {
    title: 'Seu herói',
    text: 'Mova o herói com WASD/setas ou clicando no chão. Ele ataca sozinho os inimigos por perto.',
    advance: 'heroMoved',
  },
  {
    title: 'Ouro',
    text: 'Ouro (◉) vem dos abates e do tempo. Ele serve para invocar e evoluir as criaturas da sua equipe.',
    advance: 'read',
    highlight: '.chip.gold',
  },
  {
    title: 'Invoque uma criatura',
    text: 'Arraste uma carta do painel até a arena — ou aperte 1 e clique no chão. Verde = dá para invocar.',
    advance: 'creaturePlaced',
    highlight: '#card-list',
  },
  {
    title: 'Pulso',
    text: 'Aperte Espaço para usar a habilidade do herói. Ela recarrega sozinha.',
    advance: 'pulse',
    highlight: '#pulse-button',
  },
  {
    title: 'Evoluir e vender',
    text: 'Clique numa criatura em campo para ver os atributos, evoluir (botão verde quando há ouro) ou vender.',
    advance: 'inspect',
  },
  {
    title: 'Entre as ondas',
    text: 'Ao vencer uma onda, escolha 1 entre 3 melhorias — as douradas são raras. A run é salva a cada onda. Boa sorte!',
    advance: 'read',
  },
];
