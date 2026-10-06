import { ARENA } from '../data/config';
import { CREATURES, type CreatureId } from '../data/creatures';
import { MAX_CREATURE_LEVEL } from '../data/evolution';
import { creatureAbility, creatureName, creatureRange, isAscended, levelInfo } from '../game/creatureStats';
import { canEvolve, evolveCost, sellValue } from '../game/economy';
import type { Creature, Enemy, Point, Pool, RunState } from '../game/state';
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

export interface InspectButton {
  action: 'evolve' | 'sell';
  label: string;
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

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

  for (const pool of state.pools) drawPool(ctx, pool, time);
  for (const creature of state.creatures) drawAuraRing(ctx, creature, time);

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

  if (interaction.inspected) drawInspectPanel(ctx, state, interaction.inspected);
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
  if (enemy.held) {
    // segurado por um Guarda
    ctx.strokeStyle = '#c9d4e8bb';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + 14 * scale, 11 * scale, 4 * scale, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }

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

  if (enemy.poisonTimer > 0) {
    // bolhas verdes subindo
    ctx.fillStyle = '#a8f080';
    for (let i = 0; i < 3; i++) {
      const phase = (time * 1.5 + i / 3 + enemy.animationOffset) % 1;
      ctx.globalAlpha = 1 - phase;
      ctx.beginPath();
      ctx.arc(enemy.x + (i - 1) * 4 * scale, enemy.y - 10 * scale - phase * 14, 1.4, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (enemy.fearTimer > 0) {
    ctx.font = '700 11px Cinzel, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e8c890';
    ctx.strokeStyle = '#0a0612';
    ctx.lineWidth = 2.5;
    ctx.strokeText('!', enemy.x, enemy.y - 30 * scale);
    ctx.fillText('!', enemy.x, enemy.y - 30 * scale);
  }
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
  const dragon = creature.def.id === 'fireDragon' || creature.def.id === 'iceDragon';
  const flying = dragon || creature.def.id === 'haunt' || creature.def.id === 'banshee';
  const hover = dragon ? -5 + Math.sin(time * 3 + creature.x) * 2 : 0;
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
  const ascended = isAscended(creature);
  if (ascended) {
    // aura dourada da forma evoluída
    const glow = ctx.createRadialGradient(creature.x, creature.y + 4, 2, creature.x, creature.y + 4, 26);
    glow.addColorStop(0, withAlpha(creature.def.color, 0.35 + Math.sin(time * 3) * 0.1));
    glow.addColorStop(1, withAlpha(creature.def.color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(creature.x, creature.y + 4, 26, 0, TAU);
    ctx.fill();
  }
  ctx.save();
  if (frenzy || ascended) {
    ctx.shadowColor = frenzy ? '#ff2a40' : '#ffd25a';
    ctx.shadowBlur = frenzy ? 16 : 5;
  }
  drawSprite(ctx, creature.def.id, creature.x, creature.y + hover, levelInfo(creature).scale, {
    time: time + creature.x * 0.01,
    facing: creature.facing,
    attack: attackStrength(state, creature.lastAttackAt),
    level: creature.level,
  });
  ctx.restore();
  if (creature.level > 1) drawLevelStars(ctx, creature.x, creature.y + 20, creature.level);
}

function drawLevelStars(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  ctx.font = '700 7px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0a0612';
  const text = '★'.repeat(level - 1);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = level >= MAX_CREATURE_LEVEL ? '#ffd25a' : '#e8e0f8';
  ctx.fillText(text, x, y);
}

function drawHero(ctx: CanvasRenderingContext2D, state: RunState, time: number): void {
  const { hero } = state;
  if (Math.hypot(hero.target.x - hero.x, hero.target.y - hero.y) > 6) {
    ctx.strokeStyle = '#ffd25a99';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(hero.target.x, hero.target.y, 7, 3.5, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  drawShadow(ctx, hero.x, hero.y + 14, 10);
  drawHeroRing(ctx, hero.x, hero.y + 14, time, hero.def.color);
  ctx.save();
  drawSprite(ctx, hero.def.id, hero.x, hero.y, 1.05, {
    palette: hero.palette,
    time,
    facing: hero.facing,
    moving: hero.moving,
    attack: attackStrength(state, hero.lastAttackAt),
  });
  ctx.restore();
}

/** Poça borbulhante do Caldeirão (desaparece no fim). */
function drawPool(ctx: CanvasRenderingContext2D, pool: Pool, time: number): void {
  const fade = Math.min(1, pool.remaining / 0.4) * Math.min(1, (pool.duration - pool.remaining) / 0.15 + 0.2);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(pool.x, pool.y + 6);
  ctx.scale(1, 0.55);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, pool.radius);
  g.addColorStop(0, withAlpha(pool.color, 0.55));
  g.addColorStop(0.8, withAlpha(pool.color, 0.3));
  g.addColorStop(1, withAlpha(pool.color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, pool.radius, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#d8ffe8';
  for (let i = 0; i < 4; i++) {
    const phase = (time * 1.3 + i * 0.27) % 1;
    const a = i * 1.7 + pool.x;
    ctx.globalAlpha = fade * (1 - phase);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * pool.radius * 0.5, Math.sin(a) * pool.radius * 0.5, 1.5 + phase * 2.5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** Raio da aura do Alfa (discreto). */
function drawAuraRing(ctx: CanvasRenderingContext2D, creature: Creature, time: number): void {
  const ability = creatureAbility(creature);
  if (ability.kind !== 'aura') return;
  ctx.save();
  ctx.translate(creature.x, creature.y + 12);
  ctx.scale(1, 0.5);
  ctx.strokeStyle = withAlpha(creature.def.color, 0.3 + Math.sin(time * 3) * 0.1);
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -time * 10;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, ability.radius, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** Marca do herói: anel rúnico dourado girando sob os pés (ciano fica reservado para lentidão). */
function drawHeroRing(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, color: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.38);
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 20);
  glow.addColorStop(0, withAlpha(color, 0.25));
  glow.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = withAlpha(color, 0.8);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, TAU);
  ctx.stroke();
  ctx.rotate(time * 1.2);
  ctx.strokeStyle = '#ffe9a8';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 16, (i * TAU) / 4, (i * TAU) / 4 + 0.6);
    ctx.stroke();
  }
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

/** Painel sobre a criatura clicada: nome, nível e botões (também usado para detectar o clique). */
export function inspectButtons(state: RunState, creature: Creature): InspectButton[] {
  const width = 66;
  const height = 18;
  const y = creature.y - 52;
  const sell = { action: 'sell' as const, label: `Vender +${sellValue(creature)}`, enabled: true };
  const cost = evolveCost(creature, state.talents.evolveDiscount);
  if (cost === null) return [{ ...sell, x: creature.x - width / 2, y, width, height }];
  return [
    {
      action: 'evolve',
      label: `Evoluir ◉${cost}`,
      enabled: canEvolve(state, creature),
      x: creature.x - width - 2,
      y,
      width,
      height,
    },
    { ...sell, x: creature.x + 2, y, width, height },
  ];
}

function drawInspectPanel(ctx: CanvasRenderingContext2D, state: RunState, creature: Creature): void {
  rangeCircle(ctx, creature, creatureRange(creature, state.modifiers), '#ffffff88', '#ffffff0c');

  const buttons = inspectButtons(state, creature);
  const top = buttons[0]!.y;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = '700 10px Cinzel, Georgia, serif';
  const stars = '★'.repeat(creature.level) + '☆'.repeat(MAX_CREATURE_LEVEL - creature.level);
  const title = `${creatureName(creature)}  ${stars}`;
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = 3;
  ctx.strokeText(title, creature.x, top - 8);
  ctx.fillStyle = isAscended(creature) ? '#ffd25a' : '#f0e6ff';
  ctx.fillText(title, creature.x, top - 8);

  for (const b of buttons) {
    const evolve = b.action === 'evolve';
    ctx.globalAlpha = b.enabled ? 1 : 0.5;
    ctx.fillStyle = evolve ? '#2a1c48ee' : '#1c1430ee';
    ctx.strokeStyle = evolve ? '#b98cff' : '#f0c35a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.width, b.height, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = evolve ? '#e2c8ff' : '#ffd25a';
    ctx.font = '700 8.5px Cinzel, Georgia, serif';
    ctx.fillText(b.label, b.x + b.width / 2, b.y + b.height / 2 + 0.5);
  }
  ctx.globalAlpha = 1;
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
