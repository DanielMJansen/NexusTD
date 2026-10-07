// Teclas configuráveis (Configurações → Controles). Esc e 1–9 são fixos; as setas sempre movem o herói.

export type KeyAction = 'up' | 'down' | 'left' | 'right' | 'pulse' | 'evolve' | 'sell' | 'speed' | 'pause' | 'camera' | 'nexus' | 'freeze';

export type KeyBindings = Record<KeyAction, string>;

/** Ações na ordem da tela de controles, com o texto de cada uma. */
export const KEY_ACTIONS: readonly { action: KeyAction; label: string }[] = [
  { action: 'up', label: 'Mover para cima' },
  { action: 'down', label: 'Mover para baixo' },
  { action: 'left', label: 'Mover para a esquerda' },
  { action: 'right', label: 'Mover para a direita' },
  { action: 'pulse', label: 'Pulso do herói (segure para soltar assim que recarregar)' },
  { action: 'evolve', label: 'Evoluir a criatura selecionada' },
  { action: 'sell', label: 'Vender a criatura selecionada' },
  { action: 'nexus', label: 'Painel do Nexus' },
  { action: 'speed', label: 'Velocidade do jogo' },
  { action: 'freeze', label: 'Congelar o tempo' },
  { action: 'camera', label: 'Centralizar a câmera' },
  { action: 'pause', label: 'Pausar' },
];

export const DEFAULT_BINDINGS: KeyBindings = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd',
  pulse: ' ',
  evolve: 'e',
  sell: 'v',
  speed: 'f',
  pause: 'p',
  camera: 'c',
  nexus: 'n',
  freeze: '0',
};

/** Teclas que não podem ser usadas (Esc e os atalhos das criaturas). */
export const isReservedKey = (key: string): boolean => key === 'escape' || /^[1-9]$/.test(key);

/** Normaliza as teclas salvas: tecla inválida, reservada ou repetida volta ao padrão. */
export function sanitizeBindings(data: unknown): KeyBindings {
  const raw = (data ?? {}) as Partial<Record<string, unknown>>;
  const result = { ...DEFAULT_BINDINGS };
  const used = new Set<string>();
  for (const { action } of KEY_ACTIONS) {
    const key = raw[action];
    if (typeof key === 'string' && key.length > 0 && key.length <= 20 && !isReservedKey(key) && !used.has(key)) result[action] = key;
    used.add(result[action]);
  }
  // se o padrão de alguma ação colidiu com uma tecla escolhida, volta tudo ao padrão
  return new Set(Object.values(result)).size === KEY_ACTIONS.length ? result : { ...DEFAULT_BINDINGS };
}

/** Atribui uma tecla a uma ação; se outra ação já a usava, as duas trocam. */
export function rebind(bindings: KeyBindings, action: KeyAction, key: string): KeyBindings {
  const next = { ...bindings };
  const other = KEY_ACTIONS.find((a) => next[a.action] === key)?.action;
  if (other && other !== action) next[other] = next[action];
  next[action] = key;
  return next;
}

/** Ação ligada a uma tecla (minúscula), se houver. */
export const actionForKey = (bindings: KeyBindings, key: string): KeyAction | undefined =>
  KEY_ACTIONS.find((a) => bindings[a.action] === key)?.action;

const NAMES: Record<string, string> = {
  ' ': 'Espaço',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  shift: 'Shift',
  control: 'Ctrl',
  alt: 'Alt',
  tab: 'Tab',
  enter: 'Enter',
  backspace: 'Backspace',
};

/** Nome da tecla para mostrar na tela. */
export const keyLabel = (key: string): string => NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key[0]!.toUpperCase() + key.slice(1));

/** Teclas em uso agora (para os textos de ajuda da interface). */
let active: KeyBindings = { ...DEFAULT_BINDINGS };
export const setActiveBindings = (bindings: KeyBindings): void => {
  active = bindings;
};
export const boundKeyLabel = (action: KeyAction): string => keyLabel(active[action]);
