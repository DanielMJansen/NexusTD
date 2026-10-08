import { CORPSE_LIFE, raisableCorpses } from '../game/raise';
import { avalanchePosition } from '../game/mapEvents';
import { ARENA, INTERACT } from '../data/config';
import { resolveNexus } from './nexusLook';
import { drawVariantAura, drawVariantParticles, variantLayerLook } from './variantLook';

import { STAGES } from '../data/stages';
import { WAVES } from '../data/waves';
import { CREATURES, type CreatureId } from '../data/creatures';
import { ASCENDED_LEVEL } from '../data/evolution';
import { ascendedForm, creatureAbility, creatureRange, isAscended, isSupreme, levelInfo } from '../game/creatureStats';
import { canEvolve, needsBranchChoice } from '../game/economy';
import { heroMaxHp, heroRange } from '../game/hero';
import type { Creature, Enemy, Point, Pool, RunState } from '../game/state';
import { drawAtmosphere, drawBackground, drawNexus } from './arena';
import type { Effects } from './effects';
import { drawLoot, drawNexusGround, drawNexusOverlay } from './nexusLoot';
import { drawShadow, drawSprite } from './sprites';
import { drawLayered, halo, type LayerLook } from './spriteKit';

const TAU = Math.PI * 2;
/** Pontos extras a defender: Nexus em cores douradas. */
const GUARD_LOOK = { model: 'crystal' as const, palette: { dark: '#a06a10', mid: '#e8b030', light: '#fff0b0', glow: '#ffd25a', accent: '#fff4c8' } };
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
  camera: { x: number; y: number; zoom?: number } = { x: 0, y: 0 },
): void {
  effects.nexusAt = state.nexus;
  // limpa o quadro (fora do mundo pintado fica o fundo escuro)
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#07040d';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  // mundo: câmera (e tremor) aplicados; atmosfera e faixas ficam presas à tela
  const shake = effects.shakeOffset();
  ctx.save();
  // alinha a câmera a pixels inteiros da tela (o cenário em cache não treme)
  const zoom = camera.zoom ?? 1;
  ctx.translate(shake.x, shake.y);
  ctx.scale(zoom, zoom);
  const px = ctx.getTransform().a || 1;
  ctx.translate(-Math.round(camera.x * px) / px, -Math.round(camera.y * px) / px);
  drawBackground(ctx, time, STAGES[state.stage], state.map, state.nexus);

  drawIce(ctx, state, time);
  drawAvalancheWarning(ctx, state, time);
  drawRaisableCorpses(ctx, state, time);
  drawNexusGround(ctx, state, !!interaction.nexusOpen, time);
  for (const pool of state.pools) drawPool(ctx, pool, time);
  for (const strike of state.pulseFx.strikes) drawStrikeWarning(ctx, strike, time);
  for (const item of state.loot) drawLoot(ctx, item, time);
  for (const creature of state.creatures) drawAuraRing(ctx, creature, time);

  // Tudo que tem "pé no chão" é desenhado de cima para baixo, para sobrepor corretamente.
  const layers: { y: number; draw: () => void }[] = [
    {
      y: state.nexus.y + 10,
      draw: () => {
        drawNexus(ctx, state.nexus.hp, state.nexus.maxHp, time, effects.nexusHurt, resolveNexus(state.nexusLook, state.stage), state.nexus);
        drawNexusOverlay(ctx, state, time);
      },
    },
  ];
  for (const g of state.guards) {
    // ponto vital gêmeo (Deserto): mesmo visual do Nexus da fase
    const look = g.twin ? resolveNexus(state.nexusLook, state.stage) : GUARD_LOOK;
    layers.push({ y: g.y + 10, draw: () => drawNexus(ctx, g.hp, g.maxHp, time, state.time - g.lastHitAt < 0.15 ? 1 : 0, look, g) });
  }
  for (const o of state.interactables) layers.push({ y: o.y, draw: () => drawInteractable(ctx, o, time, state.weather.active) });
  // Portais do Céu (Fase 5)
  const portalRule = STAGES[state.stage].portals;
  for (const p of state.portals) if (!p.sealed && !p.done) layers.push({ y: p.y - 12, draw: () => drawPortal(ctx, p, time, portalRule?.sealTime ?? 3, portalRule?.warning ?? 5) });
  for (const enemy of state.enemies) layers.push({ y: enemy.y, draw: () => drawEnemy(ctx, state, enemy, time) });
  for (const creature of state.creatures) {
    layers.push({ y: creature.y, draw: () => drawCreature(ctx, state, creature, time) });
  }
  layers.push({ y: state.hero.y, draw: () => drawHero(ctx, state, time, !!interaction.heroRange) });
  layers.sort((a, b) => a.y - b.y);
  for (const layer of layers) layer.draw();

  if (interaction.inspected) drawInspectRange(ctx, state, interaction.inspected, interaction.hoverBranch ?? null);
  if (interaction.placement) drawPlacementPreview(ctx, state, interaction.placement, time);
  drawAvalanche(ctx, state, time);
  effects.drawWorld(ctx, time);
  if (state.wind !== null) drawWind(ctx, state.wind, time, state.map);
  ctx.restore();
  if (state.weather.active) {
    if (STAGES[state.stage].weather?.kind === 'sandstorm') drawSandstorm(ctx, time);
    else drawBlizzard(ctx, time);
  }

  drawAtmosphere(ctx, time, STAGES[state.stage].biome === 'tundra');
  effects.drawBanners(ctx);
}

const attackStrength = (state: RunState, lastAttackAt: number) =>
  Math.max(0, 1 - (state.time - lastAttackAt) / ATTACK_ANIMATION);

function drawEnemy(ctx: CanvasRenderingContext2D, state: RunState, enemy: Enemy, time: number): void {
  const scale = enemy.def.scale * (enemy.elite ? WAVES.elites.scale : 1);
  if (enemy.hidden) {
    // oculto pela tempestade de areia: só um vulto
    ctx.save();
    ctx.globalAlpha = 0.14 + Math.sin(time * 3 + enemy.animationOffset) * 0.05;
    ctx.fillStyle = '#5a3a1a';
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y - 4 * scale, 8 * scale, 11 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    return;
  }
  if ((enemy.reviveTime ?? 0) > 0) {
    // caído: monte de areia e ataduras com um brilho dourado que cresce até levantar
    const rise = 1 - enemy.reviveTime! / 3;
    ctx.fillStyle = '#c8a868';
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + 8 * scale, 12 * scale, 4.5 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + 6 * scale, 9 * scale, 3 * scale, 0.1, 0, TAU);
    ctx.fill();
    halo(ctx, enemy.x, enemy.y + 4 * scale, (14 + rise * 10) * scale, '#f0c35a', 0.3 + rise * 0.4 + Math.sin(time * 8) * 0.1);
    return;
  }
  if (enemy.submerged && enemy.def.flying) {
    // voador sumido nas nuvens: só a sombra
    drawShadow(ctx, enemy.x, enemy.y + 14 * scale, 5 * scale);
    return;
  }
  if (enemy.submerged) {
    drawSubmerged(ctx, enemy.x, enemy.y + 6 * scale, scale, time + enemy.animationOffset);
    return;
  }
  const flying = enemy.def.flying && !enemy.stone;
  // salto: sobe em arco (a sombra fica no chão)
  const leap = enemy.def.traits.find((t) => t.kind === 'leap');
  const lift = (enemy.leapTime ?? 0) > 0 && leap?.kind === 'leap' ? Math.sin(Math.PI * (1 - enemy.leapTime! / leap.duration)) * 16 * scale : 0;
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
    const angle = Math.atan2(state.nexus.y - enemy.y, state.nexus.x - enemy.x);
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

  // brilho e filtros vão para a camada do sprite (um efeito por inimigo, não por traço)
  // brilhos (elite, fúria, lento): halo em cache atrás do sprite, sem camada nem shadowBlur
  const look: LayerLook = {};
  if (enemy.slowTimer > 0) halo(ctx, enemy.x, enemy.y - 6 * scale, 24 * scale, '#7fd8ff', 0.55);
  else if (enemy.elite || enemy.enraged) halo(ctx, enemy.x, enemy.y - 6 * scale, (24 + Math.sin(time * 5) * 3) * scale, enemy.enraged ? '#ff2a3a' : '#ffd25a', 0.6);
  // tintas baratas (sem filtro de canvas): aliado verde, pedra cinza, clarão de golpe branco
  if (enemy.allyTimer > 0) {
    look.tint = 'rgba(110, 255, 170, 0.38)';
    halo(ctx, enemy.x, enemy.y - 4 * scale, 18 * scale, '#7affb0', 0.5);
  }
  if (enemy.stone || (enemy.stunTimer > 0 && enemy.stunLook === 'stone')) look.tint = 'rgba(150, 150, 160, 0.7)';
  const flash = state.time - enemy.lastHitAt < HIT_FLASH;
  // esqueleto erguido: sobe da terra no primeiro meio segundo
  const rising = enemy.summonedAlly && enemy.raisedAt !== undefined ? Math.min(1, (state.time - enemy.raisedAt) / 0.5) : 1;
  // ataque: tranco curto na direção do golpe e pose de ataque do sprite
  const lunge = Math.max(0, 1 - (state.time - enemy.lastAttackAt) / 0.3);
  const ex = enemy.x + Math.cos(enemy.attackAngle) * lunge * 5;
  const ey = enemy.y + Math.sin(enemy.attackAngle) * lunge * 5 - lift + (1 - rising) * 16 * scale;
  const enemyFacing = lunge > 0 ? (Math.cos(enemy.attackAngle) >= 0 ? 1 : -1) : enemy.x < state.nexus.x ? 1 : -1;
  drawLayered(ctx, ex, ey - 6 * scale, 40 * scale, look, (c) => {
    if (enemy.hexTimer > 0) drawFrog(c, enemy.x, enemy.y, scale, time + enemy.animationOffset);
    else {
      drawSprite(c, enemy.def.id, ex, ey, scale, {
        attack: lunge,
        time: time + enemy.animationOffset,
        facing: enemyFacing,
        moving: !enemy.stone,
        // Hidra: nível = cabeças vivas
        level: enemy.heads ?? 1,
      });
    }
  });
  if (flash) {
    // clarão do golpe: brilho branco somado por cima (sem camada)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    halo(ctx, ex, ey - 6 * scale, 20 * scale, '#ffffff', 0.55);
    ctx.restore();
  }
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

  if (enemy.ward) {
    // Escudados (Sem Fim): anel que quebra no primeiro golpe
    ctx.strokeStyle = '#9ad8ffcc';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - 6 * scale, 15 * scale, 0, TAU);
    ctx.stroke();
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
  if ((enemy.gripTimer ?? 0) > 0) {
    // Garras: arranhões vermelhos
    ctx.strokeStyle = '#ff5a4acc';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (const dx of [-3, 0, 3]) {
      ctx.moveTo(enemy.x + dx * scale - 2, enemy.y - 12 * scale);
      ctx.lineTo(enemy.x + dx * scale + 2, enemy.y - 4 * scale);
    }
    ctx.stroke();
  }
  if (enemy.stunTimer > 0 && enemy.stunLook === 'stun') drawStunStars(ctx, enemy.x, enemy.y - 24 * scale, time);
  if (enemy.stunTimer > 0 && enemy.stunLook === 'root') drawRoots(ctx, enemy.x, enemy.y + 12 * scale, scale);
  if (enemy.markTimer > 0) drawMark(ctx, enemy.x, enemy.y - 6 * scale, 10 * scale, time);
  if (enemy.corrodeTimer > 0) drawDrips(ctx, enemy.x, enemy.y - 4 * scale, scale, time, '#9aff3a');
  if (enemy.weakenTimer > 0) drawDrips(ctx, enemy.x, enemy.y - 4 * scale, scale, time, '#8a5aff');
  if (enemy.allyTimer > 0) {
    ctx.strokeStyle = '#9affc8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y - 24 * scale, 5 * scale, 1.6 * scale, 0, 0, TAU);
    ctx.stroke();
  }
  if (enemy.fearTimer > 0) {
    ctx.font = '700 11px Cinzel, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e8c890';
    ctx.strokeStyle = '#0a0612';
    ctx.lineWidth = 2.5;
    const mark = enemy.fearLook === 'confuse' ? '?' : '!';
    ctx.strokeText(mark, enemy.x, enemy.y - 30 * scale);
    ctx.fillText(mark, enemy.x, enemy.y - 30 * scale);
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
  if (enemy.heads !== undefined) {
    // Hidra: cabeças vivas (barra = cabeça atual)
    ctx.font = '700 9px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#07040d';
    const label = `${enemy.heads} cabeça${enemy.heads > 1 ? 's' : ''}${enemy.cutHeads ? ` · +${enemy.cutHeads * 2} em ${Math.ceil(enemy.regrowTimer ?? 0)} s` : ''}`;
    ctx.strokeText(label, enemy.x, enemy.y - 32 * scale);
    ctx.fillStyle = enemy.cutHeads ? '#ffb84a' : '#bada9a';
    ctx.fillText(label, enemy.x, enemy.y - 32 * scale);
  }
}

/** Inimigo submerso na lama: só bolhas e o par de olhos. */
function drawSubmerged(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, time: number): void {
  ctx.strokeStyle = '#a89060aa';
  ctx.lineWidth = 1;
  for (let k = 0; k < 2; k++) {
    const t = (time * 0.8 + k * 0.5) % 1;
    ctx.globalAlpha = 1 - t;
    ctx.beginPath();
    ctx.ellipse(x, y, (6 + t * 10) * scale, (2 + t * 3) * scale, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffd84a';
  for (const dx of [-2.5, 2.5]) {
    ctx.beginPath();
    ctx.arc(x + dx * scale, y - 1, 1.1 * scale, 0, TAU);
    ctx.fill();
  }
}

/** Duração do salto da Caçada (ida e volta), só visual. */
const LEAP_TIME = 0.5;

function drawCreature(ctx: CanvasRenderingContext2D, state: RunState, creature: Creature, time: number): void {
  const since = creature.leapAt === undefined ? Infinity : state.time - creature.leapAt;
  if (since >= LEAP_TIME || !creature.leapTo) {
    drawCreatureBody(ctx, state, creature, time);
    return;
  }
  // salto: vai até o alvo e volta num arco
  const f = Math.sin((since / LEAP_TIME) * Math.PI);
  const dx = (creature.leapTo.x - creature.x) * 0.85 * f;
  const dy = (creature.leapTo.y - creature.y) * 0.85 * f - 22 * f;
  ctx.save();
  ctx.translate(dx, dy);
  drawCreatureBody(ctx, state, creature, time);
  ctx.restore();
}

function drawCreatureBody(ctx: CanvasRenderingContext2D, state: RunState, creature: Creature, time: number): void {
  if ((creature.swallowTimer ?? 0) > 0) {
    // engolida pelo Rei Sapo: só o contorno tracejado de onde ela estava
    ctx.strokeStyle = '#bada9a99';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(creature.x, creature.y + 12, 12, 4.5, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '700 9px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#bada9a';
    ctx.fillText(`engolida · ${Math.ceil(creature.swallowTimer!)} s`, creature.x, creature.y + 2);
    return;
  }
  const dragon = creature.def.id === 'fireDragon' || creature.def.id === 'iceDragon' || creature.def.id === 'storm';
  const flying = dragon || creature.def.flying || creature.def.id === 'haunt' || creature.def.id === 'banshee';
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
  const variant = creature.variant ?? null;
  const spriteScale = levelInfo(creature).scale;
  // brilho (fúria, variante): halo em cache atrás do sprite; a forma evoluída já tem a aura acima
  if (frenzy) halo(ctx, creature.x, creature.y + hover - 6 * spriteScale, 28 * spriteScale, '#ff2a40', 0.7);
  else if (variant) drawVariantAura(ctx, creature.def.id, variant, creature.x, creature.y + hover - 6 * spriteScale, spriteScale, time);
  const look: LayerLook = variant ? variantLayerLook(creature.def.id, variant, time + creature.x * 0.01) : {};
  drawLayered(ctx, creature.x, creature.y + hover - 6 * spriteScale, 40 * spriteScale, look, (c) =>
    drawSprite(c, creature.def.id, creature.x, creature.y + hover, spriteScale, {
      time: time + creature.x * 0.01,
      facing: creature.facing,
      attack: attackStrength(state, creature.lastAttackAt),
      level: creature.level,
      branch: creature.branch,
      supreme: isSupreme(creature),
    }),
  );
  if (variant) drawVariantParticles(ctx, creature.def.id, variant, creature.x, creature.y + hover - 6 * spriteScale, spriteScale, time);
  const form = ascendedForm(creature);
  if (form) drawBranchEmblem(ctx, creature.x + 13, creature.y + 12, form.icon, form.color);
  if (state.haste.remaining > 0) drawSparkles(ctx, creature.x, creature.y - 10, time + creature.x);
  if (creature.webTimer > 0) {
    if (creature.webLook === 'curse') drawCurse(ctx, creature.x, creature.y - 4, Math.min(1, creature.webTimer * 2), time);
    else drawWeb(ctx, creature.x, creature.y - 4, Math.min(1, creature.webTimer * 2));
  }
  if (creature.stunTimer > 0) {
    if (creature.frozen) drawFrozenBlock(ctx, creature.x, creature.y - 6);
    else drawStunStars(ctx, creature.x, creature.y - 26, time);
  }
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

/** Sapo (Feitiço do Sapo): pulinhos no lugar do inimigo. */
function drawFrog(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, time: number): void {
  const hop = Math.abs(Math.sin(time * 4)) * 4;
  const s = Math.max(0.8, scale * 0.8);
  ctx.save();
  ctx.translate(x, y + 8 - hop);
  ctx.scale(s, s);
  ctx.fillStyle = '#5ac85a';
  ctx.strokeStyle = '#170c24';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 5, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#7ae87a';
    ctx.beginPath();
    ctx.arc(side * 3.5, -4, 2.4, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#12081c';
    ctx.beginPath();
    ctx.arc(side * 3.5, -4.2, 1, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#2a5a2a';
  ctx.beginPath();
  ctx.arc(0, 0.5, 3, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.restore();
}

/** Aviso no chão antes do golpe: meteoro caindo (vermelho) ou coluna de luz (dourado). */
function drawStrikeWarning(ctx: CanvasRenderingContext2D, strike: { x: number; y: number; delay: number; total: number; kind: 'meteor' | 'judgment' }, time: number): void {
  const progress = 1 - strike.delay / strike.total;
  const color = strike.kind === 'meteor' ? '255, 90, 40' : '255, 236, 160';
  const r = strike.kind === 'meteor' ? 30 : 42;
  ctx.save();
  ctx.strokeStyle = `rgba(${color}, ${0.4 + progress * 0.5})`;
  ctx.fillStyle = `rgba(${color}, ${0.08 + progress * 0.18})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(strike.x, strike.y + 6, r, r * 0.45, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(strike.x, strike.y + 6, r * progress, r * 0.45 * progress, 0, 0, TAU);
  ctx.stroke();
  if (strike.kind === 'meteor') {
    // meteoro descendo em diagonal
    const fall = (1 - progress) * 160;
    const mx = strike.x + fall * 0.5;
    const my = strike.y - fall;
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, 9);
    g.addColorStop(0, '#fff2c0');
    g.addColorStop(0.4, '#ff8a2a');
    g.addColorStop(1, '#ff4a1a00');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = `rgba(255, 246, 192, ${0.15 + Math.sin(time * 20) * 0.08})`;
    ctx.fillRect(strike.x - 3, strike.y - 200, 6, 206);
  }
  ctx.restore();
}

/** Pó dourado caindo: criatura acelerada pela Bênção Feérica. */
function drawSparkles(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  ctx.fillStyle = '#ffe9a8';
  for (let i = 0; i < 3; i++) {
    const phase = (time * 1.4 + i / 3) % 1;
    ctx.globalAlpha = 1 - phase;
    ctx.beginPath();
    ctx.arc(x + Math.sin(time * 3 + i * 2) * 8, y - 10 + phase * 16, 1.1, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Raízes enroladas nos pés (preso pela Herbalista). */
function drawRoots(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.strokeStyle = '#4a8a3a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = -1; i <= 1; i++) {
    ctx.moveTo(x + i * 5 * scale, y + 2);
    ctx.quadraticCurveTo(x + i * 8 * scale, y - 6 * scale, x + i * 2 * scale, y - 10 * scale);
  }
  ctx.stroke();
  ctx.fillStyle = '#7ad85a';
  ctx.beginPath();
  ctx.ellipse(x - 4 * scale, y - 8 * scale, 1.8, 1, 0.6, 0, TAU);
  ctx.ellipse(x + 3 * scale, y - 9 * scale, 1.8, 1, -0.6, 0, TAU);
  ctx.fill();
}

/** Mira dourada girando: inimigo marcado (recebe mais dano). */
function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(time * 1.5);
  ctx.strokeStyle = '#ffd25acc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4;
    ctx.moveTo(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3));
    ctx.lineTo(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3));
  }
  ctx.stroke();
  ctx.restore();
}

/** Gotas escorrendo (corrosão verde, enfraquecimento roxo). */
function drawDrips(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, time: number, color: string): void {
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const ph = (time * 1.2 + i / 3) % 1;
    ctx.globalAlpha = 1 - ph;
    ctx.beginPath();
    ctx.arc(x + (i - 1) * 5 * scale, y + ph * 12 * scale, 1.2, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
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
  // até a forma evoluída: estrelas claras; estrelas compradas depois (★4, ★5) em dourado vivo
  const base = '★'.repeat(Math.min(level, ASCENDED_LEVEL));
  const extra = '★'.repeat(Math.max(0, level - ASCENDED_LEVEL));
  const full = base + extra;
  ctx.strokeText(full, x, y);
  const start = x - ctx.measureText(full).width / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = level >= ASCENDED_LEVEL ? '#ffd25a' : '#e8e0f8';
  ctx.fillText(base, start, y);
  if (extra) {
    ctx.fillStyle = '#fff6a0';
    ctx.fillText(extra, start + ctx.measureText(base).width, y);
  }
  ctx.textAlign = 'center';
}

function drawHero(ctx: CanvasRenderingContext2D, state: RunState, time: number, highlightRange: boolean): void {
  const { hero } = state;
  if (hero.dead) {
    // marcador no Nexus com a contagem para renascer
    const x = state.nexus.x;
    const y = state.nexus.y + 42;
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
  if (state.pulse.remaining <= 0 && state.phase === 'playing') {
    // Pulso pronto: aura pulsando na cor do herói
    const beat = 0.5 + 0.5 * Math.sin(time * 5);
    ctx.strokeStyle = hero.def.color;
    ctx.globalAlpha = 0.35 + 0.4 * beat;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(hero.x, hero.y + 14, 15 + beat * 3, 5.5 + beat, 0, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // alcance do ataque do herói: sempre discreto; destacado com Shift ou mouse sobre ele
  ctx.save();
  ctx.strokeStyle = withAlpha(hero.def.color, highlightRange ? 0.6 : 0.18);
  ctx.fillStyle = withAlpha(hero.def.color, highlightRange ? 0.08 : 0);
  ctx.setLineDash([4, 5]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(hero.x, hero.y, heroRange(state), 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  const glide = state.pulseFx.glide;
  if (glide) {
    // rastros fantasmagóricos ao longo do caminho percorrido
    for (let i = 1; i <= 5; i++) {
      const t = (glide.elapsed / glide.duration) * (1 - i * 0.16);
      if (t <= 0) continue;
      const eased = 1 - (1 - t) * (1 - t);
      ctx.save();
      ctx.globalAlpha = 0.28 - i * 0.04;
      drawSprite(ctx, hero.def.id, glide.from.x + (glide.to.x - glide.from.x) * eased, glide.from.y + (glide.to.y - glide.from.y) * eased, 1.05, {
        palette: hero.palette,
        time,
        facing: glide.to.x >= glide.from.x ? 1 : -1,
      });
      ctx.restore();
    }
  }
  const fury = state.pulseFx.transform > 0;
  ctx.save();
  if (glide) ctx.globalAlpha = 0.55;
  const heroScale = fury ? 1.5 : 1.05;
  if (fury) halo(ctx, hero.x, hero.y - 6 - 6 * heroScale, 34 * heroScale, '#ff5a3a', 0.6);
  const heroLook: LayerLook = {};
  if (state.time - hero.lastHitAt < 0.08) heroLook.filter = 'brightness(1.8) saturate(0.5)';
  drawLayered(ctx, hero.x, hero.y - (fury ? 6 : 0) - 6 * heroScale, 40 * heroScale, heroLook, (c) =>
    drawSprite(c, hero.def.id, hero.x, hero.y - (fury ? 6 : 0), heroScale, {
      palette: hero.palette,
      time,
      facing: hero.facing,
      moving: hero.moving,
      attack: attackStrength(state, hero.lastAttackAt),
    }),
  );
  ctx.restore();
  if (hero.shieldTimer > 0) {
    // invulnerável ao nascer: bolha dourada que pisca no último segundo
    const blink = hero.shieldTimer > 1 || Math.sin(time * 24) > 0;
    if (blink) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(time * 5) * 0.12;
      halo(ctx, hero.x, hero.y - 6, 30, '#ffe08a', 0.5);
      ctx.strokeStyle = '#ffe9a8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hero.x, hero.y - 6, 21, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
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
  if (pool.look === 'crack') {
    drawCrack(ctx, pool, time, fade);
    return;
  }
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

/** Trecho da Fenda Sísmica: chão aberto na direção do golpe, magma no fundo e lascas de pedra nas bordas. */
function drawCrack(ctx: CanvasRenderingContext2D, pool: Pool, time: number, fade: number): void {
  const angle = pool.angle ?? 0;
  const half = (pool.span ?? 18) * 0.62; // trechos se sobrepõem: a fenda fica contínua
  // mais larga perto do herói, afina na ponta; abre rápido no começo
  const opened = Math.min(1, (pool.duration - pool.remaining) / 0.12);
  const width = pool.radius * (1.6 - (pool.along ?? 0.5) * 0.7) * opened;
  const seed = Math.round(pool.x * 7 + pool.y * 13);
  const jag = (k: number) => ((Math.sin(seed * 0.37 + k * 2.1) + 1) / 2) * 0.5 + 0.5;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(pool.x, pool.y + 6);
  ctx.scale(1, 0.75);
  ctx.rotate(angle);
  // brilho de magma vazando
  if (fade > 0.3) {
    ctx.fillStyle = '#ff7a2a22';
    ctx.beginPath();
    ctx.ellipse(0, 0, half + 8, width * 1.3, 0, 0, TAU);
    ctx.fill();
  }
  // sombra do chão afundado
  ctx.fillStyle = '#00000055';
  ctx.beginPath();
  ctx.ellipse(0, 0, half + 4, width * 0.95, 0, 0, TAU);
  ctx.fill();
  // contorno recortado (borda de cima e de baixo)
  const edge = (side: number, scale: number) => {
    ctx.moveTo(-half, 0);
    ctx.lineTo(-half * 0.45, side * width * scale * jag(side + 1));
    ctx.lineTo(0, side * width * scale * 0.55 * jag(side + 2));
    ctx.lineTo(half * 0.5, side * width * scale * jag(side + 3));
    ctx.lineTo(half, 0);
  };
  // lábios de pedra levantados
  ctx.fillStyle = '#6a4a32';
  ctx.beginPath();
  edge(-1, 0.75);
  edge(1, 0.75);
  ctx.fill();
  // fundo escuro
  ctx.fillStyle = '#140a06';
  ctx.beginPath();
  edge(-1, 0.52);
  edge(1, 0.52);
  ctx.fill();
  // magma pulsando no fundo
  const glow = 0.55 + 0.45 * Math.sin(time * 6 + seed);
  ctx.fillStyle = `rgba(255, ${Math.round(110 + glow * 70)}, 40, ${0.55 + glow * 0.35})`;
  ctx.beginPath();
  edge(-1, 0.3);
  edge(1, 0.3);
  ctx.fill();
  // lascas de pedra soltas nas bordas
  ctx.fillStyle = '#8a6a4a';
  for (const side of [-1, 1]) {
    const x = (jag(side * 5) - 0.75) * half * 2;
    const y = side * width * 0.82;
    ctx.beginPath();
    ctx.moveTo(x - 3, y);
    ctx.lineTo(x, y - side * 3.5);
    ctx.lineTo(x + 3, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Raio da aura do Alfa (discreto). */
/**
 * Auras no chão (Alfa, bênçãos da Clériga, Encantadora, Guardião, Unicórnio...): área suave, borda com
 * tracejado girando; auras que ferem (dps) pulsam ondas para fora e soltam faíscas.
 */
function drawAuraRing(ctx: CanvasRenderingContext2D, creature: Creature, time: number): void {
  const ability = creatureAbility(creature);
  if (ability.kind !== 'aura' && ability.kind !== 'bless') return;
  const radius = ability.radius;
  const color = ascendedForm(creature)?.color ?? creature.def.color;
  const harmful = ability.kind === 'bless' && (ability.dps ?? 0) > 0;
  const tint = harmful ? '#ff8a4a' : color;
  ctx.save();
  ctx.translate(creature.x, creature.y + 12);
  ctx.scale(1, 0.5);
  // área preenchida: transparente no centro, mais forte perto da borda
  const fill = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  fill.addColorStop(0, withAlpha(tint, 0));
  fill.addColorStop(0.75, withAlpha(tint, harmful ? 0.12 : 0.08));
  fill.addColorStop(1, withAlpha(tint, harmful ? 0.22 : 0.16));
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fill();
  // borda nítida e tracejado girando por cima
  ctx.strokeStyle = withAlpha(tint, 0.45 + Math.sin(time * 3 + creature.x) * 0.1);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = withAlpha(tint, 0.85);
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 14]);
  ctx.lineDashOffset = -time * 14;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  if (harmful) {
    // ondas que saem do centro: a aura fere quem está dentro
    for (let i = 0; i < 2; i++) {
      const t = (time * 0.9 + i / 2) % 1;
      ctx.strokeStyle = withAlpha('#ffb07a', (1 - t) * 0.55);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, radius * t, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
  if (harmful) {
    // faíscas subindo dentro da área
    for (let i = 0; i < 4; i++) {
      const phase = (time * 0.7 + i / 4 + creature.x * 0.01) % 1;
      const a = i * 1.9 + creature.y;
      const r = radius * (0.3 + 0.6 * ((i * 0.37) % 1));
      halo(ctx, creature.x + Math.cos(a) * r, creature.y + 12 + Math.sin(a) * r * 0.5 - phase * 14, 3, '#ffd08a', 1 - phase);
    }
  }
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
    facing: placement.at.x > state.nexus.x ? -1 : 1,
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

/** Praga da Bruxa do Brejo: espirais verdes e uma caveirinha sobre a criatura. */
function drawCurse(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number, time: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#9aff5a';
  ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) {
    const a = time * 3 + (k * TAU) / 3;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 9, y + Math.sin(a) * 4, 2, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = '#caff9a';
  ctx.beginPath();
  ctx.arc(x, y - 16, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#1a2a10';
  ctx.fillRect(x - 1.8, y - 17, 1.2, 1.2);
  ctx.fillRect(x + 0.6, y - 17, 1.2, 1.2);
  ctx.restore();
}

/** Variante Lendária: faíscas douradas girando ao redor da criatura. */

/** Fogueira: bacia de pedra; acesa, chama e círculo de calor; apagada, anel de progresso do herói. */
function drawInteractable(
  ctx: CanvasRenderingContext2D,
  o: RunState['interactables'][number],
  time: number,
  storm: boolean,
): void {
  const { x, y } = o;
  if (o.lit && storm) {
    // área protegida da nevasca
    ctx.strokeStyle = 'rgba(255, 170, 80, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y, o.radius, o.radius * 0.72, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#3a3448';
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(x, y, 10, 4.5, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#5a5470';
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 1);
  ctx.lineTo(x - 6, y - 8);
  ctx.lineTo(x + 6, y - 8);
  ctx.lineTo(x + 9, y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (o.lit) {
    const flick = Math.sin(time * 12) * 1.5;
    const glow = ctx.createRadialGradient(x, y - 12, 1, x, y - 12, 26);
    glow.addColorStop(0, '#ffd27a99');
    glow.addColorStop(1, '#ff8a3a00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 12, 26, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ff8a3a';
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 8);
    ctx.quadraticCurveTo(x - 4, y - 18 - flick, x, y - 24 - flick);
    ctx.quadraticCurveTo(x + 4, y - 18 + flick, x + 5, y - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe08a';
    ctx.beginPath();
    ctx.ellipse(x, y - 12, 2.5, 4.5, 0, 0, TAU);
    ctx.fill();
  } else {
    // fumaça e anel de progresso (herói perto reacende)
    ctx.fillStyle = 'rgba(160, 160, 180, 0.35)';
    ctx.beginPath();
    ctx.arc(x + Math.sin(time * 2) * 2, y - 14 - ((time * 8) % 8), 3, 0, TAU);
    ctx.fill();
    if (o.progress > 0) {
      ctx.strokeStyle = '#ffd27a';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(x, y - 12, 12, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, o.progress / INTERACT.time));
      ctx.stroke();
    }
  }
}

/** Nevasca: véu branco e flocos na tela inteira (espaço da tela). */
/** Portal do Céu: em aviso, círculo pulsando com contagem; aberto, redemoinho de luz; anel dourado ao selar. */
function drawPortal(ctx: CanvasRenderingContext2D, p: RunState['portals'][number], time: number, sealTime: number, warning: number): void {
  ctx.save();
  if (p.warn > 0) {
    const k = 1 - p.warn / warning;
    ctx.strokeStyle = `rgba(200, 160, 255, ${0.4 + 0.4 * Math.abs(Math.sin(time * 6))})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.lineDashOffset = -time * 20;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 30, 13, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(150, 100, 255, ${0.15 + k * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 30 * k, 13 * k, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#f4ecff';
    ctx.font = '700 14px Cinzel, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(Math.ceil(p.warn)), p.x, p.y - 18);
    ctx.restore();
    return;
  }
  // redemoinho: fenda vertical de luz com anéis girando
  halo(ctx, p.x, p.y - 18, 40, '#a87aff', 0.55);
  ctx.fillStyle = '#2a0a5a';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, 28, 12, 0, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = i === 1 ? '#ffe7a8' : '#c8a0ff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 26 - i * 7, 11 - i * 3, 0, time * (2 + i) , time * (2 + i) + Math.PI * 1.4);
    ctx.stroke();
  }
  const rift = ctx.createLinearGradient(p.x, p.y - 46, p.x, p.y);
  rift.addColorStop(0, 'rgba(200, 170, 255, 0)');
  rift.addColorStop(1, 'rgba(230, 210, 255, 0.85)');
  ctx.fillStyle = rift;
  ctx.beginPath();
  ctx.moveTo(p.x - 4 - Math.sin(time * 5) * 2, p.y);
  ctx.quadraticCurveTo(p.x, p.y - 30, p.x, p.y - 46);
  ctx.quadraticCurveTo(p.x, p.y - 30, p.x + 4 + Math.sin(time * 5) * 2, p.y);
  ctx.closePath();
  ctx.fill();
  // progresso de selar
  if (p.seal > 0) {
    ctx.strokeStyle = '#ffd25a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 34, 15, 0, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, p.seal / sealTime));
    ctx.stroke();
  }
  ctx.restore();
}

/** Rajadas de vento atravessando o mapa na direção do vento (Fase 5). */
function drawWind(ctx: CanvasRenderingContext2D, angle: number, time: number, map: { width: number; height: number }): void {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  ctx.save();
  ctx.strokeStyle = '#6a58b0';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 34; i++) {
    const seed = i * 7.31;
    const t = (time * 0.35 + (seed % 1)) % 1;
    const span = Math.hypot(map.width, map.height);
    // linha de base perpendicular ao vento, espalhada pelo mapa
    const px = map.width / 2 + -dy * ((((seed * 97) % 1) - 0.5) * span) + dx * (t - 0.5) * span;
    const py = map.height / 2 + dx * ((((seed * 97) % 1) - 0.5) * span) + dy * (t - 0.5) * span;
    if (px < -40 || py < -40 || px > map.width + 40 || py > map.height + 40) continue;
    ctx.globalAlpha = Math.sin(t * Math.PI) * 0.45;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - dx * 34, py - dy * 34);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBlizzard(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.save();
  ctx.fillStyle = 'rgba(220, 235, 255, 0.18)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < 90; i++) {
    const fx = (i * 73.7 + time * (60 + (i % 5) * 25)) % (ARENA.width + 40) - 20;
    const fy = (i * 41.3 + time * (90 + (i % 7) * 18)) % (ARENA.height + 40) - 20;
    ctx.beginPath();
    ctx.arc(fx, fy, 0.8 + (i % 3) * 0.5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** Tempestade de areia: névoa alaranjada e rajadas de areia na horizontal (presas à tela). */
function drawSandstorm(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.save();
  ctx.fillStyle = 'rgba(214, 160, 90, 0.32)';
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
  ctx.strokeStyle = 'rgba(255, 230, 180, 0.55)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 70; i++) {
    const x = (i * 97.3 + time * (220 + (i % 6) * 40)) % (ARENA.width + 80) - 40;
    const y = (i * 37.7) % ARENA.height + Math.sin(time * 2 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10 + (i % 4) * 5, y + 1);
    ctx.stroke();
  }
  ctx.restore();
}

/** Lago: rachaduras onde o gelo cansou e buracos de água escura (fecham aos poucos). */
function drawIce(ctx: CanvasRenderingContext2D, state: RunState, time: number): void {
  const terrain = STAGES[state.stage].terrain;
  const g = state.ice;
  if (terrain?.kind !== 'ice' || !g) return;
  const size = terrain.cell;
  for (let i = 0; i < g.holes.length; i++) {
    const x = g.x0 + ((i % g.cols) + 0.5) * size;
    const y = g.y0 + (Math.floor(i / g.cols) + 0.5) * size;
    const hole = g.holes[i]!;
    if (hole > 0) {
      const closing = Math.min(1, hole / 3);
      ctx.fillStyle = `rgba(14, 40, 70, ${0.85 * closing})`;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.55, size * 0.4, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `rgba(200, 236, 255, ${0.8 * closing})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = `rgba(120, 190, 230, ${0.4 * closing})`;
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(time * 2 + i) * 2, y, size * 0.3, size * 0.18, 0, 0, TAU);
      ctx.stroke();
      continue;
    }
    const stress = g.stress[i]! / terrain.crackAt;
    if (stress < 0.35) continue;
    // rachaduras crescem com o cansaço
    ctx.strokeStyle = `rgba(90, 140, 190, ${0.25 + stress * 0.55})`;
    ctx.lineWidth = 0.8 + stress;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + i;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * size * 0.5 * stress, y + Math.sin(a) * size * 0.4 * stress);
    }
    ctx.stroke();
  }
}

/** Aviso da avalanche: a trilha pisca em vermelho antes de descer. */
function drawAvalancheWarning(ctx: CanvasRenderingContext2D, state: RunState, time: number): void {
  const a = state.avalanche;
  if (!a || a.t >= a.delay) return;
  const path = STAGES[state.stage].entrances?.[a.entrance]?.path;
  if (!path) return;
  ctx.save();
  ctx.strokeStyle = `rgba(255, 90, 90, ${0.25 + 0.25 * Math.sin(time * 10)})`;
  ctx.lineWidth = a.width * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

/** Avalanche descendo: massa de neve com nuvem de pó. */
function drawAvalanche(ctx: CanvasRenderingContext2D, state: RunState, time: number): void {
  const at = avalanchePosition(state);
  const a = state.avalanche;
  if (!at || !a) return;
  for (let k = 0; k < 14; k++) {
    const ang = (k / 14) * TAU + time * 3;
    const r = a.width * (0.5 + 0.4 * Math.sin(time * 7 + k));
    ctx.fillStyle = k % 2 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(210, 228, 245, 0.85)';
    ctx.beginPath();
    ctx.arc(at.x + Math.cos(ang) * r * 0.6, at.y + Math.sin(ang) * r * 0.45, a.width * 0.45, 0, TAU);
    ctx.fill();
  }
}

/** Criatura congelada: bloco de gelo translúcido. */
function drawFrozenBlock(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = 'rgba(180, 225, 255, 0.45)';
  ctx.strokeStyle = 'rgba(230, 248, 255, 0.9)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 13, y + 18);
  ctx.lineTo(x - 15, y - 12);
  ctx.lineTo(x - 4, y - 22);
  ctx.lineTo(x + 12, y - 16);
  ctx.lineTo(x + 15, y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 10);
  ctx.lineTo(x - 5, y - 16);
  ctx.stroke();
}

/** Senhor dos Mortos: caveirinhas nos corpos que o próximo Pulso vai erguer (somem com o tempo). */
function drawRaisableCorpses(ctx: CanvasRenderingContext2D, state: RunState, time: number): void {
  const corpses = raisableCorpses(state);
  if (!corpses.length) return;
  const ready = state.pulse.remaining <= 0;
  for (const c of corpses) {
    const left = 1 - (state.time - c.at) / CORPSE_LIFE;
    ctx.globalAlpha = Math.min(1, left * 2) * (ready ? 0.9 : 0.5);
    const bob = Math.sin(time * 4 + c.x) * 1.2;
    ctx.fillStyle = 'rgba(122, 255, 176, 0.25)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 6, 8, 3, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#e8f0e4';
    ctx.beginPath();
    ctx.arc(c.x, c.y - 2 + bob, 3.6, 0, TAU);
    ctx.fill();
    ctx.fillRect(c.x - 2, c.y + 0.5 + bob, 4, 2.2);
    ctx.fillStyle = '#1a2a20';
    ctx.fillRect(c.x - 2.2, c.y - 3 + bob, 1.6, 1.6);
    ctx.fillRect(c.x + 0.6, c.y - 3 + bob, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
}
