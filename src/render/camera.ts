import { ARENA } from '../data/config';
import type { Point, RunState } from '../game/state';

/** Velocidade da rolagem pela borda da tela (unidades do mundo por segundo). */
const EDGE_SPEED = 420;
/** Faixa da borda (fração da largura da vista) que rola a câmera. */
const EDGE_BAND = 0.035;

/**
 * Câmera: qual pedaço do mundo aparece na tela (a vista tem o tamanho de ARENA).
 * Segue o herói; o mouse na borda rola a vista livremente até o herói se mover pelo teclado (ou C).
 * Em mapas do tamanho da tela, fica parada em (0, 0).
 */
export class Camera {
  x = 0;
  y = 0;
  follow = true;

  /** O mundo é maior que a vista? (só então há rolagem e minimapa) */
  scrolls(state: RunState): boolean {
    return state.map.width > ARENA.width || state.map.height > ARENA.height;
  }

  /** Centraliza no herói na hora (início da run, tecla C). */
  snap(state: RunState): void {
    this.follow = true;
    this.x = state.hero.x - ARENA.width / 2;
    this.y = state.hero.y - ARENA.height / 2;
    this.clamp(state);
  }

  /** Move a vista para centralizar um ponto do mundo (clique no minimapa) e solta do herói. */
  lookAt(state: RunState, p: Point): void {
    this.follow = false;
    this.x = p.x - ARENA.width / 2;
    this.y = p.y - ARENA.height / 2;
    this.clamp(state);
  }

  /** viewPointer: mouse em coordenadas da vista (null fora da arena). */
  update(state: RunState, dt: number, viewPointer: Point | null, dragging: boolean): void {
    if (!this.scrolls(state)) {
      this.x = 0;
      this.y = 0;
      return;
    }
    if (viewPointer && !dragging) {
      const bx = ARENA.width * EDGE_BAND;
      const ex = viewPointer.x < bx ? -1 : viewPointer.x > ARENA.width - bx ? 1 : 0;
      const ey = viewPointer.y < bx ? -1 : viewPointer.y > ARENA.height - bx ? 1 : 0;
      if (ex || ey) {
        this.follow = false;
        this.x += ex * EDGE_SPEED * dt;
        this.y += ey * EDGE_SPEED * dt;
      }
    }
    if (this.follow) {
      const tx = state.hero.x - ARENA.width / 2;
      const ty = state.hero.y - ARENA.height / 2;
      const k = Math.min(1, dt * 6);
      this.x += (tx - this.x) * k;
      this.y += (ty - this.y) * k;
    }
    this.clamp(state);
  }

  private clamp(state: RunState): void {
    this.x = Math.max(0, Math.min(state.map.width - ARENA.width, this.x));
    this.y = Math.max(0, Math.min(state.map.height - ARENA.height, this.y));
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
  dot(state.hero, '#ffd25a', 2.6);
  ctx.strokeStyle = '#ffffffcc';
  ctx.lineWidth = 1;
  ctx.strokeRect(camera.x * sx + 0.5, camera.y * sy + 0.5, ARENA.width * sx - 1, ARENA.height * sy - 1);
}
