/** Ações dos botões do overlay, indexadas por `data-action`; recebem o `data-value` do botão. */
export type OverlayActions = Record<string, (value: string) => void>;

const overlay = document.querySelector<HTMLElement>('#overlay')!;
let actions: OverlayActions = {};

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
}

export function hideOverlay(): void {
  actions = {};
  overlay.classList.remove('visible');
  overlay.innerHTML = '';
}
