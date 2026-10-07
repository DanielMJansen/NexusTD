import { ARENA } from '../data/config';
import type { Point, RunState } from '../game/state';

/** Rigidez da mola que leva a câmera ao herói (maior = mais colada), amortecida sem oscilar. */
const STIFFNESS = 60;
/** Zoom máximo (aproximar) e passo de cada clique da roda. */
const MAX_ZOOM = 1.25;
const ZOOM_STEP = 1.12;
/** Folga além das bordas do mundo (do tamanho do HUD): nada fica preso atrás da barra de baixo ou do topo. */
const PAD = { side: 12, top: 26, bottom: 46 };

/**
 * Câmera: qual pedaço do mundo aparece na tela. A vista tem o tamanho de ARENA dividido pelo zoom
 * (roda do mouse: de "mapa inteiro" até MAX_ZOOM). Sempre centrada no herói (no Nexus enquanto ele está morto), com uma mola curta;
 * se a vista for maior que o mapa, centraliza o mapa.
 */
export class Camera {
  x = 0;
  y = 0;
  /** Zoom atual (1 = normal; menor = mais longe) e o alvo, que o atual segue suave. */
  zoom = 1;
  private targetZoom = 1;
  private vx = 0;
  private vy = 0;

  /** Largura e altura do pedaço do mundo visível. */
  viewWidth(): number {
    return ARENA.width / this.zoom;
  }

  viewHeight(): number {
    return ARENA.height / this.zoom;
  }

  /** Zoom que mostra o mapa inteiro (com a folga do HUD). */
  minZoom(state: RunState): number {
    const w = state.map.width + PAD.side * 2;
    const h = state.map.height + PAD.top + PAD.bottom;
    return Math.min(1, ARENA.width / w, ARENA.height / h);
  }

  /** Roda do mouse: `steps` > 0 aproxima, < 0 afasta. */
  zoomBy(state: RunState, steps: number): void {
    this.targetZoom = Math.max(this.minZoom(state), Math.min(MAX_ZOOM, this.targetZoom * ZOOM_STEP ** steps));
  }

  /** O mundo é maior que a vista? (só então há rolagem e minimapa) */
  scrolls(state: RunState): boolean {
    return state.map.width > ARENA.width || state.map.height > ARENA.height;
  }

  /** Centraliza no herói na hora (início da run, tecla C); volta ao zoom normal no início da run. */
  snap(state: RunState, resetZoom = false): void {
    if (resetZoom) this.zoom = this.targetZoom = 1;
    this.x = state.hero.x - this.viewWidth() / 2;
    this.y = state.hero.y - this.viewHeight() / 2;
    this.vx = this.vy = 0;
    this.clamp(state);
  }

  update(state: RunState, dt: number): void {
    // zoom suave na direção do alvo (mantendo o centro da vista)
    this.targetZoom = Math.max(this.minZoom(state), Math.min(MAX_ZOOM, this.targetZoom));
    if (Math.abs(this.zoom - this.targetZoom) > 1e-4) {
      const cx = this.x + this.viewWidth() / 2;
      const cy = this.y + this.viewHeight() / 2;
      this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 12);
      this.x = cx - this.viewWidth() / 2;
      this.y = cy - this.viewHeight() / 2;
    }
    // herói morto: a câmera vai para o Nexus (onde ele renasce)
    const focus = state.hero.dead ? state.nexus : state.hero;
    const tx = focus.x - this.viewWidth() / 2;
    const ty = focus.y - this.viewHeight() / 2;
    // mola criticamente amortecida (sem tranco e sem passar do ponto); passo limitado contra quadros longos
    const step = Math.min(dt, 1 / 30);
    const damping = 2 * Math.sqrt(STIFFNESS);
    this.vx += ((tx - this.x) * STIFFNESS - this.vx * damping) * step;
    this.vy += ((ty - this.y) * STIFFNESS - this.vy * damping) * step;
    this.x += this.vx * step;
    this.y += this.vy * step;
    this.clamp(state);
  }

  /** Mantém a vista no mundo (com folga); se a vista for maior que o mapa naquele eixo, centraliza. */
  private clamp(state: RunState): void {
    const w = this.viewWidth();
    const h = this.viewHeight();
    const fit = (pos: number, size: number, world: number, before: number, after: number): [number, boolean] => {
      if (size >= world + before + after) return [(world - size) / 2 + (after - before) / 2, true];
      const min = -before;
      const max = world - size + after;
      return [Math.max(min, Math.min(max, pos)), pos < min || pos > max];
    };
    const [x, hitX] = fit(this.x, w, state.map.width, PAD.side, PAD.side);
    const [y, hitY] = fit(this.y, h, state.map.height, PAD.top, PAD.bottom);
    if (hitX) this.vx = 0;
    if (hitY) this.vy = 0;
    this.x = x;
    this.y = y;
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
  ctx.strokeRect(camera.x * sx + 0.5, camera.y * sy + 0.5, camera.viewWidth() * sx - 1, camera.viewHeight() * sy - 1);
}
