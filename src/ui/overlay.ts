import { drawPortrait } from '../render/portrait';
import type { SpriteId } from '../render/sprites';

/** Ações dos botões do overlay, indexadas por `data-action`; recebem o `data-value` do botão. */
export type OverlayActions = Record<string, (value: string) => void>;

const overlay = document.querySelector<HTMLElement>('#overlay')!;
let actions: OverlayActions = {};
/** Canvases com `data-sprite`, animados a cada quadro enquanto o overlay está aberto. */
let portraits: HTMLCanvasElement[] = [];

overlay.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
  if (!button || button.disabled) return;
  actions[button.dataset.action!]?.(button.dataset.value ?? '');
});

export function showOverlay(html: string, newActions: OverlayActions): void {
  actions = newActions;
  overlay.innerHTML = html;
  overlay.scrollTop = 0;
  overlay.classList.add('visible');
  portraits = [...overlay.querySelectorAll<HTMLCanvasElement>('canvas[data-sprite]')];
}

export function hideOverlay(): void {
  actions = {};
  portraits = [];
  overlay.classList.remove('visible');
  overlay.innerHTML = '';
}

export function isOverlayVisible(): boolean {
  return overlay.classList.contains('visible');
}

export function animateOverlay(time: number): void {
  portraits.forEach((canvas, i) => drawPortrait(canvas, canvas.dataset.sprite as SpriteId, time + i * 0.7));
}
