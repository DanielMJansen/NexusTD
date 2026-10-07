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

/** Clériga: túnica clara, véu e cajado com sol. A: Sacerdotisa dourada com auréola; B: Inquisidora de vermelho e preto com maça em chamas. */
export function drawCleric(ctx: Ctx, p: Pose): void {
  // Santa (suprema A): flutua, auréola de vitral e véu longo; Grã-Inquisidora (suprema B): livro em chamas
  const saint = p.supreme && formA(p);
  const grand = p.supreme && formB(p);
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
  const robe = inq ? '#5a1418' : formA(p) ? '#fff6dc' : '#f4f0f8';
  const robeDark = inq ? '#1a0608' : formA(p) ? '#d8b860' : '#b8b0d0';
  const trim = inq ? '#ff7a3a' : GOLD;

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
  } else {
    ctx.shadowColor = '#ffe9a8';
    ctx.shadowBlur = 8 + p.attack * 8;
    shape(ctx, '#fff0b0', () => circle(ctx, 0, -18, 3), 0.8);
    ctx.strokeStyle = GOLD;
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
    shape(ctx, vertical(ctx, hy - 14, hy + 8, '#8a1a20', '#2a0608'), () =>
      poly(ctx, [-8, hy + 7, -7, hy - 4, 0, hy - 15, 7, hy - 4, 8, hy + 7, 5, hy + 5, 5, hy - 2, -4, hy - 2, -5, hy + 5]),
    );
    glowingEye(ctx, 0.5, hy + 0.5, 1.2, '#ffb040');
    glowingEye(ctx, 4, hy + 0.5, 1.2, '#ffb040');
  } else {
    shape(ctx, vertical(ctx, hy - 9, hy + 8, '#ffffff', '#c8c0e0'), () => {
      ctx.moveTo(-7.5, hy + 7);
      ctx.quadraticCurveTo(-9, hy - 8, 1, hy - 8.5);
      ctx.quadraticCurveTo(8, hy - 8, 6.5, hy - 3);
      ctx.lineTo(-3, hy - 3);
      ctx.lineTo(-4, hy + 7);
      ctx.closePath();
    });
    eye(ctx, 1.4, hy + 0.6, 1.6, '#5a8ad8', 0.4);
    eye(ctx, 4.8, hy + 0.6, 1.6, '#5a8ad8', 0.4);
  }
  if (formA(p)) {
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
  // véu longo atrás, ondulando
  shape(ctx, vertical(ctx, -22, 16, '#ffffff', '#d8d0f0'), () => {
    ctx.moveTo(-3, -22);
    ctx.quadraticCurveTo(-13, -6, -12 + Math.sin(t * 2) * 1.5, 16);
    ctx.lineTo(10 + Math.sin(t * 2 + 1) * 1.5, 16);
    ctx.quadraticCurveTo(10, -6, 4, -22);
    ctx.closePath();
  }, 0.9);
  // túnica branca e dourada que some em luz embaixo
  shape(ctx, vertical(ctx, -10, 14, '#fffaf0', '#f0d890'), () => poly(ctx, [-5, -9, 5, -9, 8, 10, 0, 14, -8, 10]));
  shape(ctx, GOLD, () => ctx.rect(-1.2, -8, 2.4, 18), 0.5);
  halo(ctx, 0, 14, 10, '#fff2b0', 0.6);
  // auréola atrás da cabeça, depois rosto e mãos em prece
  const hy = -15;
  stainedHalo(ctx, 1, hy - 2, t, 0.35 + p.attack * 0.4);
  shape(ctx, radial(ctx, 1, hy, 7, '#ffe6cf', '#e9b994'), () => circle(ctx, 1, hy, 6.5));
  shape(ctx, '#ffffff', () => {
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
  shape(ctx, '#ffe6cf', () => poly(ctx, [1, -6, 3, -10, 5, -6, 3, -3]), 0.6);
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
  const body = hunger ? '#5a2a8a' : '#4a2a50';
  const eyes = hunger ? '#e0a0ff' : '#ff3a4a';
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
  const count = hunger ? 7 : 5;
  const spread = 12 + p.attack * 5;
  for (let i = 0; i < count; i++) {
    const a = p.time * (hunger ? 3.2 : 2.4) + (i * TAU) / count;
    tinyBat(ctx, Math.cos(a) * spread, Math.sin(a) * spread * 0.6, 1.15, p.time + i, body, eyes);
  }
  // morcego-líder no centro
  tinyBat(ctx, 0, -1, 2.1, p.time * 0.8, hunger ? '#7a3ab0' : '#6a2a5a', eyes);
}

/** Possessor: sombra roxa com mãos longas. A: Marionetista (fios nas mãos); B: Devorador (boca enorme, vermelho). */
export function drawPossessor(ctx: Ctx, p: Pose): void {
  const devour = formB(p);
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
}

/** Herbalista: bruxa de vestido de folhas e cajado de galho. A: Jardim Venenoso (flores roxas); B: Guardiã do Bosque (galhos-chifres e casca). */
export function drawHerbalist(ctx: Ctx, p: Pose): void {
  const sway = Math.sin(p.time * 2.3) * 1.1;
  const poison = formA(p);
  const grove = formB(p);
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
}
