import { CREATURES, type CreatureId } from '../data/creatures';
import { sellValue } from '../game/economy';
import type { Creature, Point, RunState } from '../game/state';
import { drawBackground, drawNexus } from './arena';
import type { Effects } from './effects';
import { drawShadow, drawSprite } from './sprites';

const TAU = Math.PI * 2;

/** Estado da interação do jogador que aparece na arena. */
export interface InteractionView {
  /** Criatura tocada: mostra alcance e botão de venda. */
  inspected: Creature | null;
  /** Carta sendo arrastada: mostra prévia e alcance. */
  placement: { creature: CreatureId; at: Point } | null;
}

/** Posição do botão "Vender" acima da criatura (também usada para detectar o toque). */
export const SELL_BUTTON = { offsetY: -35, width: 64, height: 22 };

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: RunState,
  effects: Effects,
  interaction: InteractionView,
  time: number,
): void {
  drawBackground(ctx, time);
  drawNexus(ctx, state.nexus.hp, state.nexus.maxHp, time);

  for (const enemy of state.enemies) {
    const scale = enemy.def.scale;
    drawShadow(ctx, enemy.x, enemy.y, 10 * scale);
    if (enemy.slowTimer > 0) glow(ctx, '#6cf', 14);
    drawSprite(ctx, enemy.def.id, enemy.x, enemy.y, scale, time + enemy.animationOffset);
    ctx.shadowBlur = 0;
    if (enemy.hp < enemy.maxHp) {
      const width = 18 * scale;
      const top = enemy.y - enemy.def.radius - 12;
      ctx.fillStyle = '#000a';
      ctx.fillRect(enemy.x - width / 2, top, width, 3);
      ctx.fillStyle = '#e44';
      ctx.fillRect(enemy.x - width / 2, top, width * Math.max(0, enemy.hp / enemy.maxHp), 3);
    }
  }

  for (const creature of state.creatures) {
    drawShadow(ctx, creature.x, creature.y, 13);
    if (creature.frenzyTimer > 0) glow(ctx, '#f33', 22);
    const bob = Math.sin(time * 3 + creature.x) * 1.5;
    drawSprite(ctx, creature.def.id, creature.x, creature.y + bob, 1.1, time);
    ctx.shadowBlur = 0;
  }

  if (interaction.inspected) drawSellPrompt(ctx, state, interaction.inspected);

  const { hero } = state;
  if (Math.hypot(hero.target.x - hero.x, hero.target.y - hero.y) > 6) {
    ctx.strokeStyle = '#8cf8';
    ctx.beginPath();
    ctx.arc(hero.target.x, hero.target.y, 6, 0, TAU);
    ctx.stroke();
  }
  drawShadow(ctx, hero.x, hero.y, 13);
  glow(ctx, '#8cf', 16);
  drawSprite(ctx, 'hero', hero.x, hero.y, 1.15, time);
  ctx.shadowBlur = 0;

  if (interaction.placement) drawPlacementPreview(ctx, state, interaction.placement, time);

  effects.draw(ctx);
}

function glow(ctx: CanvasRenderingContext2D, color: string, blur: number): void {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function drawSellPrompt(ctx: CanvasRenderingContext2D, state: RunState, creature: Creature): void {
  ctx.strokeStyle = '#fff6';
  ctx.beginPath();
  ctx.arc(creature.x, creature.y, creature.def.range * state.modifiers.range, 0, TAU);
  ctx.stroke();

  const { width, height, offsetY } = SELL_BUTTON;
  const left = creature.x - width / 2;
  const top = creature.y + offsetY - height / 2;
  ctx.fillStyle = '#3a2b60';
  ctx.fillRect(left, top, width, height);
  ctx.strokeStyle = '#fc6';
  ctx.strokeRect(left, top, width, height);
  ctx.fillStyle = '#fc6';
  ctx.font = 'bold 11px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`Vender +${sellValue(creature)}`, creature.x, top + 15);
}

function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  state: RunState,
  placement: { creature: CreatureId; at: Point },
  time: number,
): void {
  const def = CREATURES[placement.creature];
  const { x, y } = placement.at;
  const range = def.range * state.modifiers.range;
  ctx.fillStyle = withAlpha(def.color, 0.13);
  ctx.beginPath();
  ctx.arc(x, y, range, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = def.color;
  ctx.beginPath();
  ctx.arc(x, y, range, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.7;
  drawSprite(ctx, def.id, x, y, 1.1, time);
  ctx.globalAlpha = 1;
}

/** Converte '#rgb' ou '#rrggbb' em rgba() com a opacidade dada. */
function withAlpha(hex: string, alpha: number): string {
  const digits = hex.slice(1);
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  const value = parseInt(full, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
