import type { Point } from '../game/state';

/** Teclas pressionadas; setas e WASD dão a direção do herói. */
export class Keyboard {
  private pressed = new Set<string>();

  /** `onKeyDown` recebe a tecla em minúsculas; pode chamar `preventDefault` no evento. */
  constructor(onKeyDown: (key: string, event: KeyboardEvent) => void) {
    addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      this.pressed.add(key);
      if (!event.repeat) onKeyDown(key, event);
      else if (key === ' ') event.preventDefault();
    });
    addEventListener('keyup', (event) => this.pressed.delete(event.key.toLowerCase()));
    // Evita tecla "presa" ao trocar de janela com ela pressionada.
    addEventListener('blur', () => this.pressed.clear());
  }

  isDown(key: string): boolean {
    return this.pressed.has(key);
  }

  direction(): Point {
    const is = (...keys: string[]) => keys.some((k) => this.pressed.has(k));
    return {
      x: (is('arrowright', 'd') ? 1 : 0) - (is('arrowleft', 'a') ? 1 : 0),
      y: (is('arrowdown', 's') ? 1 : 0) - (is('arrowup', 'w') ? 1 : 0),
    };
  }
}
