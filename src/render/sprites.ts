import type { CreatureId } from '../data/creatures';
import type { EnemyId } from '../data/enemies';
import type { HeroId } from '../data/heroes';
import {
  ascended,
  formA,
  formB,
  blush,
  circle,
  ellipse,
  eye,
  glowingEye,
  GOLD,
  line,
  OUTLINE,
  poly,
  radial,
  shape,
  skin,
  TAU,
  vertical,
  walk,
  type Ctx,
  type SpritePose,
} from './spriteKit';
import {
  drawAlpha,
  drawBanshee,
  drawCauldron,
  drawHaunt,
  drawHowler,
  drawHunter,
  drawLycan,
  drawSorceress,
  drawSpecter,
  drawWitch,
} from './spritesMystic';
import {
  drawDarkBanshee,
  drawGargoyle,
  drawHeadless,
  drawLich,
  drawNecromancer,
  drawSkeletonArcher,
  drawSlime,
  drawSpider,
} from './spritesEnemies';
import { drawBatSwarm, drawCleric, drawHerbalist, drawPossessor } from './spritesClasses';
import { drawArchdemon, drawImp, drawInfernal, drawSuccubus } from './spritesDemon';
import { drawBasilisk, drawGorgonQueen, drawMedusa, drawSerpentArcher } from './spritesGorgon';
import { drawDeathLord, drawDrainer, drawReaper, drawSkeletonWarrior } from './spritesNecro';
import { drawColossus, drawCrystalGolem, drawMagmaGolem, drawWall } from './spritesGolem';
import { drawEnchantress, drawFaeQueen, drawLumina, drawTrickster } from './spritesFae';

export type SpriteId = HeroId | CreatureId | EnemyId;
export type { SpritePose };

/**
 * Desenha um personagem vetorial com os pés em (x, y + 14 × scale).
 * O desenho base olha para a direita e tem cerca de 40 unidades de altura.
 */
export function drawSprite(ctx: Ctx, id: SpriteId, x: number, y: number, scale: number, pose: SpritePose): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (pose.facing ?? 1), scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const p: Required<SpritePose> = { facing: 1, attack: 0, moving: false, level: 1, branch: 0, palette: {}, ...pose };
  switch (id) {
    case 'knight':
      drawHero(ctx, p);
      break;
    case 'vampireLord':
      drawVampireLord(ctx, p);
      break;
    case 'draconian':
      drawDraconian(ctx, p);
      break;
    case 'lycan':
      drawLycan(ctx, p);
      break;
    case 'specter':
      drawSpecter(ctx, p);
      break;
    case 'witch':
      drawWitch(ctx, p);
      break;
    case 'hunter':
      drawHunter(ctx, p);
      break;
    case 'alpha':
      drawAlpha(ctx, p);
      break;
    case 'haunt':
      drawHaunt(ctx, p);
      break;
    case 'banshee':
      drawBanshee(ctx, p);
      break;
    case 'sorceress':
      drawSorceress(ctx, p);
      break;
    case 'cauldron':
      drawCauldron(ctx, p);
      break;
    case 'archer':
      drawArcher(ctx, p);
      break;
    case 'guard':
      drawGuard(ctx, p);
      break;
    case 'duelist':
      drawVampire(ctx, p);
      break;
    case 'sanguine':
      drawBloodMage(ctx, p);
      break;
    case 'fireDragon':
      drawDragon(ctx, p, formB(p) ? INFERNAL_WYRM : FIRE_DRAGON);
      break;
    case 'iceDragon':
      drawDragon(ctx, p, formB(p) ? FROZEN_DRAGON : ICE_DRAGON);
      break;
    case 'storm':
      drawDragon(ctx, p, formB(p) ? TEMPEST_DRAGON : formA(p) ? THUNDER_DRAGON : STORM_DRAGON);
      break;
    case 'howler':
      drawHowler(ctx, p);
      break;
    case 'cleric':
      drawCleric(ctx, p);
      break;
    case 'imp':
      drawImp(ctx, p);
      break;
    case 'succubus':
      drawSuccubus(ctx, p);
      break;
    case 'infernal':
      drawInfernal(ctx, p);
      break;
    case 'archdemon':
      drawArchdemon(ctx, p);
      break;
    case 'serpentArcher':
      drawSerpentArcher(ctx, p);
      break;
    case 'medusa':
      drawMedusa(ctx, p);
      break;
    case 'basilisk':
      drawBasilisk(ctx, p);
      break;
    case 'gorgonQueen':
      drawGorgonQueen(ctx, p);
      break;
    case 'skeletonWarrior':
      drawSkeletonWarrior(ctx, p);
      break;
    case 'boneWarrior':
      drawSkeletonWarrior(ctx, p, true);
      break;
    case 'reaper':
      drawReaper(ctx, p);
      break;
    case 'drainer':
      drawDrainer(ctx, p);
      break;
    case 'deathLord':
      drawDeathLord(ctx, p);
      break;
    case 'stoneWall':
      drawWall(ctx, p);
      break;
    case 'crystalGolem':
      drawCrystalGolem(ctx, p);
      break;
    case 'magmaGolem':
      drawMagmaGolem(ctx, p);
      break;
    case 'colossus':
      drawColossus(ctx, p);
      break;
    case 'enchantress':
      drawEnchantress(ctx, p);
      break;
    case 'trickster':
      drawTrickster(ctx, p);
      break;
    case 'lumina':
      drawLumina(ctx, p);
      break;
    case 'faeQueen':
      drawFaeQueen(ctx, p);
      break;
    case 'batSwarm':
      drawBatSwarm(ctx, p);
      break;
    case 'possessor':
      drawPossessor(ctx, p);
      break;
    case 'herbalist':
      drawHerbalist(ctx, p);
      break;
    case 'zombie':
      drawZombie(ctx, p);
      break;
    case 'bat':
      drawBat(ctx, p);
      break;
    case 'ogre':
      drawOgre(ctx, p, false);
      break;
    case 'ogreKing':
      drawOgre(ctx, p, true);
      break;
    case 'skeletonArcher':
      drawSkeletonArcher(ctx, p);
      break;
    case 'slime':
    case 'slimeling':
      drawSlime(ctx, p);
      break;
    case 'spider':
      drawSpider(ctx, p, false);
      break;
    case 'spiderQueen':
      drawSpider(ctx, p, true);
      break;
    case 'gargoyle':
      drawGargoyle(ctx, p);
      break;
    case 'headless':
      drawHeadless(ctx, p);
      break;
    case 'darkBanshee':
      drawDarkBanshee(ctx, p);
      break;
    case 'necromancer':
      drawNecromancer(ctx, p);
      break;
    case 'lich':
      drawLich(ctx, p);
      break;
  }
  ctx.restore();
}

/** Sombra elíptica no chão, sob os pés. */
export function drawShadow(ctx: Ctx, x: number, y: number, width: number): void {
  ctx.fillStyle = '#05020a88';
  ctx.beginPath();
  ctx.ellipse(x, y, width, width * 0.32, 0, 0, TAU);
  ctx.fill();
}

// ---------- herói ----------

function drawHero(ctx: Ctx, p: Required<SpritePose>): void {
  const step = walk(p);
  const bob = p.moving ? Math.abs(step) * -1.2 : Math.sin(p.time * 2.5) * 0.5;
  const sway = Math.sin(p.time * 3) * 1.5 + step * 2;

  // capa
  shape(ctx, vertical(ctx, -8, 12, skin(p, 'cape', '#3a4fa8'), skin(p, 'capeDark', '#1d2763')), () =>
    poly(ctx, [-6, -7 + bob, 5, -7 + bob, 2, 11, -6 - sway, 13, -12 - sway, 10]),
  );
  // pernas
  shape(ctx, '#3a2a22', () => ctx.roundRect(-5 + step * 2, 6, 4, 8, 1.5));
  shape(ctx, '#3a2a22', () => ctx.roundRect(1 - step * 2, 6, 4, 8, 1.5));
  // túnica
  shape(ctx, vertical(ctx, -8, 9, skin(p, 'tunic', '#7d9be8'), skin(p, 'tunicDark', '#3c55b0')), () =>
    ctx.roundRect(-7, -8 + bob, 14, 16 - bob, [5, 5, 3, 3]),
  );
  shape(ctx, '#5a3a24', () => ctx.rect(-7, 2 + bob * 0.5, 14, 2.6), 1);
  shape(ctx, '#f0c35a', () => ctx.rect(-1.5, 1.8 + bob * 0.5, 3, 3), 0.8);
  // cachecol
  shape(ctx, skin(p, 'scarf', '#4fd2e8'), () => ctx.roundRect(-6, -9 + bob, 12, 3.5, 1.5), 1);
  shape(ctx, skin(p, 'scarfDark', '#3ab0c8'), () => poly(ctx, [-5, -7 + bob, -9 - sway * 0.6, -3 + bob, -6, -2 + bob]), 1);

  // espada: baixa e à frente no repouso; no golpe sobe acima da cabeça e corta para baixo
  ctx.save();
  ctx.translate(7, 1 + bob);
  ctx.rotate(2.2 - p.attack * 2);
  line(ctx, '#e8f0ff', 2.6, () => {
    ctx.moveTo(0, -2);
    ctx.lineTo(0, -19);
  });
  shape(ctx, '#f0c35a', () => ctx.roundRect(-3.5, -3, 7, 2.2, 1), 1);
  shape(ctx, '#7a4a2a', () => ctx.roundRect(-1.2, -1, 2.4, 4, 1), 1);
  ctx.restore();
  shape(ctx, '#f2cfae', () => circle(ctx, 7, 1 + bob, 2.4), 1);

  // cabeça
  const hy = -16 + bob;
  shape(ctx, radial(ctx, 0, hy, 8.5, '#ffe6cf', '#e9b994'), () => circle(ctx, 0, hy, 8.5));
  shape(ctx, vertical(ctx, hy - 9, hy, skin(p, 'hair', '#8a5230'), skin(p, 'hairDark', '#5e3420')), () => {
    ctx.moveTo(-8.6, hy + 1);
    ctx.quadraticCurveTo(-9, hy - 10, 1, hy - 9.5);
    ctx.quadraticCurveTo(9.5, hy - 9, 8.6, hy - 2);
    ctx.quadraticCurveTo(4, hy - 6, 2, hy - 3);
    ctx.quadraticCurveTo(-2, hy - 6, -5, hy - 2);
    ctx.quadraticCurveTo(-6, hy, -8.6, hy + 1);
  });
  eye(ctx, 1.2, hy + 0.5, 2.1, '#3a6ad8');
  eye(ctx, 5.6, hy + 0.5, 2.1, '#3a6ad8');
  blush(ctx, -1.5, hy + 3.6);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(4, hy + 3.6, 1.4, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

// ---------- nobre vampiro (herói) ----------

function drawVampireLord(ctx: Ctx, p: Required<SpritePose>): void {
  const step = walk(p);
  const bob = p.moving ? Math.abs(step) * -1.2 : Math.sin(p.time * 2.2) * 0.5;
  const sway = Math.sin(p.time * 3) * 1.5 + step * 2.5;

  // capa longa com forro vermelho
  shape(ctx, vertical(ctx, -9, 14, skin(p, 'cape', '#2a1440'), skin(p, 'capeDark', '#0e0618')), () =>
    poly(ctx, [-6, -8 + bob, 6, -8 + bob, 9, 14, -2 - sway, 12, -14 - sway, 14]),
  );
  shape(ctx, vertical(ctx, -6, 12, skin(p, 'lining', '#c8203a'), skin(p, 'liningDark', '#5e0a1a')), () => poly(ctx, [-5, -6 + bob, -12 - sway, 12, -4 - sway, 10]), 0);
  // pernas e sobretudo
  shape(ctx, '#140a20', () => ctx.roundRect(-4.5 + step * 2, 6, 4, 8, 1.5));
  shape(ctx, '#140a20', () => ctx.roundRect(0.5 - step * 2, 6, 4, 8, 1.5));
  shape(ctx, vertical(ctx, -8, 9, skin(p, 'coat', '#4a2a6a'), skin(p, 'coatDark', '#24123a')), () => ctx.roundRect(-6.5, -8 + bob, 13, 16 - bob, [4, 4, 2, 2]));
  shape(ctx, '#f4eef8', () => poly(ctx, [-2.2, -8 + bob, 2.2, -8 + bob, 0, -2 + bob]), 0.8);
  shape(ctx, GOLD, () => ctx.rect(-6.5, 2 + bob * 0.5, 13, 1.6), 0.6);

  // rapieira: estoca no ataque
  const thrust = p.attack * 8;
  line(ctx, '#dfe6f4', 1.4, () => {
    ctx.moveTo(6, 0 + bob);
    ctx.lineTo(17 + thrust, -6 + bob - thrust * 0.2);
  });
  shape(ctx, GOLD, () => circle(ctx, 6.5, 0 + bob, 2), 0.8);

  // cabeça, cabelo, cartola
  const hy = -16 + bob;
  shape(ctx, radial(ctx, 0, hy, 8, '#fbf6ff', '#cdbfe0'), () => circle(ctx, 0, hy, 8));
  shape(ctx, '#140a20', () => {
    ctx.moveTo(-8.2, hy + 1);
    ctx.quadraticCurveTo(-8.5, hy - 7, 0, hy - 7.5);
    ctx.quadraticCurveTo(8.5, hy - 7, 8.2, hy + 1);
    ctx.lineTo(5, hy - 3);
    ctx.lineTo(1.5, hy - 1);
    ctx.lineTo(-2, hy - 4);
    ctx.closePath();
  });
  shape(ctx, skin(p, 'hat', '#140a20'), () => ctx.roundRect(-7, hy - 9.5, 14, 2.5, 1));
  shape(ctx, skin(p, 'hat', '#1e1030'), () => ctx.roundRect(-4.5, hy - 19, 9, 10, 1.5));
  shape(ctx, skin(p, 'hatBand', '#c8203a'), () => ctx.rect(-4.5, hy - 12, 9, 2), 0.6);
  glowingEye(ctx, 1.6, hy + 0.8, 1.4, '#ff3048');
  glowingEye(ctx, 5.2, hy + 0.8, 1.4, '#ff3048');
  shape(ctx, '#ffffff', () => poly(ctx, [2.5, hy + 4.4, 3.4, hy + 4.4, 3, hy + 6]), 0.4);
  shape(ctx, '#ffffff', () => poly(ctx, [4.4, hy + 4.4, 5.3, hy + 4.4, 4.9, hy + 6]), 0.4);
}

// ---------- draconato (herói) ----------

function drawDraconian(ctx: Ctx, p: Required<SpritePose>): void {
  const step = walk(p, 10);
  const bob = p.moving ? Math.abs(step) * -1 : Math.sin(p.time * 2) * 0.5;
  const tail = Math.sin(p.time * 3) * 2;
  const flap = Math.sin(p.time * 5) * 0.15;

  // cauda e asinhas nas costas
  shape(ctx, skin(p, 'bodyDark', '#8a2418'), () => {
    ctx.moveTo(-4, 6);
    ctx.quadraticCurveTo(-14, 10, -17, 3 + tail);
    ctx.quadraticCurveTo(-12, 8, -3, 10);
    ctx.closePath();
  });
  shape(ctx, '#f0c35a', () => poly(ctx, [-17, 3 + tail, -21, 0 + tail, -18, 6 + tail]), 1);
  ctx.save();
  ctx.translate(-3, -6 + bob);
  ctx.rotate(-0.3 + flap);
  shape(ctx, skin(p, 'wing', '#c8402a'), () => poly(ctx, [0, 0, -12, -10, -13, -2, -8, 2]));
  ctx.restore();
  // pernas
  shape(ctx, skin(p, 'bodyDark', '#5a1810'), () => ctx.roundRect(-5 + step * 2, 6, 4.5, 8, 2));
  shape(ctx, skin(p, 'bodyDark', '#5a1810'), () => ctx.roundRect(0.5 - step * 2, 6, 4.5, 8, 2));
  // corpo escamado com peitoral
  shape(ctx, radial(ctx, 0, 0 + bob, 10, skin(p, 'body', '#d8452a'), skin(p, 'bodyDark', '#7a1a10')), () => ctx.roundRect(-7, -9 + bob, 14, 17, [5, 5, 4, 4]));
  shape(ctx, skin(p, 'belly', '#f0c890'), () => ctx.roundRect(-3, -7 + bob, 7, 13, 3), 1);
  // cinto e ombreira de bronze
  shape(ctx, '#3a1a10', () => ctx.rect(-7, 3 + bob, 14, 2.4), 0.8);
  shape(ctx, GOLD, () => ctx.rect(-1.2, 2.8 + bob, 2.4, 2.8), 0.6);
  shape(ctx, vertical(ctx, -10, -4, skin(p, 'armor', '#ffe07a'), skin(p, 'armorDark', '#b8801a')), () => ellipse(ctx, -4, -7 + bob, 4.5, 3), 1);
  ctx.strokeStyle = '#c8803a';
  ctx.lineWidth = 0.7;
  for (const y of [-4, -1, 2]) {
    ctx.beginPath();
    ctx.moveTo(-2.5, y + bob);
    ctx.lineTo(3.5, y + bob);
    ctx.stroke();
  }
  // braço com garras
  shape(ctx, skin(p, 'wing', '#c8402a'), () => circle(ctx, 7, 1 + bob, 2.6), 1);

  // cabeça de dragão: focinho, chifres, olhos
  const hy = -16 + bob;
  shape(ctx, '#fff0d0', () => poly(ctx, [-3, hy - 5, -10, hy - 12, -1, hy - 8]), 1);
  shape(ctx, '#fff0d0', () => poly(ctx, [1, hy - 7, -2, hy - 15, 4, hy - 8]), 1);
  shape(ctx, radial(ctx, 1, hy, 8.5, skin(p, 'body', '#d8452a'), skin(p, 'bodyDark', '#7a1a10')), () => circle(ctx, 1, hy, 8));
  shape(ctx, radial(ctx, 8, hy + 2, 5, skin(p, 'body', '#d8452a'), skin(p, 'bodyDark', '#9a2a18')), () => ellipse(ctx, 7.5, hy + 2.5, 5, 3.6));
  ctx.fillStyle = '#5a1a0a';
  ctx.beginPath();
  circle(ctx, 11, hy + 1.5, 0.7);
  ctx.fill();
  if (p.attack > 0.3) {
    ctx.save();
    ctx.shadowColor = '#ffb040';
    ctx.shadowBlur = 10;
    shape(ctx, '#ffb040', () => circle(ctx, 13, hy + 3.5, 1 + p.attack * 2), 0);
    ctx.restore();
  }
  eye(ctx, 3, hy - 1.5, 2.6, '#e0a020', 0.3);
}

// ---------- arqueiro (humano) ----------

function drawArcher(ctx: Ctx, p: Required<SpritePose>): void {
  const breathe = Math.sin(p.time * 2.2) * 0.6;
  // Atirador de Elite: capuz carmesim, arco longo escuro, pena e lente
  const elite = formB(p);
  const pull = p.attack > 0.5 ? 0 : 1 - p.attack * 2; // após o tiro, a corda volta a ser puxada

  // aljava nas costas
  ctx.save();
  ctx.translate(-6, -3);
  ctx.rotate(-0.35);
  shape(ctx, '#8a5a32', () => ctx.roundRect(-2.5, -8, 5, 14, 2), 1);
  for (const dx of [-1.2, 1.2]) shape(ctx, '#e8e0d0', () => poly(ctx, [dx - 1.2, -8, dx + 1.2, -8, dx, -12]), 0.8);
  ctx.restore();

  // manto
  shape(ctx, vertical(ctx, -10, 14, elite ? '#a8323c' : '#3f9a5c', elite ? '#4a1018' : '#1d5530'), () =>
    poly(ctx, [-1, -9 + breathe, 8, 7, 9, 14, -9, 14, -8, 7]),
  );
  shape(ctx, '#2b2018', () => ctx.rect(-6, 3, 12, 2.2), 0.8);

  // capuz e rosto
  const hy = -14 + breathe;
  if (elite) {
    // pena vermelha presa no capuz
    shape(ctx, vertical(ctx, hy - 20, hy - 6, '#ff6a5a', '#a01a2a'), () => {
      ctx.moveTo(-7, hy - 8);
      ctx.quadraticCurveTo(-16, hy - 16, -13, hy - 22);
      ctx.quadraticCurveTo(-8, hy - 15, -4, hy - 9);
      ctx.closePath();
    }, 0.9);
  }
  shape(ctx, vertical(ctx, hy - 10, hy + 8, elite ? '#c0444e' : '#4fb06c', elite ? '#6a1a22' : '#2a7040'), () => {
    ctx.moveTo(-8, hy + 6);
    ctx.quadraticCurveTo(-11, hy - 6, -4, hy - 9);
    ctx.lineTo(-11, hy - 14);
    ctx.quadraticCurveTo(4, hy - 13, 8.5, hy - 3);
    ctx.quadraticCurveTo(9, hy + 4, 6, hy + 7);
    ctx.closePath();
  });
  shape(ctx, '#1a2a1e', () => ellipse(ctx, 2.5, hy + 0.5, 5.6, 5.4), 0);
  shape(ctx, radial(ctx, 3, hy + 1, 5, '#ffe2c8', '#e2b08a'), () => ellipse(ctx, 3, hy + 1.2, 4.6, 4.5), 0);
  if (formA(p)) shape(ctx, GOLD, () => ctx.roundRect(-6, hy - 5.5, 13, 2.2, 1), 0.8);
  eye(ctx, 1.6, hy + 0.6, 1.6, elite ? '#8a2a2a' : '#3a7a3a', 0.4);
  eye(ctx, 5, hy + 0.6, 1.6, elite ? '#8a2a2a' : '#3a7a3a', 0.4);
  if (elite) {
    // lente de mira sobre o olho da frente
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(7.2, hy + 0.2);
    ctx.lineTo(9, hy - 2);
    ctx.stroke();
    shape(ctx, '#bfe8ff66', () => circle(ctx, 5, hy + 0.6, 2.5), 0);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    circle(ctx, 5, hy + 0.6, 2.5);
    ctx.stroke();
  }
  blush(ctx, 0.5, hy + 3.4);

  // arco
  const bx = 5;
  const by = elite ? -3 : -2;
  const r = elite ? 15 : 12;
  const top = { x: bx + r * Math.cos(-1.2), y: by + r * Math.sin(-1.2) };
  const bottom = { x: bx + r * Math.cos(1.2), y: by + r * Math.sin(1.2) };
  const nock = { x: top.x - 3 - pull * 6, y: by };
  ctx.strokeStyle = elite ? '#ff6a6a' : '#efe6d0';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(nock.x, nock.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.stroke();
  line(ctx, elite ? '#3a2218' : formA(p) ? GOLD : '#a8703c', elite ? 2.8 : 2.4, () => ctx.arc(bx, by, r, -1.2, 1.2));
  if (elite) {
    shape(ctx, '#c0444e', () => circle(ctx, top.x, top.y, 1.3), 0.6);
    shape(ctx, '#c0444e', () => circle(ctx, bottom.x, bottom.y, 1.3), 0.6);
  }
  if (pull > 0.2) {
    line(ctx, '#d8c8a8', 1.2, () => {
      ctx.moveTo(nock.x, nock.y);
      ctx.lineTo(nock.x + 15, nock.y);
    });
    shape(ctx, '#cfd8e8', () => poly(ctx, [nock.x + 15, nock.y - 2, nock.x + 19, nock.y, nock.x + 15, nock.y + 2]), 0.8);
  }
  shape(ctx, '#f2cfae', () => circle(ctx, nock.x, nock.y, 1.9), 0.9);
}

// ---------- guarda (humano) ----------

function drawGuard(ctx: Ctx, p: Required<SpritePose>): void {
  const thrust = p.attack * 6;
  const sway = Math.sin(p.time * 2) * 0.5;
  // Martelo Sagrado: armadura branca e azul, martelo brilhante e auréola azul
  const holy = formB(p);
  const trim = holy ? '#9fdcff' : ascended(p) ? GOLD : '#8a96b0';

  // pernas e corpo com armadura
  shape(ctx, '#4a5068', () => ctx.roundRect(-5, 7, 4.5, 7, 1.5));
  shape(ctx, '#4a5068', () => ctx.roundRect(0.5, 7, 4.5, 7, 1.5));
  shape(ctx, vertical(ctx, -9, 9, '#d8e0ee', '#8a96b0'), () => ctx.roundRect(-7, -9 + sway, 14, 17, [5, 5, 3, 3]));
  shape(ctx, vertical(ctx, -6, 9, holy ? '#ffffff' : '#4a6ad0', holy ? '#b8c8e8' : '#2a3a8a'), () => poly(ctx, [-4, -6 + sway, 4, -6 + sway, 5, 9, -5, 9]), 1);
  if (holy) shape(ctx, '#5aa8ff', () => circle(ctx, 0, 0 + sway, 2.2), 0.6);
  shape(ctx, trim, () => ctx.rect(-7, 2, 14, 2.4), 0.8);

  if (holy) {
    // martelo de guerra erguido: desce no ataque
    ctx.save();
    ctx.translate(-4, 2);
    ctx.rotate(-0.4 + p.attack * 1.3);
    line(ctx, '#e8e0d0', 2, () => {
      ctx.moveTo(0, 6);
      ctx.lineTo(0, -18);
    });
    ctx.shadowColor = '#9fdcff';
    ctx.shadowBlur = 8;
    shape(ctx, vertical(ctx, -25, -16, '#ffffff', '#8ab8e8'), () => ctx.roundRect(-6, -25, 12, 8, 2));
    ctx.shadowBlur = 0;
    shape(ctx, '#5aa8ff', () => ctx.rect(-1, -24, 2, 6), 0);
    ctx.restore();
  } else {
    // lança: horizontal à frente, estoca no ataque
    line(ctx, '#7a4a2a', 1.8, () => {
      ctx.moveTo(-6 + thrust, -1);
      ctx.lineTo(20 + thrust, -1);
    });
    shape(ctx, '#e8f0ff', () => poly(ctx, [20 + thrust, -3.2, 26 + thrust, -1, 20 + thrust, 1.2]), 1);
  }

  // elmo com viseira e pluma
  const hy = -16 + sway;
  shape(ctx, holy ? '#5aa8ff' : ascended(p) ? GOLD : '#e0243a', () => {
    ctx.moveTo(-2, hy - 8);
    ctx.quadraticCurveTo(-10, hy - 16, -12, hy - 6);
    ctx.quadraticCurveTo(-7, hy - 10, -3, hy - 6);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 0, hy, 9, '#f0f4fa', '#9aa6c0'), () => circle(ctx, 0, hy, 8.5));
  shape(ctx, '#1a1428', () => ctx.roundRect(-1, hy - 2, 9, 4.2, 2), 0.8);
  glowingEye(ctx, 2.3, hy, 1.1, '#9fdcff');
  glowingEye(ctx, 5.6, hy, 1.1, '#9fdcff');
  shape(ctx, trim, () => ctx.rect(-0.8, hy - 8.5, 1.6, 6), 0.6);

  // escudo grande na frente
  ctx.save();
  ctx.translate(6, 2);
  shape(ctx, vertical(ctx, -10, 12, holy ? '#ffffff' : ascended(p) ? '#fff0b0' : '#c8d2e6', holy ? '#7aa8e0' : ascended(p) ? '#c8901a' : '#6a7896'), () => {
    ctx.moveTo(-6, -9);
    ctx.lineTo(6, -9);
    ctx.lineTo(6, 3);
    ctx.quadraticCurveTo(6, 10, 0, 13);
    ctx.quadraticCurveTo(-6, 10, -6, 3);
    ctx.closePath();
  });
  shape(ctx, holy ? '#5aa8ff' : ascended(p) ? '#e0243a' : '#3a5ab0', () => poly(ctx, [-1.2, -6, 1.2, -6, 1.2, -1, 4, -1, 4, 1.4, 1.2, 1.4, 1.2, 8, -1.2, 8, -1.2, 1.4, -4, 1.4, -4, -1, -1.2, -1]), 0.6);
  ctx.restore();

  if (ascended(p)) {
    ctx.save();
    ctx.strokeStyle = holy ? '#9fdcff' : '#ffe48a';
    if (holy) {
      ctx.shadowColor = '#9fdcff';
      ctx.shadowBlur = 6;
    }
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, hy - 12, 6, 2, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

// ---------- vampiro sanguinário ----------

function drawBloodMage(ctx: Ctx, p: Required<SpritePose>): void {
  const float = Math.sin(p.time * 2.5) * 1.2;
  const cast = p.attack;
  // Mago de Sangue: manto roxo, coroa de runas e orbes roxos
  const mage = formB(p);
  const orb = mage ? '#c03ae0' : '#ff2040';

  // manto longo
  shape(ctx, vertical(ctx, -10, 14, mage ? '#6a2090' : '#8a1a30', mage ? '#240a3a' : '#3a0a18'), () => {
    ctx.moveTo(-5, -9);
    ctx.lineTo(5, -9);
    ctx.quadraticCurveTo(10, 4, 11, 14);
    ctx.lineTo(-11, 14);
    ctx.quadraticCurveTo(-10, 4, -5, -9);
    ctx.closePath();
  });
  shape(ctx, '#1a0a14', () => poly(ctx, [-1.5, -8, 1.5, -8, 2.5, 14, -2.5, 14]), 0);
  shape(ctx, GOLD, () => ctx.rect(-8, 4, 16, 1.6), 0.6);

  // capuz e rosto
  const hy = -15;
  shape(ctx, vertical(ctx, hy - 11, hy + 8, mage ? '#8a3ab8' : '#a02040', mage ? '#3a0c5a' : '#5a0c20'), () => {
    ctx.moveTo(-8.5, hy + 7);
    ctx.quadraticCurveTo(-11, hy - 8, 0, hy - 10.5);
    ctx.quadraticCurveTo(11, hy - 8, 8.5, hy + 7);
    ctx.closePath();
  });
  if (formA(p)) {
    shape(ctx, '#1a0a14', () => poly(ctx, [-6, hy - 6, -10, hy - 16, -3, hy - 9]), 1);
    shape(ctx, '#1a0a14', () => poly(ctx, [6, hy - 6, 10, hy - 16, 3, hy - 9]), 1);
  }
  if (mage) {
    // coroa de runas flutuando acima do capuz
    ctx.save();
    ctx.shadowColor = orb;
    ctx.shadowBlur = 6;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.45;
      const rx = Math.cos(a) * 9;
      const ry = hy - 6 + Math.sin(a) * 6 + Math.sin(p.time * 3 + i) * 0.6;
      shape(ctx, '#f0c8ff', () => poly(ctx, [rx, ry - 2, rx + 1.4, ry, rx, ry + 2, rx - 1.4, ry]), 0);
    }
    ctx.restore();
  }
  shape(ctx, '#1a0812', () => ellipse(ctx, 1.5, hy + 0.5, 6, 6), 0);
  shape(ctx, radial(ctx, 2, hy + 1, 5, '#fbf6ff', '#cdbfe0'), () => ellipse(ctx, 2, hy + 1.2, 4.8, 5), 0);
  glowingEye(ctx, 0.6, hy + 0.4, 1.3, orb);
  glowingEye(ctx, 4.2, hy + 0.4, 1.3, orb);
  shape(ctx, '#ffffff', () => poly(ctx, [1.4, hy + 3.6, 2.2, hy + 3.6, 1.8, hy + 5]), 0.4);
  shape(ctx, '#ffffff', () => poly(ctx, [3.2, hy + 3.6, 4, hy + 3.6, 3.6, hy + 5]), 0.4);

  // mão e orbe de sangue (cresce ao lançar)
  shape(ctx, '#e8dff0', () => circle(ctx, 9, 0 + float, 2), 0.8);
  ctx.save();
  ctx.shadowColor = orb;
  ctx.shadowBlur = 10;
  shape(ctx, radial(ctx, 12, -5 + float, 4, mage ? '#f0a8ff' : '#ff8090', mage ? '#6a0c8a' : '#a00c24'), () => circle(ctx, 12, -5 + float, 3 + cast * 1.5), 0.8);
  ctx.restore();

  if (ascended(p)) {
    for (let i = 0; i < 3; i++) {
      const a = p.time * (mage ? 3 : 2) + (i * TAU) / 3;
      ctx.fillStyle = mage ? '#d070ff' : '#e0243a';
      ctx.beginPath();
      circle(ctx, Math.cos(a) * 13, -6 + Math.sin(a) * 5, 1.6);
      ctx.fill();
    }
  }
}

// ---------- vampiro duelista ----------

function drawVampire(ctx: Ctx, p: Required<SpritePose>): void {
  const lunge = p.attack * 4;
  const flutter = Math.sin(p.time * 4) * 1.5;
  ctx.translate(lunge, 0);
  // Lâmina Carmesim: capa toda vermelha, cabelo branco e duas lâminas
  const blade = formB(p);

  if (blade) {
    // segunda lâmina, atrás do corpo
    line(ctx, '#ff5a6a', 1.4, () => {
      ctx.moveTo(-4, 1);
      ctx.lineTo(-17 - p.attack * 4, -6);
    });
  }
  // capa com forro vermelho e gola alta
  shape(ctx, vertical(ctx, -10, 14, blade ? '#a0101e' : '#2c1745', blade ? '#40060c' : '#120822'), () =>
    poly(ctx, [-5, -9, -16, 13 + flutter, -7, 10, 0, 14, 7, 10, 15, 13 - flutter, 5, -9]),
  );
  shape(ctx, vertical(ctx, -8, 12, '#d0243a', '#6e0c1c'), () =>
    poly(ctx, [-4, -7, -11, 11 + flutter, -3, 9, 3, 9, 11, 11 - flutter, 4, -7]),
    0,
  );
  // corpo
  shape(ctx, vertical(ctx, -9, 10, '#3a2550', '#1c1030'), () => ctx.roundRect(-5.5, -9, 11, 19, [4, 4, 2, 2]));
  shape(ctx, '#f4eef8', () => poly(ctx, [-2.4, -9, 2.4, -9, 0, -3]), 0.8);
  shape(ctx, '#c01830', () => poly(ctx, [-1.2, -7, 1.2, -7, 0, -4.5]), 0);
  shape(ctx, '#1a0f26', () => ctx.roundRect(-4.5, 9, 3.6, 5, 1), 1);
  shape(ctx, '#1a0f26', () => ctx.roundRect(1, 9, 3.6, 5, 1), 1);

  // gola alta atrás da cabeça
  shape(ctx, '#b01a30', () => poly(ctx, [-3, -9, -10, -25, -7, -11]), 1);
  shape(ctx, '#b01a30', () => poly(ctx, [3, -9, 9, -24, 7, -11]), 1);

  // rapieira
  const thrust = p.attack * 7;
  if (blade) {
    ctx.save();
    ctx.shadowColor = '#ff2a40';
    ctx.shadowBlur = 6;
  }
  line(ctx, blade ? '#ff8a96' : '#dfe6f4', 1.4, () => {
    ctx.moveTo(6, 0);
    ctx.lineTo(19 + thrust, -5 - thrust * 0.2);
  });
  if (blade) ctx.restore();
  shape(ctx, '#f0c35a', () => circle(ctx, 6.5, 0, 2.2), 1);

  // cabeça pálida, cabelo com bico, olhos vermelhos, presas
  const hy = -16;
  shape(ctx, radial(ctx, 0, hy, 8, '#fbf6ff', '#cdbfe0'), () => circle(ctx, 0, hy, 8));
  shape(ctx, vertical(ctx, hy - 9, hy, blade ? '#ffffff' : '#2e2240', blade ? '#b8b8d0' : '#120a1c'), () => {
    ctx.moveTo(-8.2, hy + 1);
    ctx.quadraticCurveTo(-9, hy - 9, 0, hy - 9.4);
    ctx.quadraticCurveTo(9, hy - 9, 8.2, hy);
    ctx.lineTo(5.5, hy - 4);
    ctx.lineTo(2.2, hy - 2);
    ctx.lineTo(-0.5, hy - 5);
    ctx.lineTo(-5, hy - 3);
    ctx.closePath();
  });
  glowingEye(ctx, 1.5, hy + 0.8, 1.5, '#ff3048');
  glowingEye(ctx, 5.4, hy + 0.8, 1.5, '#ff3048');
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hy - 1.6);
  ctx.lineTo(2.8, hy - 0.8);
  ctx.moveTo(7, hy - 1.6);
  ctx.lineTo(4.2, hy - 0.8);
  ctx.moveTo(1.6, hy + 4.2);
  ctx.quadraticCurveTo(3.8, hy + 5.4, 6, hy + 3.8);
  ctx.stroke();
  shape(ctx, '#ffffff', () => poly(ctx, [2.6, hy + 4.4, 3.6, hy + 4.6, 3.1, hy + 6.2]), 0.5);
  shape(ctx, '#ffffff', () => poly(ctx, [4.6, hy + 4.4, 5.6, hy + 4.2, 5.2, hy + 5.9]), 0.5);
  if (formA(p)) {
    shape(ctx, GOLD, () => poly(ctx, [-4.5, hy - 8, -5, hy - 13, -2, hy - 10.5, 0.5, hy - 14, 3, hy - 10.5, 6, hy - 13, 5.5, hy - 8]), 0.9);
    shape(ctx, '#e0243a', () => circle(ctx, 0.5, hy - 10, 1), 0.5);
    shape(ctx, GOLD, () => circle(ctx, 0, -3, 2), 0.8);
  }
}

// ---------- dragões ----------

interface DragonPalette {
  body: string;
  bodyDark: string;
  belly: string;
  wing: string;
  membrane: string;
  horn: string;
  iris: string;
  breath: string;
  crest: boolean;
  /** Rachaduras de lava brilhando no corpo (Wyrm Infernal). */
  lava?: boolean;
  /** Espinhos de gelo nas costas (Dragão Congelante). */
  spikes?: boolean;
  /** Faíscas de raio em volta do corpo (Tempestade). */
  bolts?: boolean;
  /** Nuvens girando sob o dragão (Olho da Tormenta). */
  clouds?: boolean;
}

const FIRE_DRAGON: DragonPalette = {
  body: '#f07a34',
  bodyDark: '#a83a1a',
  belly: '#ffd98a',
  wing: '#b8402a',
  membrane: '#ff9c5a',
  horn: '#fff0d0',
  iris: '#e0a020',
  breath: '#ffb040',
  crest: false,
};

const ICE_DRAGON: DragonPalette = {
  body: '#5ab8f0',
  bodyDark: '#2a62b0',
  belly: '#e8f8ff',
  wing: '#2f74c0',
  membrane: '#a8e2ff',
  horn: '#ffffff',
  iris: '#2a8ad8',
  breath: '#bff0ff',
  crest: true,
};

/** Wyrm Infernal (Fogo B): escamas negras com lava. */
const INFERNAL_WYRM: DragonPalette = {
  body: '#4a3a40',
  bodyDark: '#1a0c10',
  belly: '#ff8a3a',
  wing: '#2a1418',
  membrane: '#a0281a',
  horn: '#ff6a2a',
  iris: '#ff4a1a',
  breath: '#ff6a1a',
  crest: false,
  lava: true,
};

/** Dragão Congelante (Gelo B): branco-cristal com espinhos de gelo. */
const FROZEN_DRAGON: DragonPalette = {
  body: '#eaf8ff',
  bodyDark: '#7aaed8',
  belly: '#ffffff',
  wing: '#8ac0e8',
  membrane: '#dff4ff',
  horn: '#bff0ff',
  iris: '#3ab8ff',
  breath: '#e8fbff',
  crest: false,
  spikes: true,
};

/** Tempestade: dragão de nuvem azul-violeta com faíscas. */
const STORM_DRAGON: DragonPalette = {
  body: '#7a8ad8',
  bodyDark: '#3a4290',
  belly: '#dce4ff',
  wing: '#4a5ab0',
  membrane: '#aab8ff',
  horn: '#e8f0ff',
  iris: '#ffe060',
  breath: '#fff6a0',
  crest: false,
  bolts: true,
};

/** Dragão do Trovão (Tempestade A): escuro com raios amarelos. */
const THUNDER_DRAGON: DragonPalette = { ...STORM_DRAGON, body: '#4a4a8a', bodyDark: '#1e1e48', wing: '#2a2a60', membrane: '#7a7ad0', belly: '#ffe9a0' };

/** Olho da Tormenta (Tempestade B): azul-céu com nuvens girando. */
const TEMPEST_DRAGON: DragonPalette = { ...STORM_DRAGON, body: '#6aa8e0', bodyDark: '#2a5a90', wing: '#3a78b8', membrane: '#cfeaff', iris: '#bfeaff', breath: '#e8fbff', clouds: true };

function dragonWing(ctx: Ctx, c: DragonPalette, flap: number, front: boolean): void {
  const tipY = -22 + flap * 6;
  const dark = front ? c.wing : c.bodyDark;
  const membrane = front ? c.membrane : c.wing;
  const ox = front ? 1 : -3;
  shape(ctx, membrane, () => {
    ctx.moveTo(ox, -6);
    ctx.lineTo(ox - 12, tipY);
    ctx.quadraticCurveTo(ox - 14, tipY + 9, ox - 20, tipY + 12);
    ctx.quadraticCurveTo(ox - 12, tipY + 12, ox - 12, tipY + 18);
    ctx.quadraticCurveTo(ox - 6, tipY + 16, ox - 2, 0);
    ctx.closePath();
  });
  line(ctx, dark, 1.6, () => {
    ctx.moveTo(ox, -6);
    ctx.lineTo(ox - 12, tipY);
  }, false);
}

function drawDragon(ctx: Ctx, p: Required<SpritePose>, c: DragonPalette): void {
  const flap = Math.sin(p.time * 7);
  const tail = Math.sin(p.time * 3) * 2;

  dragonWing(ctx, c, flap, false);
  // cauda
  shape(ctx, c.body, () => {
    ctx.moveTo(-6, 4);
    ctx.quadraticCurveTo(-16, 10, -19, 1 + tail);
    ctx.quadraticCurveTo(-14, 6, -5, 9);
    ctx.closePath();
  });
  shape(ctx, c.bodyDark, () => poly(ctx, [-19, 1 + tail, -23, -2 + tail, -20, 4 + tail]), 1);
  // pernas
  shape(ctx, c.bodyDark, () => ctx.roundRect(-6, 8, 4.5, 6, 2), 1);
  shape(ctx, c.bodyDark, () => ctx.roundRect(2, 8, 4.5, 6, 2), 1);
  // corpo e barriga
  shape(ctx, radial(ctx, 0, 2, 11, c.body, c.bodyDark), () => ellipse(ctx, 0, 2, 9, 10));
  shape(ctx, c.belly, () => ellipse(ctx, 2.5, 4, 5, 7), 1);
  ctx.strokeStyle = c.bodyDark + '88';
  ctx.lineWidth = 0.8;
  for (const y of [1, 4, 7]) {
    ctx.beginPath();
    ctx.moveTo(-1, y);
    ctx.quadraticCurveTo(2.5, y + 1.2, 6.5, y);
    ctx.stroke();
  }
  if (c.clouds) {
    // nuvens girando sob o corpo
    ctx.fillStyle = '#e8f4ffcc';
    for (let i = 0; i < 4; i++) {
      const a = p.time * 1.5 + (i * TAU) / 4;
      ctx.beginPath();
      circle(ctx, Math.cos(a) * 12, 12 + Math.sin(a) * 2.5, 3.2);
      ctx.fill();
    }
  }
  if (c.bolts) {
    // faíscas de raio piscando em volta do corpo
    ctx.save();
    ctx.strokeStyle = '#fff6a0';
    ctx.shadowColor = '#fff6a0';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      if (Math.sin(p.time * 9 + i * 3) < 0.2) continue;
      const a = p.time * 2 + i * Math.PI;
      const x = Math.cos(a) * 11;
      const y = -2 + Math.sin(a) * 8;
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x + 2, y - 1);
      ctx.lineTo(x - 1, y + 1);
      ctx.lineTo(x + 1.5, y + 4);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (c.lava) {
    // rachaduras de lava pulsando
    ctx.save();
    ctx.shadowColor = '#ff6a1a';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = `rgba(255, ${140 + Math.round(Math.sin(p.time * 4) * 40)}, 40, 0.95)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -3);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-5, 4);
    ctx.moveTo(-2, 7);
    ctx.lineTo(0, 10);
    ctx.stroke();
    ctx.restore();
  }
  if (ascended(p)) {
    ctx.save();
    ctx.shadowColor = c.breath;
    ctx.shadowBlur = 8;
    shape(ctx, c.breath, () => poly(ctx, [2.5, -1, 5, 2, 2.5, 5, 0, 2]), 0.8);
    ctx.restore();
  }
  dragonWing(ctx, c, flap, true);

  // cabeça
  const hy = -13;
  if (c.crest) {
    for (const [x, y] of [
      [-4, -6],
      [-6, -10],
      [-5, -15],
    ] as const) {
      shape(ctx, '#ffffff', () => poly(ctx, [x, y, x - 5, y - 2, x - 1, y - 4]), 1);
    }
  }
  if (c.spikes) {
    // espinhos de cristal de gelo ao longo das costas
    for (const [x, y, s] of [
      [-3, -7, 1.2],
      [-7, -2, 1],
      [-9, 4, 0.8],
      [-1, -12, 0.9],
    ] as const) {
      shape(ctx, vertical(ctx, y - 8 * s, y, '#ffffff', '#8ad8ff'), () => poly(ctx, [x - 1.6 * s, y, x - 3 * s, y - 8 * s, x + 1.6 * s, y - 1]), 0.9);
    }
  }
  const horn = ascended(p) ? 1.5 : 1;
  shape(ctx, formA(p) ? GOLD : c.horn, () => poly(ctx, [-1, hy - 6, -1 - 7 * horn, hy - 6 - 7 * horn, 2, hy - 8]), 1);
  shape(ctx, formA(p) ? GOLD : c.horn, () => poly(ctx, [3, hy - 7, 3 - 4 * horn, hy - 7 - 8 * horn, 6, hy - 8]), 1);
  shape(ctx, radial(ctx, 4, hy, 9, c.body, c.bodyDark), () => circle(ctx, 4, hy, 8.5));
  const jaw = p.attack * 3;
  shape(ctx, radial(ctx, 11, hy + 2, 6, c.body, c.bodyDark), () => ellipse(ctx, 11, hy + 2.5, 6, 4.2));
  if (jaw > 0.3) {
    shape(ctx, '#3a0a14', () => ellipse(ctx, 14, hy + 4.5, 2.6, jaw * 0.8), 0.8);
    ctx.save();
    ctx.shadowColor = c.breath;
    ctx.shadowBlur = 10;
    ctx.fillStyle = c.breath;
    ctx.beginPath();
    circle(ctx, 17, hy + 4, jaw * 1.4);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = c.bodyDark;
  ctx.beginPath();
  circle(ctx, 14.5, hy + 1, 0.8);
  ctx.fill();
  eye(ctx, 5.5, hy - 1.5, 3.3, c.iris, 0.3);
  blush(ctx, 8.5, hy + 3.5);
}

// ---------- inimigos ----------

function drawZombie(ctx: Ctx, p: Required<SpritePose>): void {
  const shamble = Math.sin(p.time * 4);
  ctx.rotate(shamble * 0.07 + 0.08);

  // pernas
  shape(ctx, '#4a4868', () => ctx.roundRect(-5 + shamble * 1.5, 6, 4.2, 8, 1.5));
  shape(ctx, '#4a4868', () => ctx.roundRect(1 - shamble * 1.5, 6, 4.2, 8, 1.5));
  // braço de trás
  line(ctx, '#7aaa58', 3.4, () => {
    ctx.moveTo(-1, -5);
    ctx.lineTo(12, -6 + shamble * 1.5);
  });
  // camisa rasgada
  shape(ctx, vertical(ctx, -9, 9, '#7c8cae', '#4c5a7c'), () =>
    poly(ctx, [-6, -9, 6, -9, 7, 6, 4.5, 8.5, 2.5, 6, 0, 9, -2.5, 6, -5, 8.5, -7, 6]),
  );
  shape(ctx, '#8a6a4a', () => ctx.rect(-3, -2, 4, 4), 0.8);
  // braço da frente
  line(ctx, '#8fc06a', 3.6, () => {
    ctx.moveTo(2, -4);
    ctx.lineTo(15, -3 - shamble * 1.5);
  });
  shape(ctx, '#8fc06a', () => circle(ctx, 15.5, -3 - shamble * 1.5, 2.2), 1);

  // cabeça
  const hy = -16;
  shape(ctx, radial(ctx, 2, hy, 8.5, '#b6e08e', '#6a9a4a'), () => circle(ctx, 2, hy, 8.5));
  shape(ctx, '#3a3a2a', () => poly(ctx, [-5, hy - 6, -2, hy - 10, 0, hy - 7, 3, hy - 10, 4, hy - 7]), 1);
  ctx.strokeStyle = '#3a4a2a';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-3, hy - 3);
  ctx.lineTo(4, hy - 4.5);
  for (const x of [-1.5, 0.8, 3]) {
    ctx.moveTo(x, hy - 5);
    ctx.lineTo(x + 0.4, hy - 2.6);
  }
  ctx.stroke();
  eye(ctx, 6, hy, 2.8, '#d8e05a', 0.1);
  shape(ctx, '#fbf7ff', () => circle(ctx, 1, hy + 0.5, 1.6), 0.8);
  ctx.fillStyle = '#12081c';
  ctx.beginPath();
  circle(ctx, 1.2, hy + 0.6, 0.6);
  ctx.fill();
  shape(ctx, '#3a1a1a', () => poly(ctx, [1, hy + 4, 7.5, hy + 3.6, 6.5, hy + 6, 4, hy + 5.2, 2, hy + 6]), 0.8);
}

function drawBat(ctx: Ctx, p: Required<SpritePose>): void {
  const flap = Math.sin(p.time * 16);
  ctx.translate(0, -6 + Math.sin(p.time * 5) * 1.5);

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    const tip = -10 - flap * 8;
    shape(ctx, vertical(ctx, tip, 6, '#5a3a80', '#2e1a48'), () => {
      ctx.moveTo(3, -2);
      ctx.quadraticCurveTo(10, tip - 2, 21, tip);
      ctx.quadraticCurveTo(19, tip + 7, 16, tip + 10);
      ctx.quadraticCurveTo(13, tip + 7, 11, tip + 11);
      ctx.quadraticCurveTo(8, tip + 8, 4, 4);
      ctx.closePath();
    });
    ctx.strokeStyle = '#1e1030';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(4, -1);
    ctx.lineTo(16, tip + 10);
    ctx.moveTo(4, -1);
    ctx.lineTo(11, tip + 11);
    ctx.stroke();
    ctx.restore();
  }
  shape(ctx, '#3e2860', () => poly(ctx, [-5, -5, -6, -13, -1, -7]), 1);
  shape(ctx, '#3e2860', () => poly(ctx, [5, -5, 6, -13, 1, -7]), 1);
  shape(ctx, radial(ctx, 0, 0, 7, '#7a58a8', '#3e2860'), () => ellipse(ctx, 0, 0, 6.5, 7));
  glowingEye(ctx, -2.3, -1.5, 1.6, '#ff3a3a');
  glowingEye(ctx, 2.3, -1.5, 1.6, '#ff3a3a');
  shape(ctx, '#ffffff', () => poly(ctx, [-1.6, 2.4, -0.6, 2.4, -1.1, 4.2]), 0.4);
  shape(ctx, '#ffffff', () => poly(ctx, [0.6, 2.4, 1.6, 2.4, 1.1, 4.2]), 0.4);
}

function drawOgre(ctx: Ctx, p: Required<SpritePose>, king: boolean): void {
  const stomp = Math.sin(p.time * 5);
  const bob = Math.abs(stomp) * -0.8;

  if (king) {
    shape(ctx, vertical(ctx, -10, 14, '#6a2a9a', '#2e0f48'), () =>
      poly(ctx, [-8, -8, 8, -8, 13, 14, -13, 14]),
    );
  }
  // pernas
  shape(ctx, '#6e6036', () => ctx.roundRect(-8 + stomp, 8, 6, 7, 2));
  shape(ctx, '#6e6036', () => ctx.roundRect(2 - stomp, 8, 6, 7, 2));
  // barriga
  shape(ctx, radial(ctx, 0, 1 + bob, 13, king ? '#b8a46a' : '#b0a060', king ? '#6a5a30' : '#6e6236'), () =>
    ellipse(ctx, 0, 1 + bob, 12, 11.5),
  );
  shape(ctx, '#d8c890', () => ellipse(ctx, 2, 3 + bob, 6.5, 6), 0);
  ctx.fillStyle = '#5a4a28';
  ctx.beginPath();
  circle(ctx, 2.5, 4 + bob, 0.9);
  ctx.fill();
  // tanga
  shape(ctx, '#6b4426', () => poly(ctx, [-11, 6 + bob, 11, 6 + bob, 7, 12, 2, 10, -3, 12, -8, 10]), 1);
  shape(ctx, king ? '#f0c35a' : '#3a2414', () => ctx.rect(-11, 5 + bob, 22, 2.2), 1);

  // clava no ombro
  ctx.save();
  ctx.translate(9, -2 + bob);
  ctx.rotate(0.45 + stomp * 0.08);
  shape(ctx, vertical(ctx, -18, 0, '#9a6a3a', '#5a3a1a'), () => {
    ctx.moveTo(-1.6, 0);
    ctx.lineTo(-3.5, -16);
    ctx.quadraticCurveTo(0, -21, 3.5, -16);
    ctx.lineTo(1.6, 0);
    ctx.closePath();
  });
  if (king) {
    for (const [x, y] of [
      [-3.5, -13],
      [3.5, -13],
      [0, -19.5],
    ] as const) {
      shape(ctx, '#d8d8e0', () => poly(ctx, [x - 1, y, x + 1, y, x + Math.sign(x || 0.001) * 2.5, y - 2.5]), 0.6);
    }
  }
  ctx.restore();
  shape(ctx, '#a89858', () => circle(ctx, 9, -2 + bob, 3), 1);

  // cabeça
  const hy = -14 + bob;
  shape(ctx, '#a89858', () => poly(ctx, [-8, hy, -12, hy - 4, -7, hy - 3]), 1);
  shape(ctx, '#a89858', () => poly(ctx, [8, hy, 12, hy - 4, 7, hy - 3]), 1);
  shape(ctx, radial(ctx, 0, hy, 8.5, '#c8b878', '#7e7040'), () => circle(ctx, 0, hy, 8.2));
  ctx.strokeStyle = '#2a1e10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4.5, hy - 2.8);
  ctx.lineTo(0.5, hy - 1.6);
  ctx.lineTo(6, hy - 3);
  ctx.stroke();
  glowingEye(ctx, -1, hy, 1.4, '#ffd23a');
  glowingEye(ctx, 3.6, hy, 1.4, '#ffd23a');
  shape(ctx, '#3a1a10', () => ellipse(ctx, 1.5, hy + 4.4, 4, 1.6), 0.8);
  shape(ctx, '#fff8e0', () => poly(ctx, [-2, hy + 5, -0.6, hy + 5, -1.4, hy + 1.6]), 0.7);
  shape(ctx, '#fff8e0', () => poly(ctx, [3.6, hy + 5, 5, hy + 5, 4.4, hy + 1.6]), 0.7);

  if (king) {
    shape(ctx, vertical(ctx, hy - 16, hy - 6, '#ffe07a', '#c8901a'), () =>
      poly(ctx, [-6.5, hy - 6, -7.5, hy - 14, -3.5, hy - 10, 0, hy - 16, 3.5, hy - 10, 7.5, hy - 14, 6.5, hy - 6]),
    );
    shape(ctx, '#e0243a', () => circle(ctx, 0, hy - 8.5, 1.6), 0.7);
  }
}
