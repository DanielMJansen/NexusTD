import { showOverlay } from './overlay';

export interface PauseHandlers {
  onResume(): void;
  onSettings(): void;
  /** Salva a run e volta ao menu (dá para continuar depois). */
  onSaveAndQuit(): void;
  /** Desiste da run: apaga o save, sem Essência. */
  onAbandon(): void;
}

export function showPause(handlers: PauseHandlers): void {
  showOverlay(
    `<div class="panel">
      <h2>Pausado</h2>
      <p class="subtitle">As hordas esperam.</p>
      <div class="stack">
        <button class="play-button" data-action="resume">▶ Continuar</button>
        <button data-action="settings">⚙ Configurações</button>
        <button data-action="save">💾 Salvar e sair para o menu</button>
        <button data-action="abandon">Abandonar run</button>
      </div>
    </div>`,
    {
      resume: () => handlers.onResume(),
      settings: () => handlers.onSettings(),
      save: () => handlers.onSaveAndQuit(),
      abandon: () => handlers.onAbandon(),
    },
  );
}
