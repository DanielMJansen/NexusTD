import type { Settings } from '../save/settings';
import { showOverlay } from './overlay';

export interface SettingsHandlers {
  onChange(change: Partial<Settings>): void;
  onBack(): void;
  onExport(): void;
  onImport(): void;
}

const percent = (v: number) => Math.round(v * 100);

/** Tela de configurações: volumes independentes, mudo e backup do progresso. */
export function showSettings(settings: Settings, handlers: SettingsHandlers): void {
  const slider = (key: 'musicVolume' | 'sfxVolume', label: string) => `
    <label class="slider-row">
      <span>${label}</span>
      <input type="range" min="0" max="100" step="1" value="${percent(settings[key])}" data-setting="${key}" />
      <output>${percent(settings[key])}%</output>
    </label>`;

  const root = showOverlay(
    `<div class="panel settings">
      <h2>Configurações</h2>
      <h3>Som</h3>
      ${slider('musicVolume', 'Música')}
      ${slider('sfxVolume', 'Efeitos')}
      <label class="check-row">
        <input type="checkbox" data-setting="muted"${settings.muted ? ' checked' : ''} />
        <span>Silenciar tudo</span>
      </label>
      <h3>Progresso</h3>
      <p class="hint">Leve seu progresso para outro computador ou navegador.</p>
      <div class="row-buttons">
        <button data-action="export">⇩ Exportar save</button>
        <button data-action="import">⇧ Importar save</button>
      </div>
      <button class="play-button" data-action="back">Voltar</button>
    </div>`,
    {
      back: () => handlers.onBack(),
      export: () => handlers.onExport(),
      import: () => handlers.onImport(),
    },
  );

  for (const input of root.querySelectorAll<HTMLInputElement>('input[data-setting]')) {
    const key = input.dataset.setting as keyof Settings;
    input.addEventListener('input', () => {
      if (key === 'muted') {
        handlers.onChange({ muted: input.checked });
        return;
      }
      const value = Number(input.value) / 100;
      input.parentElement!.querySelector('output')!.textContent = `${input.value}%`;
      handlers.onChange({ [key]: value });
    });
  }
}
