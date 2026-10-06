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
  /** Cores da skin (heróis); chaves ausentes usam a cor padrão do desenho. */
  palette?: SkinPalette;
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
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ellipse(ctx, x, y, r, r * 0.8);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#fff6';
  ctx.beginPath();
  circle(ctx, x - r * 0.3, y - r * 0.3, r * 0.35);
  ctx.fill();
}

export function blush(ctx: Ctx, x: number, y: number): void {
  ctx.fillStyle = '#ff7a9a55';
  ctx.beginPath();
  ellipse(ctx, x, y, 2.4, 1.4);
  ctx.fill();
}

/** Forma evoluída (nível máximo). */
export const ascended = (p: Required<SpritePose>) => p.level >= 3;
export const GOLD = '#f0c35a';

/** Cor da skin com fallback para a cor padrão do desenho. */
export const skin = (p: Required<SpritePose>, key: string, fallback: string): string => p.palette[key] ?? fallback;

export const walk = (p: Required<SpritePose>, speed = 12) => (p.moving ? Math.sin(p.time * speed) : 0);
