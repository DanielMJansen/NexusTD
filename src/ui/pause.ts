import { showOverlay } from './overlay';

export function showPause(handlers: { onResume(): void; onQuit(): void }): void {
  showOverlay(
    `<div class="panel">
      <h2>Pausado</h2>
      <p class="subtitle">As hordas esperam.</p>
      <div class="stack">
        <button class="play-button" data-action="resume">▶ Continuar</button>
        <button data-action="quit">Sair para o menu</button>
      </div>
    </div>`,
    { resume: () => handlers.onResume(), quit: () => handlers.onQuit() },
  );
}
