import { boundKeyLabel as k } from '../input/bindings';
import type { RunState } from '../game/state';
import { ADMIN_RUN_ACTIONS, type AdminRunAction } from '../game/adminRun';
import { heroSheetHtml } from './describe';
import { showOverlay } from './overlay';
import { t } from '../i18n/i18n';

export interface PauseHandlers {
  onResume(): void;
  onSettings(): void;
  /** Rever o quadro de mecânicas da fase. */
  onStageIntro(): void;
  /** Salva a run e volta ao menu (dá para continuar depois). */
  onSaveAndQuit(): void;
  /** Desiste da run: apaga o save, sem Essência. */
  onAbandon(): void;
  /** Só com o modo administrador: ações na run (ouro, nível, vida, inimigos). */
  onAdmin?(action: AdminRunAction): void;
}

export function showPause(handlers: PauseHandlers, run?: RunState): void {
  const admin = handlers.onAdmin
    ? `<div class="pause-admin"><small>🛠 Admin da run${run ? ` · ${run.gold} ◉ · ${t('herói nível {n}', { n: run.hero.level })}` : ''}</small><div class="row-buttons">${ADMIN_RUN_ACTIONS.map(
        (a) => `<button data-action="admin" data-value="${a.id}">${a.label}</button>`,
      ).join('')}</div></div>`
    : '';
  const move = ['up', 'left', 'down', 'right'].map((a) => k(a as 'up')).join('');
  showOverlay(
    `<div class="panel">
      <h2>${t('Pausado')}</h2>
      <p class="subtitle">${t('As hordas esperam.')}</p>
      <div class="stack">
        <button class="play-button" data-action="resume">${t('▶ Continuar')}</button>
        <button data-action="intro">${t('📜 Como funciona esta fase')}</button>
        <button data-action="settings">⚙ ${t('Configurações')}</button>
        <button data-action="save">${t('💾 Salvar e sair para o menu')}</button>
        <button data-action="abandon">${t('Abandonar run')}</button>
      </div>
      ${admin}
      <details class="pause-controls"><summary>${t('Controles')}</summary><dl class="controls">
        <dt>${move} / ${t('setas')}</dt><dd>${t('mover o herói')}</dd>
        <dt>${t('Clique no chão')}</dt><dd>${t('guiar o herói')}</dd>
        <dt>${t('1–8 ou arrastar')}</dt><dd>${t('invocar criatura')}</dd>
        <dt>${t('Clique na criatura')}</dt><dd>${t('evoluir / vender')}</dd>
        <dt>${k('evolve')}</dt><dd>${t('evoluir a selecionada')}</dd>
        <dt>${k('sell')}</dt><dd>${t('vender a selecionada')}</dd>
        <dt>${k('nexus')} / ${t('clique no Nexus')}</dt><dd>${t('melhorar o Nexus')}</dd>
        <dt>${k('pulse')}</dt><dd>${t('Pulso do herói (segure: solta ao recarregar)')}</dd>
        <dt>${t('Botão direito')}</dt><dd>${t('cancelar')}</dd>
        <dt>${k('pause')} / Esc</dt><dd>${t('pausar')}</dd>
        <dt>${k('speed')} / ${k('freeze')}</dt><dd>${t('velocidade / congelar')}</dd>
        <dt>${k('camera')}</dt><dd>${t('centralizar a câmera')}</dd>
      </dl></details>
      ${run ? `<div class="hero-sheet-pause"><h3>${run.hero.def.name}</h3>${heroSheetHtml(run)}</div>` : ''}
    </div>`,
    {
      resume: () => handlers.onResume(),
      settings: () => handlers.onSettings(),
      intro: () => handlers.onStageIntro(),
      save: () => handlers.onSaveAndQuit(),
      abandon: () => handlers.onAbandon(),
      admin: (action) => handlers.onAdmin?.(action as AdminRunAction),
    },
  );
}
