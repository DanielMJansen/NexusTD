import { ARENA } from '../data/config';

/**
 * Ajusta a resolução do canvas da arena ao tamanho dele na tela (nítido em telas de alta
 * densidade) e aplica a escala para desenhar em unidades da arena.
 */
export function fitArenaCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, renderScale = 1): void {
  fitPixels(canvas, renderScale);
  ctx.setTransform(canvas.width / ARENA.width, 0, 0, canvas.height / ARENA.height, 0, 0);
}

/** Canvas pequeno (retratos de criatura): ajusta a resolução e desenha em pixels CSS. */
export function fitSmallCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  const dpr = fitPixels(canvas);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** Redimensiona o buffer do canvas para tamanho CSS × devicePixelRatio. Devolve o devicePixelRatio. */
function fitPixels(canvas: HTMLCanvasElement, renderScale = 1): number {
  const dpr = (window.devicePixelRatio || 1) * renderScale;
  const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return dpr;
}
