import { drawFallenAngel, drawGriffin, drawHarpy, drawMarbleSentinel, drawSeraph, drawStormCrow, drawWindElemental } from './spritesCitadel';
import { drawDjinn, drawMummy, drawPharaoh, drawRaider, drawSandSerpent, drawScarab, drawScorpionKing } from './spritesDesert';
import { drawFrostWolf, drawFrostWyrm, drawGlacierTroll, drawIceSpirit, drawKobold, drawSnowball, drawSnowGolem, drawYeti } from './spritesTundra';
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
  halo,
  line,
  OUTLINE,
  poly,
  radial,
  shape,
  skin,
  darken,
  star,
  starDots,
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
import { drawBogHag, drawCrocodile, drawHydra, drawLeech, drawToad, drawWisp } from './spritesSwamp';
import { drawArchangel, drawCherub, drawGuardianAngel, drawValkyrie } from './spritesAngel';
import { drawArchdemon, drawImp, drawInfernal, drawSuccubus } from './spritesDemon';
import { drawBasilisk, drawGorgonQueen, drawMedusa, drawSerpentArcher } from './spritesGorgon';
import { drawDeathLord, drawDrainer, drawReaper, drawSkeletonWarrior } from './spritesNecro';
import { drawColossus, drawCrystalGolem, drawMagmaGolem, drawWall } from './spritesGolem';
import { drawEnchantress, drawFaeQueen, drawLumina, drawTrickster } from './spritesFae';
import { drawAlicorn, drawGuardianUnicorn, drawStarFoal, drawWarPegasus } from './spritesUnicorn';

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
  const p: Required<SpritePose> = { facing: 1, attack: 0, moving: false, level: 1, branch: 0, palette: {}, supreme: false, variant: null, ...pose };
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
      drawDragon(ctx, p, dragonLook(id, p, formB(p) ? (p.supreme ? APOCALYPSE_WYRM : INFERNAL_WYRM) : p.supreme ? PRIMORDIAL_DRAGON : formA(p) ? ELDER_DRAGON : FIRE_DRAGON));
      break;
    case 'iceDragon':
      drawDragon(ctx, p, dragonLook(id, p, formB(p) ? (p.supreme ? ABSOLUTE_ZERO : FROZEN_DRAGON) : p.supreme ? BOREAL_DRAGON : formA(p) ? GLACIAL_DRAGON : ICE_DRAGON));
      break;
    case 'storm':
      drawDragon(ctx, p, dragonLook(id, p, formB(p) ? (p.supreme ? HURRICANE_DRAGON : TEMPEST_DRAGON) : formA(p) ? (p.supreme ? LIGHTNING_LORD : THUNDER_DRAGON) : STORM_DRAGON));
      break;
    case 'howler':
      drawHowler(ctx, p);
      break;
    case 'cleric':
      drawCleric(ctx, p);
      break;
    case 'cherub':
      drawCherub(ctx, p);
      break;
    case 'valkyrie':
      drawValkyrie(ctx, p);
      break;
    case 'guardianAngel':
      drawGuardianAngel(ctx, p);
      break;
    case 'archangel':
      drawArchangel(ctx, p);
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
    case 'starFoal':
      drawStarFoal(ctx, p);
      break;
    case 'guardianUnicorn':
      drawGuardianUnicorn(ctx, p);
      break;
    case 'warPegasus':
      drawWarPegasus(ctx, p);
      break;
    case 'alicorn':
      drawAlicorn(ctx, p);
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
    case 'toad':
      drawToad(ctx, p);
      break;
    case 'toadKing':
      drawToad(ctx, p, true);
      break;
    case 'leech':
      drawLeech(ctx, p);
      break;
    case 'bogHag':
      drawBogHag(ctx, p);
      break;
    case 'crocodile':
      drawCrocodile(ctx, p);
      break;
    case 'elderCroc':
      drawCrocodile(ctx, p, true);
      break;
    case 'wisp':
      drawWisp(ctx, p);
      break;
    case 'hydra':
      drawHydra(ctx, p);
      break;
    case 'frostWolf':
      drawFrostWolf(ctx, p);
      break;
    case 'snowGolem':
      drawSnowGolem(ctx, p);
      break;
    case 'snowball':
      drawSnowball(ctx, p);
      break;
    case 'iceSpirit':
      drawIceSpirit(ctx, p);
      break;
    case 'glacierTroll':
      drawGlacierTroll(ctx, p);
      break;
    case 'kobold':
      drawKobold(ctx, p);
      break;
    case 'yetiElder':
      drawYeti(ctx, p);
      break;
    case 'frostWyrm':
      drawFrostWyrm(ctx, p);
      break;
    case 'scarab':
      drawScarab(ctx, p);
      break;
    case 'mummy':
      drawMummy(ctx, p);
      break;
    case 'sandSerpent':
      drawSandSerpent(ctx, p);
      break;
    case 'raider':
      drawRaider(ctx, p);
      break;
    case 'djinn':
      drawDjinn(ctx, p);
      break;
    case 'scorpionKing':
      drawScorpionKing(ctx, p);
      break;
    case 'pharaoh':
      drawPharaoh(ctx, p);
      break;
    case 'harpy':
      drawHarpy(ctx, p);
      break;
    case 'marbleSentinel':
      drawMarbleSentinel(ctx, p);
      break;
    case 'fallenAngel':
      drawFallenAngel(ctx, p);
      break;
    case 'windElemental':
      drawWindElemental(ctx, p);
      break;
    case 'stormCrow':
      drawStormCrow(ctx, p);
      break;
    case 'griffin':
      drawGriffin(ctx, p);
      break;
    case 'seraph':
      drawSeraph(ctx, p);
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

/** Cores do Arqueiro em cada variante (as formas continuam com os próprios acessórios). */
const ARCHER_VARIANTS = {
  // Patrulheiro do Outono: capuz ocre e couro marrom
  rare: { cloak: ['#d0802e', '#6a3410'], hood: ['#e8963a', '#8a4214'], bow: '#7a4a22', eye: '#7a4a1a', quiver: '#5a3418', tip: '#ffd8a0' },
  // Caçador de Bestas: pele de lobo no capuz, couro escuro, olhos âmbar
  epic: { cloak: ['#6a4a2e', '#2a1a0e'], hood: ['#a0a0aa', '#4a4a54'], bow: '#5a3a1e', eye: '#ffb030', quiver: '#4a2e18', tip: '#ffd080' },
  // Arqueiro Estelar: azul-noite com estrelas, arco de luz
  legendary: { cloak: ['#3a4ab0', '#0c1240'], hood: ['#4a5ac8', '#141a5a'], bow: '#bfe0ff', eye: '#8ab8ff', quiver: '#1a2260', tip: '#e8f4ff' },
} as const;

function drawArcher(ctx: Ctx, p: Required<SpritePose>): void {
  const breathe = Math.sin(p.time * 2.2) * 0.6;
  // Atirador de Elite: capuz carmesim, arco longo escuro, pena, lente e lenço na boca
  const elite = formB(p);
  // Patrulheiro (A): capa curta nos ombros, braçadeira e duas flechas no arco
  const ranger = formA(p);
  const base = p.variant ? ARCHER_VARIANTS[p.variant] : null;
  // na variante, o Atirador fica em tons mais escuros (a forma continua diferente da A)
  const vc = base && elite
    ? { ...base, cloak: [darken(base.cloak[0], 0.35), darken(base.cloak[1], 0.35)] as const, hood: [darken(base.hood[0], 0.3), darken(base.hood[1], 0.3)] as const }
    : base;
  const pull = p.attack > 0.5 ? 0 : 1 - p.attack * 2; // após o tiro, a corda volta a ser puxada
  // Formas Supremas: Mestre Arqueiro (A) e Olho do Falcão (B)
  const master = p.supreme && !elite;
  const hawk = p.supreme && elite;

  if (master) {
    // capa longa de folhas esvoaçando atrás
    const wind = Math.sin(p.time * 3) * 2;
    shape(ctx, vertical(ctx, -12, 16, vc ? vc.hood[0] : '#5ac878', vc ? vc.cloak[1] : '#1a5a2c'), () => {
      ctx.moveTo(-3, -11 + breathe);
      ctx.quadraticCurveTo(-14 + wind, 0, -17 + wind, 15);
      ctx.lineTo(-12 + wind, 12);
      ctx.lineTo(-9 + wind, 16);
      ctx.lineTo(-5, 12);
      ctx.lineTo(-1, 15);
      ctx.closePath();
    }, 0.9);
    for (let i = 0; i < 4; i++) shape(ctx, vc ? vc.tip : '#7ae890', () => ellipse(ctx, -6 - i * 2.6 + wind * (i / 4), -2 + i * 4, 1.8, 0.9, 0.8), 0.4);
  }

  // aljava nas costas (dupla, com flechas verdes brilhantes, no Mestre Arqueiro)
  for (const off of master ? [-3, 0] : [0]) {
    ctx.save();
    ctx.translate(-6 + off, -3);
    ctx.rotate(-0.35 - off * 0.05);
    shape(ctx, vc ? vc.quiver : '#8a5a32', () => ctx.roundRect(-2.5, -8, 5, 14, 2), 1);
    for (const dx of [-1.2, 1.2]) shape(ctx, vc ? vc.tip : master ? '#9affb0' : '#e8e0d0', () => poly(ctx, [dx - 1.2, -8, dx + 1.2, -8, dx, -12]), 0.8);
    if (master) halo(ctx, 0, -11, 4, vc ? vc.tip : '#7affa0', 0.6);
    // Caçador de Bestas: tufos de pelo na boca da aljava
    if (p.variant === 'epic') for (const dx of [-2.2, 0, 2.2]) shape(ctx, '#c8c8d0', () => circle(ctx, dx, -7.5, 1.6), 0.5);
    ctx.restore();
  }

  // manto
  shape(ctx, vertical(ctx, -10, 14, vc ? vc.cloak[0] : hawk ? '#2a2a34' : elite ? '#a8323c' : '#3f9a5c', vc ? vc.cloak[1] : hawk ? '#0a0a10' : elite ? '#4a1018' : '#1d5530'), () =>
    poly(ctx, [-1, -9 + breathe, 8, 7, 9, 14, -9, 14, -8, 7]),
  );
  shape(ctx, '#2b2018', () => ctx.rect(-6, 3, 12, 2.2), 0.8);
  if (p.variant === 'legendary') starDots(ctx, p.time, [[-4, 9], [3, 6], [6, 11], [-6, 1]]);
  if (ranger) {
    // capa curta sobre os ombros, com filete dourado
    shape(ctx, vertical(ctx, -9, 0, vc ? darken(vc.hood[0], 0.15) : '#2f7a48', vc ? darken(vc.hood[1], 0.2) : '#174a2a'), () =>
      poly(ctx, [-8, -7 + breathe, 6, -8 + breathe, 9, -2, 4, 1, -1, -1, -6, 1, -10, -2]),
    1);
    line(ctx, GOLD, 0.9, () => {
      ctx.moveTo(9, -2);
      ctx.lineTo(4, 1);
      ctx.lineTo(-1, -1);
      ctx.lineTo(-6, 1);
      ctx.lineTo(-10, -2);
    }, false);
  }

  // capuz e rosto
  const hy = -14 + breathe;
  if (p.variant === 'epic') {
    // orelhas do lobo (a pele cobre o capuz)
    for (const [ex, lean] of [[-7, -0.3], [-1, 0.15]] as const) {
      shape(ctx, '#8a8a94', () => poly(ctx, [ex - 2.6, hy - 9, ex + 2.6, hy - 9.5, ex + lean * 8, hy - 17]), 0.9);
      shape(ctx, '#d8a0a0', () => poly(ctx, [ex - 1, hy - 10, ex + 1.2, hy - 10.2, ex + lean * 6, hy - 14.5]), 0);
    }
  }
  if (elite) {
    // pena presa no capuz (vermelha; na variante, na cor dela)
    shape(ctx, vertical(ctx, hy - 20, hy - 6, vc ? vc.tip : '#ff6a5a', vc ? vc.cloak[1] : '#a01a2a'), () => {
      ctx.moveTo(-7, hy - 8);
      ctx.quadraticCurveTo(-16, hy - 16, -13, hy - 22);
      ctx.quadraticCurveTo(-8, hy - 15, -4, hy - 9);
      ctx.closePath();
    }, 0.9);
  }
  shape(ctx, vertical(ctx, hy - 10, hy + 8, vc ? vc.hood[0] : hawk ? '#3a3a46' : elite ? '#c0444e' : '#4fb06c', vc ? vc.hood[1] : hawk ? '#0e0e16' : elite ? '#6a1a22' : '#2a7040'), () => {
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
  eye(ctx, 1.6, hy + 0.6, 1.6, vc ? vc.eye : elite ? '#8a2a2a' : '#3a7a3a', 0.4);
  eye(ctx, 5, hy + 0.6, 1.6, vc ? vc.eye : elite ? '#8a2a2a' : '#3a7a3a', 0.4);
  if (p.variant === 'epic') {
    // focinho do lobo sobre a testa, com o nariz e os dentes de cima
    shape(ctx, vertical(ctx, hy - 11, hy - 2, '#c4c4cc', '#5a5a64'), () => {
      ctx.moveTo(-4, hy - 9);
      ctx.quadraticCurveTo(4, hy - 12.5, 9, hy - 9);
      ctx.lineTo(14, hy - 6.5);
      ctx.quadraticCurveTo(14.5, hy - 4, 12, hy - 3.4);
      ctx.quadraticCurveTo(4, hy - 3.5, -3, hy - 4);
      ctx.closePath();
    }, 1);
    // olhos da pele de lobo (fendas âmbar) e o nariz na ponta do focinho
    for (const ex of [3, 7]) shape(ctx, '#ffb030', () => ellipse(ctx, ex, hy - 8.2, 1.3, 0.6, -0.2), 0);
    shape(ctx, '#1a1a20', () => ellipse(ctx, 13.4, hy - 5.6, 1.4, 1.1), 0);
    for (const tx of [6, 9, 11.5]) shape(ctx, '#ffffff', () => poly(ctx, [tx - 0.8, hy - 3.6, tx + 0.8, hy - 3.6, tx, hy - 1.6]), 0);
  }
  if (p.variant === 'legendary') {
    // estrela presa no capuz
    shape(ctx, '#ffffff', () => star(ctx, -7, hy - 9, 2.2), 0);
    halo(ctx, -7, hy - 9, 4, '#bfe0ff', 0.7);
    starDots(ctx, p.time + 1, [[-8, hy - 1], [6, hy - 7]]);
  }
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
    // lenço cobrindo a boca, com a ponta solta atrás
    const scarf = vc ? darken(vc.cloak[0], 0.25) : '#3a1418';
    shape(ctx, scarf, () => poly(ctx, [-6, hy + 6, -11, hy + 9, -9.5, hy + 4.5, -5, hy + 2.5]), 0.7);
    shape(ctx, scarf, () => {
      ctx.moveTo(-2.5, hy + 2.6);
      ctx.quadraticCurveTo(3, hy + 1.8, 8.4, hy + 2.6);
      ctx.lineTo(7.4, hy + 6.2);
      ctx.quadraticCurveTo(2, hy + 7.4, -3, hy + 6.4);
      ctx.closePath();
    }, 0.8);
  } else blush(ctx, 0.5, hy + 3.4);

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
  if (p.variant === 'legendary') {
    // arco de luz em lua crescente
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    line(ctx, '#8ab8ff66', 5, () => ctx.arc(bx, by, r, -1.2, 1.2));
    ctx.restore();
    shape(ctx, vertical(ctx, by - r, by + r, '#ffffff', '#8ab8ff'), () => {
      ctx.arc(bx, by, r + 1.3, -1.2, 1.2);
      ctx.arc(bx + 2.4, by, r - 0.6, 1.15, -1.15, true);
      ctx.closePath();
    }, 0.6);
  } else {
    line(ctx, vc ? (formA(p) ? GOLD : vc.bow) : elite ? '#3a2218' : formA(p) ? GOLD : '#a8703c', elite ? 2.8 : 2.4, () => ctx.arc(bx, by, r, -1.2, 1.2));
  }
  if (p.variant === 'epic') {
    // presas nas pontas do arco
    for (const [tip, dir] of [[top, -1], [bottom, 1]] as const) {
      shape(ctx, '#f4f0e0', () => poly(ctx, [tip.x - 1.2, tip.y, tip.x + 1.2, tip.y, tip.x + 1.6, tip.y + dir * 3.6]), 0.6);
    }
  } else if (elite) {
    shape(ctx, vc ? vc.tip : '#c0444e', () => circle(ctx, top.x, top.y, 1.3), 0.6);
    shape(ctx, vc ? vc.tip : '#c0444e', () => circle(ctx, bottom.x, bottom.y, 1.3), 0.6);
  }
  if (pull > 0.2) {
    // Patrulheiro: duas flechas em leque (multi-tiro)
    for (const lift of ranger ? [-3.2, 0] : [0]) {
      line(ctx, '#d8c8a8', 1.2, () => {
        ctx.moveTo(nock.x, nock.y);
        ctx.lineTo(nock.x + 15, nock.y + lift);
      });
      shape(ctx, vc ? vc.tip : '#cfd8e8', () => poly(ctx, [nock.x + 15, nock.y + lift - 2, nock.x + 19, nock.y + lift * 1.25, nock.x + 15, nock.y + lift + 2]), 0.8);
    }
  }
  shape(ctx, '#f2cfae', () => circle(ctx, nock.x, nock.y, 1.9), 0.9);

  if (ranger || master) {
    // braçadeira de couro reforçada na mão do arco
    shape(ctx, '#6a4020', () => ctx.roundRect(nock.x - 2.5, nock.y - 1.6, 4, 3.2, 1), 0.6);
    shape(ctx, GOLD, () => ctx.rect(nock.x - 1, nock.y - 1.6, 1, 3.2), 0);
  }
  if (hawk) {
    // luneta longa sobre o olho e a mira vermelha à frente
    line(ctx, '#3a3020', 1.6, () => {
      ctx.moveTo(5, hy + 0.6);
      ctx.lineTo(11, hy - 0.4);
    });
    shape(ctx, '#bfe8ff88', () => circle(ctx, 11.5, hy - 0.5, 1.4), 0.6);
    ctx.save();
    ctx.globalAlpha *= 0.55 + Math.sin(p.time * 6) * 0.2;
    ctx.strokeStyle = '#ff3a3a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + r + 30, by);
    ctx.stroke();
    halo(ctx, bx + r + 30, by, 3, '#ff3a3a', 1);
    ctx.restore();
  }
}

// ---------- guarda (humano) ----------

/** Cores da Guarda em cada variante (as formas continuam com lança, martelo e escudos próprios). */
const GUARD_VARIANTS = {
  // Guarda Real: prata polida, tabardo vermelho-real, filetes e brasão dourados
  rare: { armor: ['#f4f6fa', '#9aa4b8'], tabard: ['#d0283e', '#6a0a1a'], trim: GOLD, plume: '#ffffff', helm: ['#ffffff', '#aab4c8'], shield: ['#f4f4fa', '#9aa0b8'], emblem: GOLD, eyes: '#9fdcff' },
  // Templário: elmo fechado com fenda em cruz, tabardo branco com cruz vermelha
  epic: { armor: ['#c8ccd6', '#6a7080'], tabard: ['#ffffff', '#c8c8d4'], trim: '#c01828', plume: '#c01828', helm: ['#d8dce4', '#6a7080'], shield: ['#ffffff', '#c0c4d0'], emblem: '#c01828', eyes: '#ff8a5a' },
  // Paladino do Sol: armadura branca com ouro, elmo alado, disco de sol atrás da cabeça, escudo-sol
  legendary: { armor: ['#ffffff', '#c4c8d8'], tabard: ['#ffffff', '#f0dca0'], trim: GOLD, plume: '#ffd23a', helm: ['#ffffff', '#c4c8d8'], shield: ['#fff8dc', '#e8b030'], emblem: '#ff9a1a', eyes: '#fff0a0' },
} as const;

/** Capa da Guarda (Paladino e Paladino do Sol): de vermelho, ou nas cores da variante. */
function guardCape(ctx: Ctx, sway: number, time: number, top: string, bottom: string): void {
  const wind = Math.sin(time * 2.5) * 1.2;
  shape(ctx, vertical(ctx, -9, 15, top, bottom), () => {
    ctx.moveTo(-6, -8 + sway);
    ctx.quadraticCurveTo(-12 + wind, 2, -13 + wind, 15);
    ctx.lineTo(-7 + wind * 0.5, 13);
    ctx.lineTo(-2, 15);
    ctx.lineTo(3, -8 + sway);
    ctx.closePath();
  }, 1);
}

/** Disco de sol atrás da cabeça (Paladino do Sol): anel fino e raios girando devagar. */
function sunDisc(ctx: Ctx, x: number, y: number, time: number): void {
  halo(ctx, x, y, 18, '#ffd23a', 0.4 + Math.sin(time * 2) * 0.1);
  ctx.save();
  ctx.translate(x, y);
  // anel liso e um anel pontilhado girando devagar por fora
  ctx.strokeStyle = '#ffe48a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  circle(ctx, 0, 0, 12);
  ctx.stroke();
  ctx.globalAlpha *= 0.7;
  ctx.lineWidth = 0.9;
  ctx.setLineDash([1.5, 2.5]);
  ctx.lineDashOffset = -time * 4;
  ctx.beginPath();
  circle(ctx, 0, 0, 14.5);
  ctx.stroke();
  ctx.restore();
}

/** Asas douradas abertas nos lados do elmo, com três penas (Paladino do Sol). */
function helmWings(ctx: Ctx, hy: number): void {
  for (const [x, dir] of [[-7.5, -1], [7.5, 1]] as const) {
    shape(ctx, vertical(ctx, hy - 11, hy, '#ffffff', '#e0a828'), () => {
      ctx.moveTo(x, hy - 1);
      ctx.quadraticCurveTo(x + dir * 5, hy - 4, x + dir * 10, hy - 10);
      ctx.lineTo(x + dir * 8.2, hy - 6.6);
      ctx.lineTo(x + dir * 9.4, hy - 5.6);
      ctx.lineTo(x + dir * 6.6, hy - 3.6);
      ctx.lineTo(x + dir * 7.4, hy - 2);
      ctx.lineTo(x + dir * 3, hy - 0.6);
      ctx.closePath();
    }, 0.8);
  }
}

/** Brasão de sol (Paladino do Sol): disco com raios que pulsa e brilha mais no golpe. */
function sunEmblem(ctx: Ctx, x: number, y: number, r: number, time: number, attack: number): void {
  halo(ctx, x, y, r * 3, '#ffd23a', 0.5 + Math.sin(time * 3) * 0.2 + attack * 0.5);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + time * 0.5;
    shape(ctx, '#ffb020', () => poly(ctx, [x + Math.cos(a - 0.25) * r, y + Math.sin(a - 0.25) * r, x + Math.cos(a) * r * 1.7, y + Math.sin(a) * r * 1.7, x + Math.cos(a + 0.25) * r, y + Math.sin(a + 0.25) * r]), 0);
  }
  shape(ctx, radial(ctx, x, y, r, '#ffffff', '#ffc020'), () => circle(ctx, x, y, r), 0.6);
}

function drawGuard(ctx: Ctx, p: Required<SpritePose>): void {
  const thrust = p.attack * 6;
  const sway = Math.sin(p.time * 2) * 0.5;
  // Martelo Sagrado: armadura branca e azul, martelo brilhante e auréola azul
  const holy = formB(p);
  const gv = p.variant ? GUARD_VARIANTS[p.variant] : null;
  const trim = gv ? gv.trim : holy ? '#9fdcff' : ascended(p) ? GOLD : '#8a96b0';
  const hy = -16 + sway;

  // Paladino (A): capa e ombreiras grandes (o Bastião supremo tem as próprias)
  const paladin = formA(p);
  if (p.variant === 'legendary') sunDisc(ctx, 0, hy, p.time);
  if (paladin || p.variant === 'legendary') {
    guardCape(ctx, sway, p.time, gv ? (p.variant === 'legendary' ? '#fff4c8' : gv.tabard[0]) : '#d0283e', gv ? (p.variant === 'legendary' ? '#d8a020' : darken(gv.tabard[1], 0.2)) : '#5a0a1a');
  }

  // pernas e corpo com armadura
  shape(ctx, '#4a5068', () => ctx.roundRect(-5, 7, 4.5, 7, 1.5));
  shape(ctx, '#4a5068', () => ctx.roundRect(0.5, 7, 4.5, 7, 1.5));
  shape(ctx, vertical(ctx, -9, 9, gv ? gv.armor[0] : '#d8e0ee', gv ? gv.armor[1] : '#8a96b0'), () => ctx.roundRect(-7, -9 + sway, 14, 17, [5, 5, 3, 3]));
  shape(ctx, vertical(ctx, -6, 9, gv ? gv.tabard[0] : holy ? '#ffffff' : '#4a6ad0', gv ? gv.tabard[1] : holy ? '#b8c8e8' : '#2a3a8a'), () => poly(ctx, [-4, -6 + sway, 4, -6 + sway, 5, 9, -5, 9]), 1);
  if (p.variant === 'epic') {
    // cruz vermelha no tabardo
    shape(ctx, '#c01828', () => ctx.rect(-1, -4.5 + sway, 2, 12), 0);
    shape(ctx, '#c01828', () => ctx.rect(-3.5, -1.5 + sway, 7, 2), 0);
  } else if (p.variant === 'legendary') {
    shape(ctx, '#ffb020', () => star(ctx, 0, 0.5 + sway, 2.6), 0.5);
  } else if (holy) shape(ctx, '#5aa8ff', () => circle(ctx, 0, 0 + sway, 2.2), 0.6);
  shape(ctx, trim, () => ctx.rect(-7, 2, 14, 2.4), 0.8);
  if (paladin && !p.supreme) {
    // ombreiras grandes e arredondadas
    for (const x of [-10, 4]) {
      shape(ctx, vertical(ctx, -12, -4, gv ? gv.armor[0] : '#fff0b0', gv ? trim : '#c8901a'), () => ctx.roundRect(x, -11 + sway, 7, 6.5, [4, 4, 1.5, 1.5]), 0.9);
      shape(ctx, trim, () => ctx.rect(x + 0.5, -6.2 + sway, 6, 1), 0);
    }
  }

  if (holy) {
    // martelo de guerra erguido: desce no ataque
    ctx.save();
    ctx.translate(-4, 2);
    ctx.rotate(0.3 + p.attack * 1.1);
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
  if (p.variant !== 'epic' && p.variant !== 'legendary') {
    shape(ctx, gv ? gv.plume : holy ? '#5aa8ff' : ascended(p) ? GOLD : '#e0243a', () => {
      ctx.moveTo(-2, hy - 8);
      ctx.quadraticCurveTo(-10, hy - 16, -12, hy - 6);
      ctx.quadraticCurveTo(-7, hy - 10, -3, hy - 6);
      ctx.closePath();
    });
  }
  if (p.variant === 'epic') {
    // elmo de balde do Templário: fenda em cruz e olhos em brasa
    shape(ctx, vertical(ctx, hy - 9, hy + 8, gv!.helm[0], gv!.helm[1]), () => ctx.roundRect(-8, hy - 8.5, 16, 16.5, [4, 4, 2, 2]), 1.1);
    shape(ctx, '#0e0a14', () => ctx.rect(0, hy - 1.2, 8, 2.4), 0);
    shape(ctx, '#0e0a14', () => ctx.rect(3.6, hy - 6, 2.2, 10), 0);
    glowingEye(ctx, 2, hy, 0.9, gv!.eyes);
    glowingEye(ctx, 7, hy, 0.9, gv!.eyes);
    for (const y of [hy - 7, hy + 6]) shape(ctx, '#c01828', () => ctx.rect(-8, y, 16, 1.2), 0);
  } else {
    shape(ctx, radial(ctx, 0, hy, 9, gv ? gv.helm[0] : '#f0f4fa', gv ? gv.helm[1] : '#9aa6c0'), () => circle(ctx, 0, hy, 8.5));
    shape(ctx, '#1a1428', () => ctx.roundRect(-1, hy - 2, 9, 4.2, 2), 0.8);
    glowingEye(ctx, 2.3, hy, 1.1, gv ? gv.eyes : '#9fdcff');
    glowingEye(ctx, 5.6, hy, 1.1, gv ? gv.eyes : '#9fdcff');
    shape(ctx, trim, () => ctx.rect(-0.8, hy - 8.5, 1.6, 6), 0.6);
    if (p.variant === 'legendary') helmWings(ctx, hy);
  }

  // escudo grande na frente
  ctx.save();
  ctx.translate(6, 2);
  shape(ctx, vertical(ctx, -10, 12, gv ? gv.shield[0] : holy ? '#ffffff' : ascended(p) ? '#fff0b0' : '#c8d2e6', gv ? gv.shield[1] : holy ? '#7aa8e0' : ascended(p) ? '#c8901a' : '#6a7896'), () => {
    ctx.moveTo(-6, -9);
    ctx.lineTo(6, -9);
    ctx.lineTo(6, 3);
    ctx.quadraticCurveTo(6, 10, 0, 13);
    ctx.quadraticCurveTo(-6, 10, -6, 3);
    ctx.closePath();
  });
  if (p.variant === 'legendary') sunEmblem(ctx, 0, 1, 3.4, p.time, p.attack);
  else shape(ctx, gv ? gv.emblem : holy ? '#5aa8ff' : ascended(p) ? '#e0243a' : '#3a5ab0', () => poly(ctx, [-1.2, -6, 1.2, -6, 1.2, -1, 4, -1, 4, 1.4, 1.2, 1.4, 1.2, 8, -1.2, 8, -1.2, 1.4, -4, 1.4, -4, -1, -1.2, -1]), 0.6);
  ctx.restore();

  if (ascended(p) && !p.supreme) {
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

  if (p.supreme && !holy) {
    // Bastião: escudo-torre enorme com brasão, ombreiras de placas azul e branca
    for (const x of [-8, 6]) shape(ctx, vertical(ctx, -11, -4, gv ? gv.armor[0] : '#ffffff', gv ? gv.tabard[1] : '#5a7ad8'), () => ctx.roundRect(x, -11 + sway, 6, 6, [3, 3, 1, 1]), 0.8);
    ctx.save();
    ctx.translate(9, 1);
    shape(ctx, vertical(ctx, -16, 15, gv ? gv.shield[0] : '#eef4ff', gv ? gv.shield[1] : '#4a6ad0'), () => ctx.roundRect(-7, -16, 14, 31, 2.5), 1.2);
    shape(ctx, gv ? gv.tabard[1] : '#2a3a8a', () => ctx.roundRect(-5, -14, 10, 27, 2), 0.6);
    if (p.variant === 'epic') {
      // escudo-torre do Templário: cruz vermelha
      shape(ctx, '#c01828', () => ctx.rect(-1.4, -12, 2.8, 23), 0);
      shape(ctx, '#c01828', () => ctx.rect(-4.5, -5, 9, 2.8), 0);
    } else if (p.variant === 'legendary') sunEmblem(ctx, 0, -1, 4.2, p.time, p.attack);
    // brasão: leão estilizado em dourado
    else shape(ctx, GOLD, () => {
      ctx.moveTo(0, -9);
      ctx.lineTo(3.5, -5);
      ctx.lineTo(2, 1);
      ctx.lineTo(3.5, 7);
      ctx.lineTo(0, 5);
      ctx.lineTo(-3.5, 7);
      ctx.lineTo(-2, 1);
      ctx.lineTo(-3.5, -5);
      ctx.closePath();
    }, 0.6);
    for (const y of [-12, 11]) shape(ctx, '#c8d2e6', () => circle(ctx, -3.5, y, 0.9), 0);
    ctx.restore();
  }
  if (p.supreme && holy) {
    // Juiz de Ferro: elmo fechado de ferro e martelo de duas mãos rachado de luz
    shape(ctx, vertical(ctx, hy - 10, hy + 7, '#6a6e7a', '#2a2c34'), () => ctx.roundRect(-8.5, hy - 9, 17, 16, [7, 7, 3, 3]), 1.1);
    shape(ctx, '#0e0c14', () => ctx.rect(-1, hy - 1.2, 8, 2.2), 0);
    for (const x of [1.5, 4, 6.5]) shape(ctx, '#ffe9a8', () => ctx.rect(x, hy - 0.6, 1.2, 1), 0);
    ctx.save();
    ctx.translate(-6, 3);
    ctx.rotate(-0.2 + p.attack * 1.4);
    line(ctx, '#3a2a20', 2.6, () => {
      ctx.moveTo(0, 9);
      ctx.lineTo(0, -22);
    });
    shape(ctx, vertical(ctx, -32, -20, '#8a8e9a', '#3a3c44'), () => ctx.roundRect(-9, -32, 18, 12, 2), 1.1);
    // rachaduras de luz no martelo
    const glow = 0.6 + Math.sin(p.time * 5) * 0.3 + p.attack * 0.4;
    ctx.save();
    ctx.globalAlpha *= Math.min(1, glow);
    line(ctx, '#ffe9a8', 0.9, () => {
      ctx.moveTo(-6, -30);
      ctx.lineTo(-2, -26);
      ctx.lineTo(-4, -22);
      ctx.moveTo(4, -31);
      ctx.lineTo(2, -27);
      ctx.lineTo(6, -23);
    }, false);
    ctx.restore();
    halo(ctx, 0, -26, 10, '#ffe9a8', glow * 0.5);
    ctx.restore();
  }
}

// ---------- vampiro sanguinário ----------

/** Cores do Sanguinário em cada variante: manto, capuz, filete, orbe e olhos. */
const SANGUINE_VARIANTS = {
  // Cultista de Ônix: manto preto com ouro, sangue escuro
  rare: { robe: ['#2e2834', '#0a080c'], hood: ['#423a4a', '#14101a'], trim: GOLD, orb: ['#ff7080', '#6a0010'], eyes: '#ffd25a' },
  // Sacerdote da Lua de Sangue: manto branco-osso com carmesim, lua no capuz, cálice no lugar do orbe, runas
  epic: { robe: ['#f0e6e2', '#8a6e6e'], hood: ['#faf2ee', '#a08484'], trim: '#c0102a', orb: ['#ff8a96', '#a00c24'], eyes: '#ff3a4a' },
  // Avatar Escarlate: manto de sangue líquido, coroa de espinhos de sangue cristalizado
  legendary: { robe: ['#ff3a50', '#4a0010'], hood: ['#e02038', '#5a0010'], trim: '#ffb0b8', orb: ['#ffb0b8', '#c0102a'], eyes: '#ffffff' },
} as const;

function drawBloodMage(ctx: Ctx, p: Required<SpritePose>): void {
  const float = Math.sin(p.time * 2.5) * 1.2;
  const cast = p.attack;
  // Mago de Sangue: manto roxo, coroa de runas e orbes roxos
  const mage = formB(p);
  const sv = p.variant ? SANGUINE_VARIANTS[p.variant] : null;
  const orb = sv ? sv.orb[1] : mage ? '#c03ae0' : '#ff2040';
  // Formas Supremas: Soberano Escarlate (A) e Arcano Rubro (B)
  const sovereign = p.supreme && !mage;
  const arcane = p.supreme && mage;
  if (sovereign) {
    // trono de sangue flutuante atrás
    shape(ctx, vertical(ctx, -30, 14, '#c0182c', '#3a0410'), () => {
      ctx.moveTo(-12, 14);
      ctx.lineTo(-12, -18);
      ctx.lineTo(-8, -28);
      ctx.lineTo(-4, -20);
      ctx.lineTo(0, -31);
      ctx.lineTo(4, -20);
      ctx.lineTo(8, -28);
      ctx.lineTo(12, -18);
      ctx.lineTo(12, 14);
      ctx.closePath();
    }, 1);
    shape(ctx, '#ffd25a', () => circle(ctx, 0, -24, 1.6), 0.5);
    for (let i = 0; i < 3; i++) {
      const t = (p.time * 0.9 + i / 3) % 1;
      shape(ctx, '#e0243a', () => ellipse(ctx, -9 + i * 9, 14 + t * 4, 1, 1.6), 0);
    }
  }

  // Lorde de Sangue (A): asas de morcego de sangue abertas atrás
  const lord = formA(p) && !p.supreme;
  if (lord) {
    const beat = Math.sin(p.time * 3) * 1.5;
    for (const side of [-1, 1]) {
      shape(ctx, vertical(ctx, -26, 6, sv ? sv.orb[0] : '#ff3a50', sv ? sv.robe[1] : '#5a0614'), () => {
        ctx.moveTo(side * 3, -8);
        ctx.lineTo(side * 18, -22 - beat);
        ctx.lineTo(side * 16, -14 - beat);
        ctx.lineTo(side * 21, -9 - beat);
        ctx.lineTo(side * 15, -4);
        ctx.lineTo(side * 17, 2);
        ctx.lineTo(side * 5, 0);
        ctx.closePath();
      }, 1);
    }
  }

  // manto longo (no Mago de Sangue, a variante fica mais escura)
  const shadeB = (c: string) => (mage ? darken(c, 0.3) : c);
  shape(ctx, vertical(ctx, -10, 14, sv ? shadeB(sv.robe[0]) : mage ? '#6a2090' : '#8a1a30', sv ? sv.robe[1] : mage ? '#240a3a' : '#3a0a18'), () => {
    ctx.moveTo(-5, -9);
    ctx.lineTo(5, -9);
    ctx.quadraticCurveTo(10, 4, 11, 14);
    ctx.lineTo(-11, 14);
    ctx.quadraticCurveTo(-10, 4, -5, -9);
    ctx.closePath();
  });
  shape(ctx, '#1a0a14', () => poly(ctx, [-1.5, -8, 1.5, -8, 2.5, 14, -2.5, 14]), 0);
  shape(ctx, sv ? sv.trim : GOLD, () => ctx.rect(-8, 4, 16, 1.6), 0.6);
  if (p.variant === 'epic') {
    // runas de sangue acesas no manto
    ctx.save();
    ctx.globalAlpha *= 0.6 + Math.sin(p.time * 3) * 0.3;
    ctx.strokeStyle = '#ff6a7a';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (const [rx, ry] of [[-6, 8], [5, 9], [-4, -2]] as const) {
      ctx.moveTo(rx - 1.2, ry - 1.2);
      ctx.lineTo(rx + 1.2, ry + 1.2);
      ctx.moveTo(rx + 1.2, ry - 1.2);
      ctx.lineTo(rx, ry);
    }
    ctx.stroke();
    ctx.restore();
  }
  if (p.variant === 'legendary') {
    // o manto escorre: gotas caindo da barra
    for (let i = 0; i < 4; i++) {
      const t = (p.time * 0.8 + i * 0.27) % 1;
      shape(ctx, '#e0182c', () => ellipse(ctx, -8 + i * 5.3, 14 + t * 5, 0.9 + (1 - t) * 0.4, 1.5), 0);
    }
  }

  // capuz e rosto
  const hy = -15;
  if (p.variant === 'legendary') {
    // coroa de espinhos de sangue cristalizado
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.32;
      const len = i % 2 ? 6 : 9;
      shape(ctx, vertical(ctx, hy - 20, hy - 8, '#ffb0b8', '#a00c24'), () =>
        poly(ctx, [Math.cos(a - 0.12) * 9, hy - 2 + Math.sin(a - 0.12) * 9, Math.cos(a) * (9 + len), hy - 2 + Math.sin(a) * (9 + len), Math.cos(a + 0.12) * 9, hy - 2 + Math.sin(a + 0.12) * 9]),
      0.6);
    }
  }
  shape(ctx, vertical(ctx, hy - 11, hy + 8, sv ? shadeB(sv.hood[0]) : mage ? '#8a3ab8' : '#a02040', sv ? sv.hood[1] : mage ? '#3a0c5a' : '#5a0c20'), () => {
    ctx.moveTo(-8.5, hy + 7);
    ctx.quadraticCurveTo(-11, hy - 8, 0, hy - 10.5);
    ctx.quadraticCurveTo(11, hy - 8, 8.5, hy + 7);
    ctx.closePath();
  });
  if (formA(p)) {
    // chifres longos e curvados para trás
    for (const side of [-1, 1]) {
      shape(ctx, vertical(ctx, hy - 20, hy - 5, '#4a2a34', '#14060c'), () => {
        ctx.moveTo(side * 5, hy - 6);
        ctx.quadraticCurveTo(side * 13, hy - 12, side * 10, hy - 21);
        ctx.quadraticCurveTo(side * 9, hy - 13, side * 2.5, hy - 9);
        ctx.closePath();
      }, 1);
    }
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
      shape(ctx, sv ? sv.orb[0] : '#f0c8ff', () => poly(ctx, [rx, ry - 2, rx + 1.4, ry, rx, ry + 2, rx - 1.4, ry]), 0);
    }
    ctx.restore();
  }
  if (p.variant === 'epic') {
    // lua crescente vermelha presa no capuz
    halo(ctx, 0, hy - 8, 5, '#ff3a4a', 0.7);
    shape(ctx, '#ff4a5a', () => {
      ctx.arc(0, hy - 8, 3.2, 0, TAU);
      ctx.arc(1.4, hy - 8.8, 2.6, TAU, 0, true);
    }, 0.5);
  }
  shape(ctx, '#1a0812', () => ellipse(ctx, 1.5, hy + 0.5, 6, 6), 0);
  shape(ctx, radial(ctx, 2, hy + 1, 5, '#fbf6ff', '#cdbfe0'), () => ellipse(ctx, 2, hy + 1.2, 4.8, 5), 0);
  glowingEye(ctx, 0.6, hy + 0.4, 1.3, sv ? sv.eyes : orb);
  glowingEye(ctx, 4.2, hy + 0.4, 1.3, sv ? sv.eyes : orb);
  shape(ctx, '#ffffff', () => poly(ctx, [1.4, hy + 3.6, 2.2, hy + 3.6, 1.8, hy + 5]), 0.4);
  shape(ctx, '#ffffff', () => poly(ctx, [3.2, hy + 3.6, 4, hy + 3.6, 3.6, hy + 5]), 0.4);

  // mão e orbe de sangue (cresce ao lançar); no Sacerdote, um cálice dourado com sangue
  shape(ctx, '#e8dff0', () => circle(ctx, 9, 0 + float, 2), 0.8);
  ctx.save();
  ctx.shadowColor = orb;
  ctx.shadowBlur = 10;
  if (p.variant === 'epic') {
    const cy = -6 + float;
    shape(ctx, vertical(ctx, cy - 3, cy + 6, '#ffe48a', '#c8901a'), () => {
      ctx.moveTo(8.5, cy - 3);
      ctx.lineTo(15.5, cy - 3);
      ctx.quadraticCurveTo(15, cy + 2, 12.6, cy + 2.6);
      ctx.lineTo(12.6, cy + 5);
      ctx.lineTo(14.2, cy + 6);
      ctx.lineTo(9.8, cy + 6);
      ctx.lineTo(11.4, cy + 5);
      ctx.lineTo(11.4, cy + 2.6);
      ctx.quadraticCurveTo(9, cy + 2, 8.5, cy - 3);
      ctx.closePath();
    }, 0.8);
    shape(ctx, '#c00c24', () => ellipse(ctx, 12, cy - 2.6, 3.2, 0.9 + cast * 0.6), 0);
  } else {
    shape(ctx, radial(ctx, 12, -5 + float, 4, sv ? sv.orb[0] : mage ? '#f0a8ff' : '#ff8090', sv ? sv.orb[1] : mage ? '#6a0c8a' : '#a00c24'), () => circle(ctx, 12, -5 + float, 3 + cast * 1.5), 0.8);
  }
  ctx.restore();
  if (p.variant === 'legendary' && !ascended(p)) {
    // três orbes de sangue orbitando (nas formas evoluídas eles já aparecem)
    for (let i = 0; i < 3; i++) {
      const a = p.time * 2 + (i * TAU) / 3;
      shape(ctx, '#ff3a50', () => circle(ctx, Math.cos(a) * 13, -6 + Math.sin(a) * 5, 1.8), 0.4);
    }
  }

  if (mage) {
    // grimório aberto flutuando ao lado, com as páginas brilhando
    const by = -2 + Math.sin(p.time * 2) * 1.2;
    ctx.save();
    ctx.translate(-12, by);
    ctx.rotate(-0.2);
    shape(ctx, sv ? darken(sv.robe[0], 0.4) : '#3a0c5a', () => ctx.roundRect(-6, -4, 12, 8, 1), 1);
    shape(ctx, '#f4e8ff', () => poly(ctx, [-5.2, -3.2, -0.3, -2.4, -0.3, 3, -5.2, 2.4]), 0.5);
    shape(ctx, '#f4e8ff', () => poly(ctx, [0.3, -2.4, 5.2, -3.2, 5.2, 2.4, 0.3, 3]), 0.5);
    ctx.strokeStyle = sv ? sv.orb[1] : '#c03ae0';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (const y of [-1.2, 0.4, 2]) {
      ctx.moveTo(-4.4, y);
      ctx.lineTo(-1.2, y + 0.3);
      ctx.moveTo(1.2, y + 0.3);
      ctx.lineTo(4.4, y);
    }
    ctx.stroke();
    halo(ctx, 0, -1, 8, sv ? sv.orb[1] : '#c03ae0', 0.4 + cast * 0.4);
    ctx.restore();
  }
  if (arcane) {
    // círculo de runas de sangue girando em volta
    for (let i = 0; i < 6; i++) {
      const a = p.time * 1.2 + (i * TAU) / 6;
      const rx = Math.cos(a) * 15;
      const ry = -2 + Math.sin(a) * 7;
      shape(ctx, sv ? sv.orb[0] : '#f0a8ff', () => poly(ctx, [rx, ry - 2.4, rx + 1.6, ry, rx, ry + 2.4, rx - 1.6, ry]), 0.4);
    }
    halo(ctx, 12, -5 + float, 9, sv ? sv.orb[1] : '#c03ae0', 0.5 + cast * 0.4);
  }
  if (ascended(p)) {
    for (let i = 0; i < 3; i++) {
      const a = p.time * (mage ? 3 : 2) + (i * TAU) / 3;
      ctx.fillStyle = sv ? sv.orb[1] : mage ? '#d070ff' : '#e0243a';
      ctx.beginPath();
      circle(ctx, Math.cos(a) * 13, -6 + Math.sin(a) * 5, 1.6);
      ctx.fill();
    }
  }
}

// ---------- vampiro duelista ----------

/** Cores do Duelista em cada variante: capa, forro, roupa, gola, lâmina e olhos. */
const DUELIST_VARIANTS = {
  // Duelista do Luar: azul-noite com forro prata, espada prateada
  rare: { cape: ['#24346a', '#0a1028'], lining: ['#dce4f4', '#7a84a4'], body: ['#2e3c6e', '#141c3a'], collar: '#b8c4e4', blade: '#cfe8ff', eyes: '#8ad0ff' },
  // Mascarado do Baile: vinho bordado em ouro, máscara e chapéu de três pontas
  epic: { cape: ['#6a0c30', '#26040f'], lining: ['#f0c040', '#8a5a10'], body: ['#521036', '#200614'], collar: '#e8b030', blade: '#ffe8a0', eyes: '#ff3048' },
  // Senhor do Eclipse: negro com forro vermelho, eclipse atrás e espada de sombra
  legendary: { cape: ['#140c1e', '#020104'], lining: ['#ff2a40', '#5a0010'], body: ['#1a1428', '#06040a'], collar: '#ff2a40', blade: '#ff3a50', eyes: '#ff2a40' },
} as const;

/** Morcegos pequenos orbitando (Senhor do Eclipse). */
function orbitBats(ctx: Ctx, time: number, count: number, rx: number, ry: number, cy: number): void {
  for (let i = 0; i < count; i++) {
    const a = time * 1.3 + (i * TAU) / count;
    const x = Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry;
    const flap = Math.sin(time * 16 + i) * 1.4;
    shape(ctx, '#0e0610', () => poly(ctx, [x - 4, y - 1 - flap, x - 1, y, x, y - 1, x + 1, y, x + 4, y - 1 - flap, x + 1.6, y + 1.6, x - 1.6, y + 1.6]), 0.4);
    ctx.fillStyle = '#ff2a40';
    ctx.fillRect(x - 0.6, y - 0.2, 0.5, 0.5);
    ctx.fillRect(x + 0.2, y - 0.2, 0.5, 0.5);
  }
}

function drawVampire(ctx: Ctx, p: Required<SpritePose>): void {
  const lunge = p.attack * 4;
  const flutter = Math.sin(p.time * 4) * 1.5;
  // Lâmina Carmesim: capa toda vermelha, cabelo branco e duas lâminas
  const blade = formB(p);
  // Formas Supremas: Príncipe da Noite (A) e Dança das Lâminas (B)
  const prince = p.supreme && !blade;
  const dance = p.supreme && blade;
  const dv = p.variant ? DUELIST_VARIANTS[p.variant] : null;
  if (p.variant === 'legendary') {
    // eclipse atrás: disco negro com anel vermelho
    halo(ctx, 0, -18, 20, '#ff2a40', 0.45 + Math.sin(p.time * 2) * 0.1);
    shape(ctx, '#05020a', () => circle(ctx, 0, -18, 13), 0);
    ctx.save();
    ctx.strokeStyle = '#ff5a6a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    circle(ctx, 0, -18, 13);
    ctx.stroke();
    ctx.restore();
  }
  ctx.translate(lunge, 0);
  if (prince) {
    // capa enorme em asas de morcego, com morcegos saindo da barra
    const beat = Math.sin(p.time * 3) * 2;
    for (const side of [-1, 1]) {
      shape(ctx, vertical(ctx, -24, 14, dv ? dv.cape[0] : '#2a0a1a', dv ? dv.cape[1] : '#0a0208'), () => {
        ctx.moveTo(side * 2, -10);
        ctx.lineTo(side * 22, -22 - beat);
        ctx.lineTo(side * 19, -12 - beat);
        ctx.lineTo(side * 24, -6 - beat);
        ctx.lineTo(side * 18, 0);
        ctx.lineTo(side * 21, 8);
        ctx.lineTo(side * 6, 12);
        ctx.closePath();
      }, 1);
    }
    for (let i = 0; i < 3; i++) {
      const t = (p.time * 0.7 + i / 3) % 1;
      shape(ctx, '#1a0812', () => poly(ctx, [-14 + i * 12, 10 - t * 26, -11 + i * 12, 8 - t * 26, -8 + i * 12, 10 - t * 26, -11 + i * 12, 11 - t * 26]), 0.4);
    }
  }
  if (dance) {
    // duas espadas de sangue cristalizado cruzadas atrás
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(0, -2);
      ctx.rotate(side * 0.7 + Math.sin(p.time * 2 + side) * 0.05);
      shape(ctx, vertical(ctx, -26, 0, '#ffb0c0', '#a0101e'), () => poly(ctx, [-1.6, 0, 0, -26, 1.6, 0, 0, 3]), 0.8);
      ctx.restore();
    }
    halo(ctx, 0, -12, 12, '#ff3a50', 0.35);
  }

  // Conde (A): manto real bem mais largo, até o chão, com filete dourado e gola de arminho
  const count = formA(p) && !prince;
  // capa com forro vermelho e gola alta (na Lâmina Carmesim, a variante escurece a capa)
  const capeTop = dv ? (blade ? darken(dv.cape[0], 0.3) : dv.cape[0]) : blade ? '#a0101e' : '#2c1745';
  const capeBottom = dv ? dv.cape[1] : blade ? '#40060c' : '#120822';
  const w = count ? 1.35 : 1;
  shape(ctx, vertical(ctx, -10, 14, capeTop, capeBottom), () =>
    poly(ctx, [-5, -9, -16 * w, 14 + flutter, -7 * w, 11, 0, 15, 7 * w, 11, 15 * w, 14 - flutter, 5, -9]),
  );
  shape(ctx, vertical(ctx, -8, 12, dv ? dv.lining[0] : '#d0243a', dv ? dv.lining[1] : '#6e0c1c'), () =>
    poly(ctx, [-4, -7, -11 * w, 12 + flutter, -3, 9, 3, 9, 11 * w, 12 - flutter, 4, -7]),
    0,
  );
  if (count) {
    line(ctx, GOLD, 1.2, () => {
      ctx.moveTo(-16 * w, 14 + flutter);
      ctx.lineTo(-7 * w, 11);
      ctx.lineTo(0, 15);
      ctx.lineTo(7 * w, 11);
      ctx.lineTo(15 * w, 14 - flutter);
    }, false);
  }
  if (blade) {
    // Lâmina Carmesim: rabo de cavalo branco esvoaçando atrás
    const sw = Math.sin(p.time * 3) * 1.5;
    shape(ctx, vertical(ctx, -22, -4, '#ffffff', '#b8b8d0'), () => {
      ctx.moveTo(-5, -21);
      ctx.quadraticCurveTo(-14, -20 + sw, -19, -10 + sw);
      ctx.quadraticCurveTo(-13, -13 + sw, -7, -14);
      ctx.closePath();
    }, 0.9);
  }
  // corpo
  shape(ctx, vertical(ctx, -9, 10, dv ? dv.body[0] : '#3a2550', dv ? dv.body[1] : '#1c1030'), () => ctx.roundRect(-5.5, -9, 11, 19, [4, 4, 2, 2]));
  shape(ctx, '#f4eef8', () => poly(ctx, [-2.4, -9, 2.4, -9, 0, -3]), 0.8);
  shape(ctx, dv ? dv.collar : '#c01830', () => poly(ctx, [-1.2, -7, 1.2, -7, 0, -4.5]), 0);
  shape(ctx, '#1a0f26', () => ctx.roundRect(-4.5, 9, 3.6, 5, 1), 1);
  shape(ctx, '#1a0f26', () => ctx.roundRect(1, 9, 3.6, 5, 1), 1);

  // gola alta atrás da cabeça
  shape(ctx, dv ? dv.collar : '#b01a30', () => poly(ctx, [-3, -9, -10, -25, -7, -11]), 1);
  shape(ctx, dv ? dv.collar : '#b01a30', () => poly(ctx, [3, -9, 9, -24, 7, -11]), 1);
  if (count) {
    // gola de arminho sobre os ombros (branca com pintas pretas)
    shape(ctx, vertical(ctx, -11, -4, '#ffffff', '#d8d0e0'), () => ctx.roundRect(-9, -10.5, 18, 5.5, 2.8), 1);
    for (const x of [-6, -2, 2.5, 6.5]) shape(ctx, '#14101c', () => poly(ctx, [x, -9, x + 0.8, -7, x, -6.5, x - 0.8, -7]), 0);
  }
  if (blade) {
    // ombreira de armadura vermelha no ombro da frente
    shape(ctx, vertical(ctx, -11, -4, dv ? dv.lining[0] : '#ff5a6a', dv ? darken(dv.lining[1], 0.2) : '#7a0c1c'), () => ctx.roundRect(1, -11, 8, 6, [4, 4, 1.5, 1.5]), 1);
    shape(ctx, dv ? dv.collar : GOLD, () => ctx.rect(1.5, -6.5, 7, 0.9), 0);
  }

  // rapieira (de sombra com fio vermelho no Senhor do Eclipse)
  const thrust = p.attack * 7;
  const glowBlade = blade || p.variant === 'legendary';
  if (glowBlade) {
    ctx.save();
    ctx.shadowColor = dv ? dv.blade : '#ff2a40';
    ctx.shadowBlur = 6;
  }
  if (p.variant === 'legendary') {
    line(ctx, '#0a0410', 2.2, () => {
      ctx.moveTo(6, 0);
      ctx.lineTo(19 + thrust, -5 - thrust * 0.2);
    });
  }
  line(ctx, dv ? dv.blade : blade ? '#ff8a96' : '#dfe6f4', p.variant === 'legendary' ? 0.7 : 1.4, () => {
    ctx.moveTo(6, 0);
    ctx.lineTo(19 + thrust, -5 - thrust * 0.2);
  }, p.variant !== 'legendary');
  if (blade) {
    // segunda lâmina na outra mão, cruzando a primeira à frente do corpo
    line(ctx, dv ? dv.blade : '#ff8a96', 1.4, () => {
      ctx.moveTo(3, 4);
      ctx.lineTo(18 + thrust * 0.6, 9 - thrust * 0.3);
    });
    shape(ctx, dv ? dv.collar : '#f0c35a', () => circle(ctx, 3.5, 4, 2), 1);
  }
  if (glowBlade) ctx.restore();
  shape(ctx, dv ? dv.collar : '#f0c35a', () => circle(ctx, 6.5, 0, 2.2), 1);

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
  glowingEye(ctx, 1.5, hy + 0.8, 1.5, dv ? dv.eyes : '#ff3048');
  glowingEye(ctx, 5.4, hy + 0.8, 1.5, dv ? dv.eyes : '#ff3048');
  if (p.variant === 'epic') {
    // máscara veneziana dourada (com os furos dos olhos) e ponta curva ao lado
    shape(ctx, vertical(ctx, hy - 2, hy + 3, '#ffe48a', '#c8901a'), () => {
      ctx.moveTo(-2, hy - 1);
      ctx.quadraticCurveTo(3.5, hy - 3, 8.5, hy - 1);
      ctx.quadraticCurveTo(8, hy + 2.6, 5.2, hy + 2.8);
      ctx.quadraticCurveTo(3.5, hy + 1.6, 1.8, hy + 2.8);
      ctx.quadraticCurveTo(-1, hy + 2.6, -2, hy - 1);
      ctx.closePath();
    }, 0.8);
    shape(ctx, '#e8b030', () => poly(ctx, [-2, hy - 0.5, -6, hy - 4, -4, hy + 1]), 0.6);
    glowingEye(ctx, 1.5, hy + 0.8, 1.1, dv!.eyes);
    glowingEye(ctx, 5.4, hy + 0.8, 1.1, dv!.eyes);
  }
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
  // Mascarado: chapéu de três pontas com pluma (a coroa do Conde vai por cima)
  const hatLift = p.variant === 'epic' ? 5 : 0;
  if (p.variant === 'epic') {
    shape(ctx, vertical(ctx, hy - 18, hy - 6, '#ffd8e8', '#c04a7a'), () => {
      ctx.moveTo(-6, hy - 10);
      ctx.quadraticCurveTo(-14, hy - 18, -10, hy - 22);
      ctx.quadraticCurveTo(-8, hy - 15, -3, hy - 11);
      ctx.closePath();
    }, 0.8);
    shape(ctx, vertical(ctx, hy - 14, hy - 6, '#3a0a20', '#14040a'), () => {
      ctx.moveTo(-10, hy - 7);
      ctx.quadraticCurveTo(-8, hy - 15, 0.5, hy - 14);
      ctx.quadraticCurveTo(9, hy - 15, 11, hy - 7);
      ctx.quadraticCurveTo(0.5, hy - 10, -10, hy - 7);
      ctx.closePath();
    }, 1);
    line(ctx, GOLD, 0.9, () => {
      ctx.moveTo(-9.5, hy - 7.4);
      ctx.quadraticCurveTo(0.5, hy - 10.4, 10.5, hy - 7.4);
    }, false);
  }
  if (formA(p)) {
    // Conde: coroa maior; Príncipe da Noite: ainda mais alta, de ônix com rubis
    const tall = prince ? 1.6 : 1.3;
    const cy = hy - hatLift;
    shape(ctx, prince ? '#2a1a2a' : GOLD, () => poly(ctx, [-5, cy - 8, -5.5, cy - 8 - 5 * tall, -2, cy - 8 - 2.5 * tall, 0.5, cy - 8 - 6 * tall, 3, cy - 8 - 2.5 * tall, 6.5, cy - 8 - 5 * tall, 6, cy - 8]), 0.9);
    shape(ctx, '#e0243a', () => circle(ctx, 0.5, cy - 10.5, prince ? 1.5 : 1.2), 0.5);
    for (const x of [-4, 5]) shape(ctx, '#e0243a', () => circle(ctx, x, cy - 9.5, 0.9), 0.4);
    shape(ctx, GOLD, () => circle(ctx, 0, -3, 2.2), 0.8);
  }
  if (p.variant === 'legendary') orbitBats(ctx, p.time, 3, 17, 6, -12);
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
  // Formas Supremas
  /** Chifres longos e coroa de espinhos (Dragão Primordial). */
  primal?: boolean;
  /** Chamas vivas ao longo das costas e brasas (Wyrm do Apocalipse). */
  flames?: boolean;
  /** Faixas de aurora nas asas (Dragão Boreal). */
  aurora?: boolean;
  /** Névoa congelante em volta (Zero Absoluto). */
  frost?: boolean;
  /** Nuvem de tempestade sobre a cabeça (Senhor dos Raios). */
  stormCloud?: boolean;
  /** Olho brilhante no peito e vento girando (Furacão). */
  eye?: boolean;
  // Formas A (nível 3): dragão adulto (maior, chifres grossos, placas no peito) com a marca do elemento
  /** Brasa acesa no peito e chama na ponta da cauda (Fogo A). */
  emberChest?: boolean;
  /** Cristais de gelo nos ombros (Gelo A). */
  shoulderCrystals?: boolean;
  /** Listras de raio pelo corpo (Dragão do Trovão). */
  stormStripes?: boolean;
  // Variantes do Altar
  /** Fumaça saindo das narinas (Vulcânico). */
  smoke?: boolean;
  /** Penas de fogo nas asas, crista de chamas e plumas na cauda (Dragão-Fênix). */
  phoenix?: boolean;
  /** Juba de neve no pescoço e pingentes sob o queixo (Neves Eternas). */
  snowMane?: boolean;
  /** Aurora correndo pelo corpo (Dragão Boreal da variante). */
  auroraBody?: boolean;
  /** Rebites de bronze e para-raios nos chifres (Dragão de Bronze). */
  bronze?: boolean;
  /** Bigodes longos ondulando, nuvens douradas e pérola flutuando (Serpente Celeste). */
  celestial?: boolean;
}

/** Variantes dos dragões: cores trocadas e marcas próprias (as marcas da forma continuam). */
type DragonVariant = Partial<DragonPalette>;
const DRAGON_VARIANTS: Partial<Record<CreatureId, Record<'rare' | 'epic' | 'legendary', DragonVariant>>> = {
  fireDragon: {
    // Dragão Dourado
    rare: { body: '#f0c040', bodyDark: '#a0701a', belly: '#fff4d0', wing: '#c8901a', membrane: '#ffe08a', horn: '#fff8e0', iris: '#c06a10', breath: '#ffd25a' },
    // Dragão Vulcânico: rocha com lava, chifres de obsidiana, fumaça
    epic: { body: '#6a5a58', bodyDark: '#2a1c1a', belly: '#ff9a3a', wing: '#3a2a28', membrane: '#ff5a1a', horn: '#1a1014', iris: '#ffb030', breath: '#ff7a1a', lava: true, smoke: true },
    // Dragão-Fênix: asas de penas em chamas
    legendary: { body: '#fff2c4', bodyDark: '#f0a020', belly: '#ffffff', wing: '#ff5a1a', membrane: '#ff9a2a', horn: '#ffffff', iris: '#ff4a1a', breath: '#ffe07a', phoenix: true },
  },
  iceDragon: {
    // Dragão de Quartzo Rosa
    rare: { body: '#f0a0c8', bodyDark: '#b0507a', belly: '#fff0f6', wing: '#c86a9a', membrane: '#ffd0e8', horn: '#ffffff', iris: '#c03a7a', breath: '#ffd0e8' },
    // Dragão das Neves Eternas: juba de neve e pingentes
    epic: { body: '#a8bcd4', bodyDark: '#56688a', belly: '#e8f0f8', wing: '#7a90b4', membrane: '#dce8f8', horn: '#cfeeff', iris: '#3a8ad8', breath: '#ffffff', snowMane: true },
    // Dragão Boreal: aurora no corpo e nas asas
    legendary: { body: '#3a2470', bodyDark: '#120a2e', belly: '#c8f4ff', wing: '#1e1448', membrane: '#3ad8b0', horn: '#e8fcff', iris: '#7affd8', breath: '#c8fff0', aurora: true, auroraBody: true },
  },
  storm: {
    // Dragão do Crepúsculo
    rare: { body: '#e88a4a', bodyDark: '#7a3a8a', belly: '#ffe0c0', wing: '#8a4aa0', membrane: '#ffb070', horn: '#fff0e0', iris: '#ffe060', breath: '#fff6a0' },
    // Dragão de Bronze: placas com rebites, para-raios nos chifres
    epic: { body: '#c08a4a', bodyDark: '#6a4a1a', belly: '#e8d0a0', wing: '#8a5a2a', membrane: '#e0b070', horn: '#d8dce4', iris: '#7af0ff', breath: '#bff8ff', bronze: true },
    // Serpente Celeste: dourada, bigodes longos, nuvens e pérola
    legendary: { body: '#ffe8a0', bodyDark: '#c89020', belly: '#fff8e0', wing: '#e0b040', membrane: '#fff0b0', horn: '#ffffff', iris: '#c02a2a', breath: '#ffffff', celestial: true },
  },
};

/** Paleta final do dragão: a da forma, com as cores e marcas da variante (a forma B escurece a variante). */
function dragonLook(id: CreatureId, p: Required<SpritePose>, base: DragonPalette): DragonPalette {
  const variant = p.variant ? DRAGON_VARIANTS[id]?.[p.variant] : undefined;
  if (!variant) return base;
  const look = { ...base, ...variant };
  if (formB(p)) {
    look.body = darken(look.body, 0.3);
    look.bodyDark = darken(look.bodyDark, 0.3);
    look.wing = darken(look.wing, 0.25);
  }
  return look;
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

/** Dragão Primordial (suprema do Dragão Ancião): vermelho-ouro antigo, chifres longos. */
const PRIMORDIAL_DRAGON: DragonPalette = { ...FIRE_DRAGON, body: '#c8401a', bodyDark: '#5a1408', belly: '#ffe9a8', wing: '#7a1a0a', membrane: '#ffb040', horn: '#ffe9a8', iris: '#ffd25a', breath: '#ffd25a', primal: true, emberChest: true };

/** Wyrm do Apocalipse (suprema do Wyrm Infernal): negro em chamas vivas. */
const APOCALYPSE_WYRM: DragonPalette = { ...INFERNAL_WYRM, body: '#2a1418', bodyDark: '#0a0204', membrane: '#ff4a1a', flames: true };

/** Dragão Boreal (suprema do Glacial): asas translúcidas com aurora. */
const BOREAL_DRAGON: DragonPalette = { ...ICE_DRAGON, body: '#bfe8ff', bodyDark: '#4a7ab8', wing: '#6aa8d8', membrane: '#dff8ff', aurora: true, shoulderCrystals: true };

/** Zero Absoluto (suprema do Congelante): cristal com névoa congelante. */
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

/** Zero Absoluto (suprema do Congelante): cristal com névoa congelante. */
const ABSOLUTE_ZERO: DragonPalette = { ...FROZEN_DRAGON, body: '#ffffff', bodyDark: '#8ac0e8', breath: '#ffffff', frost: true };

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

/** Senhor dos Raios e Furacão (supremas da Tempestade) ficam logo abaixo das bases. */
/** Dragão do Trovão (Tempestade A): escuro com raios amarelos e crina de raios. */
const THUNDER_DRAGON: DragonPalette = { ...STORM_DRAGON, body: '#4a4a8a', bodyDark: '#1e1e48', wing: '#2a2a60', membrane: '#7a7ad0', belly: '#ffe9a0', stormStripes: true };

/** Dragão Ancião (Fogo A): bigodes, barba e chifres curvados. */
const ELDER_DRAGON: DragonPalette = { ...FIRE_DRAGON, body: '#e06a2a', bodyDark: '#8a2a10', emberChest: true };

/** Gelo A: coroa de cristais e barba de pingentes. */
const GLACIAL_DRAGON: DragonPalette = { ...ICE_DRAGON, body: '#4aa8e8', bodyDark: '#1e4a98', shoulderCrystals: true };

/** Olho da Tormenta (Tempestade B): azul-céu com nuvens girando. */
const TEMPEST_DRAGON: DragonPalette = { ...STORM_DRAGON, body: '#6aa8e0', bodyDark: '#2a5a90', wing: '#3a78b8', membrane: '#cfeaff', iris: '#bfeaff', breath: '#e8fbff', clouds: true };

/** Senhor dos Raios (suprema do Trovão): nuvem de tempestade sobre a cabeça. */
const LIGHTNING_LORD: DragonPalette = { ...THUNDER_DRAGON, iris: '#fff6a0', stormCloud: true };

/** Furacão (suprema do Olho da Tormenta): olho no peito e vento girando. */
const HURRICANE_DRAGON: DragonPalette = { ...TEMPEST_DRAGON, eye: true };

/** Chama em forma de gota, tremulando (cauda e crista dos dragões de fogo). `angle` 0 = para cima. */
function flame(ctx: Ctx, x: number, y: number, w: number, h: number, angle: number, time: number): void {
  const flicker = 1 + Math.sin(time * 11) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  halo(ctx, 0, -h * 0.4, h * 0.7, '#ffb040', 0.6);
  for (const [scale, top, bottom] of [[1, '#ffd040', '#ff4a1a'], [0.55, '#ffffff', '#ffe07a']] as const) {
    const fw = w * scale;
    const fh = h * scale * flicker;
    shape(ctx, vertical(ctx, -fh, 0, top, bottom), () => {
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-fw * 1.3, -fh * 0.35, 0, -fh);
      ctx.quadraticCurveTo(fw * 1.3, -fh * 0.35, 0, 0);
      ctx.closePath();
    }, scale === 1 ? 0.5 : 0);
  }
  ctx.restore();
}

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
  // formas A (e suas Supremas): dragão adulto, 15% maior (cresce a partir dos pés)
  const adult = formA(p);
  if (adult) {
    ctx.translate(0, 14);
    ctx.scale(1.15, 1.15);
    ctx.translate(0, -14);
  }

  if (c.frost) {
    // névoa congelante girando em volta
    for (let i = 0; i < 5; i++) {
      const a = p.time * 0.8 + (i * TAU) / 5;
      halo(ctx, Math.cos(a) * 16, 4 + Math.sin(a) * 6, 7, '#e8fbff', 0.45);
    }
  }
  if (c.eye) {
    // vento girando (arcos)
    ctx.save();
    ctx.strokeStyle = '#e8f4ffaa';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const a = p.time * 3 + (i * TAU) / 3;
      ctx.beginPath();
      ctx.ellipse(0, 2, 18, 9, 0, a, a + 1.4);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (c.celestial) {
    // nuvens douradas sob o corpo
    for (const [x, y, r] of [[-12, 13, 4], [-6, 15, 5], [2, 15, 5], [9, 13, 4]] as const) {
      shape(ctx, vertical(ctx, y - r, y + r, '#fff4c0', '#e0a830'), () => circle(ctx, x + Math.sin(p.time * 1.5 + x) * 0.8, y, r), 0.6);
    }
  }
  dragonWing(ctx, c, flap, false);
  // cauda
  shape(ctx, c.body, () => {
    ctx.moveTo(-6, 4);
    ctx.quadraticCurveTo(-16, 10, -19, 1 + tail);
    ctx.quadraticCurveTo(-14, 6, -5, 9);
    ctx.closePath();
  });
  shape(ctx, c.bodyDark, () => poly(ctx, [-19, 1 + tail, -23, -2 + tail, -20, 4 + tail]), 1);
  if (c.phoenix || c.emberChest) {
    // chama em gota na ponta da cauda (maior na Fênix)
    const size = c.phoenix ? 1.6 : 1.3;
    flame(ctx, -21, 1 + tail, 2.6 * size, 7 * size, -0.9, p.time);
  }
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
  if (adult) {
    // placas de armadura no peito (dragão adulto)
    for (const y of [-0.5, 3, 6.5]) shape(ctx, vertical(ctx, y, y + 3.4, c.belly, darken(c.belly, 0.18)), () => ctx.roundRect(-1.2, y, 7.6, 3.4, 1.6), 0.6);
  }
  if (c.emberChest) {
    // brasa acesa no peito
    halo(ctx, 2.6, 2, 6 + Math.sin(p.time * 4) * 0.8, '#ff8a2a', 0.8);
    shape(ctx, radial(ctx, 2.6, 2, 2.6, '#fff4b0', '#ff6a1a'), () => circle(ctx, 2.6, 2, 2.2), 0.6);
  }
  if (c.stormStripes) {
    // listras de raio pelo flanco
    for (const y of [-3, 3]) {
      shape(ctx, '#ffe060', () => poly(ctx, [-8.5, y, -5, y - 1.6, -4, y + 0.4, -0.5, y - 1.2, -1.5, y + 1.4, -5, y + 2.4, -6, y + 0.6, -8.8, y + 1.6]), 0.5);
    }
  }
  if (c.auroraBody) {
    // faixas de aurora correndo pelo corpo
    ['#7affc8', '#7ac8ff', '#e08aff'].forEach((color, i) => {
      ctx.save();
      ctx.globalAlpha *= 0.5 + Math.sin(p.time * 2.5 + i * 1.3) * 0.25;
      line(ctx, color, 1.4, () => {
        ctx.moveTo(-8, -2 + i * 3);
        ctx.quadraticCurveTo(-3, -5 + i * 3 + Math.sin(p.time * 3 + i) * 1.5, 1, -1 + i * 3);
      }, false);
      ctx.restore();
    });
  }
  if (c.bronze) {
    // placas de bronze com rebites
    line(ctx, c.bodyDark, 0.8, () => {
      ctx.moveTo(-8, -2);
      ctx.quadraticCurveTo(-4, 0, -2, -6);
      ctx.moveTo(-8, 6);
      ctx.quadraticCurveTo(-4, 7, -2, 3);
    }, false);
    for (const [x, y] of [[-7, -1], [-4, -4], [-7, 7], [-4, 5]] as const) shape(ctx, '#f0d8a0', () => circle(ctx, x, y, 0.8), 0.3);
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
  if (ascended(p) && !c.emberChest) {
    ctx.save();
    ctx.shadowColor = c.breath;
    ctx.shadowBlur = 8;
    shape(ctx, c.breath, () => poly(ctx, [2.5, -1, 5, 2, 2.5, 5, 0, 2]), 0.8);
    ctx.restore();
  }
  dragonWing(ctx, c, flap, true);
  if (c.phoenix) {
    // brilho de fogo na asa da frente
    halo(ctx, -10, -14 + flap * 3, 10, '#ffb040', 0.45 + Math.sin(p.time * 5) * 0.1);
  }
  if (c.shoulderCrystals) {
    // cristais de gelo no ombro, em cacho
    halo(ctx, -8, -6, 10, '#7ad8ff', 0.5);
    for (const [x, y, h, lean] of [[-11, 0, 8, -0.75], [-8.5, -3, 11, -0.4], [-5, -4, 8, -0.05]] as const) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(lean);
      shape(ctx, vertical(ctx, -h, 0, '#e8fcff', '#2a9ae0'), () => poly(ctx, [-2.4, 0, -2.4, -h * 0.7, 0, -h, 2.4, -h * 0.7, 2.4, 0]), 0.9);
      line(ctx, '#ffffff', 0.6, () => {
        ctx.moveTo(-0.8, -1);
        ctx.lineTo(-0.8, -h * 0.75);
      }, false);
      ctx.restore();
    }
  }
  if (c.aurora) {
    // faixas de aurora sobre a asa da frente
    const colors = ['#7affc8', '#7ac8ff', '#c08aff'];
    colors.forEach((color, i) => {
      ctx.save();
      ctx.globalAlpha *= 0.45 + Math.sin(p.time * 2 + i) * 0.15;
      line(ctx, color, 1.6, () => {
        ctx.moveTo(-1 - i * 2, -6 + i * 2);
        ctx.quadraticCurveTo(-8 - i * 2, -16 + flap * 3, -14 - i, -12 + flap * 3 + i * 3);
      }, false);
      ctx.restore();
    });
  }
  if (c.flames) {
    // chamas vivas ao longo das costas e brasas subindo
    for (let i = 0; i < 5; i++) {
      const x = -8 + i * 3;
      const y = -6 + Math.abs(i - 2) * 1.5;
      const h = 5 + Math.sin(p.time * 10 + i * 1.3) * 2;
      shape(ctx, i % 2 ? '#ffd040' : '#ff5a1a', () => poly(ctx, [x - 1.6, y, x, y - h, x + 1.6, y]), 0);
    }
    for (let i = 0; i < 3; i++) {
      const t = (p.time * 0.8 + i / 3) % 1;
      halo(ctx, -6 + i * 5, -8 - t * 16, 2.2, '#ffb040', 1 - t);
    }
  }
  if (c.eye) {
    // olho da tempestade no peito
    halo(ctx, 2.5, 4, 7, '#bfeaff', 0.7);
    shape(ctx, '#ffffff', () => ellipse(ctx, 2.5, 4, 2.6, 1.8), 0.6);
    shape(ctx, '#3ab8ff', () => circle(ctx, 2.5 + Math.sin(p.time) * 0.6, 4, 1.1), 0);
  }

  // cabeça
  const hy = -13;
  if (c.primal) {
    // coroa de espinhos atrás da cabeça
    for (let i = 0; i < 5; i++) {
      const a = -2.4 + i * 0.32;
      shape(ctx, '#ffe9a8', () => poly(ctx, [4 + Math.cos(a) * 7, hy + Math.sin(a) * 7, 4 + Math.cos(a) * 14, hy + Math.sin(a) * 14, 4 + Math.cos(a + 0.15) * 7, hy + Math.sin(a + 0.15) * 7]), 0.6);
    }
  }
  if (c.phoenix) {
    // crista de chamas em gota atrás da cabeça
    flame(ctx, -2, hy - 4, 2.6, 9, -0.5, p.time);
    flame(ctx, 2, hy - 6, 2.4, 8, -0.15, p.time + 1);
  }
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
  const horn = c.primal ? 2.1 : ascended(p) ? 1.5 : 1;
  const hornColor = formA(p) && !p.variant ? GOLD : c.horn;
  if (adult) {
    // chifres grossos curvados para trás (dragão adulto)
    for (const [x, len] of [[-1, 1.25], [3, 1.05]] as const) {
      shape(ctx, vertical(ctx, hy - 20, hy - 6, hornColor, darken(hornColor, 0.35)), () => {
        ctx.moveTo(x - 2.5, hy - 6);
        ctx.quadraticCurveTo(x - 5 * len, hy - 15 * len, x - 11 * len, hy - 16 * len);
        ctx.quadraticCurveTo(x - 4 * len, hy - 10 * len, x + 3.5, hy - 7.5);
        ctx.closePath();
      }, 1);
    }
  } else {
    shape(ctx, hornColor, () => poly(ctx, [-1, hy - 6, -1 - 7 * horn, hy - 6 - 7 * horn, 2, hy - 8]), 1);
    shape(ctx, hornColor, () => poly(ctx, [3, hy - 7, 3 - 4 * horn, hy - 7 - 8 * horn, 6, hy - 8]), 1);
  }
  if (c.bronze) {
    // para-raios: pontas de aço com faísca
    for (const [x, y] of [[-1 - 7 * horn, hy - 6 - 7 * horn], [3 - 4 * horn, hy - 7 - 8 * horn]] as const) {
      shape(ctx, '#ffffff', () => circle(ctx, x, y, 0.9), 0.4);
      if (Math.sin(p.time * 8 + x) > 0.4) halo(ctx, x, y, 3, '#7af0ff', 0.9);
    }
  }
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
  if (c.snowMane) {
    // neve acumulada no alto da cabeça (gorro de neve) e nas costas
    shape(ctx, vertical(ctx, hy - 10, hy - 4, '#ffffff', '#dceaf8'), () => {
      ctx.moveTo(-3.5, hy - 4.5);
      ctx.quadraticCurveTo(-3, hy - 10, 3, hy - 9.6);
      ctx.quadraticCurveTo(9, hy - 10, 10.5, hy - 5);
      ctx.quadraticCurveTo(8, hy - 6.5, 6, hy - 5.6);
      ctx.quadraticCurveTo(3, hy - 7, 0, hy - 5.4);
      ctx.quadraticCurveTo(-2, hy - 6, -3.5, hy - 4.5);
      ctx.closePath();
    }, 0.8);
    shape(ctx, '#ffffff', () => ellipse(ctx, -7, -3, 4, 2.2, -0.5), 0.7);
  }
  if (c.smoke) {
    // fumaça subindo das narinas
    for (let i = 0; i < 3; i++) {
      const t = (p.time * 0.7 + i / 3) % 1;
      halo(ctx, 15 + t * 3, hy - t * 12, 2 + t * 3, '#8a8088', 0.6 * (1 - t));
    }
  }
  if (c.celestial) {
    // pérola flutuando acima do focinho
    const py = hy - 8 + Math.sin(p.time * 2) * 1.5;
    halo(ctx, 15, py, 6, '#fff4c0', 0.7);
    shape(ctx, radial(ctx, 14.4, py - 0.6, 2.6, '#ffffff', '#c8d8f0'), () => circle(ctx, 15, py, 2.4), 0.6);
  }
  if (c.stormCloud) {
    // nuvem de tempestade sobre a cabeça, com raio piscando
    for (const [x, y, r] of [
      [0, hy - 18, 5],
      [6, hy - 20, 6],
      [12, hy - 18, 5],
    ] as const) shape(ctx, '#4a4a6a', () => circle(ctx, x, y, r), 0.8);
    if (Math.sin(p.time * 9) > 0.3) {
      line(ctx, '#fff6a0', 1.2, () => {
        ctx.moveTo(6, hy - 15);
        ctx.lineTo(4, hy - 11);
        ctx.lineTo(7, hy - 10);
        ctx.lineTo(5, hy - 6);
      }, false);
    }
  }
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
    ctx.lineTo(15 + p.attack * 5, -3 - shamble * 1.5 - p.attack * 2);
  });
  shape(ctx, '#8fc06a', () => circle(ctx, 15.5 + p.attack * 5, -3 - shamble * 1.5 - p.attack * 2, 2.2), 1);

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
  ctx.translate(p.attack * 3, p.attack * 5);
  ctx.rotate(p.attack * 0.5);
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
  ctx.rotate(0.45 + stomp * 0.08 + p.attack * 1.4);
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
