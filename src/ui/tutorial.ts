import { TUTORIAL_STEPS, type TutorialAdvance } from '../data/tutorial';
import { boundKeyLabel } from '../input/bindings';

/** Troca {move}, {pulse}, {evolve} e {sell} pelas teclas configuradas. */
const withKeys = (text: string): string =>
  text
    .replace('{move}', ['up', 'left', 'down', 'right'].map((a) => boundKeyLabel(a as 'up')).join(''))
    .replace('{pulse}', boundKeyLabel('pulse'))
    .replace('{evolve}', boundKeyLabel('evolve'))
    .replace('{sell}', boundKeyLabel('sell'));
import type { GameEvent } from '../game/events';
import type { Point } from '../game/state';

/** O que o tutorial observa a cada quadro para avançar os passos de ação. */
export interface TutorialWatch {
  hero: Point;
  inspecting: boolean;
}

/**
 * Tutorial guiado da primeira run: caixa fixa no canto do palco, destaque no elemento
 * relevante e "Pular tutorial" sempre visível.
 */
export class Tutorial {
  private step = -1;
  private heroStart: Point | null = null;
  private readonly box: HTMLElement;
  private highlighted: Element[] = [];

  /** `onDone` é chamado ao concluir ou pular (marca o tutorial como visto). */
  constructor(private readonly onDone: () => void) {
    this.box = document.createElement('div');
    this.box.className = 'tutorial-box';
    this.box.hidden = true;
    document.querySelector('#stage')!.appendChild(this.box);
    this.box.addEventListener('click', (event) => {
      const action = (event.target as HTMLElement).closest<HTMLElement>('[data-tutorial]')?.dataset.tutorial;
      if (action === 'next') this.next();
      if (action === 'skip') this.finish();
    });
  }

  get active(): boolean {
    return this.step >= 0;
  }

  /** Passos de leitura congelam o jogo. */
  get freezes(): boolean {
    return this.active && this.current() === 'read';
  }

  start(): void {
    this.step = -1;
    this.next();
  }

  /** Esconde sem marcar como visto (ex.: saiu da run no meio). */
  stop(): void {
    this.step = -1;
    this.render();
  }

  onEvent(event: GameEvent): void {
    if (!this.active) return;
    const need = this.current();
    if ((need === 'creaturePlaced' && event.type === 'creaturePlaced') || (need === 'pulse' && event.type === 'pulse')) {
      this.next();
    }
  }

  watch(state: TutorialWatch): void {
    if (!this.active) return;
    const need = this.current();
    if (need === 'heroMoved') {
      this.heroStart ??= { ...state.hero };
      if (Math.hypot(state.hero.x - this.heroStart.x, state.hero.y - this.heroStart.y) > 40) this.next();
    } else if (need === 'inspect' && state.inspecting) {
      this.next();
    }
  }

  /** Passo atual pede invocar? (o App garante ouro suficiente nesse passo) */
  get wantsSummon(): boolean {
    return this.active && this.current() === 'creaturePlaced';
  }

  private current(): TutorialAdvance | null {
    return TUTORIAL_STEPS[this.step]?.advance ?? null;
  }

  private next(): void {
    this.step++;
    this.heroStart = null;
    if (this.step >= TUTORIAL_STEPS.length) {
      this.finish();
      return;
    }
    this.render();
  }

  private finish(): void {
    this.step = -1;
    this.render();
    this.onDone();
  }

  private render(): void {
    for (const el of this.highlighted) el.classList.remove('tutorial-highlight');
    this.highlighted = [];
    const step = TUTORIAL_STEPS[this.step];
    if (!step) {
      this.box.hidden = true;
      return;
    }
    if (step.highlight) {
      this.highlighted = [...document.querySelectorAll(step.highlight)];
      for (const el of this.highlighted) el.classList.add('tutorial-highlight');
    }
    const action = step.advance === 'read' ? '<button data-tutorial="next">Próximo ▸</button>' : '<em>Faça a ação para continuar…</em>';
    this.box.innerHTML = `
      <div class="tutorial-head"><span>Tutorial ${this.step + 1}/${TUTORIAL_STEPS.length}</span>
        <button class="tutorial-skip" data-tutorial="skip">Pular tutorial</button></div>
      <h4>${step.title}</h4>
      <p>${withKeys(step.text)}</p>
      <div class="tutorial-foot">${action}</div>`;
    this.box.hidden = false;
  }
}
