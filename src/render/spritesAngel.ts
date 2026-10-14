// Raça Anjo: Querubim, Valquíria, Guardião e o herói Arcanjo.
import {
  halo as glow,
  circle,
  darken,
  ellipse,
  flame,
  star,
  eye,
  formA,
  formB,
  GOLD,
  line,
  poly,
  radial,
  shape,
  skin,
  TAU,
  vertical,
  type Ctx,
  type Pose,
} from './spriteKit';

/** Asas de penas brancas (pares extras para o Serafim). */
function featherWings(ctx: Ctx, t: number, color: string, size: number, y: number, pairs = 1): void {
  const flap = Math.sin(t * 5) * 0.2;
  for (let k = 0; k < pairs; k++) {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(-1, y + k * 5);
      ctx.scale(side, 1);
      ctx.rotate(-0.3 + flap + k * 0.35);
      shape(ctx, vertical(ctx, -10 * size, 4 * size, '#ffffff', color), () => {
        ctx.moveTo(1, 0);
        ctx.quadraticCurveTo(8 * size, -10 * size, 15 * size, -7 * size);
        ctx.lineTo(12 * size, -3 * size);
        ctx.lineTo(14 * size, -1 * size);
        ctx.lineTo(10 * size, 1 * size);
        ctx.lineTo(11 * size, 3 * size);
        ctx.quadraticCurveTo(5 * size, 4 * size, 1, 2);
        ctx.closePath();
      }, 0.8);
      ctx.restore();
    }
  }
}

/** Asas de vitral (Querubim de Vitral): painéis coloridos entre veios de chumbo. */
function stainedWings(ctx: Ctx, t: number, pairs: number): void {
  const flap = Math.sin(t * 5) * 0.2;
  const colors = ['#ff6a8a', '#ffd040', '#6ab8ff', '#7ae8a0', '#c08aff'];
  for (let k = 0; k < pairs; k++) {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(-1, -3 + k * 5);
      ctx.scale(side, 1);
      ctx.rotate(-0.3 + flap + k * 0.35);
      const pts: [number, number][] = [[1, 0], [6, -8], [12, -8], [12, -2], [8, 3], [2, 2]];
      // cinco painéis em leque a partir da base
      for (let i = 0; i < 5; i++) {
        const a = pts[i]!;
        const b = pts[i + 1]!;
        shape(ctx, colors[(i + k) % colors.length]!, () => poly(ctx, [1, 0, a[0], a[1], b[0], b[1]]), 0.9);
      }
      ctx.restore();
    }
  }
}

function halo(ctx: Ctx, x: number, y: number, r: number, color = '#ffe48a'): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.32, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** Querubim: anjinho com arco de luz. A: Serafim (três pares de asas douradas); B: Arauto (trombeta). */
export function drawCherub(ctx: Ctx, p: Pose): void {
  // Formas Supremas: Seis Asas (A, quatro asas extras com olhos) e Trombeta do Juízo (B, trombeta dourada)
  if (p.supreme && formA(p)) {
    for (const [dy, s] of [[-12, 1.1], [4, 0.9]] as const) {
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * 3, dy);
        ctx.scale(side, 1);
        ctx.rotate(-0.3 + Math.sin(p.time * 6 + dy) * 0.15);
        shape(ctx, '#fff8e8', () => ellipse(ctx, 9 * s, 0, 9 * s, 3.5 * s), 0.6);
        shape(ctx, '#3a6ad8', () => circle(ctx, 10 * s, 0, 1.1), 0.3);
        ctx.restore();
      }
    }
  }
  const seraph = formA(p);
  const herald = formB(p);
  const CV = {
    // Querubim Rosado
    rare: { wing: '#ffb8d8', skin: ['#fff0e8', '#f0c0b0'], hair: '#ffb0c8', cloth: '#ffd8ec', eyes: '#d84a8a' },
    // Cupido: arco com ponta de coração, asas vermelhas, aljava
    epic: { wing: '#ff6a8a', skin: ['#fff0e0', '#f0c0a8'], hair: '#c86a3a', cloth: '#ff8aa8', eyes: '#c8304a' },
    // Querubim de Vitral: corpo e asas de vitral colorido com contornos de chumbo
    legendary: { wing: '#6ab8ff', skin: ['#fff4c0', '#ffd060'], hair: '#ff6a8a', cloth: '#7ae8a0', eyes: '#1a1a24' },
  } as const;
  const cv = p.variant ? CV[p.variant] : null;
  ctx.translate(0, -4 + Math.sin(p.time * 3) * 1.6);
  if (seraph && !p.supreme) {
    // Serafim: anjo em chamas, com um anel de fogo dourado atrás
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + p.time * 0.8;
      flame(ctx, 0.5 + Math.cos(a) * 9, -8 + Math.sin(a) * 9, 2, 6, a + Math.PI / 2, p.time + i, { outer: ['#fff4b0', '#ffb020'], inner: ['#ffffff', '#fff4c0'], glow: '#ffd040' });
    }
  }
  if (p.variant === 'legendary') stainedWings(ctx, p.time, seraph ? 3 : 1);
  else featherWings(ctx, p.time * 1.4, cv ? cv.wing : seraph ? '#ffd25a' : '#d8e4ff', seraph && !p.supreme ? 0.95 : 0.75, -3, seraph ? 3 : 1);
  shape(ctx, radial(ctx, 0, 2, 7, cv ? cv.skin[0] : '#fff0e0', cv ? cv.skin[1] : '#f0c0a8'), () => ellipse(ctx, 0, 2, 5.5, 6.5));
  shape(ctx, cv ? cv.cloth : '#ffffff', () => poly(ctx, [-5, 3, 5, 3, 4, 8, -4, 8]), 0.6);
  if (p.variant === 'legendary') {
    // corpo de vitral: painéis coloridos com o chumbo escuro
    for (const [pts, c] of [
      [[-5, -3, 0, -4, 0, 3, -5, 3], '#ff6a8a'],
      [[0, -4, 5, -3, 5, 3, 0, 3], '#ffd040'],
      [[-5, 3, 0, 3, 0, 8, -4, 8], '#6ab8ff'],
      [[0, 3, 5, 3, 4, 8, 0, 8], '#7ae8a0'],
    ] as const) shape(ctx, c, () => poly(ctx, [...pts]), 1);
  }
  const hy = -8;
  shape(ctx, radial(ctx, 0.5, hy, 6, cv ? cv.skin[0] : '#fff0e0', cv ? cv.skin[1] : '#f0c0a8'), () => circle(ctx, 0.5, hy, 5.8));
  shape(ctx, cv ? cv.hair : '#ffe08a', () => {
    for (let i = 0; i < 4; i++) {
      const x = -4 + i * 2.6;
      ctx.moveTo(x + 1.5, hy - 4);
      ctx.arc(x, hy - 4, 1.6, 0, TAU);
    }
  }, 0.5);
  eye(ctx, -0.6, hy + 0.6, 1.5, cv ? cv.eyes : '#3a8ad8', 0.4);
  eye(ctx, 2.8, hy + 0.6, 1.5, cv ? cv.eyes : '#3a8ad8', 0.4);
  halo(ctx, 0.5, hy - 8, 4.5, p.variant === 'legendary' ? '#ff6a8a' : undefined);
  if (herald && !p.supreme) {
    // Arauto: trombeta grande com estandarte pendurado
    ctx.save();
    ctx.translate(5, -4);
    ctx.rotate(-0.4 - p.attack * 0.3);
    shape(ctx, vertical(ctx, -6, 6, '#fff4b0', '#c8901a'), () => poly(ctx, [0, -1, 12, -2, 17, -6, 17, 6, 12, 2, 0, 1]), 0.8);
    const wave = Math.sin(p.time * 4) * 0.8;
    shape(ctx, vertical(ctx, 1, 11, cv ? cv.cloth : '#5a8ad8', cv ? cv.wing : '#2a4a9a'), () => poly(ctx, [4, 1.4, 11, 1.8, 11 + wave, 10, 7.5 + wave, 8, 4 + wave, 10]), 0.6);
    shape(ctx, GOLD, () => star(ctx, 7.5 + wave * 0.5, 5, 1.6), 0);
    ctx.restore();
  } else if (herald) {
    // trombeta dourada
    ctx.save();
    ctx.translate(5, -4);
    ctx.rotate(-0.4 - p.attack * 0.3);
    shape(ctx, GOLD, () => poly(ctx, [0, -0.8, 9, -1.6, 13, -4, 13, 4, 9, 1.6, 0, 0.8]), 0.7);
    ctx.restore();
  } else {
    // arco de luz (com ponta de coração no Cupido)
    line(ctx, p.variant === 'epic' ? '#ff4a6a' : seraph ? GOLD : '#fff6c0', 1.4, () => ctx.arc(5, 0, 7, -1.2, 1.2));
    if (p.variant === 'epic') {
      for (const a of [-1.2, 1.2]) {
        const x = 5 + Math.cos(a) * 7;
        const y = Math.sin(a) * 7;
        shape(ctx, '#ff4a6a', () => {
          ctx.moveTo(x, y + 1.6);
          ctx.bezierCurveTo(x - 2.4, y - 0.6, x - 1, y - 2.2, x, y - 0.8);
          ctx.bezierCurveTo(x + 1, y - 2.2, x + 2.4, y - 0.6, x, y + 1.6);
          ctx.closePath();
        }, 0.4);
      }
    }
  }
  if (p.supreme && formB(p)) {
    ctx.save();
    ctx.translate(6, -8);
    ctx.rotate(-0.3 - p.attack * 0.3);
    shape(ctx, vertical(ctx, -2, 2, '#fff2b0', '#c8901a'), () => poly(ctx, [0, -0.8, 12, -3.5, 12, 3.5, 0, 0.8]), 0.6);
    glow(ctx, 12, 0, 6, '#ffe9a8', 0.5 + p.attack * 0.5);
    ctx.restore();
  }
}

/** Valquíria: guerreira alada de lança. A: Matadora de Reis (armadura dourada); B: Lança Celeste (lança azul brilhante). */
/** Corcel alado branco (montaria da Valquíria do Corcel Alado). */
function wingedSteed(ctx: Ctx, t: number, charge: number): void {
  const gallop = Math.sin(t * 7);
  // asa de trás
  featherWings(ctx, t * 1.2, '#c8d8ff', 1.1, -2);
  // patas
  for (const [x, ph] of [[-8, 0], [-4, 1.5], [5, 0.8], [9, 2.3]] as const) {
    line(ctx, '#d8dce8', 2.4, () => {
      ctx.moveTo(x, 4);
      ctx.lineTo(x + Math.sin(t * 7 + ph) * 2, 11);
    });
    shape(ctx, '#8a8a9a', () => ctx.rect(x - 1.2 + Math.sin(t * 7 + ph) * 2, 11, 2.4, 1.6), 0.4);
  }
  // cauda
  shape(ctx, '#f4f4fa', () => {
    ctx.moveTo(-11, -1);
    ctx.quadraticCurveTo(-17, 2 + gallop, -16, 9);
    ctx.quadraticCurveTo(-13, 4, -10, 2);
    ctx.closePath();
  }, 0.7);
  // corpo
  shape(ctx, radial(ctx, 0, 0, 12, '#ffffff', '#c8ccd8'), () => ellipse(ctx, 0, 1, 12, 5.5), 1);
  // pescoço e cabeça
  ctx.save();
  ctx.translate(9, -2);
  ctx.rotate(-0.6 - charge * 0.2);
  shape(ctx, radial(ctx, 4, -4, 7, '#ffffff', '#c8ccd8'), () => {
    ctx.moveTo(-2, 2);
    ctx.lineTo(2, -7);
    ctx.lineTo(9, -6);
    ctx.quadraticCurveTo(11, -3, 8, -2);
    ctx.lineTo(4, -2);
    ctx.lineTo(3, 3);
    ctx.closePath();
  }, 1);
  shape(ctx, '#ffe8a0', () => poly(ctx, [1, -6, -2, -2, 2, -1]), 0.5);
  shape(ctx, '#1a1a24', () => circle(ctx, 5, -5, 0.8), 0);
  ctx.restore();
  // asa da frente
  ctx.save();
  ctx.translate(0, 1);
  featherWings(ctx, t * 1.2 + 0.5, '#e8eeff', 1, -3);
  ctx.restore();
}

export function drawValkyrie(ctx: Ctx, p: Pose): void {
  const slayer = formA(p);
  const celestial = formB(p);
  const VV = {
    // Valquíria Rubra: armadura carmesim
    rare: { armor: ['#e05a5a', '#7a1414'], skirt: '#3a1a2a', hair: '#ffd88a', wing: '#ffc8c8' },
    // Valquíria Nórdica: aço escuro, capa de pele, tranças ruivas e escudo redondo pintado
    epic: { armor: ['#8a94a8', '#3a4050'], skirt: '#5a3a1e', hair: '#d8602a', wing: '#e0e4ec' },
    // Valquíria do Corcel Alado: armadura de prata e ouro, montada num cavalo alado branco
    legendary: { armor: ['#f4f4fa', '#c8a040'], skirt: '#3a5ad8', hair: '#fff0b0', wing: '#e8eeff' },
  } as const;
  const vv = p.variant ? VV[p.variant] : null;
  const shadeB = (c: string) => (vv && celestial ? darken(c, 0.15) : c);
  const armor = vv ? shadeB(vv.armor[0]) : slayer ? '#f0c35a' : '#c8d2e6';
  const armorDark = vv ? vv.armor[1] : slayer ? '#8a6418' : '#6a7896';
  if (p.variant === 'legendary') {
    // montada no corcel alado: o cavalo embaixo, ela sentada mais alto
    ctx.save();
    ctx.translate(-1, 4);
    wingedSteed(ctx, p.time, p.attack);
    ctx.restore();
    ctx.translate(-2, -9);
  }
  if (slayer && !p.supreme) {
    // Matadora de Reis: capa vermelha longa
    const wind = Math.sin(p.time * 2.5) * 1.5;
    shape(ctx, vertical(ctx, -10, 14, '#d02a3a', '#5a0a14'), () => {
      ctx.moveTo(-5, -9);
      ctx.quadraticCurveTo(-13 + wind, 2, -14 + wind, 14);
      ctx.lineTo(-6, 12);
      ctx.lineTo(2, -9);
      ctx.closePath();
    }, 1);
  }
  if (p.variant === 'epic' && !p.supreme) {
    // capa de pele nos ombros
    shape(ctx, vertical(ctx, -12, 6, '#8a6a4a', '#3a2a1a'), () => poly(ctx, [-8, -11, 7, -11, 9, 5, -10, 5]), 1);
  }
  if (p.variant !== 'legendary') featherWings(ctx, p.time, celestial && !p.supreme ? '#9fdcff' : vv ? vv.wing : '#c8d8ff', celestial && !p.supreme ? 1.2 : 0.95, -9);
  shape(ctx, '#4a5068', () => ctx.roundRect(-4.5, 6, 4, 8, 1.5));
  shape(ctx, '#4a5068', () => ctx.roundRect(0.5, 6, 4, 8, 1.5));
  shape(ctx, vertical(ctx, -10, 8, armor, armorDark), () => ctx.roundRect(-6, -10, 12, 17, [4, 4, 2, 2]));
  shape(ctx, vv ? vv.skirt : '#5a6ab0', () => poly(ctx, [-5, 4, 5, 4, 6, 10, -6, 10]), 0.8);
  if (p.variant === 'epic') {
    // escudo redondo pintado com um nó nórdico
    shape(ctx, radial(ctx, -8, 0, 7, '#e0c08a', '#8a5a2a'), () => circle(ctx, -8, 0, 6), 1);
    line(ctx, '#2a4a8a', 1.2, () => {
      ctx.moveTo(-14, 0);
      ctx.lineTo(-2, 0);
      ctx.moveTo(-8, -6);
      ctx.lineTo(-8, 6);
    }, false);
    shape(ctx, '#a8acb8', () => circle(ctx, -8, 0, 1.6), 0.6);
  }
  // lança (estocada)
  const thrust = p.attack * 6;
  if (celestial) {
    ctx.save();
    ctx.shadowColor = '#9fdcff';
    ctx.shadowBlur = 8;
  }
  // Lança Celeste (B): lança bem mais longa e brilhante
  const reach = celestial && !p.supreme ? 9 : 0;
  if (celestial && !p.supreme) glow(ctx, 20 + thrust + reach, -8.5, 8, '#9fdcff', 0.7);
  line(ctx, celestial ? '#bfe8ff' : '#8a6a3a', celestial && !p.supreme ? 2.2 : 1.6, () => {
    ctx.moveTo(-6 + thrust, 0.6);
    ctx.lineTo(18 + thrust + reach, -6 - reach * 0.27);
  });
  shape(ctx, celestial ? '#ffffff' : '#e8f0ff', () => poly(ctx, [17 + thrust + reach, -8.5 - reach * 0.27, 24 + thrust + reach * 1.3, -7.5 - reach * 0.3, 18 + thrust + reach, -4 - reach * 0.27]), 0.8);
  if (celestial) ctx.restore();
  // cabeça com elmo alado e tranças
  const hy = -15;
  shape(ctx, vv ? vv.hair : '#ffd88a', () => {
    ctx.moveTo(-5.5, hy);
    ctx.quadraticCurveTo(-9, hy + 8, -6, hy + 12);
    ctx.lineTo(-3, hy + 3);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 6, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6));
  shape(ctx, vertical(ctx, hy - 8, hy - 1, armor, armorDark), () => {
    ctx.moveTo(-6, hy - 1);
    ctx.quadraticCurveTo(-5, hy - 8, 1, hy - 8);
    ctx.quadraticCurveTo(7, hy - 8, 7, hy - 1);
    ctx.closePath();
  });
  // asas do elmo (bem maiores na Matadora de Reis)
  const helmWing = slayer && !p.supreme ? 1.6 : 1;
  for (const side of [-1, 1]) shape(ctx, '#ffffff', () => poly(ctx, [1 + side * 5, hy - 5, 1 + side * (5 + 5 * helmWing), hy - 5 - 5 * helmWing, 1 + side * 6, hy - 3]), 0.6);
  eye(ctx, 1, hy + 0.8, 1.5, '#3a6ad8', 0.4);
  eye(ctx, 4.4, hy + 0.8, 1.5, '#3a6ad8', 0.4);
  if (p.variant === 'epic') {
    // tranças ruivas grossas caindo à frente
    for (const x of [-4, 6]) shape(ctx, '#d8602a', () => ctx.roundRect(x - 1.2, hy + 2, 2.4, 9, 1.2), 0.6);
  }
  if (slayer) {
    shape(ctx, vertical(ctx, hy - 13, hy - 8, '#fff0a0', '#c8901a'), () => poly(ctx, [-2, hy - 8, -2.5, hy - 12, 0, hy - 10, 1, hy - 13, 2, hy - 10, 4.5, hy - 12, 4, hy - 8]), 0.5);
  }
  if (p.supreme && formA(p)) {
    // elmo alado e espada de luz
    for (const side of [-1, 1]) shape(ctx, '#ffffff', () => poly(ctx, [1 + side * 4, -22, 1 + side * 11, -28, 1 + side * 8, -20]), 0.6);
    glow(ctx, 10, -10, 9, '#fff6c0', 0.6);
    ctx.save();
    ctx.translate(9, -2);
    ctx.rotate(-0.7 + p.attack);
    shape(ctx, vertical(ctx, -22, 0, '#ffffff', '#ffe9a8'), () => poly(ctx, [-1.4, 0, 0, -22, 1.4, 0]), 0.6);
    ctx.restore();
  }
  if (p.supreme && formB(p)) {
    // lança gigante dourada
    ctx.save();
    ctx.translate(-6, 6);
    ctx.rotate(-0.9 + p.attack * 0.4);
    line(ctx, '#c8901a', 2, () => {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -38);
    });
    shape(ctx, vertical(ctx, -48, -36, '#ffffff', '#ffd25a'), () => poly(ctx, [-3, -37, 0, -48, 3, -37]), 0.6);
    glow(ctx, 0, -42, 7, '#fff6c0', 0.6);
    ctx.restore();
  }
}

/** Guardião Celestial: anjo alto com escudo grande. A: Égide Celeste (escudo dourado com sol); B: Juiz (espada e balança). */
/** Anéis de Ofanim: dois anéis dourados entrelaçados girando, cobertos de olhos. */
function ophanimRings(ctx: Ctx, t: number, front: boolean): void {
  for (const [tilt, speed] of [[0.5, 1], [-0.5, -0.8]] as const) {
    ctx.save();
    ctx.translate(0, -4);
    ctx.rotate(tilt);
    // só metade do anel de cada vez: a de trás antes do corpo, a da frente depois
    const start = front ? 0 : Math.PI;
    ctx.strokeStyle = '#e0a830';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 6, 0, start, start + Math.PI);
    ctx.stroke();
    ctx.strokeStyle = '#fff0a0';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = t * speed + (i / 8) * TAU;
      const norm = ((a % TAU) + TAU) % TAU;
      if (front ? norm > Math.PI : norm <= Math.PI) continue;
      const x = Math.cos(a) * 17;
      const y = Math.sin(a) * 6;
      shape(ctx, '#ffffff', () => ellipse(ctx, x, y, 1.6, 1.1), 0.5);
      shape(ctx, '#3a8ad8', () => circle(ctx, x + 0.3, y, 0.6), 0);
    }
    ctx.restore();
  }
}

export function drawGuardianAngel(ctx: Ctx, p: Pose): void {
  const aegis = formA(p);
  const judge = formB(p);
  const GV = {
    // Guardião de Bronze
    rare: { robe: ['#e8b070', '#8a5a2a'], wing: '#f0c890', hair: '#6a3a1a', shield: ['#f0c070', '#8a5a1a'] },
    // Anjo de Pedra: estátua cinza com rachaduras e musgo
    epic: { robe: ['#c8c4bc', '#6a6660'], wing: '#b8b4ac', hair: '#a8a49c', shield: ['#d0ccc4', '#7a766e'] },
    // Ofanim: corpo de luz dourada dentro de anéis de olhos girando
    legendary: { robe: ['#fff8e0', '#e0b040'], wing: '#fff0b0', hair: '#ffffff', shield: ['#fff4c0', '#e0a830'] },
  } as const;
  const gv = p.variant ? GV[p.variant] : null;
  const shadeB = (c: string) => (gv && judge ? darken(c, 0.2) : c);
  ctx.translate(0, -2 + Math.sin(p.time * 2) * 1.2);
  if (p.variant === 'legendary') {
    glow(ctx, 0, -4, 20, '#ffe08a', 0.5);
    ophanimRings(ctx, p.time, false);
  }
  featherWings(ctx, p.time * 0.8, gv ? gv.wing : judge ? '#a8b0c8' : '#e0e8ff', aegis && !p.supreme ? 1.45 : 1.15, -8, p.variant === 'legendary' ? 2 : 1);
  if (judge && !p.supreme) {
    // Juiz: toga escura longa
    shape(ctx, vertical(ctx, -10, 14, gv ? shadeB(gv.robe[0]) : '#3a3a4a', '#0e0e16'), () => poly(ctx, [-6, -10, 6, -10, 10, 14, -10, 14]), 1);
  }
  shape(ctx, vertical(ctx, -10, 14, gv ? shadeB(gv.robe[0]) : judge ? '#d8dce8' : '#ffffff', gv ? gv.robe[1] : judge ? '#6a7090' : '#c8d0e8'), () =>
    poly(ctx, [-5, -10, 5, -10, 8, 14, -8, 14]),
  );
  shape(ctx, GOLD, () => ctx.rect(-6, 2, 12, 1.4), 0.5);
  if (p.variant === 'epic') {
    // rachaduras e musgo de estátua
    line(ctx, '#4a4640', 0.7, () => {
      ctx.moveTo(-3, -8);
      ctx.lineTo(-1, -3);
      ctx.lineTo(-3, 1);
      ctx.moveTo(3, 6);
      ctx.lineTo(5, 10);
    }, false);
    shape(ctx, '#5a9a4a', () => ellipse(ctx, -5, 12, 4, 1.6), 0.4);
    shape(ctx, '#5a9a4a', () => ellipse(ctx, 6, -9, 2.4, 1.2), 0.4);
  }
  if (judge) {
    // espada erguida e balança
    line(ctx, '#e8f0ff', 1.6, () => {
      ctx.moveTo(-6, 0);
      ctx.lineTo(-8, -20);
    });
    shape(ctx, GOLD, () => ctx.rect(-9.5, -3, 4, 1.4), 0.5);
    line(ctx, GOLD, 0.9, () => {
      ctx.moveTo(6, -6);
      ctx.lineTo(12, -6);
      ctx.moveTo(9, -9);
      ctx.lineTo(9, -6);
    });
    const tilt = Math.sin(p.time * 2) * 1.2;
    shape(ctx, GOLD, () => ellipse(ctx, 6, -2 + tilt, 2, 0.8), 0.4);
    shape(ctx, GOLD, () => ellipse(ctx, 12, -2 - tilt, 2, 0.8), 0.4);
  } else if (aegis && !p.supreme) {
    // Égide Celeste: escudo-torre grande com um sol de raios
    shape(ctx, vertical(ctx, -14, 14, gv ? gv.shield[0] : '#fff0b0', gv ? gv.shield[1] : '#c8901a'), () => {
      ctx.moveTo(2, -14);
      ctx.lineTo(16, -14);
      ctx.lineTo(16, 4);
      ctx.quadraticCurveTo(16, 12, 9, 15);
      ctx.quadraticCurveTo(2, 12, 2, 4);
      ctx.closePath();
    }, 1.1);
    glow(ctx, 9, -1, 7, '#ffe9a8', 0.6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + p.time * 0.4;
      shape(ctx, '#ffd25a', () => poly(ctx, [9 + Math.cos(a - 0.3) * 3, -1 + Math.sin(a - 0.3) * 3, 9 + Math.cos(a) * 5.5, -1 + Math.sin(a) * 5.5, 9 + Math.cos(a + 0.3) * 3, -1 + Math.sin(a + 0.3) * 3]), 0);
    }
    shape(ctx, '#fff6c0', () => circle(ctx, 9, -1, 2.8), 0.5);
  } else {
    // escudo grande
    shape(ctx, vertical(ctx, -8, 10, gv ? gv.shield[0] : aegis ? '#fff0b0' : '#e8f0ff', gv ? gv.shield[1] : aegis ? '#c8901a' : '#8aa0c8'), () => {
      ctx.moveTo(4, -8);
      ctx.lineTo(13, -8);
      ctx.lineTo(13, 2);
      ctx.quadraticCurveTo(13, 8, 8.5, 11);
      ctx.quadraticCurveTo(4, 8, 4, 2);
      ctx.closePath();
    });
    if (aegis) {
      ctx.save();
      ctx.shadowColor = '#ffe9a8';
      ctx.shadowBlur = 8;
      shape(ctx, '#fff6c0', () => circle(ctx, 8.5, 0, 2.4), 0.5);
      ctx.restore();
    } else {
      shape(ctx, '#5a8ad8', () => poly(ctx, [8, -5, 9, -5, 9, -1, 11.5, -1, 11.5, 0.2, 9, 0.2, 9, 7, 8, 7, 8, 0.2, 5.5, 0.2, 5.5, -1, 8, -1]), 0.4);
    }
  }
  const hy = -16;
  shape(ctx, radial(ctx, 1, hy, 6, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6));
  shape(ctx, gv ? gv.hair : judge ? '#c8ccd8' : '#fff0a0', () => {
    ctx.moveTo(-6, hy);
    ctx.quadraticCurveTo(-3, hy - 9, 7, hy - 3);
    ctx.lineTo(6.5, hy - 5.5);
    ctx.quadraticCurveTo(0, hy - 10, -6.5, hy - 3);
    ctx.closePath();
  }, 0.7);
  if (judge && !p.supreme) {
    // Juiz: venda nos olhos
    shape(ctx, '#f4f0e0', () => ctx.roundRect(-5, hy - 0.6, 12.5, 2.8, 1.2), 0.6);
    shape(ctx, '#f4f0e0', () => poly(ctx, [-5, hy + 0.4, -9, hy + 4, -7, hy + 5, -5, hy + 1.8]), 0.5);
  } else if (p.variant === 'epic') {
    // olhos de pedra, sem pupila
    for (const x of [1, 4.4]) shape(ctx, '#a8a49c', () => ellipse(ctx, x, hy + 0.8, 1.4, 1.2), 0.4);
  } else {
    eye(ctx, 1, hy + 0.8, 1.5, judge ? '#5a5a7a' : p.variant === 'legendary' ? '#e0a830' : '#3a8ad8', 0.4);
    eye(ctx, 4.4, hy + 0.8, 1.5, judge ? '#5a5a7a' : p.variant === 'legendary' ? '#e0a830' : '#3a8ad8', 0.4);
  }
  halo(ctx, 1, hy - 9, 5.5, judge ? '#bfe8ff' : '#ffe48a');
  if (judge && !p.supreme) {
    // balança da justiça flutuando sobre a cabeça
    const y = hy - 17 + Math.sin(p.time * 2) * 1.2;
    const tilt = Math.sin(p.time * 1.5) * 1.5;
    line(ctx, '#e0a830', 1, () => {
      ctx.moveTo(1, y - 3);
      ctx.lineTo(1, y + 2);
      ctx.moveTo(-6, y + tilt);
      ctx.lineTo(8, y - tilt);
    }, false);
    for (const [x, s] of [[-6, 1], [8, -1]] as const) {
      const yy = y + s * tilt;
      line(ctx, '#e0a830', 0.6, () => {
        ctx.moveTo(x, yy);
        ctx.lineTo(x, yy + 4);
      }, false);
      shape(ctx, '#ffd25a', () => ellipse(ctx, x, yy + 4.5, 2.6, 0.9), 0.5);
    }
  }
  if (p.variant === 'legendary') ophanimRings(ctx, p.time, true);
  if (p.supreme && formA(p)) {
    // escudo de luz enorme à frente
    glow(ctx, 8, -4, 16, '#fff6c0', 0.5);
    shape(ctx, vertical(ctx, -18, 10, '#ffffffcc', '#ffd25a88'), () => {
      ctx.moveTo(1, -16);
      ctx.lineTo(15, -16);
      ctx.lineTo(15, 0);
      ctx.quadraticCurveTo(15, 8, 8, 11);
      ctx.quadraticCurveTo(1, 8, 1, 0);
      ctx.closePath();
    }, 0.8);
  }
  if (p.supreme && formB(p)) {
    // balança dourada flutuando acima
    const y = -36 + Math.sin(p.time * 2) * 1.5;
    const tilt = Math.sin(p.time * 1.5) * 2;
    line(ctx, '#c8901a', 1, () => {
      ctx.moveTo(0, y - 4);
      ctx.lineTo(0, y + 2);
      ctx.moveTo(-8, y + tilt);
      ctx.lineTo(8, y - tilt);
    }, false);
    for (const side of [-1, 1]) {
      const yy = y - side * tilt;
      line(ctx, '#c8901a', 0.6, () => {
        ctx.moveTo(side * 8, yy);
        ctx.lineTo(side * 8, yy + 5);
      }, false);
      shape(ctx, '#ffd25a', () => ellipse(ctx, side * 8, yy + 5.5, 3, 1), 0.5);
    }
    glow(ctx, 0, y, 10, '#ffe9a8', 0.4);
  }
}

/** Herói Arcanjo: grandes asas, armadura dourada e espada de luz. */
export function drawArchangel(ctx: Ctx, p: Pose): void {
  const wing = skin(p, 'wing', '#d8e4ff');
  const armor = skin(p, 'armor', '#f0c35a');
  const armorDark = skin(p, 'armorDark', '#8a6418');
  const glow = skin(p, 'glow', '#fff6c0');
  const step = p.moving ? Math.sin(p.time * 8) : 0;
  featherWings(ctx, p.time * 0.7, wing, 1.35, -10);
  shape(ctx, '#5a5068', () => ctx.roundRect(-5 + step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, '#5a5068', () => ctx.roundRect(0.5 - step * 1.5, 6, 4.5, 8, 1.5));
  shape(ctx, vertical(ctx, -11, 8, armor, armorDark), () => ctx.roundRect(-7, -11, 14, 18, [5, 5, 3, 3]));
  shape(ctx, '#ffffff', () => poly(ctx, [-6, 3, 6, 3, 7, 10, -7, 10]), 0.8);
  // espada de luz
  ctx.save();
  ctx.translate(7, -3);
  ctx.rotate(0.5 + p.attack * 1.2);
  line(ctx, armorDark, 1.6, () => {
    ctx.moveTo(0, 3);
    ctx.lineTo(0, -1);
  });
  shape(ctx, armor, () => ctx.rect(-3, -1.6, 6, 1.4), 0.5);
  ctx.shadowColor = glow;
  ctx.shadowBlur = 12;
  shape(ctx, vertical(ctx, -20, -1, '#ffffff', glow), () => poly(ctx, [-1.5, -1.5, 1.5, -1.5, 0.5, -20, -0.5, -20]), 0.5);
  ctx.restore();
  const hy = -17;
  shape(ctx, radial(ctx, 1, hy, 6.5, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6.4));
  shape(ctx, '#fff0a0', () => {
    ctx.moveTo(-6.5, hy);
    ctx.quadraticCurveTo(-3, hy - 9, 7, hy - 3);
    ctx.lineTo(6.5, hy - 5.5);
    ctx.quadraticCurveTo(0, hy - 10.5, -7, hy - 3);
    ctx.closePath();
  }, 0.7);
  eye(ctx, 1, hy + 0.8, 1.6, '#3a8ad8', 0.4);
  eye(ctx, 4.6, hy + 0.8, 1.6, '#3a8ad8', 0.4);
  halo(ctx, 1, hy - 10, 6);
}
