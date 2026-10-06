import { ARENA } from '../data/config';
import { WAVES } from '../data/waves';
import { CREATURES, type CreatureId } from '../data/creatures';
import { MAX_CREATURE_LEVEL } from '../data/evolution';
import { ascendedForm, creatureAbility, creatureRange, isAscended, levelInfo } from '../game/creatureStats';
import { canEvolve, needsBranchChoice } from '../game/economy';
import { heroMaxHp } from '../game/hero';
import type { Creature, Enemy, Point, Pool, RunState } from '../game/state';
import { drawAtmosphere, drawBackground, drawNexus } from './arena';
import type { Effects } from './effects';
import { drawLoot, drawNexusGround, drawNexusOverlay } from './nexusLoot';
import { drawShadow, drawSprite } from './sprites';

const TAU = Math.PI * 2;
/** Duração (s) da animação de golpe e do clarão de dano. */
const ATTACK_ANIMATION = 0.25;
const HIT_FLASH = 0.08;

/** Estado da interação do jogador que aparece na arena. */
export interface InteractionView {
  /** Criatura clicada: mostra alcance e botão de venda. */
  inspected: Creature | null;
  /** Vertente sob o mouse no quadro da criatura. */
  hoverBranch?: number | null;
  /** Quadro de melhorias do Nexus aberto (destaca o Nexus). */
  nexusOpen?: boolean;
  /** Mostrar o alcance do herói com destaque (Shift ou mouse sobre ele). */
  heroRange?: boolean;
  /** Carta escolhida com o mouse sobre a arena: prévia, alcance e se pode posicionar ali. */
  placement: { creature: CreatureId; at: Point; valid: boolean } | null;
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

  drawNexusGround(ctx, state, !!interaction.nexusOpen, time);
  for (const pool of state.pools) drawPool(ctx, pool, time);
  for (const item of state.loot) drawLoot(ctx, item, time);
  for (const creature of state.creatures) drawAuraRing(ctx, creature, time);

  // Tudo que tem "pé no chão" é desenhado de cima para baixo, para sobrepor corretamente.
  const layers: { y: number; draw: () => void }[] = [
    {
      y: ARENA.center.y + 10,
      draw: () => {
        drawNexus(ctx, state.nexus.hp, state.nexus.maxHp, time, effects.nexusHurt);
        drawNexusOverlay(ctx, state, time);
      },
    },
  ];
  for (const enemy of state.enemies) layers.push({ y: enemy.y, draw: () => drawEnemy(ctx, state, enemy, time) });
  for (const creature of state.creatures) {
    layers.push({ y: creature.y, draw: () => drawCreature(ctx, state, creature, time) });
  }
  layers.push({ y: state.hero.y, draw: () => drawHero(ctx, state, time, !!interaction.heroRange) });
  layers.sort((a, b) => a.y - b.y);
  for (const layer of layers) layer.draw();

  if (interaction.inspected) drawInspectRange(ctx, state, interaction.inspected, interaction.hoverBranch ?? null);
  if (interaction.placement) drawPlacementPreview(ctx, state, interaction.placement, time);
  effects.drawWorld(ctx, time);
  ctx.restore();

  drawAtmosphere(ctx, time);
  effects.drawBanners(ctx);
}

const attackStrength = (state: RunState, lastAttackAt: number) =>
  Math.max(0, 1 - (state.time - lastAttackAt) / ATTACK_ANIMATION);

function drawEnemy(ctx: CanvasRenderingContext2D, state: RunState, enemy: Enemy, time: number): void {
  const scale = enemy.def.scale * (enemy.elite ? WAVES.elites.scale : 1);
  const flying = enemy.def.flying && !enemy.stone;
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

  if (enemy.charging > 0) {
    // rastro da investida
    const angle = Math.atan2(ARENA.center.y - enemy.y, ARENA.center.x - enemy.x);
    ctx.strokeStyle = '#9ae8ff88';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (const off of [-5, 0, 5]) {
      const sx = enemy.x - Math.cos(angle) * 10 - Math.sin(angle) * off;
      const sy = enemy.y - Math.sin(angle) * 10 + Math.cos(angle) * off;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(angle) * 14, sy - Math.sin(angle) * 14);
    }
    ctx.stroke();
  }

  ctx.save();
  if (enemy.elite || enemy.enraged) {
    ctx.shadowColor = enemy.enraged ? '#ff2a3a' : '#ffd25a';
    ctx.shadowBlur = 8 + Math.sin(time * 5) * 3;
  }
  if (enemy.slowTimer > 0) {
    ctx.shadowColor = '#7fd8ff';
    ctx.shadowBlur = 12;
  }
  const filters: string[] = [];
  if (enemy.stone) filters.push('grayscale(0.8) brightness(0.9)');
  if (state.time - enemy.lastHitAt < HIT_FLASH) filters.push('brightness(2.4) saturate(0.4)');
  if (filters.length) ctx.filter = filters.join(' ');
  drawSprite(ctx, enemy.def.id, enemy.x, enemy.y, scale, {
    time: time + enemy.animationOffset,
    facing: enemy.x < ARENA.center.x ? 1 : -1,
    moving: !enemy.stone,
  });
  ctx.restore();
  if (enemy.shield > 0) {
    // escudo do Lich
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(time * 8) * 0.15;
    const g = ctx.createRadialGradient(enemy.x, enemy.y - 6 * scale, 4 * scale, enemy.x, enemy.y - 6 * scale, 22 * scale);
    g.addColorStop(0, '#7af0d800');
    g.addColorStop(1, '#7af0d866');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#bafff0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - 6 * scale, 22 * scale, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

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
  if (enemy.stunTimer > 0) drawStunStars(ctx, enemy.x, enemy.y - 24 * scale, time);
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
    ctx.fillStyle = enemy.elite ? '#ffc43a' : enemy.def.isBoss ? '#ff4a5a' : '#e8454f';
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
    // a aura tem a cor da vertente escolhida
    const auraColor = ascendedForm(creature)?.color ?? creature.def.color;
    const glow = ctx.createRadialGradient(creature.x, creature.y + 4, 2, creature.x, creature.y + 4, 26);
    glow.addColorStop(0, withAlpha(auraColor, 0.35 + Math.sin(time * 3) * 0.1));
    glow.addColorStop(1, withAlpha(auraColor, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(creature.x, creature.y + 4, 26, 0, TAU);
    ctx.fill();
  }
  ctx.save();
  if (frenzy || ascended) {
    ctx.shadowColor = frenzy ? '#ff2a40' : (ascendedForm(creature)?.color ?? '#ffd25a');
    ctx.shadowBlur = frenzy ? 16 : 5;
  }
  drawSprite(ctx, creature.def.id, creature.x, creature.y + hover, levelInfo(creature).scale, {
    time: time + creature.x * 0.01,
    facing: creature.facing,
    attack: attackStrength(state, creature.lastAttackAt),
    level: creature.level,
    branch: creature.branch,
  });
  ctx.restore();
  const form = ascendedForm(creature);
  if (form) drawBranchEmblem(ctx, creature.x + 13, creature.y + 12, form.icon, form.color);
  if (creature.webTimer > 0) drawWeb(ctx, creature.x, creature.y - 4, Math.min(1, creature.webTimer * 2));
  if (creature.stunTimer > 0) drawStunStars(ctx, creature.x, creature.y - 26, time);
  if (creature.level > 1) drawLevelStars(ctx, creature.x, creature.y + 20, creature.level);
  if (canEvolve(state, creature)) drawEvolveHint(ctx, creature.x, creature.y - 30 * levelInfo(creature).scale, time);
}

/** Emblema da vertente ao lado dos pés da criatura evoluída. */
function drawBranchEmblem(ctx: CanvasRenderingContext2D, x: number, y: number, icon: string, color: string): void {
  ctx.fillStyle = '#0a0612dd';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.font = '700 6.5px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(icon, x, y + 0.5);
}

/** Teia de aranha sobre a criatura (ataca mais devagar). */
function drawWeb(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = 0.75 * alpha;
  ctx.strokeStyle = '#ece4ff';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 11);
  }
  for (const r of [5, 9, 13]) {
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * TAU;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r * 0.85;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/** Estrelinhas girando: criatura atordoada. */
function drawStunStars(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  ctx.font = '700 7px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe07a';
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const a = time * 5 + (i * TAU) / 3;
    const sx = x + Math.cos(a) * 8;
    const sy = y + Math.sin(a) * 3;
    ctx.strokeText('✦', sx, sy);
    ctx.fillText('✦', sx, sy);
  }
}

/** Seta verde discreta: esta criatura pode evoluir agora. */
function drawEvolveHint(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  const bob = Math.sin(time * 4) * 1.5;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = '#4fd88a';
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(4, 0);
  ctx.lineTo(1.5, 0);
  ctx.lineTo(1.5, 4);
  ctx.lineTo(-1.5, 4);
  ctx.lineTo(-1.5, 0);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawLevelStars(ctx: CanvasRenderingContext2D, x: number, y: number, level: number): void {
  ctx.font = '700 6px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = '#0a0612';
  const text = '★'.repeat(level);
  ctx.strokeText(text, x, y);
  ctx.fillStyle = level >= MAX_CREATURE_LEVEL ? '#ffd25a' : '#e8e0f8';
  ctx.fillText(text, x, y);
}

function drawHero(ctx: CanvasRenderingContext2D, state: RunState, time: number, highlightRange: boolean): void {
  const { hero } = state;
  if (hero.dead) {
    // marcador no Nexus com a contagem para renascer
    const x = ARENA.center.x;
    const y = ARENA.center.y + 42;
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(time * 4) * 0.15;
    drawSprite(ctx, hero.def.id, x, y - 4, 0.8, { palette: hero.palette, time });
    ctx.restore();
    ctx.font = '700 9px Cinzel, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0a0612';
    const label = `Renasce em ${Math.ceil(hero.respawnTimer)} s`;
    ctx.strokeText(label, x, y + 16);
    ctx.fillStyle = '#ff9aa4';
    ctx.fillText(label, x, y + 16);
    return;
  }
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
  // alcance do ataque do herói: sempre discreto; destacado com Shift ou mouse sobre ele
  ctx.save();
  ctx.strokeStyle = withAlpha(hero.def.color, highlightRange ? 0.6 : 0.18);
  ctx.fillStyle = withAlpha(hero.def.color, highlightRange ? 0.08 : 0);
  ctx.setLineDash([4, 5]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(hero.x, hero.y, hero.def.attack.range * (1 + state.heroStats.range), 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  if (state.time - hero.lastHitAt < 0.08) ctx.filter = 'brightness(1.8) saturate(0.5)';
  drawSprite(ctx, hero.def.id, hero.x, hero.y, 1.05, {
    palette: hero.palette,
    time,
    facing: hero.facing,
    moving: hero.moving,
    attack: attackStrength(state, hero.lastAttackAt),
  });
  ctx.restore();
  // vida do herói (só quando ferido)
  const ratio = hero.hp / heroMaxHp(state);
  if (ratio < 1) {
    const top = hero.y - 30;
    ctx.fillStyle = '#07040dcc';
    ctx.beginPath();
    ctx.roundRect(hero.x - 13, top - 1, 26, 5, 2.5);
    ctx.fill();
    ctx.fillStyle = ratio > 0.35 ? '#4fd88a' : '#ff5a6a';
    ctx.beginPath();
    ctx.roundRect(hero.x - 12, top, 24 * ratio, 3, 1.5);
    ctx.fill();
  }
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
/** Alcance da criatura selecionada e, com o mouse numa vertente do quadro, o alcance que ela teria. */
function drawInspectRange(ctx: CanvasRenderingContext2D, state: RunState, creature: Creature, hoverBranch: number | null): void {
  rangeCircle(ctx, creature, creatureRange(creature, state.modifiers), '#ffffff88', '#ffffff0c');
  if (hoverBranch === null || !needsBranchChoice(creature)) return;
  const form = creature.def.ascended[hoverBranch]!;
  const preview = { ...creature, level: creature.level + 1, branch: hoverBranch };
  ctx.setLineDash([4, 4]);
  rangeCircle(ctx, creature, creatureRange(preview, state.modifiers), form.color, withAlpha(form.color, 0.06));
  ctx.setLineDash([]);
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
