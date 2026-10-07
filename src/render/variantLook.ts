// Visual das variantes do Altar: recolorido do tema, aura e partículas (jogo e retratos).
import type { VariantTier } from '../data/altar';
import type { CreatureId } from '../data/creatures';
import { variantTheme, type VariantTheme } from '../data/variantThemes';
import { halo, TAU, type Ctx, type LayerLook } from './spriteKit';

/** Camada do sprite com o recolorido do tema (a Lendária ganha a faixa de brilho). */
export function variantLayerLook(id: CreatureId, tier: VariantTier, time: number): LayerLook {
  const theme = variantTheme(id, tier);
  return { recolor: { colors: theme.colors, strength: theme.strength, light: theme.light, dark: theme.dark, shimmer: tier === 'legendary' ? time : undefined } };
}

/** Aura atrás do sprite (Épica e Lendária). */
export function drawVariantAura(ctx: Ctx, id: CreatureId, tier: VariantTier, x: number, y: number, scale: number, time: number): void {
  if (tier === 'rare') return;
  const theme = variantTheme(id, tier);
  const pulse = Math.sin(time * 3 + x) * 2;
  halo(ctx, x, y, (tier === 'legendary' ? 28 + pulse : 22 + pulse) * scale, theme.accent, tier === 'legendary' ? 0.6 : 0.45);
  if (tier === 'legendary') {
    // anel no chão girando
    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.lineDashOffset = -time * 12;
    ctx.beginPath();
    ctx.ellipse(x, y + 20 * scale, 17 * scale, 5.5 * scale, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

/** Partículas do tema em volta da criatura (Épica: poucas; Lendária: mais e maiores). */
export function drawVariantParticles(ctx: Ctx, id: CreatureId, tier: VariantTier, x: number, y: number, scale: number, time: number): void {
  if (tier === 'rare') return;
  const theme = variantTheme(id, tier);
  if (!theme.particles) return;
  const count = tier === 'legendary' ? 6 : 4;
  ctx.save();
  for (let k = 0; k < count; k++) particle(ctx, theme, k, count, x, y, scale, time + x * 0.01);
  ctx.restore();
}

/** Uma partícula: posição e forma vêm só do tempo (sem estado). */
function particle(ctx: Ctx, theme: VariantTheme, k: number, count: number, x: number, y: number, s: number, time: number): void {
  const seed = k * 2.39;
  const life = (time * 0.6 + k / count) % 1;
  const fade = Math.sin(life * Math.PI);
  const colors = theme.colors;
  const color = colors[k % colors.length]!;
  ctx.globalAlpha = 0.85 * fade;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  switch (theme.particles) {
    case 'ember': {
      // brasas subindo e balançando
      const px = x + Math.sin(seed * 3) * 12 * s + Math.sin(time * 4 + seed) * 2 * s;
      const py = y + (8 - life * 30) * s;
      ctx.fillStyle = k % 2 ? '#ffd84a' : theme.accent;
      ctx.beginPath();
      ctx.arc(px, py, (1.6 - life) * 1.3 * s, 0, TAU);
      ctx.fill();
      break;
    }
    case 'frost': {
      // flocos caindo devagar
      const px = x + Math.sin(seed * 5) * 14 * s + Math.sin(time * 2 + seed) * 3 * s;
      const py = y + (-22 + life * 34) * s;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      for (let a = 0; a < 3; a++) {
        const ang = (a * Math.PI) / 3 + time;
        ctx.moveTo(px - Math.cos(ang) * 2.2 * s, py - Math.sin(ang) * 2.2 * s);
        ctx.lineTo(px + Math.cos(ang) * 2.2 * s, py + Math.sin(ang) * 2.2 * s);
      }
      ctx.stroke();
      break;
    }
    case 'shadow': {
      // fumaça escura subindo
      const px = x + Math.sin(seed * 4) * 11 * s;
      const py = y + (10 - life * 26) * s;
      ctx.globalAlpha = 0.45 * fade;
      ctx.fillStyle = colors[colors.length - 1]!;
      ctx.beginPath();
      ctx.arc(px, py, (2.5 + life * 3) * s, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.6 * fade;
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(px, py, 0.9 * s, 0, TAU);
      ctx.fill();
      break;
    }
    case 'wisp': {
      // fogos-fátuos orbitando
      const a = time * 1.4 + (k * TAU) / count;
      const px = x + Math.cos(a) * 16 * s;
      const py = y - 4 * s + Math.sin(a) * 6 * s + Math.sin(time * 3 + k) * 3 * s;
      ctx.globalAlpha = 0.85;
      halo(ctx, px, py, 4.5 * s, theme.accent, 0.8);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 1 * s, 0, TAU);
      ctx.fill();
      break;
    }
    case 'spark': {
      // faíscas elétricas em zigue-zague
      if (fade < 0.4) break;
      const a = seed * 5 + Math.floor(time * 6 + k) * 1.7;
      const px = x + Math.cos(a) * 13 * s;
      const py = y - 4 * s + Math.sin(a) * 10 * s;
      ctx.strokeStyle = k % 2 ? '#ffffff' : theme.accent;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 2.5 * s, py + 2 * s);
      ctx.lineTo(px + 0.5 * s, py + 3 * s);
      ctx.lineTo(px + 3.5 * s, py + 5.5 * s);
      ctx.stroke();
      break;
    }
    case 'star': {
      // estrelinhas cintilando em órbita
      const a = time * 0.9 + (k * TAU) / count;
      const px = x + Math.cos(a) * 19 * s;
      const py = y - 4 * s + Math.sin(a) * 8 * s;
      const r = (0.8 + fade * 0.9) * s;
      ctx.globalAlpha = 0.5 + 0.5 * fade;
      ctx.fillStyle = k % 2 ? '#ffffff' : theme.accent;
      ctx.beginPath();
      ctx.moveTo(px, py - r * 1.6);
      ctx.lineTo(px + r * 0.4, py);
      ctx.lineTo(px, py + r * 1.6);
      ctx.lineTo(px - r * 0.4, py);
      ctx.closePath();
      ctx.moveTo(px - r * 1.6, py);
      ctx.lineTo(px, py + r * 0.4);
      ctx.lineTo(px + r * 1.6, py);
      ctx.lineTo(px, py - r * 0.4);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'ribbon': {
      // fitas de aurora ondulando em volta
      if (k > 2) break;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1.2 * s;
      ctx.strokeStyle = colors[k]!;
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = time * 1.2 + k * 2.1 + i * 0.32;
        const px = x + Math.cos(a) * 21 * s;
        const py = y - 2 * s + Math.sin(a) * 8 * s + Math.sin(time * 2 + i * 0.6 + k) * 2.5 * s;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Cor de partícula no tema: mantém a claridade da cor original e escolhe a cor do degradê do tema
 * (as cores do tema vão da mais clara para a mais escura).
 */
export function themeTone(color: string, colors: readonly string[]): string {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{3,8}$/i.test(hex) || colors.length === 0) return color;
  const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const alpha = full.length === 8 ? full.slice(6, 8) : '';
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const pick = colors[Math.min(colors.length - 1, Math.round((1 - lum) * (colors.length - 1)))]!;
  return pick + alpha;
}
