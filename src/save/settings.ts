// Configurações do jogador, salvas separadas do progresso. Novas opções entram com valor padrão.

export type GameSpeed = 1 | 2 | 4;

/** Qualidade gráfica: resolução interna da arena (automática ajusta sozinha pelo desempenho). */
export type Quality = 'auto' | 'high' | 'medium' | 'low';

export interface Settings {
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
  muted: boolean;
  /** Números de dano flutuando sobre os inimigos. */
  damageNumbers: boolean;
  gameSpeed: GameSpeed;
  /** Tutorial guiado já concluído ou pulado. */
  tutorialDone: boolean;
  quality: Quality;
  /** Medidor de quadros por segundo no canto da tela. */
  showFps: boolean;
}

export const SETTINGS_KEY = 'nexus-settings-v1';

const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  damageNumbers: true,
  gameSpeed: 1,
  tutorialDone: false,
  quality: 'auto',
  showFps: false,
};

const clamp01 = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;

/** Normaliza qualquer objeto vindo do armazenamento ou de um arquivo importado. */
export function sanitizeSettings(data: unknown): Settings {
  const raw = (data ?? {}) as Partial<Settings>;
  return {
    musicVolume: clamp01(raw.musicVolume, DEFAULT_SETTINGS.musicVolume),
    sfxVolume: clamp01(raw.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    muted: raw.muted === true,
    damageNumbers: raw.damageNumbers !== false,
    gameSpeed: raw.gameSpeed === 2 || raw.gameSpeed === 4 ? raw.gameSpeed : 1,
    tutorialDone: raw.tutorialDone === true,
    quality: raw.quality === 'high' || raw.quality === 'medium' || raw.quality === 'low' ? raw.quality : 'auto',
    showFps: raw.showFps === true,
  };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? sanitizeSettings(JSON.parse(raw)) : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Sem localStorage: as configurações valem só nesta sessão.
  }
}
