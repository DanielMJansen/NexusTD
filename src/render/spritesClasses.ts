// Terceiras classes das raças atuais (F9): Clériga, Enxame de Morcegos, Possessor e Herbalista.
// (Tempestade usa o desenho de dragão em sprites.ts; Uivador usa a cabeça de lobo em spritesMystic.ts.)
import {
  circle,
  ellipse,
  eye,
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

  // túnica
  shape(ctx, vertical(ctx, -10, 14, robe, robeDark), () =>
    poly(ctx, [-5, -9 + breathe, 5, -9 + breathe, 9, 14, -9, 14]),
  );
  shape(ctx, trim, () => ctx.rect(-1.2, -8 + breathe, 2.4, 22), 0.6);
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
  if (p.variant === 'rare') lily(ctx, -5, hy - 6);
  if (p.variant === 'legendary' && !inq) {
    // auréola de sete cores (no lugar da dourada)
    rainbowHalo(ctx, 1, hy - 12, p.time);
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
function tinyBat(ctx: Ctx, x: number, y: number, s: number, t: number, body: string, eyes: string): void {
  const flap = Math.sin(t * 18) * 3 * s;
  ctx.save();
  ctx.translate(x, y);
  for (const side of [-1, 1]) {
    shape(ctx, body, () => poly(ctx, [0, 0, side * 7 * s, -3 * s - flap, side * 5 * s, 1 * s, side * 3 * s, 2 * s]), 0.7);
  }
  shape(ctx, body, () => ellipse(ctx, 0, 0, 2.2 * s, 2.6 * s), 0.7);
  ctx.fillStyle = eyes;
  ctx.beginPath();
  circle(ctx, -0.8 * s, -0.6 * s, 0.5 * s);
  circle(ctx, 0.8 * s, -0.6 * s, 0.5 * s);
  ctx.fill();
  ctx.restore();
}

/** Enxame: vários morcegos girando. A: Nuvem Sangrenta (névoa vermelha); B: Revoada Faminta (mais morcegos, roxos). */
export function drawBatSwarm(ctx: Ctx, p: Pose): void {
  const blood = formA(p);
  const hunger = formB(p);
  // Formas Supremas: Eclipse (A, nuvem negra que escurece o chão) e Fome Eterna (B, morcegos maiores de olhos dourados)
  const eclipse = p.supreme && blood;
  const eternal = p.supreme && hunger;
  const body = eclipse ? '#1a0a14' : hunger ? '#5a2a8a' : '#4a2a50';
  const eyes = eternal ? '#ffd25a' : hunger ? '#e0a0ff' : '#ff3a4a';
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
  }
  const count = eclipse ? 9 : hunger ? 7 : 5;
  const spread = (eclipse ? 17 : 12) + p.attack * 5;
  for (let i = 0; i < count; i++) {
    const a = p.time * (hunger ? 3.2 : 2.4) + (i * TAU) / count;
    tinyBat(ctx, Math.cos(a) * spread, Math.sin(a) * spread * 0.6, eternal ? 1.6 : 1.15, p.time + i, body, eyes);
  }
  // morcego-líder no centro
  tinyBat(ctx, 0, -1, 2.1, p.time * 0.8, hunger ? '#7a3ab0' : '#6a2a5a', eyes);
}

/** Possessor: sombra roxa com mãos longas. A: Marionetista (fios nas mãos); B: Devorador (boca enorme, vermelho). */
export function drawPossessor(ctx: Ctx, p: Pose): void {
  const devour = formB(p);
  // Formas Supremas: Mestre das Almas (A, fios de alma com almas presas) e Abismo (B, portal no peito)
  const souls = p.supreme && !devour;
  const abyss = p.supreme && devour;
  const color = devour ? '#5a1430' : '#4a2a80';
  const edge = devour ? '#ff3a5a00' : '#9a6aff00';
  ctx.translate(0, Math.sin(p.time * 2.2) * 2 - 6);
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
  // mãos longas estendidas
  const reach = p.attack * 4;
  for (const side of [-1, 1]) {
    line(ctx, color, 2, () => {
      ctx.moveTo(side * 6, -8);
      ctx.quadraticCurveTo(side * 12, -10, side * (15 + reach), -4);
    });
    for (let f = 0; f < 3; f++) {
      line(ctx, devour ? '#ff8aa0' : '#d8b8ff', 0.8, () => {
        ctx.moveTo(side * (15 + reach), -4);
        ctx.lineTo(side * (18 + reach), -6 + f * 2);
      }, false);
    }
  }
  if (formA(p)) {
    // fios de marionete descendo dos dedos
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
    glowingEye(ctx, -2, -17, 1.5, '#ff2a4a');
    glowingEye(ctx, 4, -17, 1.5, '#ff2a4a');
  } else {
    glowingEye(ctx, -1.5, -15, 1.6, '#d8a8ff');
    glowingEye(ctx, 3.5, -15, 1.6, '#d8a8ff');
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

/** Herbalista: bruxa de vestido de folhas e cajado de galho. A: Jardim Venenoso (flores roxas); B: Guardiã do Bosque (galhos-chifres e casca). */
export function drawHerbalist(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2.3) * 1.1;
  const poison = formA(p);
  const grove = formB(p);
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
  const dress = grove ? '#6a4a2a' : '#3a8a4a';
  const dressDark = grove ? '#2a1a0c' : '#1a4a24';
  shape(ctx, vertical(ctx, -9, 14, dress, dressDark), () =>
    poly(ctx, [-5, -9, 5, -9, 10, 14, 5, 11, 1, 14, -3, 11, -10, 14]),
  );
  // folhas na barra do vestido
  for (let i = 0; i < 4; i++) {
    shape(ctx, grove ? '#8a6a3a' : '#5ad85a', () => ellipse(ctx, -7 + i * 4.5, 12, 2, 1.1, 0.5), 0.5);
  }
  // cajado de galho com broto
  ctx.save();
  ctx.translate(7, 0);
  ctx.rotate(0.25 + p.attack * 0.6);
  line(ctx, '#6a4a2a', 1.8, () => {
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(2, -4, -1, -15);
  });
  shape(ctx, poison ? '#b86aff' : '#7ad85a', () => ellipse(ctx, -1, -17, 2.4, 3.4, 0.3), 0.6);
  shape(ctx, poison ? '#e8b8ff' : '#c8ff9a', () => ellipse(ctx, 1.5, -15, 1.8, 2.6, -0.6), 0.6);
  ctx.restore();
  // rosto, cabelo verde
  const hy = -15;
  shape(ctx, grove ? '#3a5a2a' : '#4a9a4a', () => {
    ctx.moveTo(-7, hy - 2);
    ctx.quadraticCurveTo(-12, hy + 8 + sway, -8, hy + 12);
    ctx.lineTo(-4, hy + 3);
    ctx.closePath();
  });
  shape(ctx, radial(ctx, 1, hy, 7, '#ffe6cf', '#e0b090'), () => circle(ctx, 1, hy, 6.8));
  shape(ctx, grove ? '#3a5a2a' : '#4a9a4a', () => {
    ctx.moveTo(-7, hy);
    ctx.quadraticCurveTo(-3, hy - 9, 7, hy - 3);
    ctx.lineTo(7, hy - 5.5);
    ctx.quadraticCurveTo(0, hy - 10, -7.5, hy - 3);
    ctx.closePath();
  }, 0.8);
  eye(ctx, 1.2, hy + 0.5, 1.7, grove ? '#8a6a2a' : '#3aa83a');
  eye(ctx, 4.8, hy + 0.5, 1.7, grove ? '#8a6a2a' : '#3aa83a');
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
