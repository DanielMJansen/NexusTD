// Ferramentas de desenho compartilhadas pelos sprites vetoriais (contorno, gradientes, olhos).
import type { SkinPalette } from '../data/skins';

/** Como o personagem está agora; tudo opcional exceto o tempo de animação. */
export interface SpritePose {
  /** Tempo contínuo (s) para animações de idle. */
  time: number;
  /** 1 olha para a direita, -1 para a esquerda. */
  facing?: 1 | -1;
  /** Força do golpe: 1 no instante do ataque, caindo até 0. */
  attack?: number;
  moving?: boolean;
  /** Nível de evolução; no nível máximo aparecem os acessórios da forma evoluída. */
  level?: number;
  /** Vertente da forma evoluída (0 ou 1). */
  branch?: number;
  /** Cores da skin (heróis); chaves ausentes usam a cor padrão do desenho. */
  palette?: SkinPalette;
  /** Forma Suprema (despertada em ★5): cada sprite desenha a sua versão única. */
  supreme?: boolean;
}

export const TAU = Math.PI * 2;
export const OUTLINE = '#170c24';

export type Ctx = CanvasRenderingContext2D;

/** Pose com todos os campos preenchidos (o que as funções de desenho recebem). */
export type Pose = Required<SpritePose>;

// ---------- utilitários de desenho ----------

export function shape(ctx: Ctx, fill: string | CanvasGradient, build: () => void, outline = 1.4): void {
  ctx.beginPath();
  build();
  ctx.fillStyle = fill;
  ctx.fill();
  if (outline > 0) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = outline;
    ctx.stroke();
  }
}

export function line(ctx: Ctx, color: string, width: number, build: () => void, outline = true): void {
  if (outline) {
    ctx.beginPath();
    build();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = width + 2.4;
    ctx.stroke();
  }
  ctx.beginPath();
  build();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function vertical(ctx: Ctx, top: number, bottom: number, from: string, to: string): CanvasGradient {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

export function radial(ctx: Ctx, x: number, y: number, r: number, inner: string, outer: string): CanvasGradient {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  return g;
}

export const circle = (ctx: Ctx, x: number, y: number, r: number) => ctx.arc(x, y, r, 0, TAU);
export const ellipse = (ctx: Ctx, x: number, y: number, rx: number, ry: number, rot = 0) =>
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);

export function poly(ctx: Ctx, points: number[]): void {
  ctx.moveTo(points[0]!, points[1]!);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i]!, points[i + 1]!);
  ctx.closePath();
}

/** Olho expressivo: branco, íris, pupila e brilho. */
export function eye(ctx: Ctx, x: number, y: number, r: number, iris: string, look = 0.35): void {
  shape(ctx, '#fbf7ff', () => circle(ctx, x, y, r), 1);
  ctx.fillStyle = iris;
  ctx.beginPath();
  circle(ctx, x + r * look, y + r * 0.08, r * 0.62);
  ctx.fill();
  ctx.fillStyle = '#12081c';
  ctx.beginPath();
  circle(ctx, x + r * look * 1.2, y + r * 0.1, r * 0.32);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  circle(ctx, x + r * 0.05, y - r * 0.35, r * 0.24);
  ctx.fill();
}

/** Olho brilhante (criaturas sinistras). */
export function glowingEye(ctx: Ctx, x: number, y: number, r: number, color: string): void {
  halo(ctx, x, y, r * 2.6, color, 0.6);
  ctx.fillStyle = color;
  ctx.beginPath();
  ellipse(ctx, x, y, r, r * 0.8);
  ctx.fill();
  ctx.fillStyle = '#fff6';
  ctx.beginPath();
  circle(ctx, x - r * 0.3, y - r * 0.3, r * 0.35);
  ctx.fill();
}

const haloCache = new Map<string, HTMLCanvasElement>();

/**
 * Brilho suave pré-desenhado (gradiente em cache por cor). Bem mais barato que shadowBlur,
 * que o navegador recalcula a cada traço; usar em detalhes que se repetem muito (olhos, gemas).
 */
export function halo(ctx: Ctx, x: number, y: number, r: number, color: string, alpha = 1): void {
  let image = haloCache.get(color);
  if (!image) {
    image = document.createElement('canvas');
    image.width = image.height = 64;
    const g = image.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, 64, 64);
    haloCache.set(color, image);
  }
  const previous = ctx.globalAlpha;
  ctx.globalAlpha = previous * alpha;
  ctx.drawImage(image, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = previous;
}

/** Brilho, filtro e tinta aplicados de uma vez ao sprite inteiro. */
export interface LayerLook {
  filter?: string;
  /** Cor pintada por cima só onde há sprite (barato; substitui filtros de cor). Ex.: clarão branco, aliado verde. */
  tint?: string;
  shadowColor?: string;
  shadowBlur?: number;
}

/** Várias camadas em rodízio: reusar a mesma logo depois de colá-la força a GPU a sincronizar. */
const layers: HTMLCanvasElement[] = [];
let nextLayer = 0;
const LAYER_POOL = 12;

/**
 * Desenha um sprite numa camada e cola com brilho/filtro numa só operação. Com shadowBlur ou
 * filter direto no contexto, o navegador refaz o efeito em cada traço do sprite (dezenas por
 * personagem), o que derruba o quadro com muitos inimigos. Sem efeito, desenha direto.
 * (cx, cy, half): quadrado que contém o sprite, nas coordenadas atuais do contexto.
 */
export function drawLayered(ctx: Ctx, cx: number, cy: number, half: number, look: LayerLook, draw: (c: Ctx) => void): void {
  if (!look.filter && !look.shadowBlur && !look.tint) {
    draw(ctx);
    return;
  }
  const m = ctx.getTransform();
  const s = Math.max(0.5, Math.hypot(m.a, m.b));
  const size = Math.ceil(half * 2 * s);
  nextLayer = (nextLayer + 1) % LAYER_POOL;
  const layer = (layers[nextLayer] ??= document.createElement('canvas'));
  if (layer.width < size || layer.height < size) layer.width = layer.height = Math.max(size, layer.width);
  const lc = layer.getContext('2d')!;
  lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.clearRect(0, 0, size, size);
  lc.setTransform(s, 0, 0, s, -(cx - half) * s, -(cy - half) * s);
  lc.globalAlpha = 1;
  draw(lc);
  if (look.tint) {
    // tinta só onde o sprite tem pixels
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.globalCompositeOperation = 'source-atop';
    lc.fillStyle = look.tint;
    lc.fillRect(0, 0, size, size);
    lc.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  if (look.filter) ctx.filter = look.filter;
  if (look.shadowBlur) {
    ctx.shadowColor = look.shadowColor ?? '#ffffff';
    ctx.shadowBlur = look.shadowBlur;
  }
  ctx.drawImage(layer, 0, 0, size, size, cx - half, cy - half, half * 2, half * 2);
  ctx.restore();
}

export function blush(ctx: Ctx, x: number, y: number): void {
  ctx.fillStyle = '#ff7a9a55';
  ctx.beginPath();
  ellipse(ctx, x, y, 2.4, 1.4);
  ctx.fill();
}

/** Forma evoluída (nível máximo). */
export const ascended = (p: Required<SpritePose>) => p.level >= 3;
/** Forma evoluída na vertente B (visual próprio). */
export const formB = (p: Required<SpritePose>) => p.level >= 3 && p.branch === 1;
/** Forma evoluída na vertente A. */
export const formA = (p: Required<SpritePose>) => p.level >= 3 && p.branch !== 1;
export const GOLD = '#f0c35a';

/** Cor da skin com fallback para a cor padrão do desenho. */
export const skin = (p: Required<SpritePose>, key: string, fallback: string): string => p.palette[key] ?? fallback;

export const walk = (p: Required<SpritePose>, speed = 12) => (p.moving ? Math.sin(p.time * speed) : 0);
