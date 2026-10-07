import type { VariantTier } from '../data/altar';
import { CREATURES, type CreatureId } from '../data/creatures';
import { drawVariantAura, drawVariantParticles, variantLayerLook } from './variantLook';
import { drawNexusModel, type NexusAppearance } from './arena';
import type { SkinPalette } from '../data/skins';
import { drawLayered } from './spriteKit';
import { drawSprite, type SpriteId } from './sprites';
import { fitSmallCanvas } from './viewport';

export interface PortraitOptions {
  silhouette?: boolean;
  level?: number;
  /** Vertente da forma evoluída (0 ou 1). */
  branch?: number;
  palette?: SkinPalette;
  /** Variante do Altar (recolorido, aura e partículas do tema). */
  variant?: VariantTier;
  /** Filtro de cor avulso (ilustrações). */
  filter?: string;
}

/** Prévia animada do Nexus (tela do Nexus, Altar). */
export function drawNexusPreview(canvas: HTMLCanvasElement, time: number, look: NexusAppearance, locked = false): void {
  const size = canvas.clientWidth;
  if (!size) return;
  const ctx = canvas.getContext('2d')!;
  fitSmallCanvas(canvas, ctx);
  ctx.clearRect(0, 0, size, canvas.clientHeight);
  const scale = size / 130;
  ctx.save();
  ctx.scale(scale, scale);
  if (locked) {
    ctx.filter = 'grayscale(1) brightness(0.45)';
  }
  drawNexusModel(ctx, 65, (canvas.clientHeight / scale) * 0.6, time, look);
  ctx.restore();
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
  const x = size / 2 - scale;
  const y = canvas.clientHeight / 2 + 6 * scale;
  // variante: filtro aplicado uma vez ao sprite inteiro (camada), não a cada traço
  const variant = options.silhouette ? undefined : options.variant;
  const creature = variant && id in CREATURES ? (id as CreatureId) : undefined;
  if (creature) drawVariantAura(ctx, creature, variant!, x, y - 8 * scale, scale, time);
  const look = creature ? variantLayerLook(creature, variant!, time) : { filter: options.silhouette ? undefined : options.filter };
  drawLayered(ctx, x, y - 6 * scale, 30 * scale, look, (c) =>
    drawSprite(c, id, x, y, scale, {
      time,
      level: options.level ?? 1,
      branch: options.branch ?? 0,
      palette: options.palette ?? {},
    }),
  );
  if (creature) drawVariantParticles(ctx, creature, variant!, x, y - 8 * scale, scale, time);
  ctx.restore();
}
