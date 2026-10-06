import { ARENA } from '../data/config';
import type { Point, RunState } from '../game/state';

/** Velocidade máxima da rolagem pela borda (unidades do mundo por segundo). */
const EDGE_SPEED = 460;
/** Faixa da borda (fração da vista) que rola a câmera; mais fundo na faixa = mais rápido. */
const EDGE_BAND = 0.06;
/** Zona morta ao seguir o herói (fração da vista): dentro dela a câmera não se mexe. */
const DEAD_ZONE = { x: 0.12, y: 0.1 };
/** Rigidez da mola que leva a câmera ao alvo (maior = mais rápida), amortecida sem oscilar. */
const STIFFNESS = 22;

/**
 * Câmera: qual pedaço do mundo aparece na tela (a vista tem o tamanho de ARENA).
 * Segue o herói com uma mola amortecida e zona morta; o mouse na borda da arena rola a vista
 * (acelerando e freando suave) até o herói voltar a ser seguido (teclado, clique no chão ou C).
 * Em mapas do tamanho da tela, fica parada em (0, 0).
 */
export class Camera {
  x = 0;
  y = 0;
  follow = true;
  private vx = 0;
  private vy = 0;
  private edgeX = 0;
  private edgeY = 0;

  /** O mundo é maior que a vista? (só então há rolagem e minimapa) */
  scrolls(state: RunState): boolean {
    return state.map.width > ARENA.width || state.map.height > ARENA.height;
  }

  /** Centraliza no herói na hora (início da run, tecla C). */
  snap(state: RunState): void {
    this.follow = true;
    this.x = state.hero.x - ARENA.width / 2;
    this.y = state.hero.y - ARENA.height / 2;
    this.vx = this.vy = this.edgeX = this.edgeY = 0;
    this.clamp(state);
  }

  /** Move a vista para centralizar um ponto do mundo (clique no minimapa) e solta do herói. */
  lookAt(state: RunState, p: Point): void {
    this.follow = false;
    this.x = p.x - ARENA.width / 2;
    this.y = p.y - ARENA.height / 2;
    this.vx = this.vy = this.edgeX = this.edgeY = 0;
    this.clamp(state);
  }

  /** viewPointer: mouse em coordenadas da vista, só quando está sobre a arena (null fora dela ou sobre o HUD). */
  update(state: RunState, dt: number, viewPointer: Point | null, dragging: boolean): void {
    if (!this.scrolls(state)) {
      this.x = 0;
      this.y = 0;
      return;
    }
    // rolagem pela borda: velocidade cresce com a profundidade na faixa e muda suave
    let wantX = 0;
    let wantY = 0;
    if (viewPointer && !dragging) {
      const bx = ARENA.width * EDGE_BAND;
      const by = ARENA.height * EDGE_BAND;
      const depth = (d: number, band: number) => Math.max(0, Math.min(1, 1 - d / band)) ** 1.5;
      wantX = depth(viewPointer.x, bx) * -1 + depth(ARENA.width - viewPointer.x, bx);
      wantY = depth(viewPointer.y, by) * -1 + depth(ARENA.height - viewPointer.y, by);
    }
    const ease = Math.min(1, dt * 8);
    this.edgeX += (wantX * EDGE_SPEED - this.edgeX) * ease;
    this.edgeY += (wantY * EDGE_SPEED - this.edgeY) * ease;
    if (Math.abs(wantX) + Math.abs(wantY) > 0.05) this.follow = false;
    if (Math.abs(this.edgeX) + Math.abs(this.edgeY) > 1) {
      this.x += this.edgeX * dt;
      this.y += this.edgeY * dt;
      this.vx = this.vy = 0;
    }

    if (this.follow) {
      // alvo: só se move quando o herói sai da zona morta no centro da vista
      const cx = this.x + ARENA.width / 2;
      const cy = this.y + ARENA.height / 2;
      const dzx = ARENA.width * DEAD_ZONE.x;
      const dzy = ARENA.height * DEAD_ZONE.y;
      const offX = state.hero.x - cx;
      const offY = state.hero.y - cy;
      const tx = this.x + (Math.abs(offX) > dzx ? offX - Math.sign(offX) * dzx : 0);
      const ty = this.y + (Math.abs(offY) > dzy ? offY - Math.sign(offY) * dzy : 0);
      // mola criticamente amortecida (sem tranco e sem passar do ponto)
      const damping = 2 * Math.sqrt(STIFFNESS);
      this.vx += ((tx - this.x) * STIFFNESS - this.vx * damping) * dt;
      this.vy += ((ty - this.y) * STIFFNESS - this.vy * damping) * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
    this.clamp(state);
  }

  private clamp(state: RunState): void {
    const maxX = state.map.width - ARENA.width;
    const maxY = state.map.height - ARENA.height;
    if (this.x < 0 || this.x > maxX) this.vx = 0;
    if (this.y < 0 || this.y > maxY) this.vy = 0;
    this.x = Math.max(0, Math.min(maxX, this.x));
    this.y = Math.max(0, Math.min(maxY, this.y));
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
