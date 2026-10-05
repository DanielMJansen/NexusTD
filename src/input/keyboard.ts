import type { Point } from '../game/state';

/** Teclas pressionadas; setas e WASD dão a direção do herói. */
export class Keyboard {
  private pressed = new Set<string>();

  constructor(onKeyDown: (key: string) => void) {
    addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      this.pressed.add(key);
      onKeyDown(key);
    });
    addEventListener('keyup', (event) => this.pressed.delete(event.key.toLowerCase()));
    // Evita tecla "presa" ao trocar de janela com ela pressionada.
    addEventListener('blur', () => this.pressed.clear());
  }

  direction(): Point {
    const is = (...keys: string[]) => keys.some((k) => this.pressed.has(k));
    return {
      x: (is('arrowright', 'd') ? 1 : 0) - (is('arrowleft', 'a') ? 1 : 0),
      y: (is('arrowdown', 's') ? 1 : 0) - (is('arrowup', 'w') ? 1 : 0),
    };
  }
}
