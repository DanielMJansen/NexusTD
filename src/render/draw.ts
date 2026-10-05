import { ARENA } from '../data/config';
import { CREATURES, type CreatureId } from '../data/creatures';
import { sellValue } from '../game/economy';
import type { Creature, Enemy, Point, RunState } from '../game/state';
import { drawAtmosphere, drawBackground, drawNexus } from './arena';
import type { Effects } from './effects';
import { drawShadow, drawSprite } from './sprites';

const TAU = Math.PI * 2;
/** Duração (s) da animação de golpe e do clarão de dano. */
const ATTACK_ANIMATION = 0.25;
const HIT_FLASH = 0.08;

/** Estado da interação do jogador que aparece na arena. */
export interface InteractionView {
  /** Criatura clicada: mostra alcance e botão de venda. */
  inspected: Creature | null;
  /** Carta escolhida com o mouse sobre a arena: prévia, alcance e se pode posicionar ali. */
  placement: { creature: CreatureId; at: Point; valid: boolean } | null;
}

/** Botão "Vender" acima da criatura (também usado para detectar o clique). */
export const SELL_BUTTON = { offsetY: -40, width: 64, height: 18 };

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: RunState,
  effects: Effects,
  interaction: InteractionView,
  time: number,
): void {
  drawBackground(ctx, time);

  const shake = effects.shakeOffset();
  ctx.save();
  ctx.translate(shake.x, shake.y);

  // Tudo que tem "pé no chão" é desenhado de cima para baixo, para sobrepor corretamente.
  const layers: { y: number; draw: () => void }[] = [
    {
      y: ARENA.center.y + 10,
      draw: () => drawNexus(ctx, state.nexus.hp, state.nexus.maxHp, time, effects.nexusHurt),
    },
  ];
  for (const enemy of state.enemies) layers.push({ y: enemy.y, draw: () => drawEnemy(ctx, state, enemy, time) });
  for (const creature of state.creatures) {
    layers.push({ y: creature.y, draw: () => drawCreature(ctx, state, creature, time) });
  }
  layers.push({ y: state.hero.y, draw: () => drawHero(ctx, state, time) });
  layers.sort((a, b) => a.y - b.y);
  for (const layer of layers) layer.draw();

  if (interaction.inspected) drawSellPrompt(ctx, state, interaction.inspected);
  if (interaction.placement) drawPlacementPreview(ctx, state, interaction.placement, time);
  effects.drawWorld(ctx, time);
  ctx.restore();

  drawAtmosphere(ctx, time);
  effects.drawBanners(ctx);
}

const attackStrength = (state: RunState, lastAttackAt: number) =>
  Math.max(0, 1 - (state.time - lastAttackAt) / ATTACK_ANIMATION);

function drawEnemy(ctx: CanvasRenderingContext2D, state: RunState, enemy: Enemy, time: number): void {
  const { scale } = enemy.def;
  const flying = enemy.def.zigzag !== null;
  drawShadow(ctx, enemy.x, enemy.y + 14 * scale, (flying ? 6 : 9) * scale);

  ctx.save();
  if (enemy.slowTimer > 0) {
    ctx.shadowColor = '#7fd8ff';
    ctx.shadowBlur = 12;
  }
  if (state.time - enemy.lastHitAt < HIT_FLASH) ctx.filter = 'brightness(2.4) saturate(0.4)';
  drawSprite(ctx, enemy.def.id, enemy.x, enemy.y, scale, {
    time: time + enemy.animationOffset,
    facing: enemy.x < ARENA.center.x ? 1 : -1,
    moving: true,
  });
  ctx.restore();

  if (enemy.slowTimer > 0) {
    ctx.fillStyle = '#bff0ff';
    for (let i = 0; i < 3; i++) {
      const a = time * 3 + i * 2.1;
      ctx.beginPath();
      ctx.arc(enemy.x + Math.cos(a) * 9 * scale, enemy.y - 6 * scale + Math.sin(a) * 4, 1.2, 0, TAU);
      ctx.fill();
    }
  }

  if (enemy.hp < enemy.maxHp) {
    const width = 20 * scale;
    const top = enemy.y - 28 * scale;
    ctx.fillStyle = '#07040dcc';
    ctx.beginPath();
    ctx.roundRect(enemy.x - width / 2 - 1, top - 1, width + 2, 5, 2.5);
    ctx.fill();
    ctx.fillStyle = enemy.def.isBoss ? '#ff4a5a' : '#e8454f';
    ctx.beginPath();
    ctx.roundRect(enemy.x - width / 2, top, width * Math.max(0, enemy.hp / enemy.maxHp), 3, 1.5);
    ctx.fill();
  }
}

function drawCreature(ctx: CanvasRenderingContext2D, state: RunState, creature: Creature, time: number): void {
  const flying = creature.def.id === 'fireDragon' || creature.def.id === 'iceDragon';
  const hover = flying ? -5 + Math.sin(time * 3 + creature.x) * 2 : 0;
  drawShadow(ctx, creature.x, creature.y + 14, flying ? 9 : 11);

  const frenzy = creature.frenzyTimer > 0;
  if (frenzy) {
    const pulse = 0.6 + Math.sin(time * 14) * 0.25;
    ctx.strokeStyle = `rgba(255, 50, 70, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(creature.x, creature.y + 14, 15, 5, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.save();
  if (frenzy) {
    ctx.shadowColor = '#ff2a40';
    ctx.shadowBlur = 16;
  }
  drawSprite(ctx, creature.def.id, creature.x, creature.y + hover, 1, {
    time: time + creature.x * 0.01,
    facing: creature.facing,
    attack: attackStrength(state, creature.lastAttackAt),
  });
  ctx.restore();
}

function drawHero(ctx: CanvasRenderingContext2D, state: RunState, time: number): void {
  const { hero } = state;
  if (Math.hypot(hero.target.x - hero.x, hero.target.y - hero.y) > 6) {
    ctx.strokeStyle = '#7fd8ff99';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(hero.target.x, hero.target.y, 7, 3.5, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  drawShadow(ctx, hero.x, hero.y + 14, 10);
  ctx.save();
  ctx.shadowColor = '#7fd8ff';
  ctx.shadowBlur = 10;
  drawSprite(ctx, 'hero', hero.x, hero.y, 1.05, {
    time,
    facing: hero.facing,
    moving: hero.moving,
    attack: attackStrength(state, hero.lastAttackAt),
  });
  ctx.restore();
}

function rangeCircle(ctx: CanvasRenderingContext2D, at: Point, radius: number, color: string, fill: string): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawSellPrompt(ctx: CanvasRenderingContext2D, state: RunState, creature: Creature): void {
  rangeCircle(ctx, creature, creature.def.range * state.modifiers.range, '#ffffff88', '#ffffff0c');

  const { width, height, offsetY } = SELL_BUTTON;
  const left = creature.x - width / 2;
  const top = creature.y + offsetY - height / 2;
  ctx.fillStyle = '#1c1430ee';
  ctx.strokeStyle = '#f0c35a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(left, top, width, height, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd25a';
  ctx.font = '700 9px Cinzel, Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Vender +${sellValue(creature)}`, creature.x, top + height / 2 + 0.5);
}

function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  state: RunState,
  placement: { creature: CreatureId; at: Point; valid: boolean },
  time: number,
): void {
  const def = CREATURES[placement.creature];
  const color = placement.valid ? def.color : '#ff4a5a';
  rangeCircle(ctx, placement.at, def.range * state.modifiers.range, color, withAlpha(color, 0.1));
  ctx.save();
  ctx.globalAlpha = placement.valid ? 0.75 : 0.4;
  drawSprite(ctx, def.id, placement.at.x, placement.at.y, 1, {
    time,
    facing: placement.at.x > ARENA.center.x ? -1 : 1,
  });
  ctx.restore();
}

/** Converte '#rgb' ou '#rrggbb' em rgba() com a opacidade dada. */
function withAlpha(hex: string, alpha: number): string {
  const digits = hex.slice(1);
  const full = digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  const value = parseInt(full, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}
