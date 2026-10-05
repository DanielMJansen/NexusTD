import { showOverlay } from './overlay';

export function showPause(handlers: { onResume(): void; onQuit(): void }): void {
  showOverlay(
    `<h3>Pausado</h3>
    <button data-action="resume">▶ Continuar</button>
    <button data-action="quit">Sair para o menu</button>`,
    { resume: () => handlers.onResume(), quit: () => handlers.onQuit() },
  );
}
