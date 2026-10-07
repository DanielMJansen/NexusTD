import { boundKeyLabel as k } from '../input/bindings';
import type { RunState } from '../game/state';
import { heroSheetHtml } from './describe';
import { showOverlay } from './overlay';

export interface PauseHandlers {
  onResume(): void;
  onSettings(): void;
  /** Rever o quadro de mecânicas da fase. */
  onStageIntro(): void;
  /** Salva a run e volta ao menu (dá para continuar depois). */
  onSaveAndQuit(): void;
  /** Desiste da run: apaga o save, sem Essência. */
  onAbandon(): void;
}

export function showPause(handlers: PauseHandlers, run?: RunState): void {
  const move = ['up', 'left', 'down', 'right'].map((a) => k(a as 'up')).join('');
  showOverlay(
    `<div class="panel">
      <h2>Pausado</h2>
      <p class="subtitle">As hordas esperam.</p>
      <div class="stack">
        <button class="play-button" data-action="resume">▶ Continuar</button>
        <button data-action="intro">📜 Como funciona esta fase</button>
        <button data-action="settings">⚙ Configurações</button>
        <button data-action="save">💾 Salvar e sair para o menu</button>
        <button data-action="abandon">Abandonar run</button>
      </div>
      <details class="pause-controls"><summary>Controles</summary><dl class="controls">
        <dt>${move} / setas</dt><dd>mover o herói</dd>
        <dt>Clique no chão</dt><dd>guiar o herói</dd>
        <dt>1–8 ou arrastar</dt><dd>invocar criatura</dd>
        <dt>Clique na criatura</dt><dd>evoluir / vender</dd>
        <dt>${k('evolve')}</dt><dd>evoluir a selecionada</dd>
        <dt>${k('sell')}</dt><dd>vender a selecionada</dd>
        <dt>${k('nexus')} / clique no Nexus</dt><dd>melhorar o Nexus</dd>
        <dt>${k('pulse')}</dt><dd>Pulso do herói (segure: solta ao recarregar)</dd>
        <dt>Botão direito</dt><dd>cancelar</dd>
        <dt>${k('pause')} / Esc</dt><dd>pausar</dd>
        <dt>${k('speed')} / ${k('freeze')}</dt><dd>velocidade / congelar</dd>
        <dt>${k('camera')}</dt><dd>centralizar a câmera</dd>
      </dl></details>
      ${run ? `<div class="hero-sheet-pause"><h3>${run.hero.def.name}</h3>${heroSheetHtml(run)}</div>` : ''}
    </div>`,
    {
      resume: () => handlers.onResume(),
      settings: () => handlers.onSettings(),
      intro: () => handlers.onStageIntro(),
      save: () => handlers.onSaveAndQuit(),
      abandon: () => handlers.onAbandon(),
    },
  );
}
