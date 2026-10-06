import type { RunState } from '../game/state';
import { heroSheetHtml } from './describe';
import { showOverlay } from './overlay';

export interface PauseHandlers {
  onResume(): void;
  onSettings(): void;
  /** Salva a run e volta ao menu (dá para continuar depois). */
  onSaveAndQuit(): void;
  /** Desiste da run: apaga o save, sem Essência. */
  onAbandon(): void;
}

export function showPause(handlers: PauseHandlers, run?: RunState): void {
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
      <details class="pause-controls"><summary>Controles</summary><dl class="controls">
        <dt>WASD / setas</dt><dd>mover o herói</dd>
        <dt>Clique no chão</dt><dd>guiar o herói</dd>
        <dt>1–8 ou arrastar</dt><dd>invocar criatura</dd>
        <dt>Clique na criatura</dt><dd>evoluir / vender</dd>
        <dt>E</dt><dd>evoluir a selecionada</dd>
        <dt>N / clique no Nexus</dt><dd>melhorar o Nexus</dd>
        <dt>Espaço</dt><dd>Pulso do herói</dd>
        <dt>Mouse na borda · C</dt><dd>mover a vista · voltar ao herói</dd>
        <dt>Botão direito</dt><dd>cancelar</dd>
        <dt>P / Esc</dt><dd>pausar</dd>
        <dt>F / 0</dt><dd>velocidade / congelar</dd>
      </dl></details>
      ${run ? `<div class="hero-sheet-pause"><h3>${run.hero.def.name}</h3>${heroSheetHtml(run)}</div>` : ''}
    </div>`,
    {
      resume: () => handlers.onResume(),
      settings: () => handlers.onSettings(),
      save: () => handlers.onSaveAndQuit(),
      abandon: () => handlers.onAbandon(),
    },
  );
}
