import { STAGES, type IceTerrain } from '../data/stages';
import type { Point, RunState } from './state';

// Lago congelado: inimigos deslizam; o gelo cansa onde muitos passam, racha e vira buraco por um tempo.

const iceOf = (state: RunState): IceTerrain | null => {
  const t = STAGES[state.stage].terrain;
  return t?.kind === 'ice' ? t : null;
};

/** O ponto está sobre o gelo do lago (fora da ilha do Nexus)? */
export function onIce(state: RunState, p: Point): boolean {
  const ice = iceOf(state);
  if (!ice) return false;
  const { lake, island } = ice;
  if (((p.x - lake.x) / lake.rx) ** 2 + ((p.y - lake.y) / lake.ry) ** 2 > 1) return false;
  return Math.hypot(p.x - island.x, p.y - island.y) > island.r;
}

function grid(state: RunState, ice: IceTerrain): NonNullable<RunState['ice']> {
  if (!state.ice) {
    const cols = Math.ceil((ice.lake.rx * 2) / ice.cell);
    const rows = Math.ceil((ice.lake.ry * 2) / ice.cell);
    state.ice = { stress: new Array(cols * rows).fill(0), holes: new Array(cols * rows).fill(0), cols, rows, x0: ice.lake.x - ice.lake.rx, y0: ice.lake.y - ice.lake.ry };
  }
  return state.ice;
}

function cellAt(state: RunState, ice: IceTerrain, p: Point): number {
  const g = grid(state, ice);
  const c = Math.floor((p.x - g.x0) / ice.cell);
  const r = Math.floor((p.y - g.y0) / ice.cell);
  if (c < 0 || r < 0 || c >= g.cols || r >= g.rows) return -1;
  return r * g.cols + c;
}

/** Há buraco aberto neste ponto? */
export function inHole(state: RunState, p: Point): boolean {
  const ice = iceOf(state);
  if (!ice || !onIce(state, p)) return false;
  const i = cellAt(state, ice, p);
  return i >= 0 && state.ice!.holes[i]! > 0;
}

/** Abre buracos num raio (Wyrm emergindo). */
export function breakIce(state: RunState, at: Point, radius: number): void {
  const ice = iceOf(state);
  if (!ice) return;
  const g = grid(state, ice);
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      const center = { x: g.x0 + (c + 0.5) * ice.cell, y: g.y0 + (r + 0.5) * ice.cell };
      if (Math.hypot(center.x - at.x, center.y - at.y) <= radius && onIce(state, center)) {
        g.holes[r * g.cols + c] = ice.holeTime;
        g.stress[r * g.cols + c] = 0;
      }
    }
  }
}

/** Multiplicador de velocidade do inimigo no gelo. */
export function iceSpeed(state: RunState, p: Point): number {
  const ice = iceOf(state);
  return ice && onIce(state, p) ? ice.slide : 1;
}

/** Cansaço do gelo, rachaduras, buracos que congelam de novo e inimigos que caem. */
export function updateIce(state: RunState, dt: number, fall: (index: number) => void): void {
  const ice = iceOf(state);
  if (!ice) return;
  const g = grid(state, ice);
  for (let i = 0; i < g.holes.length; i++) if (g.holes[i]! > 0) g.holes[i] = Math.max(0, g.holes[i]! - dt);
  state.enemies.forEach((e, index) => {
    if (e.dead || e.allyTimer > 0 || e.def.flying || e.submerged || !onIce(state, e)) return;
    const i = cellAt(state, ice, e);
    if (i < 0) return;
    if (g.holes[i]! > 0) {
      if (!e.def.isBoss) fall(index);
      return;
    }
    g.stress[i]! += dt * (e.def.radius / 8);
    if (g.stress[i]! >= ice.crackAt) {
      g.stress[i] = 0;
      g.holes[i] = ice.holeTime;
      state.events.push({ type: 'iceCracked', x: g.x0 + ((i % g.cols) + 0.5) * ice.cell, y: g.y0 + (Math.floor(i / g.cols) + 0.5) * ice.cell });
    }
  });
}
