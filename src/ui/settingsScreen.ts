import type { Settings } from '../save/settings';
import { showOverlay } from './overlay';

export interface SettingsHandlers {
  onChange(change: Partial<Settings>): void;
  onBack(): void;
  onExport(): void;
  onImport(): void;
  onResetSave(): void;
}

const percent = (v: number) => Math.round(v * 100);

/** Checkboxes desta tela e o campo booleano que cada um altera. */
const TOGGLES = ['muted', 'damageNumbers', 'showFps'] as const;

/** Tela de configurações: som, jogo, tutorial e backup/apagar progresso. */
export function showSettings(settings: Settings, handlers: SettingsHandlers): void {
  const slider = (key: 'musicVolume' | 'sfxVolume', label: string) => `
    <label class="slider-row">
      <span>${label}</span>
      <input type="range" min="0" max="100" step="1" value="${percent(settings[key])}" data-setting="${key}" />
      <output>${percent(settings[key])}%</output>
    </label>`;
  const toggle = (key: (typeof TOGGLES)[number], label: string) => `
    <label class="check-row">
      <input type="checkbox" data-setting="${key}"${settings[key] ? ' checked' : ''} />
      <span>${label}</span>
    </label>`;

  const root = showOverlay(
    `<div class="panel settings">
      <h2>Configurações</h2>
      <h3>Som</h3>
      ${slider('musicVolume', 'Música')}
      ${slider('sfxVolume', 'Efeitos')}
      ${toggle('muted', 'Silenciar tudo')}
      <h3>Jogo</h3>
      ${toggle('damageNumbers', 'Mostrar números de dano')}
      <h3>Desempenho</h3>
      <div class="quality-row">
        <span>Qualidade gráfica</span>
        <div class="segmented">${(
          [
            ['auto', 'Automática'],
            ['high', 'Alta'],
            ['medium', 'Média'],
            ['low', 'Baixa'],
          ] as const
        )
          .map(([value, label]) => `<button class="${settings.quality === value ? 'active' : ''}" data-action="quality" data-value="${value}">${label}</button>`)
          .join('')}</div>
      </div>
      <p class="hint">Automática reduz a resolução da arena sozinha se o jogo ficar pesado. Baixa ajuda bastante em computadores mais simples ou telas muito grandes.</p>
      ${toggle('showFps', 'Mostrar FPS (quadros por segundo)')}
      <div class="row-buttons">
        <button data-action="tutorial"${settings.tutorialDone ? '' : ' disabled'}>${
          settings.tutorialDone ? '↺ Rever tutorial na próxima run' : 'Tutorial na próxima run ✓'
        }</button>
      </div>
      <h3>Progresso</h3>
      <p class="hint">Leve seu progresso para outro computador ou navegador.</p>
      <div class="row-buttons">
        <button data-action="export">⇩ Exportar save</button>
        <button data-action="import">⇧ Importar save</button>
      </div>
      <div class="row-buttons">
        <button class="danger" data-action="reset">✖ Apagar todo o progresso</button>
      </div>
      <button class="play-button" data-action="back">Voltar</button>
    </div>`,
    {
      back: () => handlers.onBack(),
      export: () => handlers.onExport(),
      import: () => handlers.onImport(),
      reset: () => handlers.onResetSave(),
      quality: (value) => {
        handlers.onChange({ quality: value as Settings['quality'] });
        showSettings({ ...settings, quality: value as Settings['quality'] }, handlers);
      },
      tutorial: () => {
        handlers.onChange({ tutorialDone: false });
        showSettings({ ...settings, tutorialDone: false }, handlers);
      },
    },
  );

  for (const input of root.querySelectorAll<HTMLInputElement>('input[data-setting]')) {
    const key = input.dataset.setting as keyof Settings;
    input.addEventListener('input', () => {
      if ((TOGGLES as readonly string[]).includes(key)) {
        handlers.onChange({ [key]: input.checked });
        return;
      }
      const value = Number(input.value) / 100;
      input.parentElement!.querySelector('output')!.textContent = `${input.value}%`;
      handlers.onChange({ [key]: value });
    });
  }
}
