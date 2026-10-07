import type { Point } from '../game/state';
import { DEFAULT_BINDINGS, type KeyBindings } from './bindings';

/** Teclas pressionadas; setas e as teclas de movimento (WASD por padrão) dão a direção do herói. */
export class Keyboard {
  private pressed = new Set<string>();
  /** Teclas configuradas (as setas sempre funcionam). */
  bindings: KeyBindings = { ...DEFAULT_BINDINGS };

  /** `onKeyDown` recebe a tecla em minúsculas; pode chamar `preventDefault` no evento. */
  constructor(onKeyDown: (key: string, event: KeyboardEvent) => void) {
    addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      this.pressed.add(key);
      if (!event.repeat) onKeyDown(key, event);
      else if (key === ' ' || key === this.bindings.pulse) event.preventDefault();
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
    const b = this.bindings;
    return {
      x: (is('arrowright', b.right) ? 1 : 0) - (is('arrowleft', b.left) ? 1 : 0),
      y: (is('arrowdown', b.down) ? 1 : 0) - (is('arrowup', b.up) ? 1 : 0),
    };
  }
}
