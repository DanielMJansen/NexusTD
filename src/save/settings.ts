// Configurações do jogador, salvas separadas do progresso. Novas opções entram com valor padrão.
import { DEFAULT_BINDINGS, sanitizeBindings, type KeyBindings } from '../input/bindings';
import { detectLang, LANGS, TRANSLATION_COMPLETE, type Lang } from '../i18n/i18n';

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
  /**
   * Código de administrador digitado (vazio = sem Admin). Guarda-se o código, não um "sim": editar o save
   * à mão não libera o Admin, porque o app confere o hash dele ao abrir (`adminUnlocked` no App).
   */
  adminCode: string;
  /** Teclas configuradas (Controles). */
  keys: KeyBindings;
  /** Idioma do jogo (padrão: o do navegador). */
  language: Lang;
  /** Tamanho da interface da run (HUD, cartas, tutorial): normal ou grande (acessibilidade). */
  uiScale: UiScale;
}

export type UiScale = 'normal' | 'large';

export const SETTINGS_KEY = 'nexus-settings-v1';

/** Idioma de quem ainda não escolheu: o do navegador quando a tradução estiver completa (TRANSLATION_COMPLETE). */
const DEFAULT_LANGUAGE: Lang = TRANSLATION_COMPLETE ? detectLang() : 'pt';

const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  damageNumbers: true,
  gameSpeed: 1,
  tutorialDone: false,
  quality: 'auto',
  showFps: false,
  adminCode: '',
  keys: { ...DEFAULT_BINDINGS },
  language: 'pt',
  uiScale: 'normal',
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
    adminCode: typeof raw.adminCode === 'string' ? raw.adminCode.slice(0, 64) : '',
    keys: sanitizeBindings(raw.keys),
    // sem idioma salvo (jogador novo ou configurações antigas): português até a tradução dos dados terminar;
    // depois passa a seguir o navegador (detectLang)
    language: LANGS.includes(raw.language as Lang) ? (raw.language as Lang) : DEFAULT_LANGUAGE,
    uiScale: raw.uiScale === 'large' ? 'large' : 'normal',
  };
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return sanitizeSettings(raw ? JSON.parse(raw) : {});
  } catch {
    return sanitizeSettings({});
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Sem localStorage: as configurações valem só nesta sessão.
  }
}
