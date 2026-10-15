// Terceiras classes das raças atuais (F9): Clériga, Enxame de Morcegos, Possessor e Herbalista.
// (Tempestade usa o desenho de dragão em sprites.ts; Uivador usa a cabeça de lobo em spritesMystic.ts.)
import {
  circle,
  darken,
  ellipse,
  eye,
  flame,
  formA,
  formB,
  glowingEye,
  GOLD,
  halo,
  line,
  poly,
  radial,
  shape,
  TAU,
  vertical,
  type Ctx,
  type Pose,
} from './spriteKit';

/** Cores da Clériga em cada variante: túnica, túnica da Inquisidora, véu, filetes, luz do cajado e olhos. */
const CLERIC_VARIANTS = {
  // Irmã do Lírio: hábito branco e lilás, lírio no véu, luz lilás
  rare: { robe: ['#fbf6ff', '#b898e8'], inq: ['#6a3a9a', '#24103a'], veil: ['#ffffff', '#d4c0f4'], trim: '#b08ae0', orb: '#e8d8ff', glow: '#c8a0ff', eyes: '#8a5ad8' },
  // Oráculo: azul-meia-noite e ouro, venda dourada, cajado com olho de cristal, runas aos pés
  epic: { robe: ['#4a4ab8', '#14143e'], inq: ['#3a2a7a', '#0e0a24'], veil: ['#f4ecd8', '#c8b88a'], trim: GOLD, orb: '#bfe8ff', glow: '#ffd25a', eyes: '#5a8ad8' },
  // Santa da Aurora: branco com reflexos de aurora, asas de luz, auréola de sete cores, flores aos pés
  legendary: { robe: ['#ffffff', '#a8e8ff'], inq: ['#4a6ac8', '#1a1a5a'], veil: ['#ffffff', '#d0f4ff'], trim: '#9af0ff', orb: '#ffffff', glow: '#9af0ff', eyes: '#4ab8c8' },
} as const;

/** Clériga: túnica clara, véu e cajado com sol. A: Sacerdotisa dourada com auréola; B: Inquisidora de vermelho e preto com maça em chamas. */
export function drawCleric(ctx: Ctx, p: Pose): void {
  // Santa (suprema A): flutua, auréola de vitral e véu longo; Grã-Inquisidora (suprema B): livro em chamas
  const saint = p.supreme && formA(p);
  const grand = p.supreme && formB(p);
  if (p.variant === 'epic') runeCircle(ctx, 0, 14, p.time, p.attack ?? 0);
  if (p.variant === 'legendary') {
    auroraWings(ctx, 0, saint ? -12 : -7, p.time);
    groundFlowers(ctx, p.time);
  }
  if (saint) {
    const lift = -4 + Math.sin(p.time * 2) * 1.2;
    ctx.save();
    ctx.translate(0, lift);
    drawSaint(ctx, p);
    ctx.restore();
    return;
  }
  const breathe = Math.sin(p.time * 2) * 0.6;
  const inq = formB(p);
  const cv = p.variant ? CLERIC_VARIANTS[p.variant] : null;
  const robe = cv ? (inq ? cv.inq[0] : cv.robe[0]) : inq ? '#5a1418' : formA(p) ? '#fff6dc' : '#f4f0f8';
  const robeDark = cv ? (inq ? cv.inq[1] : cv.robe[1]) : inq ? '#1a0608' : formA(p) ? '#d8b860' : '#b8b0d0';
  const trim = cv ? cv.trim : inq ? '#ff7a3a' : GOLD;

  // Sacerdotisa (A): mitra alta e estola dourada (o que a separa da Clériga base em qualquer variante)
  const priestess = formA(p) && !inq;

  // túnica
  shape(ctx, vertical(ctx, -10, 14, robe, robeDark), () =>
    poly(ctx, [-5, -9 + breathe, 5, -9 + breathe, 9, 14, -9, 14]),
  );
  if (priestess) {
    // estola: duas faixas largas do ombro até a barra, com cruzes
    for (const x of [-4.2, 1.6]) {
      shape(ctx, vertical(ctx, -8, 14, cv ? cv.trim : '#ffe48a', cv ? darken(cv.trim, 0.3) : '#c8901a'), () => poly(ctx, [x, -8 + breathe, x + 2.6, -8 + breathe, x + 3.2 + (x > 0 ? 1.2 : -0.4), 14, x - 0.6 + (x > 0 ? 1.2 : -0.4), 14]), 0.7);
      shape(ctx, '#ffffff', () => {
        ctx.rect(x + 0.9, 6, 0.9, 3.4);
        ctx.rect(x + 0.1, 7, 2.4, 0.9);
      }, 0);
    }
  } else shape(ctx, trim, () => ctx.rect(-1.2, -8 + breathe, 2.4, 22), 0.6);
  shape(ctx, trim, () => ctx.rect(-7, 4, 14, 1.6), 0.6);

  // cajado (ou maça flamejante)
  ctx.save();
  ctx.translate(8, 2);
  ctx.rotate(0.2 + p.attack * 0.6);
  line(ctx, inq ? '#2a1a14' : '#c8a060', 1.8, () => {
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -16);
  });
  if (inq) {
    shape(ctx, '#3a3a44', () => ctx.roundRect(-3.5, -21, 7, 6, 1.5), 1);
    ctx.shadowColor = '#ff7a3a';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 3; i++) {
      const h = 4 + Math.sin(p.time * 12 + i * 2) * 1.5;
      shape(ctx, '#ffb040', () => poly(ctx, [-3 + i * 3, -21, -1.5 + i * 3, -21 - h, 0 + i * 3, -21]), 0);
    }
  } else if (p.variant === 'epic') {
    // olho de cristal no topo do cajado, dentro de um aro dourado
    ctx.shadowColor = '#bfe8ff';
    ctx.shadowBlur = 8 + (p.attack ?? 0) * 8;
    shape(ctx, GOLD, () => circle(ctx, 0, -18, 4.2), 0.8);
    ctx.shadowBlur = 0;
    shape(ctx, '#ffffff', () => ellipse(ctx, 0, -18, 3.2, 2.2), 0.4);
    shape(ctx, '#3a8ad8', () => circle(ctx, 0.4, -18, 1.5), 0);
    shape(ctx, '#0e0a14', () => circle(ctx, 0.5, -18, 0.7), 0);
  } else {
    ctx.shadowColor = cv ? cv.glow : '#ffe9a8';
    ctx.shadowBlur = 8 + p.attack * 8;
    shape(ctx, cv ? cv.orb : '#fff0b0', () => circle(ctx, 0, -18, 3), 0.8);
    ctx.strokeStyle = cv ? cv.glow : GOLD;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + p.time;
      ctx.moveTo(Math.cos(a) * 4, -18 + Math.sin(a) * 4);
      ctx.lineTo(Math.cos(a) * 6, -18 + Math.sin(a) * 6);
    }
    ctx.stroke();
  }
  ctx.restore();

  // rosto e véu (capuz pontudo na Inquisidora)
  const hy = -15 + breathe;
  if (grand) {
    // Grã-Inquisidora: auréola de chamas grande atrás da cabeça
    halo(ctx, 1, hy - 3, 18, '#ff8a3a', 0.4 + p.attack * 0.3);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.36;
      flame(ctx, 1 + Math.cos(a) * 11, hy - 3 + Math.sin(a) * 11, 2.6, 8 + (i % 2) * 2, a + Math.PI / 2, p.time + i);
    }
  }
  shape(ctx, radial(ctx, 1, hy, 7, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6.5));
  if (inq) {
    shape(ctx, vertical(ctx, hy - 14, hy + 8, cv ? cv.inq[0] : '#8a1a20', cv ? cv.inq[1] : '#2a0608'), () =>
      poly(ctx, [-8, hy + 7, -7, hy - 4, 0, hy - 15, 7, hy - 4, 8, hy + 7, 5, hy + 5, 5, hy - 2, -4, hy - 2, -5, hy + 5]),
    );
    if (p.variant === 'epic') blindfold(ctx, hy);
    else {
      glowingEye(ctx, 0.5, hy + 0.5, 1.2, cv ? cv.glow : '#ffb040');
      glowingEye(ctx, 4, hy + 0.5, 1.2, cv ? cv.glow : '#ffb040');
    }
  } else {
    shape(ctx, vertical(ctx, hy - 9, hy + 8, cv ? cv.veil[0] : '#ffffff', cv ? cv.veil[1] : '#c8c0e0'), () => {
      ctx.moveTo(-7.5, hy + 7);
      ctx.quadraticCurveTo(-9, hy - 8, 1, hy - 8.5);
      ctx.quadraticCurveTo(8, hy - 8, 6.5, hy - 3);
      ctx.lineTo(-3, hy - 3);
      ctx.lineTo(-4, hy + 7);
      ctx.closePath();
    });
    if (p.variant === 'epic') blindfold(ctx, hy);
    else {
      eye(ctx, 1.4, hy + 0.6, 1.6, cv ? cv.eyes : '#5a8ad8', 0.4);
      eye(ctx, 4.8, hy + 0.6, 1.6, cv ? cv.eyes : '#5a8ad8', 0.4);
    }
  }
  if (priestess) mitre(ctx, hy, cv ? cv.veil : ['#ffffff', '#e8dcc0'], cv ? cv.trim : GOLD);
  if (p.variant === 'rare') lily(ctx, -5, hy - 6);
  if (p.variant === 'legendary' && !inq) {
    // auréola de sete cores (no lugar da dourada), acima da mitra na Sacerdotisa
    rainbowHalo(ctx, 1, hy - (priestess ? 21 : 12), p.time);
  } else if (priestess) {
    // na Sacerdotisa, a auréola vira um brilho atrás da mitra
    halo(ctx, 1, hy - 10, 11, cv ? cv.glow : '#ffe48a', 0.45 + Math.sin(p.time * 2) * 0.1);
  } else if (formA(p)) {
    ctx.save();
    ctx.strokeStyle = '#ffe48a';
    ctx.shadowColor = '#ffe48a';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(1, hy - 12, 6.5, 2, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  if (grand) {
    // livro aberto em chamas diante do peito: o raio sai dele
    ctx.save();
    ctx.translate(4, -3 + breathe);
    ctx.rotate(-0.15);
    shape(ctx, '#3a0a10', () => ctx.roundRect(-6, -3.5, 12, 7, 1), 0.9);
    shape(ctx, '#f4ead0', () => poly(ctx, [-5.2, -2.8, -0.3, -2, -0.3, 2.6, -5.2, 2]), 0.5);
    shape(ctx, '#f4ead0', () => poly(ctx, [0.3, -2, 5.2, -2.8, 5.2, 2, 0.3, 2.6]), 0.5);
    ctx.strokeStyle = '#8a1a20';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    for (const y of [-1, 0.5]) {
      ctx.moveTo(-4.4, y);
      ctx.lineTo(-1.2, y + 0.3);
      ctx.moveTo(1.2, y + 0.3);
      ctx.lineTo(4.4, y);
    }
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const h = 4 + Math.sin(p.time * 11 + i * 1.7) * 1.6 + p.attack * 4;
      shape(ctx, i % 2 ? '#ffd040' : '#ff6a2a', () => poly(ctx, [-4.5 + i * 3, -3, -3 + i * 3, -3 - h, -1.5 + i * 3, -3]), 0);
    }
    halo(ctx, 0, -5, 9, '#ff8a3a', 0.45 + p.attack * 0.4);
    ctx.restore();
  }
}

/** Santa (Forma Suprema da Sacerdotisa): véu longo, auréola de vitral e mãos em prece; flutua. */
function drawSaint(ctx: Ctx, p: Pose): void {
  const t = p.time;
  const cv = p.variant ? CLERIC_VARIANTS[p.variant] : null;
  // rosácea de vitral enorme atrás, girando devagar
  ctx.save();
  ctx.translate(0, -12);
  ctx.rotate(t * 0.2);
  halo(ctx, 0, 0, 22, cv ? cv.glow : '#ffe9a8', 0.45);
  const colors = ['#ff6a8a', '#ffd040', '#6ab8ff', '#7ae8a0', '#c08aff', '#ff9a4a', '#6ab8ff', '#ffd040'];
  colors.forEach((color, i) => {
    const a0 = (i / colors.length) * TAU;
    const a1 = ((i + 1) / colors.length) * TAU;
    shape(ctx, color, () => {
      ctx.moveTo(Math.cos(a0) * 7, Math.sin(a0) * 7);
      ctx.arc(0, 0, 17, a0, a1);
      ctx.arc(0, 0, 7, a1, a0, true);
      ctx.closePath();
    }, 0.9);
  });
  shape(ctx, '#fff6d0', () => circle(ctx, 0, 0, 7), 0.9);
  ctx.strokeStyle = '#2a1a10';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  circle(ctx, 0, 0, 17);
  ctx.stroke();
  ctx.restore();
  // véu longo atrás, ondulando
  shape(ctx, vertical(ctx, -22, 16, cv ? cv.veil[0] : '#ffffff', cv ? cv.veil[1] : '#d8d0f0'), () => {
    ctx.moveTo(-3, -22);
    ctx.quadraticCurveTo(-13, -6, -12 + Math.sin(t * 2) * 1.5, 16);
    ctx.lineTo(10 + Math.sin(t * 2 + 1) * 1.5, 16);
    ctx.quadraticCurveTo(10, -6, 4, -22);
    ctx.closePath();
  }, 0.9);
  // túnica branca e dourada que some em luz embaixo
  shape(ctx, vertical(ctx, -10, 14, cv ? cv.robe[0] : '#fffaf0', cv ? cv.robe[1] : '#f0d890'), () => poly(ctx, [-5, -9, 5, -9, 8, 10, 0, 14, -8, 10]));
  shape(ctx, cv ? cv.trim : GOLD, () => ctx.rect(-1.2, -8, 2.4, 18), 0.5);
  halo(ctx, 0, 14, 10, cv ? cv.glow : '#fff2b0', 0.6);
  // auréola atrás da cabeça, depois rosto e mãos em prece
  const hy = -15;
  if (p.variant === 'legendary') rainbowHalo(ctx, 1, hy - 2, t, 10);
  else stainedHalo(ctx, 1, hy - 2, t, 0.35 + p.attack * 0.4);
  shape(ctx, radial(ctx, 1, hy, 7, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6.5));
  shape(ctx, cv ? cv.veil[0] : '#ffffff', () => {
    ctx.moveTo(-7, hy + 6);
    ctx.quadraticCurveTo(-8.5, hy - 8, 1, hy - 8.5);
    ctx.quadraticCurveTo(8, hy - 8, 6.5, hy - 3);
    ctx.lineTo(-3, hy - 3);
    ctx.lineTo(-4, hy + 6);
    ctx.closePath();
  }, 0.8);
  // olhos fechados em prece
  ctx.strokeStyle = '#5a3a2a';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(1.4, hy + 0.6, 1.2, 0.2, Math.PI - 0.2);
  ctx.moveTo(6, hy + 0.6);
  ctx.arc(4.8, hy + 0.6, 1.2, 0.2, Math.PI - 0.2);
  ctx.stroke();
  if (p.variant === 'epic') blindfold(ctx, hy);
  if (p.variant === 'rare') lily(ctx, -5, hy - 6);
  shape(ctx, '#ffe6cf', () => poly(ctx, [1, -6, 3, -10, 5, -6, 3, -3]), 0.6);
}

/** Mitra alta da Sacerdotisa, com filete e cruz. */
function mitre(ctx: Ctx, hy: number, colors: readonly [string, string], trim: string): void {
  shape(ctx, vertical(ctx, hy - 21, hy - 6, colors[0], colors[1]), () => {
    ctx.moveTo(-5.5, hy - 6.5);
    ctx.quadraticCurveTo(-6, hy - 15, 1, hy - 21);
    ctx.quadraticCurveTo(8, hy - 15, 7.5, hy - 6.5);
    ctx.closePath();
  }, 1);
  line(ctx, trim, 1.2, () => {
    ctx.moveTo(-5.5, hy - 7);
    ctx.lineTo(7.5, hy - 7);
    ctx.moveTo(1, hy - 20);
    ctx.lineTo(1, hy - 7);
  }, false);
  shape(ctx, trim, () => {
    ctx.rect(0.2, hy - 16, 1.6, 6);
    ctx.rect(-1.6, hy - 14, 5.2, 1.5);
  }, 0);
}

/** Venda dourada sobre os olhos (Oráculo), com um olho bordado. */
function blindfold(ctx: Ctx, hy: number): void {
  shape(ctx, vertical(ctx, hy - 1.5, hy + 2.5, '#ffe48a', '#c8901a'), () => {
    ctx.moveTo(-6.5, hy - 1.2);
    ctx.lineTo(7.2, hy - 1.6);
    ctx.lineTo(7, hy + 2.4);
    ctx.lineTo(-6.5, hy + 2.2);
    ctx.closePath();
  }, 0.7);
  // pontas soltas atrás
  shape(ctx, '#e0b030', () => poly(ctx, [-6.5, hy - 0.5, -10, hy + 3, -8, hy + 4, -6.5, hy + 1.5]), 0.5);
  shape(ctx, '#ffffff', () => ellipse(ctx, 3, hy + 0.4, 1.6, 0.9), 0);
  shape(ctx, '#3a8ad8', () => circle(ctx, 3.2, hy + 0.4, 0.6), 0);
}

/** Lírio branco preso no véu (Irmã do Lírio). */
function lily(ctx: Ctx, x: number, y: number): void {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - Math.PI / 2;
    shape(ctx, '#ffffff', () => ellipse(ctx, x + Math.cos(a) * 1.6, y + Math.sin(a) * 1.6, 1.5, 0.8, a), 0.4);
  }
  shape(ctx, '#ffd25a', () => circle(ctx, x, y, 0.8), 0);
}

/** Círculo de runas girando aos pés (Oráculo); acende na bênção. */
function runeCircle(ctx: Ctx, x: number, y: number, t: number, attack: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.32);
  ctx.globalAlpha = 0.45 + attack * 0.5;
  ctx.strokeStyle = '#ffd25a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  circle(ctx, 0, 0, 14);
  ctx.stroke();
  ctx.rotate(t * 0.8);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.save();
    ctx.translate(Math.cos(a) * 11, Math.sin(a) * 11);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-1.5, -1.5);
    ctx.lineTo(1.5, 1.5);
    ctx.moveTo(1.5, -1.5);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  if (attack > 0) halo(ctx, x, y, 14, '#ffd25a', attack * 0.6);
}

/** Asas de luz com as cores da aurora (Santa da Aurora), batendo devagar. */
function auroraWings(ctx: Ctx, x: number, y: number, t: number): void {
  const flap = Math.sin(t * 2.4) * 0.12;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x - 1, y);
    ctx.scale(side, 1);
    ctx.rotate(-0.25 + flap);
    ctx.globalAlpha = 0.85;
    shape(ctx, vertical(ctx, -14, 10, '#9affe0', '#c06aff'), () => {
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(10, -16, 20, -12);
      ctx.quadraticCurveTo(16, -6, 18, -2);
      ctx.quadraticCurveTo(13, 0, 15, 5);
      ctx.quadraticCurveTo(8, 4, 2, 6);
      ctx.closePath();
    }, 0.6);
    ctx.restore();
  }
  halo(ctx, x, y - 4, 16, '#9af0ff', 0.35);
}

/** Florzinhas brotando no chão em volta (Santa da Aurora). */
function groundFlowers(ctx: Ctx, t: number): void {
  const colors = ['#ff8ad8', '#9affe0', '#ffe07a', '#8ab8ff'];
  [-11, -5, 7, 12].forEach((fx, i) => {
    const grow = 0.75 + Math.sin(t * 1.5 + i * 1.3) * 0.25;
    const fy = 13 + (i % 2) * 1.5;
    line(ctx, '#5ac878', 0.7, () => {
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx, fy - 2.5 * grow);
    }, false);
    shape(ctx, colors[i]!, () => circle(ctx, fx, fy - 2.8 * grow, 1.1 * grow), 0.3);
  });
}

/** Auréola de sete cores girando (Santa da Aurora). */
function rainbowHalo(ctx: Ctx, x: number, y: number, t: number, r = 6.5): void {
  const colors = ['#ff5a6a', '#ff9a3a', '#ffe04a', '#5ae87a', '#4ac8ff', '#6a7aff', '#c06aff'];
  halo(ctx, x, y, r + 6, '#ffffff', 0.4);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, r > 7 ? 1 : 0.32);
  ctx.rotate(t * 0.6);
  ctx.lineWidth = r > 7 ? 2.4 : 1.6;
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = colors[i]!;
    ctx.beginPath();
    ctx.arc(0, 0, r, (i / 7) * TAU, ((i + 1) / 7) * TAU);
    ctx.stroke();
  }
  ctx.restore();
}

/** Auréola de vitral da Santa: gomos coloridos girando devagar, atrás da cabeça. */
function stainedHalo(ctx: Ctx, x: number, y: number, t: number, glow: number): void {
  halo(ctx, x, y, 15, '#fff6c0', glow);
  const colors = ['#ff7a9a', '#ffd25a', '#7ae8a0', '#7ac8ff', '#b08aff', '#ffb45a'];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 0.4);
  for (let i = 0; i < 6; i++) {
    const a0 = (i / 6) * TAU;
    const a1 = ((i + 1) / 6) * TAU;
    shape(ctx, colors[i]!, () => {
      ctx.arc(0, 0, 11, a0, a1);
      ctx.arc(0, 0, 8, a1, a0, true);
      ctx.closePath();
    }, 0.6);
  }
  ctx.restore();
}

/** Um morcego pequeno (asas batendo). */
function tinyBat(ctx: Ctx, x: number, y: number, s: number, t: number, body: string, eyes: string, wing = body): void {
  const flap = Math.sin(t * 18) * 3 * s;
  ctx.save();
  ctx.translate(x, y);
  for (const side of [-1, 1]) {
    shape(ctx, wing, () => poly(ctx, [0, 0, side * 7 * s, -3 * s - flap, side * 5 * s, 1 * s, side * 3 * s, 2 * s]), 0.7);
  }
  shape(ctx, body, () => ellipse(ctx, 0, 0, 2.2 * s, 2.6 * s), 0.7);
  ctx.fillStyle = eyes;
  ctx.beginPath();
  circle(ctx, -0.8 * s, -0.6 * s, 0.5 * s);
  circle(ctx, 0.8 * s, -0.6 * s, 0.5 * s);
  ctx.fill();
  ctx.restore();
}

/** Cores do Enxame em cada variante: corpo, asas, olhos e o morcego-líder. */
const SWARM_VARIANTS = {
  // Morcegos Albinos: brancos de olhos de rubi
  rare: { body: '#f4eef2', wing: '#d8c8d4', eyes: '#ff2a40', leader: '#ffffff' },
  // Enxame Espectral: morcegos fantasmas verde-água, translúcidos, com rastro de névoa
  epic: { body: '#6affe0', wing: '#3ac8b0', eyes: '#ffffff', leader: '#9afff0' },
  // Rei Morcego: o enxame vira um único morcego gigante de coroa, com dois de escolta
  legendary: { body: '#4a2a40', wing: '#6a2a50', eyes: '#ffd25a', leader: '#4a2a40' },
} as const;

/** Rei Morcego: um morcego grande de orelhas altas, presas e coroa. */
function kingBat(ctx: Ctx, k: number, t: number, body: string, wing: string, eyes: string, mouth: number, crown = true): void {
  const flap = Math.sin(t * 5) * 1.6;
  ctx.save();
  ctx.scale(k, k);
  for (const side of [-1, 1]) {
    shape(ctx, vertical(ctx, -10, 6, wing, darken(wing, 0.45)), () =>
      poly(ctx, [side * 3, -3, side * 7, -8 - flap, side * 12, -9 - flap * 1.4, side * 17, -5 - flap, side * 14, -1, side * 15, 4, side * 11, 2, side * 8, 5, side * 5, 2]),
    1);
    line(ctx, darken(wing, 0.55), 0.7, () => {
      ctx.moveTo(side * 4, -3);
      ctx.lineTo(side * 14, -1);
      ctx.moveTo(side * 6, -6 - flap * 0.6);
      ctx.lineTo(side * 11, 2);
    }, false);
  }
  for (const side of [-1, 1]) shape(ctx, body, () => poly(ctx, [side * 1.5, -5, side * 4.6, -11, side * 4.4, -4]), 0.9);
  shape(ctx, radial(ctx, -1, -2, 7, darken(body, -0.4), body), () => ellipse(ctx, 0, 0, 5, 6));
  shape(ctx, darken(body, -0.6), () => ellipse(ctx, 0, 2, 3, 3.4), 0);
  glowingEye(ctx, -1.8, -2, 1.1, eyes);
  glowingEye(ctx, 1.8, -2, 1.1, eyes);
  if (mouth > 0) shape(ctx, '#1a0410', () => ellipse(ctx, 0, 1.4, 1.8, mouth), 0);
  for (const x of [-0.9, 0.9]) shape(ctx, '#ffffff', () => poly(ctx, [x - 0.5, 0.6, x + 0.5, 0.6, x, 2.2]), 0.3);
  if (crown) {
    shape(ctx, vertical(ctx, -10, -5, '#fff2b0', '#c8901a'), () => poly(ctx, [-3, -5, -3.4, -9, -1.5, -7, 0, -10, 1.5, -7, 3.4, -9, 3, -5]), 0.7);
    shape(ctx, '#e0243a', () => circle(ctx, 0, -6.4, 0.8), 0);
  }
  ctx.restore();
}

/** Enxame: vários morcegos girando. A: Nuvem Sangrenta (névoa vermelha, gotas de sangue); B: Revoada Faminta (mais morcegos, roxos). */
export function drawBatSwarm(ctx: Ctx, p: Pose): void {
  const blood = formA(p);
  const hunger = formB(p);
  // Formas Supremas: Eclipse (A, nuvem negra que escurece o chão) e Fome Eterna (B, morcegos maiores de olhos dourados)
  const eclipse = p.supreme && blood;
  const eternal = p.supreme && hunger;
  const sw = p.variant ? SWARM_VARIANTS[p.variant] : null;
  const body = sw ? sw.body : eclipse ? '#1a0a14' : hunger ? '#5a2a8a' : blood ? '#6a1a30' : '#4a2a50';
  const eyes = eternal ? '#ffd25a' : sw ? sw.eyes : hunger ? '#e0a0ff' : '#ff3a4a';
  const wing = sw ? sw.wing : body;
  if (eclipse) {
    // sombra escurecendo o chão e disco negro de borda vermelha
    shape(ctx, '#05020a88', () => ellipse(ctx, 0, 13, 26, 7), 0);
    shape(ctx, '#0a0410', () => circle(ctx, 0, -6, 15), 0);
    ctx.strokeStyle = '#ff3a50aa';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    circle(ctx, 0, -6, 15 + Math.sin(p.time * 3) * 0.8);
    ctx.stroke();
  }
  ctx.translate(0, -5 + Math.sin(p.time * 3) * 1.5);
  if (blood) {
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
    g.addColorStop(0, '#ff3a5066');
    g.addColorStop(1, '#ff3a5000');
    ctx.fillStyle = g;
    ctx.beginPath();
    circle(ctx, 0, 0, 20);
    ctx.fill();
    if (!eclipse) {
      // Nuvem Sangrenta: nuvem carmesim densa, de bolhas que pulsam, envolvendo os morcegos
      const mist = sw ? sw.wing : '#a0182c';
      ctx.save();
      ctx.globalAlpha *= 0.55;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + p.time * 0.4;
        const r = 7 + Math.sin(p.time * 2 + i * 1.7) * 1.2;
        shape(ctx, mist, () => circle(ctx, Math.cos(a) * 12, Math.sin(a) * 6 + 2, r), 0);
      }
      ctx.restore();
    }
  }
  if (hunger) {
    // Revoada Faminta: rastros de velocidade girando com o enxame
    ctx.save();
    ctx.strokeStyle = sw ? sw.wing : '#c86aff';
    ctx.globalAlpha *= 0.6;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = p.time * 3.2 + (i * TAU) / 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 10, 0, a, a + 1.1);
      ctx.stroke();
    }
    ctx.restore();
  }
  const count = eclipse ? 9 : hunger ? 8 : 5;
  const spread = (eclipse ? 17 : 12) + p.attack * 5;
  const speed = hunger ? 3.2 : 2.4;
  if (blood && !eclipse) {
    // Nuvem Sangrenta: gotas de sangue pingando da nuvem
    for (let i = 0; i < 4; i++) {
      const t = (p.time * 0.9 + i * 0.25) % 1;
      shape(ctx, '#e0182c', () => ellipse(ctx, -9 + i * 6, 4 + t * 14, 0.9, 1.5), 0);
    }
  }
  if (p.variant === 'epic') {
    // rastro de névoa atrás de cada morcego fantasma
    for (let i = 0; i < count; i++) {
      for (let k = 1; k <= 3; k++) {
        const a = p.time * speed + (i * TAU) / count - k * 0.25;
        halo(ctx, Math.cos(a) * spread, Math.sin(a) * spread * 0.6, 4 - k * 0.8, '#6affe0', 0.35 - k * 0.08);
      }
    }
  }
  if (p.variant === 'legendary') {
    // Rei Morcego: dois de escolta girando e o rei no centro
    for (let i = 0; i < 2; i++) {
      const a = p.time * speed + i * Math.PI;
      tinyBat(ctx, Math.cos(a) * (spread + 6), Math.sin(a) * (spread + 6) * 0.5 - 4, eternal ? 1.4 : 1, p.time + i, body, eyes, wing);
    }
    kingBat(ctx, eternal ? 1.15 : 1, p.time, sw!.body, sw!.wing, eyes, hunger ? 1.2 + p.attack : 0);
    return;
  }
  ctx.save();
  if (p.variant === 'epic') ctx.globalAlpha *= 0.75;
  for (let i = 0; i < count; i++) {
    const a = p.time * speed + (i * TAU) / count;
    tinyBat(ctx, Math.cos(a) * spread, Math.sin(a) * spread * 0.6, eternal ? 1.6 : 1.15, p.time + i, body, eyes, wing);
  }
  // morcego-líder no centro (maior e de boca aberta na Revoada Faminta; gigante na Fome Eterna)
  if (eternal) {
    kingBat(ctx, 1.05, p.time, sw ? sw.leader : '#6a2aa0', sw ? sw.wing : '#4a1a7a', eyes, 1.6 + p.attack * 1.5, false);
    ctx.restore();
    return;
  }
  tinyBat(ctx, 0, -1, hunger ? 2.6 : 2.1, p.time * 0.8, sw ? sw.leader : hunger ? '#7a3ab0' : blood ? '#8a1a34' : '#6a2a5a', eyes, wing);
  if (hunger) {
    shape(ctx, '#1a0410', () => ellipse(ctx, 0, 1.6, 2.2, 1.3 + p.attack), 0);
    for (const x of [-1.1, 1.1]) shape(ctx, '#ffffff', () => poly(ctx, [x - 0.5, 0.6, x + 0.5, 0.6, x, 2.2]), 0);
  }
  ctx.restore();
}

/** Possessor: sombra roxa com mãos longas. A: Marionetista (fios nas mãos); B: Devorador (boca enorme, vermelho). */
/** Cores do Possessor em cada variante: corpo, borda que some, dedos e olhos. */
const POSSESSOR_VARIANTS = {
  // Sombra Esmeralda
  rare: { color: '#1e6e4e', edge: '#4affa000', fingers: '#a8ffd0', eyes: '#8affc0' },
  // Possessor Mascarado: máscara de teatro (comédia no rosto, tragédia pendurada)
  epic: { color: '#3e2a52', edge: '#8a6aff00', fingers: '#e8d8ff', eyes: '#ffd25a' },
  // Boneca Possuída: boneca de porcelana rachada, vestido de babados, cachos e laço
  legendary: { color: '#6a1a3a', edge: '#6a1a3a00', fingers: '#f4e8e0', eyes: '#8af0ff' },
} as const;

/** Corpo da Boneca Possuída (vestido, cabeça de porcelana, cachos e laço); os olhos vêm depois. */
function possessedDoll(ctx: Ctx, t: number, dress: string, devour: boolean): void {
  const hy = devour ? -16 : -15;
  // cachos atrás da cabeça
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) shape(ctx, i % 2 ? '#5a3418' : '#7a4a24', () => circle(ctx, 1 + side * 7, hy + 1 + i * 3.4 + Math.sin(t * 2 + i) * 0.4, 2.2), 0.6);
  }
  // vestido de sino com babado de renda
  shape(ctx, vertical(ctx, -9, 12, darken(dress, -0.3), darken(dress, 0.35)), () => {
    ctx.moveTo(-4, -9);
    ctx.lineTo(6, -9);
    ctx.quadraticCurveTo(9, 2, 11, 11);
    ctx.lineTo(-9, 11);
    ctx.quadraticCurveTo(-7, 2, -4, -9);
    ctx.closePath();
  });
  for (let x = -9; x <= 11; x += 2.5) shape(ctx, '#fff4f0', () => ctx.arc(x + 1.25, 11, 1.4, 0, Math.PI), 0.4);
  // pernas de porcelana balançando
  for (const x of [-3, 4]) {
    line(ctx, '#f4e8e0', 1.6, () => {
      ctx.moveTo(x, 11);
      ctx.lineTo(x + Math.sin(t * 2 + x) * 0.8, 15);
    });
    shape(ctx, '#2a1a24', () => ellipse(ctx, x + Math.sin(t * 2 + x) * 0.8, 15.4, 1.6, 0.9), 0.4);
  }
  shape(ctx, '#fff4f0', () => poly(ctx, [-3, -9, 5, -9, 1, -5]), 0.6);
  // cabeça de porcelana com rachadura
  shape(ctx, radial(ctx, 0, hy - 2, 8, '#fffaf6', '#e0d0c8'), () => circle(ctx, 1, hy, 7));
  line(ctx, '#5a4a50', 0.6, () => {
    ctx.moveTo(4, hy - 6.8);
    ctx.lineTo(3, hy - 4);
    ctx.lineTo(4.4, hy - 2.6);
    ctx.lineTo(3.4, hy - 0.4);
  }, false);
  for (const x of [-2.4, 5.2]) shape(ctx, '#ffb0c0aa', () => ellipse(ctx, x, hy + 3, 1.4, 0.8), 0);
  // franja e laço
  shape(ctx, '#7a4a24', () => {
    ctx.moveTo(-6, hy - 1);
    ctx.quadraticCurveTo(-5, hy - 8, 1, hy - 7.6);
    ctx.quadraticCurveTo(7, hy - 8, 8, hy - 1);
    ctx.quadraticCurveTo(5, hy - 5, 1, hy - 4.4);
    ctx.quadraticCurveTo(-3, hy - 5, -6, hy - 1);
    ctx.closePath();
  }, 0.7);
  for (const side of [-1, 1]) shape(ctx, '#e0304a', () => poly(ctx, [1, hy - 7.5, 1 + side * 5, hy - 10.5, 1 + side * 4.4, hy - 5.6]), 0.6);
  shape(ctx, '#ff5a6a', () => circle(ctx, 1, hy - 7.6, 1.2), 0.5);
}

export function drawPossessor(ctx: Ctx, p: Pose): void {
  const devour = formB(p);
  // Marionetista (A): cruzeta de madeira acima das mãos, fios grossos e cartola
  const puppeteer = formA(p) && !p.supreme;
  // Formas Supremas: Mestre das Almas (A, fios de alma com almas presas) e Abismo (B, portal no peito)
  const souls = p.supreme && !devour;
  const abyss = p.supreme && devour;
  const pv = p.variant ? POSSESSOR_VARIANTS[p.variant] : null;
  const color = pv ? (devour ? darken(pv.color, 0.3) : pv.color) : devour ? '#5a1430' : '#4a2a80';
  const edge = pv ? pv.edge : devour ? '#ff3a5a00' : '#9a6aff00';
  ctx.translate(0, Math.sin(p.time * 2.2) * 2 - 6);
  const doll = p.variant === 'legendary';
  if (doll) {
    // flutua torta, como se puxada por fios invisíveis
    ctx.rotate(Math.sin(p.time * 1.3) * 0.08);
    possessedDoll(ctx, p.time, color, devour);
  } else {
    const g = ctx.createLinearGradient(0, -22, 0, 16);
    g.addColorStop(0, color);
    g.addColorStop(1, edge);
    shape(ctx, g, () => {
      ctx.moveTo(-8, -10);
      ctx.quadraticCurveTo(-10, -24, 0, -24);
      ctx.quadraticCurveTo(10, -24, 8, -10);
      ctx.quadraticCurveTo(10, 4, 6, 15 + Math.sin(p.time * 5) * 2);
      ctx.lineTo(0, 10);
      ctx.lineTo(-6, 15 + Math.sin(p.time * 5 + 2) * 2);
      ctx.quadraticCurveTo(-10, 4, -8, -10);
      ctx.closePath();
    });
  }
  // mãos longas estendidas (braços de porcelana com juntas na Boneca)
  const reach = p.attack * 4;
  for (const side of [-1, 1]) {
    if (doll) {
      line(ctx, '#f4e8e0', 1.8, () => {
        ctx.moveTo(side * 5, -7);
        ctx.lineTo(side * 10, -6);
        ctx.lineTo(side * (14 + reach), -4);
      });
      shape(ctx, '#e8d8d0', () => circle(ctx, side * 10, -6, 1.2), 0.5);
      shape(ctx, '#fff8f4', () => circle(ctx, side * (15 + reach), -4, 1.6), 0.6);
      continue;
    }
    line(ctx, color, 2, () => {
      ctx.moveTo(side * 6, -8);
      ctx.quadraticCurveTo(side * 12, -10, side * (15 + reach), -4);
    });
    {
      for (let f = 0; f < 3; f++) {
        line(ctx, pv ? pv.fingers : devour ? '#ff8aa0' : '#d8b8ff', 0.8, () => {
          ctx.moveTo(side * (15 + reach), -4);
          ctx.lineTo(side * (18 + reach), -6 + f * 2);
        }, false);
      }
    }
  }
  if (puppeteer) {
    // cruzeta de madeira acima, com fios grossos até as mãos
    const sway = Math.sin(p.time * 2) * 0.12;
    ctx.save();
    ctx.translate(0, -33);
    ctx.rotate(sway);
    shape(ctx, vertical(ctx, -2, 2, '#c89a5a', '#7a5428'), () => ctx.roundRect(-13, -1.2, 26, 2.4, 1), 0.8);
    shape(ctx, vertical(ctx, -6, 6, '#c89a5a', '#7a5428'), () => ctx.roundRect(-1.2, -5, 2.4, 10, 1), 0.8);
    ctx.restore();
    line(ctx, '#f4e8ffcc', 0.8, () => {
      for (const side of [-1, 1]) {
        ctx.moveTo(side * 12 * Math.cos(sway), -33 + side * 12 * Math.sin(sway));
        ctx.lineTo(side * (16 + reach), -5);
      }
      ctx.moveTo(0, -28);
      ctx.lineTo(0, -24);
    }, false);
  } else if (souls) {
    // fios de marionete descendo dos dedos (Mestre das Almas)
    ctx.strokeStyle = '#e8d8ffaa';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (const side of [-1, 1]) {
      for (let f = 0; f < 3; f++) {
        const x = side * (18 + reach);
        ctx.moveTo(x, -6 + f * 2);
        ctx.lineTo(x + side * 1, 12 + Math.sin(p.time * 3 + f) * 2);
      }
    }
    ctx.stroke();
  }
  if (devour) {
    // boca larga com dentes
    shape(ctx, '#12040a', () => ellipse(ctx, 1, -10, 6, 3 + p.attack * 2), 0.8);
    for (let i = 0; i < 5; i++) {
      shape(ctx, '#f4ecd8', () => poly(ctx, [-3.5 + i * 2, -12, -2.5 + i * 2, -12, -3 + i * 2, -10]), 0.3);
    }
    glowingEye(ctx, -2, -17, 1.5, pv ? pv.eyes : '#ff2a4a');
    glowingEye(ctx, 4, -17, 1.5, pv ? pv.eyes : '#ff2a4a');
  } else if (p.variant !== 'epic') {
    glowingEye(ctx, -1.5, -15, 1.6, pv ? pv.eyes : '#d8a8ff');
    glowingEye(ctx, 3.5, -15, 1.6, pv ? pv.eyes : '#d8a8ff');
  }
  if (p.variant === 'epic') {
    // máscara de comédia no rosto e a de tragédia pendurada ao lado
    const my = devour ? -17 : -15;
    shape(ctx, vertical(ctx, my - 5, my + 5, '#ffffff', '#e0d8ec'), () => ellipse(ctx, 1, my, 5.4, 5.8), 0.9);
    for (const x of [-1.2, 3.2]) {
      shape(ctx, '#1a1024', () => {
        ctx.ellipse(x, my - 1, 1.3, 0.9, 0, Math.PI, TAU);
        ctx.closePath();
      }, 0);
      glowingEye(ctx, x, my - 1.3, 0.6, pv!.eyes);
    }
    line(ctx, '#1a1024', 1, () => ctx.arc(1, my + 0.8, 2.6, 0.3, Math.PI - 0.3), false);
    ctx.save();
    ctx.translate(-7, -6);
    ctx.rotate(-0.3);
    shape(ctx, '#2a1a3a', () => ellipse(ctx, 0, 0, 3, 3.3), 0.8);
    line(ctx, '#e8d8ff', 0.7, () => ctx.arc(0, 2.4, 1.6, Math.PI + 0.4, TAU - 0.4), false);
    for (const x of [-1, 1]) shape(ctx, '#e8d8ff', () => ellipse(ctx, x, -0.8, 0.6, 0.4), 0);
    ctx.restore();
  }
  if (puppeteer) {
    // cartola
    const ty = devour ? -22 : -21;
    shape(ctx, vertical(ctx, ty - 9, ty, '#2a1a3a', '#0e0814'), () => ctx.roundRect(-3.5, ty - 9, 9, 9, 1), 0.9);
    shape(ctx, '#0e0814', () => ctx.roundRect(-6.5, ty - 1, 15, 2, 1), 0.8);
    shape(ctx, pv ? pv.fingers : '#c86aff', () => ctx.rect(-3.5, ty - 3.2, 9, 1.4), 0);
  }
  if (souls) {
    // fios de alma das mãos até almas pequenas flutuando
    for (let i = 0; i < 3; i++) {
      const a = p.time * 1.4 + (i * TAU) / 3;
      const sx = Math.cos(a) * 16;
      const sy = -4 + Math.sin(a) * 8;
      line(ctx, '#d8a8ff88', 0.6, () => {
        ctx.moveTo(8, -6);
        ctx.lineTo(sx, sy);
      }, false);
      halo(ctx, sx, sy, 4, '#d8a8ff', 0.8);
      shape(ctx, '#f4e8ff', () => ellipse(ctx, sx, sy, 1.4, 1.8), 0.4);
    }
  }
  if (abyss) {
    // portal girando no peito
    ctx.save();
    ctx.translate(0, -6);
    halo(ctx, 0, 0, 10, '#ff3a5a', 0.6);
    shape(ctx, '#05020a', () => circle(ctx, 0, 0, 5), 0.6);
    ctx.rotate(p.time * 3);
    ctx.strokeStyle = '#ff6a8a';
    ctx.lineWidth = 0.9;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.arc(0, 0, 2 + k * 1.2, (k * TAU) / 3, (k * TAU) / 3 + 2.2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Florzinha de cinco pétalas com miolo dourado. */
function flower(ctx: Ctx, x: number, y: number, s: number, color: string): void {
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * TAU;
    shape(ctx, color, () => circle(ctx, x + Math.cos(a) * 1.5 * s, y + Math.sin(a) * 1.5 * s, 1.1 * s), 0.3);
  }
  shape(ctx, GOLD, () => circle(ctx, x, y, 0.8 * s), 0);
}

/** Herbalista: bruxa de vestido de folhas e cajado de galho. A: Jardim Venenoso (flores roxas); B: Guardiã do Bosque (galhos-chifres e casca). */
/** Cores da Herbalista em cada variante: vestido, folhas, cabelo, olhos e broto do cajado. */
const HERBALIST_VARIANTS = {
  // Druida do Outono: folhas laranja e vermelhas
  rare: { dress: ['#c8601e', '#5a1a08'], leaves: ['#ff9a2a', '#d83a1a'], hair: '#a8441a', eyes: '#c06a10', bud: '#ff9a2a' },
  // Bruxa dos Cogumelos: chapéu de cogumelo vermelho de bolinhas e esporos brilhando
  epic: { dress: ['#8a5a8a', '#3a1a3a'], leaves: ['#e8d0a8', '#c8a878'], hair: '#5a3a2a', eyes: '#7affd0', bud: '#7affd0' },
  // Espírito da Floresta: vestido de musgo com flores, galhada florida, vagalumes
  legendary: { dress: ['#4ec06e', '#1a4a2a'], leaves: ['#ffb0d8', '#ffffff'], hair: '#7ae890', eyes: '#ffffff', bud: '#ffb0d8' },
} as const;

export function drawHerbalist(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2.3) * 1.1;
  const poison = formA(p);
  const grove = formB(p);
  const hv = p.variant ? HERBALIST_VARIANTS[p.variant] : null;
  const shadeB = (c: string) => (hv && grove ? darken(c, 0.3) : c);
  if (p.variant === 'legendary') {
    // vagalumes em volta
    for (let i = 0; i < 4; i++) {
      const a = p.time * 1.1 + (i * TAU) / 4;
      halo(ctx, Math.cos(a) * 15, -6 + Math.sin(a * 1.3) * 9, 3, '#e8ff7a', 0.6 + Math.sin(p.time * 5 + i) * 0.3);
    }
  }
  // Formas Supremas: Floresta Viva (A, coroa de flores carnívoras) e Coração da Mata (B, ent de galhos atrás)
  const living = p.supreme && poison;
  const heart = p.supreme && grove;
  if (heart) {
    // árvore viva atrás: tronco, galhos e dois olhos de luz
    shape(ctx, vertical(ctx, -34, 14, '#6a4a2a', '#2a1a0c'), () => {
      ctx.moveTo(-6, 14);
      ctx.lineTo(-4, -18);
      ctx.lineTo(-14, -30);
      ctx.lineTo(-3, -24);
      ctx.lineTo(0, -36);
      ctx.lineTo(3, -24);
      ctx.lineTo(14, -30);
      ctx.lineTo(4, -18);
      ctx.lineTo(6, 14);
      ctx.closePath();
    }, 0.9);
    for (const [x, y] of [[-12, -30], [12, -30], [0, -36]] as const) shape(ctx, '#5ad85a', () => circle(ctx, x, y, 3.2), 0.5);
    glowingEye(ctx, -2, -12, 0.9, '#c8ff6a');
    glowingEye(ctx, 2, -12, 0.9, '#c8ff6a');
  }
  const dress = hv ? shadeB(hv.dress[0]) : grove ? '#6a4a2a' : '#3a8a4a';
  const dressDark = hv ? hv.dress[1] : grove ? '#2a1a0c' : '#1a4a24';
  shape(ctx, vertical(ctx, -9, 14, dress, dressDark), () =>
    poly(ctx, [-5, -9, 5, -9, 10, 14, 5, 11, 1, 14, -3, 11, -10, 14]),
  );
  // folhas na barra do vestido (flores no Espírito da Floresta)
  for (let i = 0; i < 4; i++) {
    shape(ctx, hv ? hv.leaves[i % 2] : grove ? '#8a6a3a' : '#5ad85a', () => ellipse(ctx, -7 + i * 4.5, 12, 2, 1.1, 0.5), 0.5);
  }
  if (p.variant === 'legendary') for (const [x, y] of [[-3, 2], [3, 6], [-5, 8]] as const) flower(ctx, x, y, 1, '#ffb0d8');
  if (poison && !p.supreme) {
    // cogumelos venenosos aos pés
    for (const [x, s] of [[-12, 1], [-8.5, 0.75], [12, 0.85]] as const) {
      shape(ctx, '#e8dcc8', () => ctx.roundRect(x - 0.9 * s, 14 - 4 * s, 1.8 * s, 4 * s, 0.6), 0.5);
      shape(ctx, vertical(ctx, 14 - 7 * s, 14 - 3.5 * s, '#d08aff', '#7a2ab0'), () => {
        ctx.ellipse(x, 14 - 4 * s, 3.2 * s, 2.6 * s, 0, Math.PI, TAU);
        ctx.closePath();
      }, 0.6);
      shape(ctx, '#f4e0ff', () => circle(ctx, x - s, 14 - 5.5 * s, 0.6 * s), 0);
    }
  }
  // cajado de galho com broto (flor carnívora no Jardim Venenoso)
  ctx.save();
  ctx.translate(7, 0);
  ctx.rotate(0.25 + p.attack * 0.6);
  line(ctx, '#6a4a2a', 1.8, () => {
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(2, -4, -1, -15);
  });
  if (poison && !p.supreme) {
    // flor carnívora no topo, abrindo e fechando
    const open = 0.4 + Math.sin(p.time * 4) * 0.25 + p.attack * 0.4;
    shape(ctx, '#5ad85a', () => ellipse(ctx, 1.5, -15, 2.6, 1.2, -0.5), 0.5);
    ctx.save();
    ctx.translate(-1, -19);
    ctx.scale(1.5, 1.5);
    for (const dir of [-1, 1]) {
      ctx.save();
      ctx.rotate(dir * open);
      shape(ctx, vertical(ctx, -5, 0, '#d84a7a', '#7a1a3a'), () => {
        ctx.moveTo(-4.5, 0);
        ctx.quadraticCurveTo(-4, dir * -4, 0, dir * -4.5);
        ctx.quadraticCurveTo(4, dir * -4, 4.5, 0);
        ctx.closePath();
      }, 0.7);
      for (const tx of [-2.6, 0, 2.6]) shape(ctx, '#ffffff', () => poly(ctx, [tx - 0.6, 0, tx + 0.6, 0, tx, dir * 1.4]), 0);
      ctx.restore();
    }
    ctx.restore();
  } else {
    shape(ctx, hv ? hv.bud : poison ? '#b86aff' : '#7ad85a', () => ellipse(ctx, -1, -17, 2.4, 3.4, 0.3), 0.6);
    shape(ctx, hv ? hv.leaves[1] : poison ? '#e8b8ff' : '#c8ff9a', () => ellipse(ctx, 1.5, -15, 1.8, 2.6, -0.6), 0.6);
  }
  ctx.restore();
  // rosto, cabelo verde
  const hy = -15;
  shape(ctx, hv ? hv.hair : grove ? '#3a5a2a' : '#4a9a4a', () => {
    ctx.moveTo(-7, hy - 2);
    ctx.quadraticCurveTo(-12, hy + 8 + sway, -8, hy + 12);
    ctx.lineTo(-4, hy + 3);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 7, '#ffe6cf', '#e0b090'), () => circle(ctx, 1, hy, 6.8));
  shape(ctx, hv ? hv.hair : grove ? '#3a5a2a' : '#4a9a4a', () => {
    ctx.moveTo(-7, hy);
    ctx.quadraticCurveTo(-3, hy - 9, 7, hy - 3);
    ctx.lineTo(7, hy - 5.5);
    ctx.quadraticCurveTo(0, hy - 10, -7.5, hy - 3);
    ctx.closePath();
  }, 0.8);
  eye(ctx, 1.2, hy + 0.5, 1.7, hv ? hv.eyes : grove ? '#8a6a2a' : '#3aa83a');
  eye(ctx, 4.8, hy + 0.5, 1.7, hv ? hv.eyes : grove ? '#8a6a2a' : '#3aa83a');
  if (p.variant === 'epic') {
    // chapéu de cogumelo vermelho de bolinhas e esporos subindo
    shape(ctx, vertical(ctx, hy - 14, hy - 4, '#ff5a4a', '#a8180e'), () => {
      ctx.moveTo(-10, hy - 3);
      ctx.quadraticCurveTo(-10, hy - 15, 1, hy - 15);
      ctx.quadraticCurveTo(12, hy - 15, 12, hy - 3);
      ctx.quadraticCurveTo(1, hy - 6, -10, hy - 3);
      ctx.closePath();
    }, 1);
    for (const [x, y, r] of [[-5, -9, 1.6], [1, -12, 1.8], [7, -8, 1.4], [3, -6.5, 1]] as const) shape(ctx, '#ffffff', () => circle(ctx, x, hy + y, r), 0);
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.6 + i / 3) % 1;
      halo(ctx, -6 + i * 6, hy - 6 - ph * 16, 2.2, '#7affd0', 0.9 * (1 - ph));
    }
  }
  if (p.variant === 'legendary' && !grove) {
    // galhada florida (na Guardiã do Bosque, as flores vão nos galhos dela)
    for (const side of [-1, 1]) {
      shape(ctx, vertical(ctx, hy - 16, hy - 5, '#8a6a3a', '#4a3018'), () => {
        ctx.moveTo(1 + side * 2, hy - 6);
        ctx.quadraticCurveTo(1 + side * 5, hy - 11, 1 + side * 4, hy - 16);
        ctx.lineTo(1 + side * 5.6, hy - 15.6);
        ctx.quadraticCurveTo(1 + side * 6.4, hy - 12, 1 + side * 8.6, hy - 12.6);
        ctx.lineTo(1 + side * 8.6, hy - 11);
        ctx.quadraticCurveTo(1 + side * 6, hy - 9.6, 1 + side * 3.6, hy - 5.6);
        ctx.closePath();
      }, 0.8);
      flower(ctx, 1 + side * 4, hy - 16, 1.1, '#ffb0d8');
      flower(ctx, 1 + side * 8.6, hy - 12, 0.9, '#ffffff');
    }
  }
  if (poison) {
    // flores roxas no cabelo e névoa tóxica
    for (const [x, y] of [[-4, hy - 6], [2, hy - 8]] as const) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU;
        shape(ctx, '#b86aff', () => circle(ctx, x + Math.cos(a) * 1.6, y + Math.sin(a) * 1.6, 1.1), 0.3);
      }
      shape(ctx, GOLD, () => circle(ctx, x, y, 0.8), 0);
    }
    ctx.fillStyle = '#b86aff33';
    for (let i = 0; i < 3; i++) {
      const ph = (p.time * 0.7 + i / 3) % 1;
      ctx.beginPath();
      circle(ctx, -8 + i * 8, 10 - ph * 10, 2 + ph * 3);
      ctx.fill();
    }
  }
  if (grove) {
    // galhos como chifres
    for (const side of [-1, 1]) {
      line(ctx, '#5a3a1a', 1.4, () => {
        ctx.moveTo(1 + side * 3, hy - 6);
        ctx.lineTo(1 + side * 6, hy - 13);
        ctx.moveTo(1 + side * 5, hy - 10);
        ctx.lineTo(1 + side * 9, hy - 12);
      });
      shape(ctx, '#7ad85a', () => ellipse(ctx, 1 + side * 9.5, hy - 12.5, 1.6, 1, 0.4), 0.4);
    }
  }
  if (living) {
    // coroa de flores carnívoras com dentes
    for (const [x, y, s] of [[-5, -25, 1], [1, -28, 1.2], [6, -24, 0.9]] as const) {
      const open = 0.5 + Math.sin(p.time * 4 + x) * 0.3;
      shape(ctx, '#d02a4a', () => ellipse(ctx, x, y - open * s, 3 * s, 2 * s), 0.6);
      shape(ctx, '#d02a4a', () => ellipse(ctx, x, y + open * s, 3 * s, 2 * s), 0.6);
      shape(ctx, '#ffffff', () => poly(ctx, [x - 1.5 * s, y - 0.4, x, y + 0.8, x + 1.5 * s, y - 0.4]), 0);
    }
  }
}
