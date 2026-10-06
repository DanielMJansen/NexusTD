// Run em andamento salva no navegador: automaticamente a cada onda vencida, ao fechar a aba
// e no "Salvar e sair" da pausa. As referências a dados (criaturas, inimigos, herói, melhorias)
// viram ids no arquivo e são reconstruídas ao carregar.
import { CREATURES, type CreatureId } from '../data/creatures';
import { ENEMIES, type EnemyId } from '../data/enemies';
import { HEROES, type HeroId } from '../data/heroes';
import { RUN_UPGRADES } from '../data/upgrades';
import type { RunState } from '../game/state';

export const RUN_KEY = 'nexus-run-v1';
const RUN_VERSION = 1;

interface SavedRun {
  version: number;
  savedAt: string;
  state: Record<string, unknown>;
}

/** Resumo para o botão "Continuar run" do menu. */
export interface SavedRunSummary {
  wave: number;
  hero: HeroId;
  savedAt: string;
}

/** Números infinitos viram null no JSON; voltam a -Infinity ao carregar. */
const restoreTime = (value: unknown): number => (typeof value === 'number' ? value : -Infinity);

function serialize(state: RunState): Record<string, unknown> {
  return {
    ...state,
    events: [],
    result: null,
    hero: { ...state.hero, def: state.hero.def.id },
    enemies: state.enemies.filter((e) => !e.dead).map((e) => ({ ...e, def: e.def.id })),
    creatures: state.creatures.map((c) => ({ ...c, def: c.def.id })),
    unlocked: [...state.unlocked],
    choices: state.choices.map((c) => ({ kind: c.kind, upgrade: c.upgrade.id })),
  };
}

/** Reconstrói o estado; lança erro se algo referenciar dados que não existem mais. */
function deserialize(raw: Record<string, unknown>): RunState {
  const need = <T>(value: T | undefined, what: string): T => {
    if (value === undefined) throw new Error(`Run salva inválida (${what}).`);
    return value;
  };
  const hero = raw.hero as Record<string, unknown>;
  const state = {
    ...raw,
    events: [],
    result: null,
    hero: {
      ...hero,
      def: need(HEROES[hero.def as HeroId], 'herói'),
      lastAttackAt: restoreTime(hero.lastAttackAt),
    },
    enemies: (raw.enemies as Record<string, unknown>[]).map((e) => ({
      ...e,
      def: need(ENEMIES[e.def as EnemyId], 'inimigo'),
      lastHitAt: restoreTime(e.lastHitAt),
    })),
    creatures: (raw.creatures as Record<string, unknown>[]).map((c) => ({
      ...c,
      def: need(CREATURES[c.def as CreatureId], 'criatura'),
      lastAttackAt: restoreTime(c.lastAttackAt),
    })),
    unlocked: new Set(raw.unlocked as CreatureId[]),
    choices: (raw.choices as { kind: 'upgrade'; upgrade: string }[]).map((c) => ({
      kind: c.kind,
      upgrade: need(
        RUN_UPGRADES.find((u) => u.id === c.upgrade),
        'melhoria',
      ),
    })),
  };
  return state as unknown as RunState;
}

export function saveRun(state: RunState): void {
  if (state.phase === 'ended') return;
  try {
    const file: SavedRun = { version: RUN_VERSION, savedAt: new Date().toISOString(), state: serialize(state) };
    localStorage.setItem(RUN_KEY, JSON.stringify(file));
  } catch {
    // Sem localStorage: a run só não fica salva.
  }
}

function readFile(): SavedRun | null {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const file = JSON.parse(raw) as SavedRun;
    return file.version === RUN_VERSION && file.state ? file : null;
  } catch {
    return null;
  }
}

export function savedRunSummary(): SavedRunSummary | null {
  const file = readFile();
  if (!file) return null;
  const hero = (file.state.hero as { def?: HeroId } | undefined)?.def;
  if (!hero || !HEROES[hero]) return null;
  return { wave: Number(file.state.wave) || 1, hero, savedAt: file.savedAt };
}

/** Carrega a run salva (null se não houver ou estiver corrompida). */
export function loadRun(): RunState | null {
  const file = readFile();
  if (!file) return null;
  try {
    return deserialize(file.state);
  } catch {
    return null;
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(RUN_KEY);
  } catch {
    // nada a limpar
  }
}

/** Para o backup: o conteúdo cru salvo (ou null). */
export function rawSavedRun(): unknown {
  return readFile();
}

/** Para o backup: grava (ou apaga) o conteúdo cru. */
export function writeRawSavedRun(value: unknown): void {
  try {
    if (value && typeof value === 'object') localStorage.setItem(RUN_KEY, JSON.stringify(value));
    else localStorage.removeItem(RUN_KEY);
  } catch {
    // ignora
  }
}
