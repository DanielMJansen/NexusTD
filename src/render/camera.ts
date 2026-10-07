import { ARENA } from '../data/config';
import type { Point, RunState } from '../game/state';

/** Rigidez da mola que leva a câmera ao herói (maior = mais colada), amortecida sem oscilar. */
const STIFFNESS = 60;

/**
 * Câmera: qual pedaço do mundo aparece na tela (a vista tem o tamanho de ARENA).
 * Sempre centrada no herói, com uma mola curta só para suavizar o movimento.
 * Em mapas do tamanho da tela, fica parada em (0, 0).
 */
export class Camera {
  x = 0;
  y = 0;
  private vx = 0;
  private vy = 0;

  /** O mundo é maior que a vista? (só então há rolagem e minimapa) */
  scrolls(state: RunState): boolean {
    return state.map.width > ARENA.width || state.map.height > ARENA.height;
  }

  /** Centraliza no herói na hora (início da run, tecla C). */
  snap(state: RunState): void {
    this.x = state.hero.x - ARENA.width / 2;
    this.y = state.hero.y - ARENA.height / 2;
    this.vx = this.vy = 0;
    this.clamp(state);
  }

  update(state: RunState, dt: number): void {
    if (!this.scrolls(state)) {
      this.x = 0;
      this.y = 0;
      return;
    }
    const tx = state.hero.x - ARENA.width / 2;
    const ty = state.hero.y - ARENA.height / 2;
    // mola criticamente amortecida (sem tranco e sem passar do ponto); passo limitado contra quadros longos
    const step = Math.min(dt, 1 / 30);
    const damping = 2 * Math.sqrt(STIFFNESS);
    this.vx += ((tx - this.x) * STIFFNESS - this.vx * damping) * step;
    this.vy += ((ty - this.y) * STIFFNESS - this.vy * damping) * step;
    this.x += this.vx * step;
    this.y += this.vy * step;
    this.clamp(state);
  }

  /** Folga além das bordas do mundo (do tamanho do HUD): nada fica preso atrás da barra de baixo ou do topo. */
  private clamp(state: RunState): void {
    const pad = { side: 12, top: 26, bottom: 46 };
    const minX = -pad.side;
    const minY = -pad.top;
    const maxX = state.map.width - ARENA.width + pad.side;
    const maxY = state.map.height - ARENA.height + pad.bottom;
    if (this.x < minX || this.x > maxX) this.vx = 0;
    if (this.y < minY || this.y > maxY) this.vy = 0;
    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));
  }
}

/** Minimapa (canto da arena): mundo inteiro, Nexus, inimigos, criaturas, herói e a vista atual. */
export function drawMinimap(canvas: HTMLCanvasElement, state: RunState, camera: Camera): void {
  const ctx = canvas.getContext('2d')!;
  const dpr = devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const sx = w / state.map.width;
  const sy = h / state.map.height;
  ctx.fillStyle = '#0d0a18cc';
  ctx.fillRect(0, 0, w, h);
  const dot = (p: Point, color: string, r: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x * sx, p.y * sy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  for (const e of state.enemies) if (!e.dead) dot(e, e.def.isBoss ? '#ff4a5a' : '#ff8a6a', e.def.isBoss ? 3 : 1.6);
  for (const c of state.creatures) dot(c, '#7af0b0', 2);
  dot(state.nexus, '#c8a8ff', 4);
  for (const g of state.guards) if (g.hp > 0) dot(g, '#ffd25a', 3.4);
  dot(state.hero, '#ffd25a', 2.6);
  ctx.strokeStyle = '#ffffffcc';
  ctx.lineWidth = 1;
  ctx.strokeRect(camera.x * sx + 0.5, camera.y * sy + 0.5, ARENA.width * sx - 1, ARENA.height * sy - 1);
}
