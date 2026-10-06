import type { SkinPalette } from '../data/skins';
import { drawSprite, type SpriteId } from './sprites';
import { fitSmallCanvas } from './viewport';

export interface PortraitOptions {
  silhouette?: boolean;
  level?: number;
  palette?: SkinPalette;
}

/** Retrato animado de um personagem num canvas pequeno (cartas, menus). */
export function drawPortrait(canvas: HTMLCanvasElement, id: SpriteId, time: number, options: PortraitOptions = {}): void {
  const size = canvas.clientWidth;
  if (!size) return;
  const ctx = canvas.getContext('2d')!;
  fitSmallCanvas(canvas, ctx);
  ctx.clearRect(0, 0, size, canvas.clientHeight);
  const scale = size / 48;
  ctx.save();
  if (options.silhouette) {
    ctx.filter = 'brightness(0)';
    ctx.globalAlpha = 0.75;
  }
  drawSprite(ctx, id, size / 2 - scale, canvas.clientHeight / 2 + 6 * scale, scale, {
    time,
    level: options.level ?? 1,
    palette: options.palette ?? {},
  });
  ctx.restore();
}
